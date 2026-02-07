import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Profile, AppRole } from '../../types';

export const useAdminUsers = (user: any, activeModule: string) => {
    const queryClient = useQueryClient();

    // --- QUERIES ---
    const { data: allUsers = [], isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data } = await supabase.from('profiles').select('*').order('joined_date', { ascending: false });
            return (data || []) as Profile[];
        },
        enabled: !!user && activeModule === 'users'
    });

    const { data: userCount = 0 } = useQuery({
        queryKey: ['admin-user-count'],
        queryFn: async () => {
            const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            return count || 0;
        },
        enabled: !!user
    });

    // --- MUTATIONS ---
    const updateUserRoleMutation = useMutation({
        mutationFn: async ({ userId, newRole }: { userId: string, newRole: AppRole }) => {
            // 1. Update metadata (if using Supabase Auth, but usually handled by triggers or edge functions)
            // For now, we update the profile table role which is what the app uses
            return supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] }); // Invalidate specific valid profile queries if possible
        }
    });

    return {
        allUsers,
        userCount,
        isLoading,
        updateUserRoleMutation
    };
};
