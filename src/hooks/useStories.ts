
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Story } from '../../types';

export const useStories = () => {
    return useQuery({
        queryKey: ['stories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('stories')
                .select('*, user:profiles(name, avatar_url)')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching stories:", error);
                throw error;
            }
            if (!data) return [];

            return data.map((s: any) => ({
                id: s.id,
                user_id: s.user_id,
                userId: s.user_id, // Compatibility
                userName: s.user?.name || 'Usuario Sión',
                userAvatar: s.user?.avatar_url || 'https://i.pravatar.cc/150',
                mediaUrl: s.media_url || '',
                media_url: s.media_url || '', // Required by Story type
                text: s.content || s.text || '',
                type: (s.type as 'image' | 'video' | 'text') || (s.media_url ? 'image' : 'text'),
                expiresAt: s.expires_at,
                expires_at: s.expires_at, // Required by Story type
                createdAt: s.created_at,
                created_at: s.created_at, // Required by Story type
                timestamp: s.created_at ? new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora'
            })) as unknown as Story[];
        }
    });
};

export const useCreateStory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, mediaFile, text }: { userId: string, mediaFile: File | null, text: string }) => {
            let uploadedUrl = '';

            if (mediaFile) {
                const fileExt = mediaFile.name.split('.').pop();
                const fileName = `${userId}-${Math.random()}.${fileExt}`;
                const filePath = `stories/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('community')
                    .upload(filePath, mediaFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('community')
                    .getPublicUrl(filePath);

                uploadedUrl = publicUrl;
            }

            const { error } = await supabase.from('stories').insert({
                user_id: userId,
                media_url: uploadedUrl,
                content: text,
                type: mediaFile ? 'image' : 'text',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stories'] });
        }
    });
};

export const useDeleteStory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (storyId: string) => {
            const { error } = await supabase.from('stories').delete().eq('id', storyId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stories'] });
        }
    });
};
