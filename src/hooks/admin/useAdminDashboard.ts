import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export const useAdminDashboard = (user: any) => {
    const { data: stats = { users: 0, news: 0, events: 0, ministries: 0, prayers: 0, inscriptions: 0 }, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const [users, news, events, ministries, prayers, inscriptions] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('news').select('*', { count: 'exact', head: true }),
                supabase.from('events').select('*', { count: 'exact', head: true }),
                supabase.from('ministries').select('*', { count: 'exact', head: true }),
                supabase.from('prayer_requests').select('*', { count: 'exact', head: true }),
                supabase.from('inscriptions').select('*', { count: 'exact', head: true })
            ]);

            return {
                users: users.count || 0,
                news: news.count || 0,
                events: events.count || 0,
                ministries: ministries.count || 0,
                prayers: prayers.count || 0,
                inscriptions: inscriptions.count || 0
            };
        },
        enabled: !!user
    });

    const { data: recentActivity = { news: [], events: [] } } = useQuery({
        queryKey: ['admin-recent'],
        queryFn: async () => {
            const [n, e] = await Promise.all([
                supabase.from('news').select('*').order('created_at', { ascending: false }).limit(3),
                supabase.from('events').select('*').order('date', { ascending: true }).limit(3)
            ]);
            return { news: n.data || [], events: e.data || [] };
        },
        enabled: !!user
    });

    return {
        stats,
        recentActivity,
        isLoading
    };
};
