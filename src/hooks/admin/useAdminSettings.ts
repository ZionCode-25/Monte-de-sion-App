import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export const useAdminSettings = (user: any) => {
    const queryClient = useQueryClient();

    const { data: settings = {}, isLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: async () => {
            const { data } = await supabase.from('app_settings').select('*');
            const map: Record<string, any> = {};
            data?.forEach((item: any) => map[item.key] = item.value);
            return map;
        },
        enabled: !!user
    });

    const updateSettingMutation = useMutation({
        mutationFn: async ({ key, value }: { key: string, value: any }) => {
            // Upsert logic: check if exists, then update or insert
            const { data } = await supabase.from('app_settings').select('*').eq('key', key).single();

            if (data) {
                return supabase.from('app_settings').update({ value }).eq('key', key);
            } else {
                return supabase.from('app_settings').insert({ key, value });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            queryClient.invalidateQueries({ queryKey: ['appSettings'] }); // Global app settings query
        }
    });

    return {
        settings,
        isLoading,
        updateSettingMutation
    };
};
