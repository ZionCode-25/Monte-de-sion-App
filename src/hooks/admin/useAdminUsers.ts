import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
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
            return supabase.from('profiles').update({ role: newRole } as any).eq('id', userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
    });

    const toggleBanMutation = useMutation({
        mutationFn: async ({ userId, isBanned }: { userId: string, isBanned: boolean }) => {
            return supabase.from('profiles').update({ is_banned: isBanned } as any).eq('id', userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            return supabase.from('profiles').update({ is_deleted: true } as any).eq('id', userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-user-count'] });
        }
    });

    return {
        allUsers,
        userCount,
        isLoading,
        updateUserRoleMutation,
        toggleBanMutation,
        deleteUserMutation
    };
};
