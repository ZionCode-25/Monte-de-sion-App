
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Post, Comment } from '../../types';

export const usePosts = (currentUserId: string) => {
    return useQuery({
        queryKey: ['posts'],
        queryFn: async () => {
            // Intentionally using 'any' in select because Supabase types with joins are tricky
            // but we will cast the result to our strict 'Post' type at the end.
            const { data, error } = await supabase
                .from('posts')
                .select(`
          *,
          user:profiles(name, avatar_url),
          comments(*, user:profiles(name, avatar_url)),
          likes(user_id)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!data) return [];

            return data.map((p: any) => ({
                ...p, // Spread original post fields (id, content, created_at, etc.)
                userId: p.user_id, // Map for compatibility if needed, but 'user_id' is in original
                userName: p.user?.name || 'Usuario',
                userAvatar: p.user?.avatar_url || '',
                mediaUrl: p.media_url,
                mediaType: p.media_type as 'image' | 'video',
                likes: p.likes ? p.likes.length : 0,
                shares: 0, // Placeholder
                comments: p.comments.map((c: any) => ({
                    ...c,
                    userId: c.user_id,
                    userName: c.user?.name || 'Usuario',
                    userAvatar: c.user?.avatar_url,
                    createdAt: c.created_at
                })) as Comment[],
                createdAt: p.created_at,
                isLiked: p.likes?.some((l: any) => l.user_id === currentUserId)
            })) as Post[];
        }
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, content, mediaUrl, mediaType, location, mentions }: { userId: string, content: string, mediaUrl?: string | null, mediaType?: 'image' | 'video' | null, location?: string, mentions?: string[] }) => {
            const fullContent = `${content}${location ? ` — en ${location}` : ''}${mentions && mentions.length > 0 ? ` con @${mentions.join(', @')}` : ''}`;

            const { data, error } = await supabase.from('posts').insert({
                user_id: userId,
                content: fullContent,
                media_url: mediaUrl,
                media_type: mediaType || (mediaUrl ? 'image' : null)
            }).select().single();

            if (error) throw error;
            return data;
        },
        onMutate: async (newPost) => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
            const previousPosts = queryClient.getQueryData<Post[]>(['posts']);

            // Optimistic update
            if (previousPosts) {
                const optimisticPost: Post = {
                    id: 'temp-' + Date.now(),
                    user_id: newPost.userId,
                    content: newPost.content,
                    media_url: newPost.mediaUrl || null,
                    media_type: newPost.mediaType || null,
                    created_at: new Date().toISOString(),
                    // UI derived properties
                    userName: 'Tú',
                    userAvatar: '',
                    likes: 0,
                    year: undefined, // Optional property from DB type
                    isLiked: false,
                    comments: []
                } as Post; // Casting as Post since we might miss some non-nullable DB fields which don't matter for UI

                queryClient.setQueryData<Post[]>(['posts'], [optimisticPost, ...previousPosts]);
            }

            return { previousPosts };
        },
        onError: (err, newPost, context) => {
            queryClient.setQueryData(['posts'], context?.previousPosts);
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
            const previousPosts = queryClient.getQueryData<Post[]>(['posts']);

            if (previousPosts) {
                queryClient.setQueryData<Post[]>(['posts'], (old) => {
                    if (!old) return [];
                    return old.map(p => {
                        if (p.id === postId) {
                            return {
                                ...p,
                                likes: isLiked ? p.likes - 1 : p.likes + 1,
                                isLiked: !isLiked
                            };
                        }
                        return p;
                    });
                });
            }
            return { previousPosts };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['posts'], context?.previousPosts);
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
            const { error } = await supabase.from('comments').insert({
                user_id: userId,
                post_id: postId,
                content: content
            });
            if (error) throw error;
        },
        onMutate: async ({ userId, postId, content }) => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
            const previousPosts = queryClient.getQueryData<Post[]>(['posts']);

            if (previousPosts) {
                queryClient.setQueryData<Post[]>(['posts'], (old) => {
                    if (!old) return [];
                    return old.map(p => {
                        if (p.id === postId) {
                            return {
                                ...p,
                                comments: [
                                    ...p.comments,
                                    {
                                        id: 'temp-' + Date.now(),
                                        content,
                                        userId: userId,
                                        userName: 'Tú',
                                        createdAt: new Date().toISOString(),
                                        // Required DB fields
                                        user_id: userId,
                                        post_id: postId,
                                        created_at: new Date().toISOString()
                                    } as Comment
                                ]
                            };
                        }
                        return p;
                    });
                });
            }

            return { previousPosts };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['posts'], context?.previousPosts);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};
