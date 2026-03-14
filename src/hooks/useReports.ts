import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/context/AuthContext';

type ContentType = 'post' | 'devotional' | 'prayer_request';

// --- REPORT CONTENT (for any user) ---
export const useReportContent = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contentType, contentId, reason }: { contentType: ContentType; contentId: string; reason?: string }) => {
            if (!user) throw new Error('No autenticado');

            // 1. Insert the report
            const { error: reportError } = await supabase.from('content_reports').insert({
                reporter_id: user.id,
                content_type: contentType,
                content_id: contentId,
                reason: reason || 'inappropriate'
            });

            if (reportError) {
                if (reportError.code === '23505') {
                    throw new Error('Ya reportaste este contenido');
                }
                throw reportError;
            }

            // 2. Count reports for this content
            const { count, error: countError } = await supabase
                .from('content_reports')
                .select('*', { count: 'exact', head: true })
                .eq('content_type', contentType)
                .eq('content_id', contentId);

            if (countError) throw countError;

            // 3. If >= 5 reports, hide the content
            if (count && count >= 5) {
                const tableName = contentType === 'post' ? 'posts'
                    : contentType === 'devotional' ? 'devotionals'
                        : 'prayer_requests';

                const { error: hideError } = await supabase
                    .from(tableName)
                    .update({ is_hidden: true })
                    .eq('id', contentId);

                if (hideError) throw hideError;
            }

            return { reportCount: count || 1 };
        },
        onSuccess: (_data, variables) => {
            // Invalidate relevant queries
            if (variables.contentType === 'post') {
                queryClient.invalidateQueries({ queryKey: ['posts'] });
            } else if (variables.contentType === 'devotional') {
                queryClient.invalidateQueries({ queryKey: ['devotionals'] });
            } else if (variables.contentType === 'prayer_request') {
                queryClient.invalidateQueries({ queryKey: ['prayer_requests'] });
            }
            queryClient.invalidateQueries({ queryKey: ['admin_reports'] });
        }
    });
};

// --- ADMIN: Fetch all reports ---
export const useAdminReports = () => {
    return useQuery({
        queryKey: ['admin_reports'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('content_reports')
                .select(`
                    *,
                    reporter:profiles!reporter_id(name, avatar_url)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Group reports by content_type + content_id
            const grouped: Record<string, {
                content_type: ContentType;
                content_id: string;
                report_count: number;
                reports: any[];
                latest_report: string;
            }> = {};

            for (const report of (data || [])) {
                const key = `${report.content_type}_${report.content_id}`;
                if (!grouped[key]) {
                    grouped[key] = {
                        content_type: report.content_type,
                        content_id: report.content_id,
                        report_count: 0,
                        reports: [],
                        latest_report: report.created_at
                    };
                }
                grouped[key].report_count++;
                grouped[key].reports.push(report);
                if (report.created_at > grouped[key].latest_report) {
                    grouped[key].latest_report = report.created_at;
                }
            }

            // Fetch content details for each group
            const enrichedGroups = await Promise.all(
                Object.values(grouped).map(async (group) => {
                    const tableName = group.content_type === 'post' ? 'posts'
                        : group.content_type === 'devotional' ? 'devotionals'
                            : 'prayer_requests';

                    const { data: contentData } = await supabase
                        .from(tableName)
                        .select('*, user:profiles!user_id(name, avatar_url)')
                        .eq('id', group.content_id)
                        .maybeSingle();

                    return {
                        ...group,
                        content: contentData,
                        is_hidden: contentData?.is_hidden || false
                    };
                })
            );

            // Sort by report count descending
            return enrichedGroups.sort((a, b) => b.report_count - a.report_count);
        },
        staleTime: 1000 * 60 * 2
    });
};

// --- ADMIN: Toggle visibility ---
export const useToggleContentVisibility = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contentType, contentId, hide }: { contentType: ContentType; contentId: string; hide: boolean }) => {
            const tableName = contentType === 'post' ? 'posts'
                : contentType === 'devotional' ? 'devotionals'
                    : 'prayer_requests';

            const { error } = await supabase
                .from(tableName)
                .update({ is_hidden: hide })
                .eq('id', contentId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_reports'] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['devotionals'] });
            queryClient.invalidateQueries({ queryKey: ['prayer_requests'] });
        }
    });
};

// --- ADMIN: Dismiss reports for a content ---
export const useDismissReports = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contentType, contentId }: { contentType: ContentType; contentId: string }) => {
            const { error } = await supabase
                .from('content_reports')
                .delete()
                .eq('content_type', contentType)
                .eq('content_id', contentId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_reports'] });
        }
    });
};
