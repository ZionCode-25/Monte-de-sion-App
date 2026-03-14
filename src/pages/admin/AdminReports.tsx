import React, { useState } from 'react';
import { useAdminReports, useToggleContentVisibility, useDismissReports } from '../../hooks/useReports';

interface AdminReportsProps {
  user: any;
  triggerToast: (msg: string) => void;
}

const contentTypeLabels: Record<string, string> = {
  post: 'Comunidad',
  devotional: 'Devocional',
  prayer_request: 'Petición de Oración',
};

const contentTypeIcons: Record<string, string> = {
  post: 'forum',
  devotional: 'menu_book',
  prayer_request: 'volunteer_activism',
};

const AdminReports: React.FC<AdminReportsProps> = ({ user, triggerToast }) => {
  const { data: reports, isLoading } = useAdminReports();
  const toggleVisibility = useToggleContentVisibility();
  const dismissReports = useDismissReports();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleVisibility = (contentType: string, contentId: string, currentlyHidden: boolean) => {
    toggleVisibility.mutate(
      { contentType: contentType as any, contentId, hide: !currentlyHidden },
      {
        onSuccess: () => triggerToast(currentlyHidden ? 'Publicación restaurada' : 'Publicación ocultada'),
        onError: () => triggerToast('Error al cambiar visibilidad'),
      }
    );
  };

  const handleDismiss = (contentType: string, contentId: string) => {
    if (!confirm('¿Descartar todos los reportes de este contenido?')) return;
    dismissReports.mutate(
      { contentType: contentType as any, contentId },
      {
        onSuccess: () => triggerToast('Reportes descartados'),
        onError: () => triggerToast('Error al descartar reportes'),
      }
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.6)]"></div>
            <span className="text-brand-obsidian/40 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Moderación</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tight">
            Reportes
          </h1>
          <p className="mt-2 text-sm text-brand-obsidian/50 dark:text-white/50 font-medium">
            Publicaciones reportadas por la comunidad. Se ocultan automáticamente al alcanzar 5 reportes.
          </p>
        </div>

        {/* Stats */}
        {reports && reports.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-brand-surface rounded-2xl p-5 border border-brand-obsidian/5 dark:border-white/5">
              <p className="text-3xl font-black text-brand-obsidian dark:text-white">{reports.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian/40 dark:text-white/40 mt-1">Contenidos reportados</p>
            </div>
            <div className="bg-white dark:bg-brand-surface rounded-2xl p-5 border border-brand-obsidian/5 dark:border-white/5">
              <p className="text-3xl font-black text-orange-500">{reports.filter(r => !r.is_hidden).length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian/40 dark:text-white/40 mt-1">Aún visibles</p>
            </div>
            <div className="bg-white dark:bg-brand-surface rounded-2xl p-5 border border-brand-obsidian/5 dark:border-white/5">
              <p className="text-3xl font-black text-red-500">{reports.filter(r => r.is_hidden).length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian/40 dark:text-white/40 mt-1">Ocultos</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-brand-obsidian/20 dark:text-white/20 animate-spin">progress_activity</span>
            <p className="mt-4 text-sm font-bold text-brand-obsidian/30 dark:text-white/30 uppercase tracking-widest">Cargando reportes...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!reports || reports.length === 0) && (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-7xl text-brand-obsidian/10 dark:text-white/10 font-thin">verified_user</span>
            <p className="mt-6 text-sm font-black uppercase tracking-widest text-brand-obsidian/30 dark:text-white/30">Sin reportes</p>
            <p className="mt-2 text-xs text-brand-obsidian/20 dark:text-white/20">Todo en orden. No hay contenido reportado.</p>
          </div>
        )}

        {/* Reports List */}
        <div className="space-y-4">
          {reports?.map((group) => {
            const key = `${group.content_type}_${group.content_id}`;
            const isExpanded = expandedId === key;
            const contentPreview = group.content?.content || group.content?.title || 'Contenido eliminado';

            return (
              <div
                key={key}
                className={`bg-white dark:bg-brand-surface rounded-2xl border transition-all duration-300 overflow-hidden ${
                  group.is_hidden
                    ? 'border-red-200 dark:border-red-900/30 opacity-70'
                    : group.report_count >= 4
                      ? 'border-orange-200 dark:border-orange-900/30'
                      : 'border-brand-obsidian/5 dark:border-white/5'
                }`}
              >
                {/* Main Row */}
                <div
                  className="p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : key)}
                >
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    group.report_count >= 5
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-500'
                      : group.report_count >= 3
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-500'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                  }`}>
                    <span className="material-symbols-outlined">{contentTypeIcons[group.content_type] || 'article'}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                        {contentTypeLabels[group.content_type] || group.content_type}
                      </span>
                      {group.is_hidden && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">visibility_off</span> Oculto
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-brand-obsidian dark:text-white truncate">
                      {contentPreview.length > 80 ? contentPreview.substring(0, 80) + '...' : contentPreview}
                    </p>
                    <p className="text-[10px] text-brand-obsidian/40 dark:text-white/40 mt-0.5 font-bold">
                      Por {group.content?.user?.name || 'Usuario desconocido'} · {new Date(group.latest_report).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Report Count Badge */}
                  <div className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 ${
                    group.report_count >= 5
                      ? 'bg-red-500 text-white'
                      : group.report_count >= 3
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                  }`}>
                    {group.report_count} {group.report_count === 1 ? 'reporte' : 'reportes'}
                  </div>

                  {/* Expand Arrow */}
                  <span className={`material-symbols-outlined text-brand-obsidian/30 dark:text-white/30 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
                    {/* Content Preview */}
                    <div className="p-5 bg-gray-50/50 dark:bg-white/[0.02]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian/30 dark:text-white/30 mb-3">Contenido</p>
                      <p className="text-sm text-brand-obsidian/70 dark:text-white/70 leading-relaxed whitespace-pre-wrap">
                        {group.content?.title && <strong className="block text-brand-obsidian dark:text-white mb-1">{group.content.title}</strong>}
                        {group.content?.content || 'Contenido no disponible'}
                      </p>
                    </div>

                    {/* Reporters List */}
                    <div className="p-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian/30 dark:text-white/30 mb-3">Reportado por</p>
                      <div className="space-y-2">
                        {group.reports.map((report: any) => (
                          <div key={report.id} className="flex items-center gap-3 text-sm">
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 shrink-0">
                              {report.reporter?.avatar_url && (
                                <img src={report.reporter.avatar_url} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <span className="font-bold text-brand-obsidian dark:text-white text-xs">
                              {report.reporter?.name || 'Usuario'}
                            </span>
                            <span className="text-[10px] text-brand-obsidian/30 dark:text-white/30 ml-auto">
                              {new Date(report.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-5 border-t border-gray-100 dark:border-white/5 flex gap-3">
                      <button
                        onClick={() => handleToggleVisibility(group.content_type, group.content_id, group.is_hidden)}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                          group.is_hidden
                            ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{group.is_hidden ? 'visibility' : 'visibility_off'}</span>
                        {group.is_hidden ? 'Restaurar' : 'Ocultar'}
                      </button>
                      <button
                        onClick={() => handleDismiss(group.content_type, group.content_id)}
                        className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-brand-obsidian/60 dark:text-white/60 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Descartar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
