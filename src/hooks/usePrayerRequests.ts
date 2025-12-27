import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/context/AuthContext';

export interface PrayerRequest {
    id: string;
    user_id: string;
    content: string;
    category: string;
    is_private: boolean;
    amen_count: number;
    created_at: string;
    userName?: string;
    userAvatar?: string;
}

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
          user:profiles(name, avatar_url)
        `)
                .order('created_at', { ascending: false });

            if (filter === 'mine' && user?.id) {
                query = query.eq('user_id', user.id);
            } else {
                // En 'all', mostrar solo públicas O las mías privadas
                // Supabase OR syntax: or=(is_private.eq.false,user_id.eq.MY_ID)
                // Pero para simplificar, filtramos en cliente o asumimos que RLS maneja privacidad
                // Asumimos 'all' son públicas. Si quieres ver privadas tuyas en 'all', RLS lo debe permitir. 
                if (!user) query = query.eq('is_private', false);
            }

            const { data, error } = await query;
            if (error) throw error;

            return data.map((r: any) => ({
                ...r,
                userName: r.user?.name || 'Anónimo',
                userAvatar: r.user?.avatar_url || ''
            })) as PrayerRequest[];
        }
    });

    // CREATE
    const addRequest = useMutation({
        mutationFn: async (newRequest: { content: string; category: string; is_private: boolean }) => {
            if (!user) throw new Error("No autenticado");

            const { error } = await supabase.from('prayer_requests').insert({
                user_id: user.id,
                content: newRequest.content,
                category: newRequest.category,
                is_private: newRequest.is_private,
                amen_count: 0
            });

            if (error) throw error;

            // Gamification: Points for creating request
            await (supabase.rpc as any)('increment_impact_points', { p_user_id: user.id, p_points: 20 });
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

    // TOGGLE AMEN (Interaction)
    const toggleAmen = useMutation({
        mutationFn: async (requestId: string) => {
            if (!user) return;

            // Simple increment for now. Ideal: 'prayer_interactions' table to prevent double votes.
            // Assuming simple counter increment here as per schema "amen_count" int.
            // WARNING: Not atomic without RPC, acceptable for MVP.

            // 1. Fetch current
            const { data } = await supabase.from('prayer_requests').select('amen_count').eq('id', requestId).single();
            const current = data?.amen_count || 0;

            // 2. Increment
            const { error } = await supabase.from('prayer_requests').update({ amen_count: current + 1 }).eq('id', requestId);
            if (error) throw error;

            // Gamification: Points for praying (interaction)
            await (supabase.rpc as any)('increment_impact_points', { p_user_id: user.id, p_points: 5 });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer_requests'] });
        }
    });

    return {
        requests,
        isLoading,
        addRequest,
        deleteRequest,
        editRequest,
        toggleAmen
    };
};
