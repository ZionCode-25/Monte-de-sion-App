import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Venture } from '../../types';

export const useAdminVentures = (user: any) => {
    const queryClient = useQueryClient();

    // --- QUERY ALL VENTURES FOR ADMIN ---
    const { data: ventures = [], isLoading } = useQuery({
        queryKey: ['admin-ventures'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('ventures')
                .select('*, owner_profile:profiles(name, avatar_url, email)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []) as Venture[];
        },
        enabled: !!user
    });

    // --- UPDATE VENTURE STATUS MUTATION ---
    const updateVentureStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' | 'pending' }) => {
            const { data, error } = await supabase
                .from('ventures')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ventures'] });
            queryClient.invalidateQueries({ queryKey: ['shop-ventures'] });
            queryClient.invalidateQueries({ queryKey: ['shop-products'] });
            queryClient.invalidateQueries({ queryKey: ['my-venture'] });
        }
    });

    // --- DELETE VENTURE MUTATION ---
    const deleteVentureMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('ventures').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ventures'] });
            queryClient.invalidateQueries({ queryKey: ['shop-ventures'] });
            queryClient.invalidateQueries({ queryKey: ['shop-products'] });
            queryClient.invalidateQueries({ queryKey: ['my-venture'] });
        }
    });

    return {
        ventures,
        isLoading,
        updateVentureStatusMutation,
        deleteVentureMutation
    };
};
