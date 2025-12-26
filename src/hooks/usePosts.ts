
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Post, Comment } from '../../types';

export const usePosts = (currentUserId: string) => {
    return useQuery({
        queryKey: ['posts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('posts')
                .select(`
          *,
          user:profiles(name, avatar_url),
          comments(*, user:profiles(name, avatar_url)),
          likes(user_id)
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
                isLiked: Array.isArray(p.likes) ? p.likes.some((l: any) => l.user_id === currentUserId) : false
            })) as Post[];
        }
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, content, mediaFile, location, mentions }: { userId: string, content: string, mediaFile?: File | null, location?: string, mentions?: string[] }) => {
            console.log("Iniciando creación de post...", { userId, hasMedia: !!mediaFile });

            const fullContent = `${content}${location ? ` — en ${location}` : ''}${mentions && mentions.length > 0 ? ` con @${mentions.join(', @')}` : ''}`;

            let uploadedUrl: string | null = null;
            let mediaType: 'image' | 'video' | null = null;

            if (mediaFile) {
                const fileExt = mediaFile.name.split('.').pop();
                const fileName = `${userId}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`; // Removed 'posts/' prefix if bucket is flat, or verify bucket structure. Using simple path for now.

                console.log("Subiendo archivo:", filePath);
                const { error: uploadError } = await supabase.storage
                    .from('community')
                    .upload(filePath, mediaFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error("Error al subir archivo:", uploadError);
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('community')
                    .getPublicUrl(filePath);

                uploadedUrl = publicUrl;
                mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
                console.log("Archivo subido. URL Pública:", uploadedUrl);
            }

            const { data, error } = await supabase.from('posts').insert({
                user_id: userId,
                content: fullContent,
                media_url: uploadedUrl, // Explicitly string | null
                media_type: mediaType
            }).select().single();

            if (error) {
                console.error("Error al insertar post en DB:", error);
                throw error;
            }
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
                    media_url: newPost.mediaFile ? URL.createObjectURL(newPost.mediaFile) : null,
                    media_type: newPost.mediaFile?.type.startsWith('video') ? 'video' : (newPost.mediaFile ? 'image' : null),
                    created_at: new Date().toISOString(),
                    // UI derived properties
                    userName: 'Tú',
                    userAvatar: '', // Should ideally fetch current user avatar
                    likes: 0,
                    year: undefined,
                    isLiked: false,
                    comments: []
                } as Post;

                queryClient.setQueryData<Post[]>(['posts'], [optimisticPost, ...previousPosts]);
            }

            return { previousPosts };
        },
        onError: (err, newPost, context) => {
            console.error("Mutation Error:", err);
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
