import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Post, Comment } from '../../types';

export const usePosts = (currentUserId: string) => {
    return useQuery({
        queryKey: ['posts', currentUserId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    user:profiles!user_id(name, avatar_url),
                    comments(*, user:profiles(name, avatar_url)),
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
                mediaType: p.media_type as 'image' | 'video',
                likes: Array.isArray(p.likes) ? p.likes.length : 0,
                shares: p.shares || 0,
                comments: Array.isArray(p.comments) ? p.comments.map((c: any) => ({
                    id: c.id,
                    content: c.content || '',
                    user_id: c.user_id,
                    post_id: c.post_id,
                    userName: c.user?.name || 'Anónimo',
                    userAvatar: c.user?.avatar_url,
                    createdAt: c.created_at,
                    created_at: c.created_at
                })) : [],
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
        mutationFn: async ({ userId, content, mediaFile, location, mentions }: { userId: string, content: string, mediaFile?: File | null, location?: string, mentions?: string[] }) => {
            const fullContent = `${content}${location ? ` — en ${location}` : ''}${mentions && mentions.length > 0 ? ` con @${mentions.join(', @')}` : ''}`;

            let uploadedUrl: string | null = null;
            let mediaType: 'image' | 'video' | null = null;

            if (mediaFile) {
                const fileExt = mediaFile.name.split('.').pop();
                const fileName = `${userId}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('community')
                    .upload(filePath, mediaFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('community')
                    .getPublicUrl(filePath);

                uploadedUrl = publicUrl;
                mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
            }

            const { data, error } = await supabase.from('posts').insert({
                user_id: userId,
                content: fullContent,
                media_url: uploadedUrl,
                media_type: mediaType
            }).select().single();

            if (error) throw error;
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
                await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', currentUserId);
            } else {
                await supabase.from('likes').insert({ post_id: postId, user_id: currentUserId });
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

export const useToggleSave = (currentUserId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ postId, isSaved }: { postId: string, isSaved: boolean }) => {
            if (isSaved) {
                await supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', currentUserId);
            } else {
                await supabase.from('saved_posts').insert({ post_id: postId, user_id: currentUserId });
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

export const useAddComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, postId, content }: { userId: string, postId: string, content: string }) => {
            // Optimistic update happens via onMutate ideally, but simplified here ensures data consistency
            // We insert the comment
            const { data, error } = await supabase.from('comments').insert({
                user_id: userId,
                post_id: postId,
                content: content
            }).select(`
                *,
                user:profiles(name, avatar_url)
            `).single();

            if (error) throw error;
            return data;
        },
        onSuccess: (newComment) => {
            queryClient.setQueryData<Post[]>(['posts', newComment.user_id], (old) => {
                // Aggressive invalidation usually works best, but let's try to update cache
                return old ? old.map(p => {
                    if (p.id === newComment.post_id) {
                        // Transform DB comment to UI comment
                        const uiComment = {
                            id: newComment.id,
                            content: newComment.content,
                            user_id: newComment.user_id,
                            post_id: newComment.post_id,
                            userName: newComment.user?.name || 'Anónimo',
                            userAvatar: newComment.user?.avatar_url,
                            createdAt: newComment.created_at,
                            created_at: newComment.created_at
                        };
                        return {
                            ...p,
                            comments: [uiComment, ...p.comments]
                        };
                    }
                    return p;
                }) : [];
            });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
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
            // Snapshot previous value
            const previousPosts = queryClient.getQueriesData({ queryKey: ['posts'] }); // Get all posts queries

            // Optimistically remove
            queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
                if (!old) return [];
                return old.filter((p: Post) => p.id !== postId);
            });

            return { previousPosts };
        },
        onError: (_err, _newTodo, context) => {
            // Rollback
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
