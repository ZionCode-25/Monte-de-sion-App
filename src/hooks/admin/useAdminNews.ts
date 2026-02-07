import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { NewsItem } from '../../types';

export const useAdminNews = (user: any, activeModule: string) => {
    const queryClient = useQueryClient();

    // --- QUERIES ---
    const { data: news = [], isLoading } = useQuery({
        queryKey: ['admin-news'],
        queryFn: async () => {
            const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
            return (data || []) as any[];
        },
        enabled: !!user && activeModule === 'news'
    });

    // --- MUTATIONS ---
    const saveNewsMutation = useMutation({
        mutationFn: async (data: any) => {
            if (data.id) return supabase.from('news').update(data).eq('id', data.id);
            return supabase.from('news').insert(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-news'] });
            queryClient.invalidateQueries({ queryKey: ['latestNews'] });
            queryClient.invalidateQueries({ queryKey: ['news'] });
        }
    });

    const deleteNewsMutation = useMutation({
        mutationFn: async (id: string) => {
            return supabase.from('news').delete().eq('id', id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-news'] });
            queryClient.invalidateQueries({ queryKey: ['latestNews'] });
            queryClient.invalidateQueries({ queryKey: ['news'] });
        }
    });

    const toggleNewsPriorityMutation = useMutation({
        mutationFn: async ({ id, priority }: { id: string, priority: boolean }) => {
            return supabase.from('news').update({ priority }).eq('id', id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-news'] });
            queryClient.invalidateQueries({ queryKey: ['latestNews'] });
        }
    });

    return {
        news,
        isLoading,
        saveNewsMutation,
        deleteNewsMutation,
        toggleNewsPriorityMutation
    };
};
