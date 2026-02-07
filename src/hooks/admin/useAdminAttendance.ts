import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { AttendanceSession } from '../../types';

export const useAdminAttendance = (user: any, activeModule: string) => {
    const queryClient = useQueryClient();

    const { data: attendanceSessions = [], isLoading } = useQuery({
        queryKey: ['admin-attendance'],
        queryFn: async () => {
            const { data } = await supabase.from('attendance_sessions').select('*').order('created_at', { ascending: false });
            return (data || []) as AttendanceSession[];
        },
        enabled: !!user && activeModule === 'attendance'
    });

    const createAttendanceSessionMutation = useMutation({
        mutationFn: async (session: { event_name: string; points: number; expires_in_hours: number }) => {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            const expires_at = new Date(Date.now() + session.expires_in_hours * 60 * 60 * 1000).toISOString();

            return supabase.from('attendance_sessions').insert({
                event_name: session.event_name,
                code,
                points: session.points,
                expires_at,
                status: 'active',
                created_by: user.id
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-attendance'] });
        }
    });

    const updateAttendanceStatusMutation = useMutation({
        mutationFn: async ({ id, status, expires_at }: { id: string, status: string, expires_at?: string }) => {
            const updateData: any = { status };
            if (expires_at) updateData.expires_at = expires_at;
            return supabase.from('attendance_sessions').update(updateData).eq('id', id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-attendance'] });
        }
    });

    const clearAttendanceHistoryMutation = useMutation({
        mutationFn: async () => {
            // Delete all sessions (dangerous action, but requested)
            // Usually we might just archive them, but for this app it seems we delete
            return supabase.from('attendance_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-attendance'] });
        }
    });

    return {
        attendanceSessions,
        isLoading,
        createAttendanceSessionMutation,
        updateAttendanceStatusMutation,
        clearAttendanceHistoryMutation
    };
};
