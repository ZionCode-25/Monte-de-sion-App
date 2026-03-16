import React, { useState } from 'react';
import { useAdminUsers } from '../../hooks/admin/useAdminUsers';
import { Profile, AppRole } from '../../types';
import { SafeImage } from '../../components/ui/SafeImage';

interface AdminUsersProps {
    user: any;
    triggerToast: (msg: string) => void;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ user, triggerToast }) => {
    const { 
        allUsers, 
        userCount, 
        banAppeals,
        isLoading, 
        loadingAppeals,
        updateUserRoleMutation, 
        toggleBanMutation, 
        deleteUserMutation,
        resolveAppealMutation 
    } = useAdminUsers(user, 'users');
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyBanned, setShowOnlyBanned] = useState(false);
    const [activeTab, setActiveTab] = useState<'members' | 'appeals'>('members');

    const filteredUsers = allUsers.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBanned = showOnlyBanned ? u.is_banned : true;
        return matchesSearch && matchesBanned;
    });

    const [showGuide, setShowGuide] = useState(false);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    return (
        <div className="flex flex-col h-full bg-brand-bg dark:bg-black/90">

            {/* Header */}
            <div className="flex-none p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-obsidian/5 dark:border-white/5">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight">
                            Comunidad
                        </h2>
                        <span className="px-3 py-1 rounded-full bg-brand-obsidian/5 dark:bg-white/10 text-xs font-black text-brand-obsidian dark:text-white border border-brand-obsidian/5 dark:border-white/5">
                            {filteredUsers.length} Miembros Activos
                        </span>
                    </div>
                    <p className="mt-2 text-brand-obsidian/40 dark:text-white/40 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                        Gestiona permisos y roles de los usuarios registrados.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${showGuide ? 'bg-brand-primary text-brand-obsidian' : 'bg-brand-obsidian/5 dark:bg-white/5 text-brand-obsidian/60 dark:text-white/40'}`}
                    >
                        <span className="material-symbols-outlined text-sm">{showGuide ? 'stat_minus_1' : 'stat_1'}</span>
                        {showGuide ? 'Ocultar Guía' : 'Ver Guía de Roles'}
                    </button>

                    {/* Search & Tabs */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex bg-white dark:bg-brand-surface p-1 rounded-xl shadow-sm ring-1 ring-brand-obsidian/5">
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'members' ? 'bg-brand-primary text-brand-obsidian shadow-md' : 'text-brand-obsidian/40 dark:text-white/40'}`}
                            >
                                Miembros
                            </button>
                            <button
                                onClick={() => setActiveTab('appeals')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'appeals' ? 'bg-brand-primary text-brand-obsidian shadow-md' : 'text-brand-obsidian/40 dark:text-white/40'}`}
                            >
                                Reclamos
                                {banAppeals.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full scale-75 border-2 border-white dark:border-black">
                                        {banAppeals.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="relative w-full md:w-64">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-brand-obsidian/30 dark:text-white/30">search</span>
                            <input
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-brand-surface rounded-xl border-none ring-1 ring-brand-obsidian/5 focus:ring-2 focus:ring-brand-primary placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest placeholder:font-bold text-sm"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => setShowOnlyBanned(!showOnlyBanned)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${showOnlyBanned ? 'bg-amber-500 text-brand-obsidian' : 'bg-brand-obsidian/5 dark:bg-white/5 text-brand-obsidian/60 dark:text-white/40'}`}
                        >
                            <span className="material-symbols-outlined text-sm">block</span>
                            {showOnlyBanned ? 'Ver Todos' : 'Ver Baneados'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Roles Guide */}
            {showGuide && (
                <div className="px-6 md:px-8 mt-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 rounded-3xl p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">shield_person</span>
                            Guía de Jerarquía y Permisos
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-brand-obsidian dark:text-white">MIEMBRO</p>
                                <p className="text-[9px] opacity-60 leading-tight">Acceso a comunidad, altar de oración y devocionales.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-brand-obsidian dark:text-white text-indigo-500">MODERADOR</p>
                                <p className="text-[9px] opacity-60 leading-tight">Puede eliminar comentarios inapropiados y gestionar reportes.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-brand-obsidian dark:text-white text-emerald-500">LÍDER</p>
                                <p className="text-[9px] opacity-60 leading-tight">Gestiona la agenda y asistencia de su ministerio asignado.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-brand-obsidian dark:text-white text-amber-500">PASTOR</p>
                                <p className="text-[9px] opacity-60 leading-tight">Permiso total de noticias, eventos y supervisión espiritual.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-brand-obsidian dark:text-white text-rose-500 border-b border-rose-500/20 pb-1">SUPER ADMIN</p>
                                <p className="text-[9px] opacity-60 leading-tight font-bold">Control absoluto: Gestión de ministerios, roles y configuración global.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User List / Appeals List */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {activeTab === 'members' ? (
                    isLoading ? (
                        <div className="text-center p-10 opacity-50">Cargando usuarios...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center p-12 border-2 border-dashed border-brand-obsidian/10 rounded-3xl opacity-50">
                            No se encontraron usuarios que coincidan.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredUsers.map((profile) => (
                                <div key={profile.id} className={`group p-6 bg-white dark:bg-brand-surface rounded-[2rem] border ${profile.is_banned ? 'border-amber-500/50' : 'border-brand-obsidian/5 dark:border-white/5'} shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center relative overflow-hidden`}>
                                    
                                    {profile.is_banned && (
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-amber-500 text-brand-obsidian px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">block</span>
                                                Baneado
                                            </span>
                                        </div>
                                    )}

                                    {isSuperAdmin && (
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    const action = profile.is_banned ? 'desbanear' : 'banear';
                                                    if (confirm(`¿Estás seguro de que quieres ${action} a ${profile.name}?`)) {
                                                        toggleBanMutation.mutate({ userId: profile.id, isBanned: !profile.is_banned }, {
                                                            onSuccess: () => triggerToast(`Usuario ${profile.is_banned ? 'desbaneado' : 'baneado'}`)
                                                        });
                                                    }
                                                }}
                                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${profile.is_banned ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white'}`}
                                                title={profile.is_banned ? 'Desbanear' : 'Banear'}
                                            >
                                                <span className="material-symbols-outlined text-sm">{profile.is_banned ? 'check_circle' : 'block'}</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`¿Estás seguro de que quieres eliminar COMPLETAMENTE a ${profile.name}? Esta acción borrará su cuenta de acceso y todos sus datos de forma permanente.`)) {
                                                        deleteUserMutation.mutate(profile.id, {
                                                            onSuccess: () => triggerToast(`Usuario eliminado`)
                                                        });
                                                    }
                                                }}
                                                className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    )}

                                    <div className="w-24 h-24 aspect-square rounded-full p-1 bg-gradient-to-br from-brand-primary/20 to-brand-gold/20 mb-4 group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
                                        <SafeImage src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full object-cover aspect-square" />
                                    </div>

                                    <h3 className="text-lg font-bold text-brand-obsidian dark:text-white leading-tight mb-1">{profile.name || 'Sin Nombre'}</h3>
                                    <p className="text-xs text-brand-obsidian/50 dark:text-white/50 mb-4 truncate w-full px-4">{profile.email}</p>

                                    <div className="inline-flex flex-wrap justify-center gap-1 rounded-xl p-1 bg-brand-silk dark:bg-white/5">
                                        {(['USER', 'MODERATOR', 'MINISTRY_LEADER', 'PASTOR', 'SUPER_ADMIN'] as AppRole[]).map((role) => (
                                            <button
                                                key={role}
                                                onClick={() => {
                                                    if (confirm(`¿Cambiar rol de ${profile.name} a ${role}?`)) {
                                                        updateUserRoleMutation.mutate({ userId: profile.id, newRole: role }, {
                                                            onSuccess: () => triggerToast(`Rol actualizado a ${role}`)
                                                        });
                                                    }
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${profile.role === role
                                                    ? 'bg-white dark:bg-brand-primary shadow-md text-brand-obsidian'
                                                    : 'text-brand-obsidian/30 dark:text-white/30 hover:bg-black/5 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                {role === 'USER' ? 'Miembro' :
                                                    role === 'MODERATOR' ? 'Moderador' :
                                                        role === 'MINISTRY_LEADER' ? 'Líder' :
                                                            role === 'PASTOR' ? 'Pastor' : 'Admin'}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-brand-obsidian/5 dark:border-white/5 w-full flex justify-between items-center text-[9px] font-bold uppercase tracking-widest opacity-40">
                                        <span>Unido: {new Date(profile.joined_date).toLocaleDateString()}</span>
                                        <span>{(profile as any).impact_points || 0} pts</span>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* Appeals Section */
                    loadingAppeals ? (
                        <div className="text-center p-10 opacity-50">Cargando reclamos...</div>
                    ) : banAppeals.length === 0 ? (
                        <div className="text-center p-12 border-2 border-dashed border-brand-obsidian/10 rounded-3xl opacity-50">
                            No hay reclamos de desbaneo pendientes.
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {banAppeals.map((appeal) => (
                                <div key={appeal.id} className="bg-white dark:bg-brand-surface rounded-3xl p-6 border border-brand-obsidian/5 dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-6">
                                    <div className="flex-none flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden mb-2">
                                            <SafeImage src={appeal.profile?.avatar_url} alt={appeal.profile?.name} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-brand-obsidian dark:text-white text-center leading-tight">
                                            {appeal.profile?.name}
                                        </p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-obsidian/30 dark:text-white/30">
                                                Enviado: {new Date(appeal.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-brand-obsidian/70 dark:text-white/60 italic leading-relaxed">
                                            "{appeal.message}"
                                        </p>
                                    </div>
                                    <div className="flex-none flex md:flex-col gap-2 justify-center">
                                        <button
                                            onClick={() => {
                                                if (confirm(`¿Aprobar reclamo y desbanear a ${appeal.profile?.name}?`)) {
                                                    resolveAppealMutation.mutate({ appealId: appeal.id, status: 'approved', userId: appeal.user_id }, {
                                                        onSuccess: () => triggerToast('Usuario desbaneado con éxito')
                                                    });
                                                }
                                            }}
                                            className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            Aprobar
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`¿Rechazar reclamo de ${appeal.profile?.name}?`)) {
                                                    resolveAppealMutation.mutate({ appealId: appeal.id, status: 'rejected', userId: appeal.user_id }, {
                                                        onSuccess: () => triggerToast('Reclamo rechazado')
                                                    });
                                                }
                                            }}
                                            className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">cancel</span>
                                            Rechazar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

        </div>
    );
};

export default AdminUsers;
