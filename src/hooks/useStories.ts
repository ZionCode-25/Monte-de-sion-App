
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

            if (error) throw error;
            if (!data) return [];

            return data.map((s: any) => ({
                ...s,
                userId: s.user_id,
                userName: s.user?.name || 'Usuario',
                userAvatar: s.user?.avatar_url || '',
                mediaUrl: s.media_url,
                text: s.content || s.text, // Assuming column name might vary or mapped props
                type: (s.type as 'image' | 'video') || 'image',
                timestamp: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })) as Story[];
        }
    });
};

export const useCreateStory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, mediaUrl, text }: { userId: string, mediaUrl: string | null, text: string }) => {
            const { error } = await supabase.from('stories').insert({
                user_id: userId,
                media_url: mediaUrl || '', // Ensure string if required, or handle null in DB types
                content: text, // Mapping 'text' to 'content' column
                type: mediaUrl ? 'image' : 'text',
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
