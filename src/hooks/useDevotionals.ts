import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/context/AuthContext';
import { Devotional } from '../../types';

export const useDevotionals = (filter: 'all' | 'mine' = 'all') => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // FETCH
    const { data: devotionals = [], isLoading, error } = useQuery({
        queryKey: ['devotionals', filter, user?.id],
        queryFn: async () => {
            let query = supabase
                .from('devotionals')
                .select(`
          *,
          user:profiles(name, avatar_url)
        `)
                .order('created_at', { ascending: false });

            if (filter === 'mine' && user?.id) {
                query = query.eq('user_id', user.id);
            }

            const { data, error } = await query;
            if (error) throw error;

            return data.map((d: any) => ({
                id: d.id,
                user_id: d.user_id,
                userName: d.user?.name || 'Usuario',
                userAvatar: d.user?.avatar_url || '',
                title: d.title,
                bible_verse: d.bible_verse || '', // snake_case from DB
                bibleVerse: d.bible_verse || '', // camelCase for UI
                content: d.content,
                audio_url: d.audio_url || null,
                audioUrl: d.audio_url || undefined,
                duration: d.duration || null,
                created_at: d.created_at,
                createdAt: d.created_at
            })) as unknown as Devotional[];
        },
        enabled: true
    });

    // CREATE
    const addDevotional = useMutation({
        mutationFn: async (newDevotional: { title: string; content: string; bible_verse: string; mediaBlob?: Blob | null; duration?: string }) => {
            if (!user) throw new Error("No autenticado");

            let uploadedAudioUrl = null;
            if (newDevotional.mediaBlob) {
                const filename = `${user.id}/${Date.now()}.webm`;
                const { error: uploadError } = await supabase.storage
                    .from('devotionals')
                    .upload(filename, newDevotional.mediaBlob);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('devotionals')
                    .getPublicUrl(filename);

                uploadedAudioUrl = publicUrl;
            }

            const { error } = await supabase.from('devotionals').insert({
                user_id: user.id,
                title: newDevotional.title,
                content: newDevotional.content,
                bible_verse: newDevotional.bible_verse,
                audio_url: uploadedAudioUrl,
                duration: newDevotional.duration
            });

            if (error) throw error;

            // Award points for creating content (optional gamification rule)
            await (supabase.rpc as any)('increment_impact_points', { p_user_id: user.id, p_points: 50 });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['devotionals'] });
        }
    });

    // DELETE
    const deleteDevotional = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('devotionals').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['devotionals'] });
        }
    });

    // EDIT
    const editDevotional = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Devotional> }) => {
            // Map UI camelCase back to snake_case if necessary
            const dbUpdates: any = { ...updates };
            if (updates.bibleVerse) dbUpdates.bible_verse = updates.bibleVerse; // Handle alias

            const { error } = await supabase.from('devotionals').update(dbUpdates).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['devotionals'] });
        }
    });

    // INCREMENT POINTS (LISTEN)
    const awardListenPoints = async () => {
        if (!user) return;
        await (supabase.rpc as any)('increment_impact_points', { p_user_id: user.id, p_points: 10 });
    };

    return {
        devotionals,
        isLoading,
        error,
        addDevotional,
        deleteDevotional,
        editDevotional,
        awardListenPoints
    };
};
