import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../components/context/AuthContext';
import { PrayerRequest } from '../types';

export { type PrayerRequest } from '../types';

export const usePrayerRequests = (filter: 'all' | 'mine' = 'all') => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // FETCH
    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['prayer_requests', filter, user?.id],
        queryFn: async () => {
            let query = supabase
                .from('prayer_requests')
                .select(`
          *,
          user:profiles(name, avatar_url),
          interactions:prayer_interactions(
            id,
            user_id,
            interaction_type,
            created_at,
            user:profiles(name, avatar_url)
          )
        `)
                .order('created_at', { ascending: false });

            if (filter === 'mine' && user?.id) {
                query = query.eq('user_id', user.id);
            } else {
                if (!user) query = query.eq('is_private', false);
            }

            // Filter out requests older than 24 hours
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            query = query.gte('created_at', twentyFourHoursAgo);

            const { data, error } = await query;
            if (error) throw error;

            return data.map((r: any) => ({
                ...r,
                userName: r.user?.name || 'Anónimo',
                userAvatar: r.user?.avatar_url || '',
                audioUrl: r.audio_url,
                duration: r.duration,
                // Calculate counts and state
                interaction_count: r.interactions?.length || 0,
                amenCount: r.interactions?.length || 0, // Legacy support
                user_has_interacted: user ? r.interactions?.some((i: any) => i.user_id === user.id) : false,
                interactions: r.interactions
            })) as PrayerRequest[];
        }
    });

    // CREATE
    const addRequest = useMutation({
        mutationFn: async (newRequest: { content: string; category: string; is_private: boolean; mediaBlob?: Blob | null; duration?: string }) => {
            if (!user) throw new Error("No autenticado");

            let uploadedAudioUrl = null;
            if (newRequest.mediaBlob) {
                const filename = `${user.id}/${Date.now()}.webm`;
                const { error: uploadError } = await supabase.storage
                    .from('prayer_requests')
                    .upload(filename, newRequest.mediaBlob);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('prayer_requests')
                    .getPublicUrl(filename);

                uploadedAudioUrl = publicUrl;
            }

            const { error } = await supabase.from('prayer_requests').insert({
                user_id: user.id,
                content: newRequest.content,
                category: newRequest.category,
                is_private: newRequest.is_private,
                audio_url: uploadedAudioUrl,
                duration: newRequest.duration,
                amen_count: 0
            });

            if (error) throw error;

            // Gamification: Petición de Oración (10 pts, límite 2/día)
            await (supabase.rpc as any)('award_points_with_limit', {
                p_user_id: user.id,
                p_action: 'prayer_post',
                p_points: 10,
                p_daily_limit: 2
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer_requests'] });
        }
    });

    // DELETE
    const deleteRequest = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('prayer_requests').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer_requests'] });
        }
    });

    // EDIT
    const editRequest = useMutation({
        mutationFn: async ({ id, content, is_private, category }: { id: string; content: string; is_private: boolean; category?: string }) => {
            const updates: any = { content, is_private };
            if (category) updates.category = category;

            const { error } = await supabase
                .from('prayer_requests')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer_requests'] });
        }
    });

    // TOGGLE INTERACTION (Replaza toggleAmen)
    const toggleInteraction = useMutation({
        mutationFn: async ({ requestId, type }: { requestId: string, type: 'amen' | 'intercession' }) => {
            if (!user) throw new Error("No autenticado");

            // Check if exists
            const { data: existing } = await supabase
                .from('prayer_interactions')
                .select('id')
                .eq('prayer_id', requestId)
                .eq('user_id', user.id)
                .maybeSingle();

            if (existing) {
                const { error } = await supabase.from('prayer_interactions').delete().eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('prayer_interactions').insert({
                    prayer_id: requestId,
                    user_id: user.id,
                    interaction_type: type
                });
                if (error) throw error;

                // Gamification: Dar un Amén (1 pt, límite 10/día)
                if (type === 'amen') {
                    await (supabase.rpc as any)('award_points_with_limit', {
                        p_user_id: user.id,
                        p_action: 'amen_give',
                        p_points: 1,
                        p_daily_limit: 10
                    });
                }
            }
        },
        onMutate: async ({ requestId }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['prayer_requests'] });

            // Snapshot the previous value
            const previousRequests = queryClient.getQueryData(['prayer_requests', filter, user?.id]);

            // Optimistically update to the new value
            queryClient.setQueryData(['prayer_requests', filter, user?.id], (old: any) => {
                if (!old) return old;
                return old.map((req: any) => {
                    if (req.id === requestId) {
                        const hasInteracted = !req.user_has_interacted;
                        return {
                            ...req,
                            user_has_interacted: hasInteracted,
                            interaction_count: hasInteracted ? req.interaction_count + 1 : Math.max(0, req.interaction_count - 1),
                            amenCount: hasInteracted ? req.amenCount + 1 : Math.max(0, req.amenCount - 1)
                        };
                    }
                    return req;
                });
            });

            return { previousRequests };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousRequests) {
                queryClient.setQueryData(['prayer_requests', filter, user?.id], context.previousRequests);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer_requests'] });
        }
    });

    return {
        requests,
        isLoading,
        addRequest,
        deleteRequest,
        editRequest,
        toggleInteraction
    };
};
