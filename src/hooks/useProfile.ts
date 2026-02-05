
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../components/context/AuthContext';

export interface ProfileUpdateData {
    name?: string;
    bio?: string;
    avatar_url?: string;
}

export const useProfile = () => {
    const { user, updateProfile: updateAuthProfile } = useAuth();
    const queryClient = useQueryClient();

    const updateProfileMutation = useMutation({
        mutationFn: async (data: ProfileUpdateData) => {
            if (!user?.id) throw new Error('No user logged in');

            const { error } = await supabase
                .from('profiles')
                .update({
                    name: data.name,
                    bio: data.bio,
                    avatar_url: data.avatar_url
                })
                .eq('id', user.id);

            if (error) throw error;

            // Also update AuthContext local state if name or avatar changed
            if (data.name || data.avatar_url) {
                updateAuthProfile({
                    name: data.name,
                    avatar: data.avatar_url
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
        }
    });

    return {
        updateProfile: updateProfileMutation.mutateAsync,
        isUpdating: updateProfileMutation.isPending
    };
};
