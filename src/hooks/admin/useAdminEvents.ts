import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { EventItem } from '../../types';

export const useAdminEvents = (user: any) => {
    const queryClient = useQueryClient();

    // --- QUERY ---
    const { data: events = [], isLoading } = useQuery({
        queryKey: ['admin-events'],
        queryFn: async () => {
            const { data } = await supabase
                .from('events')
                .select('*, author_profile:profiles(name, avatar_url)')
                .order('date', { ascending: true });
            return (data || []).map((e: any) => ({
                id: e.id,
                title: e.title,
                description: e.description,
                date: e.date,
                time: e.time,
                location: e.location,
                imageUrl: e.image_url || '',
                category: e.category,
                isFeatured: e.is_featured,
                capacity: e.capacity || 0,
                author_profile: e.author_profile
            })) as any[];
        },
        enabled: !!user
    });

    // --- MUTATIONS ---
    const saveEventMutation = useMutation({
        mutationFn: async (data: any) => {
            const payload = {
                title: data.title,
                description: data.description,
                date: data.date,
                time: data.time,
                category: data.category,
                image_url: data.imageUrl || data.image_url,
                location: data.location,
                is_featured: !!data.isFeatured,
                capacity: data.capacity || 0,
                lat: data.lat,
                lng: data.lng,
                author_id: data.author_id || data.userId
            };

            if (data.id) return supabase.from('events').update(payload).eq('id', data.id);
            return supabase.from('events').insert(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-events'] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['nextEvents'] });
        }
    });

    const deleteEventMutation = useMutation({
        mutationFn: async (id: string) => {
            return supabase.from('events').delete().eq('id', id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-events'] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['nextEvents'] });
        }
    });

    return {
        events,
        isLoading,
        saveEventMutation,
        deleteEventMutation
    };
};
