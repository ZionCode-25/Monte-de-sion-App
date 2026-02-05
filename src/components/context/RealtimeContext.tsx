import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from './ToastContext';

interface RealtimeContextType { }

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    useEffect(() => {
        if (!user) return;

        const channel = supabase.channel('app-realtime')
            // Listen for NEW COMMENTS to show Toast (if not mine)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'comments' },
                (payload) => {
                    if (payload.new.user_id !== user.id) {
                        showToast('Nuevo comentario en la comunidad', 'info');
                    }
                    queryClient.invalidateQueries({ queryKey: ['posts'] });
                }
            )
            // Listen for NEW POSTS
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'posts' },
                (payload) => {
                    if (payload.new.user_id !== user.id) {
                        showToast('Alguien publicó algo nuevo', 'success');
                    }
                    queryClient.invalidateQueries({ queryKey: ['posts'] });
                }
            )
            // Listen for DELETIONS to keep UI clean
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'posts' },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['posts'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient, showToast]);

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
