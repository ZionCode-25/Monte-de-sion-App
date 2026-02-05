import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../components/context/AuthContext';
import { PrayerInteraction } from '../../types';

export const usePrayerInteractions = (prayerId: string) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch interactions for a specific prayer request
    const { data: interactions = [], isLoading } = useQuery({
        queryKey: ['prayer_interactions', prayerId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('prayer_interactions')
                .select(`
                    *,
                    user:profiles(name, avatar_url)
                `)
                .eq('prayer_id', prayerId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as PrayerInteraction[];
        },
        enabled: !!prayerId
    });

    const userHasInteracted = interactions.some(i => i.user_id === user?.id);

    // Add Interaction
    const addInteraction = useMutation({
        mutationFn: async (type: 'amen' | 'intercession') => {
            if (!user) throw new Error("Must be logged in");

            const { error } = await supabase
                .from('prayer_interactions')
                .insert({
                    prayer_id: prayerId,
                    user_id: user.id,
                    interaction_type: type
                });

            if (error) {
                if (error.code === '23505') return; // Unique violation, ignore
                throw error;
            }

            // Gamification
            await (supabase.rpc as any)('increment_impact_points', { p_user_id: user.id, p_points: 5 });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer_interactions', prayerId] });
            queryClient.invalidateQueries({ queryKey: ['prayer_requests'] });
        }
    });

    // Remove Interaction
    const removeInteraction = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("Must be logged in");

            const { error } = await supabase
                .from('prayer_interactions')
                .delete()
                .match({ prayer_id: prayerId, user_id: user.id });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer_interactions', prayerId] });
            queryClient.invalidateQueries({ queryKey: ['prayer_requests'] });
        }
    });

    return {
        interactions,
        userHasInteracted,
        isLoading,
        addInteraction,
        removeInteraction
    };
};
