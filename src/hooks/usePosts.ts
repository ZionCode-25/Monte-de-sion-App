import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Post, Comment } from '../../types';

// Helper to build comment tree
const buildCommentTree = (flatComments: any[], currentUserId: string): Comment[] => {
    const commentMap: { [key: string]: Comment } = {};
    const rootComments: Comment[] = [];

    // First pass: Create all comment objects and map them
    flatComments.forEach(c => {
        commentMap[c.id] = {
            id: c.id,
            content: c.content || '',
            user_id: c.user_id,
            post_id: c.post_id,
            parent_id: c.parent_id,
            userName: c.user?.name || 'Anónimo',
            userAvatar: c.user?.avatar_url,
            createdAt: c.created_at,
            created_at: c.created_at,
            likes: c.comment_likes ? c.comment_likes.length : 0,
            isLiked: c.comment_likes ? c.comment_likes.some((l: any) => l.user_id === currentUserId) : false,
            replies: []
        } as Comment;
    });

    // Second pass: Link children to parents
    flatComments.forEach(c => {
        if (c.parent_id && commentMap[c.parent_id]) {
            commentMap[c.parent_id].replies?.push(commentMap[c.id]);
        } else {
            rootComments.push(commentMap[c.id]);
        }
    });

    // Sort by date (oldest first for comments usually works best, or newest first)
    // For roots: Newest first often better. For replies: Oldest first usually expected.
    rootComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Sort replies recursively
    const sortReplies = (comments: Comment[]) => {
        comments.forEach(c => {
            if (c.replies && c.replies.length > 0) {
                c.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // Oldest first for conversation flow
                sortReplies(c.replies);
            }
        });
    };
    sortReplies(rootComments);

    return rootComments;
};

// Helper for deep optimistic updates
const updateCommentTree = (comments: Comment[], targetId: string, updateFn: (c: Comment) => Comment): Comment[] => {
    return comments.map(c => {
        if (c.id === targetId) return updateFn(c);
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateCommentTree(c.replies, targetId, updateFn) };
        }
        return c;
    });
};

export const usePosts = (currentUserId: string) => {
    return useQuery({
        queryKey: ['posts', currentUserId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    user:profiles!user_id(name, avatar_url),
                    comments(*, user:profiles(name, avatar_url), comment_likes(user_id)),
                    likes(user_id),
                    saved_posts(user_id)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching posts:", error);
                throw error;
            }
            if (!data) return [];

            return data.map((p: any) => ({
                id: p.id,
                user_id: p.user_id,
                content: p.content || '',
                media_url: p.media_url,
                media_type: p.media_type,
                userName: p.user?.name || 'Miembro de Sión',
                userAvatar: p.user?.avatar_url || 'https://i.pravatar.cc/150',
                mediaUrl: p.media_url,
                mediaUrls: p.media_urls || (p.media_url ? [p.media_url] : []),
                mediaType: p.media_type as 'image' | 'video',
                likes: Array.isArray(p.likes) ? p.likes.length : 0,
                shares: p.shares || 0,
                comments: Array.isArray(p.comments) ? buildCommentTree(p.comments, currentUserId) : [],
                createdAt: p.created_at,
                created_at: p.created_at,
                isLiked: Array.isArray(p.likes) ? p.likes.some((l: any) => l.user_id === currentUserId) : false,
                isSaved: Array.isArray(p.saved_posts) ? p.saved_posts.some((s: any) => s.user_id === currentUserId) : false
            })) as Post[];
        }
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, content, mediaFiles, location, mentions }: { userId: string, content: string, mediaFiles?: File[], location?: string, mentions?: string[] }) => {
            const fullContent = `${content}${location ? ` — en ${location}` : ''}${mentions && mentions.length > 0 ? ` con @${mentions.join(', @')}` : ''}`;

            let uploadedUrls: string[] = [];
            let mediaType: 'image' | 'video' | null = null;

            if (mediaFiles && mediaFiles.length > 0) {
                // Determine type from first file (assume all same type for now for simplicity, or mixed?)
                // Instagram usually mixes, but let's assume primary type
                mediaType = mediaFiles[0].type.startsWith('video') ? 'video' : 'image';

                for (const file of mediaFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('community')
                        .upload(filePath, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('community')
                        .getPublicUrl(filePath);

                    uploadedUrls.push(publicUrl);
                }
            }

            // Try to insert with media_urls. If it fails (column missing), fall back to single media_url
            // Actually, we can't easily try-catch the column existence in one query without risk.
            // We will send both. standard columns ignore extra fields? No, Supabase throws on unknown columns.
            // PROCEEDING WITH ASSUMPTION: User ran migration OR we use a safe approach.
            // Safe approach: check if we can simply use media_url for the first one, and if we have media_urls support we use it.
            // Since we cannot check schema easily here, we will try to pass `media_urls` if there are multiple, AND `media_url` always.
            // If the user didn't run migration, this WILL fail if we pass `media_urls`.
            // Strategy: We warn in UI. Here we try to insert.

            const payload: any = {
                user_id: userId,
                content: fullContent,
                media_url: uploadedUrls[0] || null, // legacy support
                media_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
                media_type: mediaType,
                // aspect_ratio: aspectRatio // If we decided to pass it
            };

            const { data, error } = await supabase.from('posts').insert(payload).select().single();

            if (error) {
                console.error("Error creating post:", error);
                throw error;
            }
            return data;
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};

export const useToggleLike = (currentUserId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ postId, isLiked }: { postId: string, isLiked: boolean }) => {
            if (isLiked) {
                const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', currentUserId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: currentUserId });
                if (error) throw error;
            }
        },
        onMutate: async ({ postId, isLiked }) => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
            const previousPosts = queryClient.getQueryData<Post[]>(['posts', currentUserId]);

            if (previousPosts) {
                queryClient.setQueryData<Post[]>(['posts', currentUserId], (old) => {
                    if (!old) return [];
                    return old.map(p => {
                        if (p.id === postId) {
                            return {
                                ...p,
                                likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
                                isLiked: !isLiked
                            };
                        }
                        return p;
                    });
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
                const { error } = await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', currentUserId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: currentUserId });
                if (error) throw error;
            }
        },
        onMutate: async ({ commentId, isLiked }) => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
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

export const useToggleSave = (currentUserId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ postId, isSaved }: { postId: string, isSaved: boolean }) => {
            if (isSaved) {
                const { error } = await supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', currentUserId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('saved_posts').insert({ post_id: postId, user_id: currentUserId });
                if (error) throw error;
            }
        },
        onMutate: async ({ postId, isSaved }) => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
            const previousPosts = queryClient.getQueryData<Post[]>(['posts', currentUserId]);

            if (previousPosts) {
                queryClient.setQueryData<Post[]>(['posts', currentUserId], (old) => {
                    if (!old) return [];
                    return old.map(p => {
                        if (p.id === postId) {
                            return {
                                ...p,
                                isSaved: !isSaved
                            };
                        }
                        return p;
                    });
                });
            }
            return { previousPosts };
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};

// Helper to insert into tree optimistically
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






export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ postId, userId }: { postId: string, userId: string }) => {
            const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', userId);
            if (error) throw error;
        },
        onMutate: async ({ postId }) => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
            const previousPosts = queryClient.getQueriesData({ queryKey: ['posts'] });

            queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
                if (!old) return [];
                return old.filter((p: Post) => p.id !== postId);
            });

            return { previousPosts };
        },
        onError: (_err, _newTodo, context) => {
            if (context?.previousPosts) {
                context.previousPosts.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};
