import React, { useState } from 'react';
import { useAdminVentures } from '../../hooks/admin/useAdminVentures';
import { Venture } from '../../types';

interface AdminVenturesProps {
    user: any;
    triggerToast: (msg: string) => void;
}

export const AdminVentures: React.FC<AdminVenturesProps> = ({ user, triggerToast }) => {
    const { ventures, isLoading, updateVentureStatusMutation, deleteVentureMutation } = useAdminVentures(user);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

    const filteredVentures = ventures.filter(v => {
        if (statusFilter === 'all') return true;
        return v.status === statusFilter;
    });

    const handleStatusChange = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
        try {
            await updateVentureStatusMutation.mutateAsync({ id, status });
            triggerToast(`Emprendimiento ${status === 'approved' ? 'aprobado' : status === 'rejected' ? 'rechazado' : 'puesto en revisión'}`);
        } catch (err) {
            console.error(err);
            triggerToast('Error al cambiar estado del emprendimiento');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este emprendimiento?')) return;
        try {
            await deleteVentureMutation.mutateAsync(id);
            triggerToast('Emprendimiento eliminado');
        } catch (err) {
            console.error(err);
            triggerToast('Error al eliminar emprendimiento');
        }
    };

    const pendingCount = ventures.filter(v => v.status === 'pending').length;

    return (
        <div className="flex flex-col h-full bg-[#F8F9FA] dark:bg-black/95">
            {/* Header */}
            <div className="flex-none px-8 pt-10 pb-6 md:px-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em]">
                                Moderación de Mercado Sión
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-tight tracking-tight">
                            Gestión de <span className="text-brand-primary">Emprendimientos</span>
                        </h2>
                    </div>

                    {pendingCount > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/30 px-5 py-3 rounded-2xl flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                {pendingCount} Solicitudes Pendientes
                            </span>
                        </div>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'pending', label: `Pendientes (${pendingCount})` },
                        { id: 'approved', label: 'Aprobados' },
                        { id: 'rejected', label: 'Rechazados' },
                        { id: 'all', label: `Todos (${ventures.length})` }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id as any)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${statusFilter === tab.id
                                    ? 'bg-brand-primary text-brand-obsidian border-brand-primary shadow-lg shadow-brand-primary/20'
                                    : 'bg-white dark:bg-brand-surface text-brand-obsidian/40 dark:text-white/40 border-brand-obsidian/5 dark:border-white/5 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-32 custom-scrollbar">
                {isLoading ? (
                    <div className="h-64 flex flex-col items-center justify-center opacity-40">
                        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">Cargando solicitudes...</p>
                    </div>
                ) : filteredVentures.length === 0 ? (
                    <div className="h-80 flex flex-col items-center justify-center text-center opacity-40 border-2 border-dashed border-brand-obsidian/5 dark:border-white/5 rounded-[3rem]">
                        <span className="material-symbols-outlined text-4xl mb-2">storefront</span>
                        <h3 className="text-xl font-serif font-bold">Sin solicitudes en esta sección</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredVentures.map(v => (
                            <div
                                key={v.id}
                                className="bg-white dark:bg-brand-surface rounded-[2rem] p-6 border border-brand-obsidian/5 dark:border-white/5 shadow-sm flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${v.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                v.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                                                    'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse'
                                            }`}>
                                            {v.status === 'approved' ? 'Aprobado' : v.status === 'rejected' ? 'Rechazado' : 'Pendiente de Revisión'}
                                        </span>

                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                                            {v.category}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <img
                                            src={v.logo_url}
                                            alt={v.name}
                                            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-primary shadow-md shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <h3 className="font-serif font-bold text-xl text-brand-obsidian dark:text-white truncate">
                                                {v.name}
                                            </h3>
                                            {v.owner_profile && (
                                                <p className="text-xs opacity-60 truncate">
                                                    Hermano: {v.owner_profile.name} ({v.owner_profile.email})
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-brand-obsidian/70 dark:text-white/70 line-clamp-3 leading-relaxed font-medium">
                                        {v.description}
                                    </p>

                                    <div className="bg-brand-silk/40 dark:bg-black/20 p-3 rounded-xl space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="opacity-50">WhatsApp:</span>
                                            <span className="font-bold">{v.whatsapp_number}</span>
                                        </div>
                                        {v.bank_alias && (
                                            <div className="flex justify-between">
                                                <span className="opacity-50">Alias:</span>
                                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{v.bank_alias}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 mt-6 border-t border-brand-obsidian/5 dark:border-white/5 flex gap-2">
                                    {v.status !== 'approved' && (
                                        <button
                                            onClick={() => handleStatusChange(v.id, 'approved')}
                                            className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            Aprobar
                                        </button>
                                    )}

                                    {v.status !== 'rejected' && (
                                        <button
                                            onClick={() => handleStatusChange(v.id, 'rejected')}
                                            className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-amber-600 active:scale-95 transition-all flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">cancel</span>
                                            Rechazar
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(v.id)}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                        title="Eliminar registro"
                                    >
                                        <span className="material-symbols-outlined text-base">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminVentures;
