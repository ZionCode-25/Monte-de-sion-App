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

    const { data: banAppeals = [], isLoading: loadingAppeals } = useQuery({
        queryKey: ['admin-ban-appeals'],
        queryFn: async () => {
            const { data } = await supabase
                .from('ban_appeals')
                .select('*, profile:profiles(name, email, avatar_url)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            return data || [];
        },
        enabled: !!user && activeModule === 'users' && (user.role === 'SUPER_ADMIN' || user.role === 'PASTOR')
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
            const { data, error } = await supabase.functions.invoke('delete-user', {
                body: { userId }
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-user-count'] });
        }
    });

    const resolveAppealMutation = useMutation({
        mutationFn: async ({ appealId, status, userId }: { appealId: string, status: 'approved' | 'rejected', userId: string }) => {
            const { error: appealError } = await supabase
                .from('ban_appeals')
                .update({ status, resolved_at: new Date().toISOString() })
                .eq('id', appealId);
            
            if (appealError) throw appealError;

            if (status === 'approved') {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ is_banned: false } as any)
                    .eq('id', userId);
                if (profileError) throw profileError;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ban-appeals'] });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
    });

    return {
        allUsers,
        userCount,
        banAppeals,
        isLoading,
        loadingAppeals,
        updateUserRoleMutation,
        toggleBanMutation,
        deleteUserMutation,
        resolveAppealMutation
    };
};
