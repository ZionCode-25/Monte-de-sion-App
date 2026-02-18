import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Ministry {
    id: string;
    name: string;
    description: string;
    color?: string | null;
    icon?: string | null;
    image_url?: string | null;
    created_at: string;
    // Add UI/Extended fields if needed
    vision?: string;
    purpose?: string;
    activities?: string;
    schedule?: string;
    notes?: string;
    leader_id?: string;
    category?: string;
}

export const useMinistries = () => {
    const queryClient = useQueryClient();

    const fetchMinistries = async (): Promise<Ministry[]> => {
        const { data, error } = await supabase
            .from('ministries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    };

    const query = useQuery({
        queryKey: ['ministries'],
        queryFn: fetchMinistries,
        staleTime: 1000 * 60 * 5, // 5 mins
    });

    const createMutation = useMutation({
        mutationFn: async (newMinistry: Partial<Ministry>) => {
            const { data, error } = await supabase
                .from('ministries')
                .insert([newMinistry] as any)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ministries'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Ministry> }) => {
            const { data, error } = await supabase
                .from('ministries')
                .update(updates as any)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ministries'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('ministries')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ministries'] });
        },
    });

    return {
        ministries: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        createMinistry: createMutation,
        updateMinistry: updateMutation,
        deleteMinistry: deleteMutation,
    };
};
