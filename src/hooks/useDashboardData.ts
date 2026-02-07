import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Devotional, EventItem, NewsItem, AttendanceSession } from '../types';

export const useDashboardData = () => {

    const { data: latestDevotional, isLoading: isLoadingDevotional } = useQuery({
        queryKey: ['latestDevotional'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('devotionals')
                .select('*, profiles(name, avatar_url)')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) console.error("Error fetching devotional:", error);
            if (!data) return null;

            // Type assertion for the joined profile data
            const profile = data.profiles as unknown as { name: string; avatar_url: string } | null;

            return {
                id: data.id,
                title: data.title,
                content: data.content,
                bibleVerse: data.bible_verse,
                userId: data.user_id,
                userName: profile?.name || 'Anónimo',
                userAvatar: profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
                createdAt: data.created_at
            } as unknown as Devotional;
        }
    });

    const { data: nextEvent, isLoading: isLoadingEvent } = useQuery({
        queryKey: ['nextEvent'],
        queryFn: async () => {
            const { data } = await supabase.from('events').select('*').gte('date', new Date().toISOString()).order('date', { ascending: true }).limit(1).maybeSingle();
            if (!data) return null;
            return {
                id: data.id,
                title: data.title,
                date: data.date,
                time: data.time ?? '00:00',
                location: data.location ?? 'TBA',
                imageUrl: data.image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80',
                description: data.description,
                isFeatured: data.priority ?? false,
                category: data.category || 'Celebración'
            } as unknown as EventItem;
        }
    });

    const { data: latestNews, isLoading: isLoadingNews } = useQuery({
        queryKey: ['latestNews'],
        queryFn: async () => {
            const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
            if (!data) return null;
            return {
                id: data.id,
                title: data.title,
                content: data.content,
                imageUrl: data.image_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80',
                date: data.created_at,
                category: data.category || 'General',
                priority: data.priority ? 'high' : 'low',
                author: 'Admin'
            } as unknown as NewsItem;
        }
    });

    const { data: communityPreview, isLoading: isLoadingCommunity } = useQuery({
        queryKey: ['communityPreview'],
        queryFn: async () => {
            const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true });
            const { data } = await supabase.from('posts').select('user:profiles(avatar_url)').order('created_at', { ascending: false }).limit(3);

            const avatars = data?.map((p: any) => p.user?.avatar_url).filter(Boolean) || [];
            return { count: count || 0, avatars };
        }
    });

    const { data: activeAttendanceSession } = useQuery({
        queryKey: ['activeAttendanceSession'],
        queryFn: async () => {
            const { data, error } = await (supabase.from('attendance_sessions' as any))
                .select('*')
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error("Error checking attendance sessions:", error);
                return null;
            }
            return data as unknown as AttendanceSession;
        },
        refetchInterval: 30000 // Check every 30 seconds
    });

    return {
        latestDevotional,
        nextEvent,
        latestNews,
        communityPreview,
        activeAttendanceSession,
        isLoading: isLoadingDevotional || isLoadingEvent || isLoadingNews || isLoadingCommunity
    };
};
