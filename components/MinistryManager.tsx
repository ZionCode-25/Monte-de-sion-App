import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './context/AuthContext';
import { Ministry, MinistryMember, Inscription } from '../types';

interface MinistryManagerProps {
    ministryId: string;
}

const MinistryManager: React.FC<MinistryManagerProps> = ({ ministryId }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'info' | 'members' | 'requests'>('info');
    const [showToast, setShowToast] = useState<string | null>(null);

    // Forms
    const [infoForm, setInfoForm] = useState({ schedule: '', activities: '', notes: '' });
    const [memberRole, setMemberRole] = useState<{ [key: string]: string }>({});

    const triggerToast = (msg: string) => {
        setShowToast(msg);
        setTimeout(() => setShowToast(null), 3000);
    };

    // --- QUERIES ---

    const { data: ministry, isLoading: loadingMinistry } = useQuery({
        queryKey: ['ministry-detail', ministryId],
        queryFn: async () => {
            const { data, error } = await supabase.from('ministries').select('*').eq('id', ministryId).single();
            if (error) throw error;
            setInfoForm({
                schedule: data.schedule || '',
                activities: data.activities || '',
                notes: data.notes || ''
            });
            return data as Ministry;
        }
    });

    const { data: members = [] } = useQuery({
        queryKey: ['ministry-members', ministryId],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await supabase
                .from('ministry_members')
                .select('*, user:profiles(name, avatar_url, email)')
                .eq('ministry_id', ministryId);

            if (error) throw error;

            return data.map((m: any) => ({
                ...m,
                user: {
                    name: m.user?.name || 'Usuario',
                    avatar_url: m.user?.avatar_url,
                    email: m.user?.email
                }
            })) as MinistryMember[];
        },
        enabled: activeTab === 'members'
    });

    const { data: requests = [] } = useQuery({
        queryKey: ['ministry-requests', ministryId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('inscriptions')
                .select('*, user:profiles(name, avatar_url)')
                .eq('ministry_id', ministryId)
                .eq('status', 'pending');

            if (error) throw error;
            return data.map((r: any) => ({
                ...r,
                userName: r.user?.name,
                userAvatar: r.user?.avatar_url
            })) as Inscription & { userAvatar?: string };
        },
        enabled: activeTab === 'requests'
    });

    // --- MUTATIONS ---

    const updateInfoMutation = useMutation({
        mutationFn: async (formData: any) => {
            const { error } = await supabase.from('ministries').update(formData).eq('id', ministryId);
            if (error) throw error;
        },
        onSuccess: () => triggerToast("Información actualizada"),
        onError: () => triggerToast("Error al guardar")
    });

    const updateMemberRoleMutation = useMutation({
        mutationFn: async ({ memberId, role }: { memberId: string, role: string }) => {
            // @ts-ignore
            const { error } = await supabase.from('ministry_members').update({ role }).eq('id', memberId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ministry-members'] });
            triggerToast("Rol actualizado");
        },
        onError: () => triggerToast("Error al actualizar rol")
    });

    const removeMemberMutation = useMutation({
        mutationFn: async (memberId: string) => {
            // @ts-ignore
            const { error } = await supabase.from('ministry_members').delete().eq('id', memberId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ministry-members'] });
            triggerToast("Miembro eliminado");
        }
    });

    const processRequestMutation = useMutation({
        mutationFn: async ({ req, status }: { req: any, status: 'approved' | 'rejected' }) => {
            // Update inscription status
            const { error: insError } = await supabase.from('inscriptions').update({ status }).eq('id', req.id);
            if (insError) throw insError;

            if (status === 'approved') {
                // Add to members table if approved
                // @ts-ignore
                const { error: memberError } = await supabase.from('ministry_members').insert({
                    ministry_id: ministryId,
                    user_id: req.user_id,
                    role: 'Miembro' // Default role
                });
                if (memberError) throw memberError;
            }
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['ministry-requests'] });
            queryClient.invalidateQueries({ queryKey: ['ministry-members'] });
            triggerToast(vars.status === 'approved' ? "Solicitud aprobada" : "Solicitud rechazada");
        },
        onError: (err) => {
            console.error(err);
            triggerToast("Error al procesar solicitud");
        }
    });

    // --- RENDER ---

    if (loadingMinistry) return <div className="p-8 text-center opacity-50">Cargando ministerio...</div>;

    return (
        <div className="animate-reveal">
            {showToast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] bg-brand-obsidian text-emerald-400 px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-top-4 border border-emerald-500/20">
                    {showToast}
                </div>
            )}

            {/* HEADER */}
            <div className="bg-gradient-to-r from-brand-primary/10 to-transparent p-10 rounded-[3rem] border border-brand-primary/20 relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <span className="material-symbols-outlined text-9xl">church</span>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-brand-primary text-brand-obsidian px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Panel de Líder</span>
                    </div>
                    <h2 className="text-4xl font-serif font-bold text-brand-obsidian dark:text-white mb-2">
                        Ministerio de <span className="text-brand-primary">{ministry?.name}</span>
                    </h2>
                    <p className="text-brand-obsidian/60 dark:text-white/60 max-w-xl">
                        Gestiona tu equipo, horarios y solicitudes desde este centro de comando.
                    </p>
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                {[
                    { id: 'info', label: 'Información Pública', icon: 'info' },
                    { id: 'members', label: `Miembros (${members.length || 0})`, icon: 'groups' },
                    { id: 'requests', label: `Solicitudes (${requests.length || 0})`, icon: 'person_add' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === tab.id
                            ? 'bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian shadow-lg'
                            : 'bg-white dark:bg-brand-surface text-brand-obsidian/50 dark:text-white/40 hover:bg-brand-silk dark:hover:bg-white/5'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="bg-white dark:bg-brand-surface rounded-[3rem] p-8 border border-brand-obsidian/5 min-h-[400px]">

                {/* TAB: INFO */}
                {activeTab === 'info' && (
                    <div className="max-w-3xl space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Horarios de Reunión / Ensayo</label>
                            <input
                                value={infoForm.schedule}
                                onChange={e => setInfoForm({ ...infoForm, schedule: e.target.value })}
                                placeholder="Ej: Jueves 19:30hs y Domingos 09:00hs"
                                className="w-full bg-brand-silk dark:bg-brand-obsidian p-5 rounded-2xl font-bold border-none focus:ring-2 focus:ring-brand-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Actividades Principales</label>
                            <textarea
                                value={infoForm.activities}
                                onChange={e => setInfoForm({ ...infoForm, activities: e.target.value })}
                                placeholder="Describe brevemente qué hacen en el ministerio..."
                                className="w-full bg-brand-silk dark:bg-brand-obsidian p-5 rounded-2xl font-medium border-none min-h-[100px] resize-none focus:ring-2 focus:ring-brand-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Notas para Interesados</label>
                            <textarea
                                value={infoForm.notes}
                                onChange={e => setInfoForm({ ...infoForm, notes: e.target.value })}
                                placeholder="Ej: Requisitos previos, compromiso esperado, etc."
                                className="w-full bg-brand-silk dark:bg-brand-obsidian p-5 rounded-2xl font-medium border-none min-h-[100px] resize-none focus:ring-2 focus:ring-brand-primary"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => updateInfoMutation.mutate(infoForm)}
                                className="px-10 py-4 bg-brand-primary text-brand-obsidian rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-3"
                            >
                                <span className="material-symbols-outlined">save</span>
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB: MEMBERS */}
                {activeTab === 'members' && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        {members.length === 0 ? (
                            <p className="text-center opacity-40 py-12 italic">Aún no hay miembros en este equipo.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center gap-4 p-4 bg-brand-silk dark:bg-brand-obsidian/50 rounded-2xl border border-brand-obsidian/5">
                                        <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold overflow-hidden">
                                            {member.user?.avatar_url ? <img src={member.user.avatar_url} className="w-full h-full object-cover" /> : member.user?.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-brand-obsidian dark:text-white">{member.user?.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] opacity-40 text-brand-obsidian dark:text-white uppercase font-black">Rol:</span>
                                                <input
                                                    className="bg-transparent border-b border-brand-obsidian/20 dark:border-white/20 text-[10px] font-bold text-brand-primary w-24 focus:outline-none focus:border-brand-primary"
                                                    defaultValue={member.role}
                                                    onBlur={(e) => {
                                                        if (e.target.value !== member.role) {
                                                            updateMemberRoleMutation.mutate({ memberId: member.id, role: e.target.value });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm('¿Eliminar a este miembro del equipo?')) removeMemberMutation.mutate(member.id);
                                            }}
                                            className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove_circle</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: REQUESTS */}
                {activeTab === 'requests' && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        {requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 opacity-40">
                                <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                                <p className="italic text-sm">No hay solicitudes pendientes.</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="flex items-center justify-between p-6 bg-brand-silk dark:bg-brand-obsidian/50 rounded-[2rem] border border-brand-obsidian/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian flex items-center justify-center font-bold">
                                            {req.userAvatar ? <img src={req.userAvatar} className="w-full h-full object-cover rounded-full" /> : req.userName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-brand-obsidian dark:text-white">{req.userName}</h4>
                                            <p className="text-xs opacity-60 italic">{req.note ? `"${req.note}"` : 'Sin nota adjunta'}</p>
                                            <p className="text-[9px] text-brand-primary font-black uppercase mt-1">{new Date(req.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => processRequestMutation.mutate({ req, status: 'approved' })}
                                            className="px-6 py-3 bg-brand-primary text-brand-obsidian rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                        >
                                            Aprobar
                                        </button>
                                        <button
                                            onClick={() => processRequestMutation.mutate({ req, status: 'rejected' })}
                                            className="px-6 py-3 bg-white dark:bg-white/5 text-rose-500 border border-rose-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-colors"
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MinistryManager;
