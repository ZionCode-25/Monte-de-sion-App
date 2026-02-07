import React, { useState } from 'react';
import { useAdminUsers } from '../../hooks/admin/useAdminUsers';
import { Profile, AppRole } from '../../types';
import { SmartImage } from '../../components/ui/SmartImage';

interface AdminUsersProps {
    user: any;
    triggerToast: (msg: string) => void;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ user, triggerToast }) => {
    const { allUsers, userCount, isLoading, updateUserRoleMutation } = useAdminUsers(user, 'users');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = allUsers.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            {userCount} Miembros
                        </span>
                    </div>
                    <p className="mt-2 text-brand-obsidian/40 dark:text-white/40 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                        Gestiona permisos y roles de los usuarios registrados.
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-96">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-brand-obsidian/30 dark:text-white/30">search</span>
                    <input
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-brand-surface rounded-xl border-none ring-1 ring-brand-obsidian/5 focus:ring-2 focus:ring-brand-primary placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest placeholder:font-bold text-sm"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {isLoading ? (
                    <div className="text-center p-10 opacity-50">Cargando usuarios...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed border-brand-obsidian/10 rounded-3xl opacity-50">
                        No se encontraron usuarios.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredUsers.map((profile) => (
                            <div key={profile.id} className="group p-6 bg-white dark:bg-brand-surface rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center relative overflow-hidden">

                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-brand-primary/20 to-brand-gold/20 mb-4 group-hover:scale-105 transition-transform">
                                    <SmartImage src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                                </div>

                                <h3 className="text-lg font-bold text-brand-obsidian dark:text-white leading-tight mb-1">{profile.name || 'Sin Nombre'}</h3>
                                <p className="text-xs text-brand-obsidian/50 dark:text-white/50 mb-4 truncate w-full px-4">{profile.email}</p>

                                <div className="inline-flex rounded-xl p-1 bg-brand-silk dark:bg-white/5">
                                    {(['member', 'admin', 'moderator'] as AppRole[]).map((role) => (
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
                                            {role === 'member' ? 'Miembro' : role}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-brand-obsidian/5 dark:border-white/5 w-full flex justify-between items-center text-[9px] font-bold uppercase tracking-widest opacity-40">
                                    <span>Unido: {new Date(profile.joined_date).toLocaleDateString()}</span>
                                    <span>{profile.points || 0} pts</span>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminUsers;
