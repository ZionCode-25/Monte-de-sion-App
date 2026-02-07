import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Post, Comment } from '../types';

// Helper for deep optimistic updates (reused or duplicated if needed, but ideally shared)
// We will duplicate simple helpers to avoid complex sharing for now or export them from a utils file.
// For simplicity in this fix, I'll keep logic self-contained or import if possible.
// Actually, it's better to keep `updateCommentTree` and friends close to where they are used.

const insertInCommentTree = (comments: Comment[], newComment: Comment): Comment[] => {
    if (!newComment.parent_id) {
        return [newComment, ...comments];
    }
    return comments.map(c => {
        if (c.id === newComment.parent_id) {
            const replies = c.replies || [];
            return { ...c, replies: [...replies, newComment] };
        }
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: insertInCommentTree(c.replies, newComment) };
        }
        return c;
    });
};

const deleteFromCommentTree = (comments: Comment[], commentId: string): Comment[] => {
    return comments.filter(c => c.id !== commentId).map(c => {
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: deleteFromCommentTree(c.replies, commentId) };
        }
        return c;
    });
};

const editInCommentTree = (comments: Comment[], commentId: string, newContent: string): Comment[] => {
    return comments.map(c => {
        if (c.id === commentId) {
            return { ...c, content: newContent };
        }
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: editInCommentTree(c.replies, commentId, newContent) };
        }
        return c;
    });
};

const updateCommentTree = (comments: Comment[], targetId: string, updateFn: (c: Comment) => Comment): Comment[] => {
    return comments.map(c => {
        if (c.id === targetId) return updateFn(c);
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateCommentTree(c.replies, targetId, updateFn) };
        }
        return c;
    });
};

export const useAddComment = (currentUserId: string, userName: string, userAvatar: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, postId, content, parentId }: { userId: string, postId: string, content: string, parentId?: string }) => {
            console.log("Adding comment...", { userId, postId, content, parentId });

            if (!userId) {
                console.error("ERROR: userId is missing/empty in useAddComment!");
                throw new Error("User ID is required");
            }

            const { data, error, status, statusText } = await supabase.from('comments').insert({
                user_id: userId,
                post_id: postId,
                content: content,
                parent_id: parentId || null
            }).select(`
                *,
                user:profiles(name, avatar_url)
            `).single();

            if (error) {
                console.error("Supabase Error Adding Comment:", error, { status, statusText, userId, postId });
                throw error;
            }
            console.log("Comment added successfully:", data);
            return data;
        },
        onMutate: async ({ userId, postId, content, parentId }) => {
            await queryClient.cancelQueries({ queryKey: ['posts', currentUserId] });
            const previousPosts = queryClient.getQueryData<Post[]>(['posts', currentUserId]);

            const optimisticComment: Comment = {
                id: 'opt-' + Date.now(),
                content,
                user_id: userId,
                post_id: postId,
                parent_id: parentId || null,
                userName: userName || 'Yo',
                userAvatar: userAvatar || '',
                created_at: new Date().toISOString(),
                likes: 0,
                isLiked: false,
                replies: []
            };

            if (previousPosts) {
                queryClient.setQueryData<Post[]>(['posts', currentUserId], (old) => {
                    if (!old) return [];
                    return old.map(p => {
                        if (p.id === postId) {
                            return {
                                ...p,
                                comments: insertInCommentTree(p.comments, optimisticComment)
                            };
                        }
                        return p;
                    });
                });
            }

            return { previousPosts };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(['posts', currentUserId], context.previousPosts);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};

export const useDeleteComment = (currentUserId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ commentId }: { commentId: string }) => {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if (error) throw error;
        },
        onMutate: async ({ commentId }) => {
            await queryClient.cancelQueries({ queryKey: ['posts', currentUserId] });
            const previousPosts = queryClient.getQueryData<Post[]>(['posts', currentUserId]);

            if (previousPosts) {
                queryClient.setQueryData<Post[]>(['posts', currentUserId], (old) => {
                    if (!old) return [];
                    return old.map(p => ({
                        ...p,
                        comments: deleteFromCommentTree(p.comments, commentId)
                    }));
                });
            }
            return { previousPosts };
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};

export const useEditComment = (currentUserId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ commentId, content }: { commentId: string, content: string }) => {
            const { error } = await supabase.from('comments').update({ content }).eq('id', commentId);
            if (error) throw error;
        },
        onMutate: async ({ commentId, content }) => {
            await queryClient.cancelQueries({ queryKey: ['posts', currentUserId] });
            const previousPosts = queryClient.getQueryData<Post[]>(['posts', currentUserId]);

            if (previousPosts) {
                queryClient.setQueryData<Post[]>(['posts', currentUserId], (old) => {
                    if (!old) return [];
                    return old.map(p => ({
                        ...p,
                        comments: editInCommentTree(p.comments, commentId, content)
                    }));
                });
            }
            return { previousPosts };
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};

export const useToggleCommentLike = (currentUserId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ commentId, isLiked }: { commentId: string, isLiked: boolean }) => {
            if (isLiked) {
                await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', currentUserId);
            } else {
                await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: currentUserId });
            }
        },
        onMutate: async ({ commentId, isLiked }) => {
            await queryClient.cancelQueries({ queryKey: ['posts', currentUserId] });
            const previousPosts = queryClient.getQueryData<Post[]>(['posts', currentUserId]);

            if (previousPosts) {
                queryClient.setQueryData<Post[]>(['posts', currentUserId], (old) => {
                    if (!old) return [];
                    return old.map(p => ({
                        ...p,
                        comments: updateCommentTree(p.comments, commentId, (c) => ({
                            ...c,
                            likes: isLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
                            isLiked: !isLiked
                        }))
                    }));
                });
            }
            return { previousPosts };
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};

export const useRealtimeComments = (postId: string | null) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!postId) return;

        const channel = supabase
            .channel(`comments_realtime:${postId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'comments',
                    filter: `post_id=eq.${postId}`
                },
                async (payload) => {
                    if (payload.eventType === 'INSERT') {
                        queryClient.invalidateQueries({ queryKey: ['posts'] });
                    } else if (payload.eventType === 'DELETE') {
                        queryClient.invalidateQueries({ queryKey: ['posts'] });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [postId, queryClient]);
};
