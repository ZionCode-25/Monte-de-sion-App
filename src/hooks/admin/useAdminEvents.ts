import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { EventItem } from '../../types';

export const useAdminEvents = (user: any) => {
    const queryClient = useQueryClient();

    // --- QUERY ---
    const { data: events = [], isLoading } = useQuery({
        queryKey: ['admin-events'],
        queryFn: async () => {
            const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
            return (data || []).map((e: any) => ({
                id: e.id,
                title: e.title,
                description: e.description,
                date: e.date,
                time: e.time,
                location: e.location,
                imageUrl: e.image_url || '',
                category: e.category,
                isFeatured: e.priority, // Map DB priority to UI isFeatured
                priority: e.priority
            })) as EventItem[];
        },
        enabled: !!user
    });

    // --- MUTATIONS ---
    const saveEventMutation = useMutation({
        mutationFn: async (data: any) => {
            const payload = { ...data, priority: data.isFeatured }; // Map UI isFeatured back to DB priority
            delete payload.isFeatured;
            delete payload.imageUrl; // Ensure we use image_url for DB

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
