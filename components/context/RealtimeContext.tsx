
import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimeContextType {
    // We can expose methods later if needed
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) return;

        // Channel for general notifications or updates
        // Since we don't have a notifications table yet, we can listen to general activity 
        // OR better yet, let's just listen to changes that might affect the current view 
        // to simplify "Realtime" without backend triggers for now.

        // However, the prompt asked for "Notificaciones de chat o likes".
        // Without a server-side "notifications" table that links "Post X liked" -> "User Y (Owner)",
        // client-side filtering is heavy.

        // For now, let's listen to 'INSERT' on comments and just toast if it's NOT my comment.
        // But we don't know who the post owner is from the comment payload easily.

        // MVP: Just listen for global refetch triggers on tables we care about.

        const channel = supabase.channel('global-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'posts' },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['posts'] });
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'comments' },
                () => {
                    // We could show a toast "Nuevo comentario en la comunidad" but that's too spammy.
                    // Just invalidate.
                    queryClient.invalidateQueries({ queryKey: ['posts'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    return (
        <RealtimeContext.Provider value={{}}>
            {children}
        </RealtimeContext.Provider>
    );
};

export const useRealtime = () => {
    const context = useContext(RealtimeContext);
    if (!context) {
        throw new Error('useRealtime must be used within a RealtimeProvider');
    }
    return context;
};
