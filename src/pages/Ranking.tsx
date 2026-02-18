import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/context/AuthContext';

const Ranking: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: topUsers = [], isLoading, error: queryError } = useQuery({
        queryKey: ['points-ranking'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, avatar_url, impact_points')
                .order('impact_points', { ascending: false })
                .limit(100);

            if (error) {
                console.error("Error fetching ranking:", error);
                throw error;
            }
            return data || [];
        }
    });

    const filteredUsers = topUsers.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (queryError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
                <span className="material-symbols-outlined text-6xl text-rose-500 mb-4 font-thin">error</span>
                <h3 className="text-xl font-bold mb-2 text-brand-obsidian dark:text-white">Error al cargar el ranking</h3>
                <button onClick={onBack} className="bg-brand-primary text-brand-obsidian px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs">
                    Volver
                </button>
            </div>
        );
    }

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return 'crown';
            case 1: return 'military_tech';
            case 2: return 'workspace_premium';
            default: return null;
        }
    };

    const getRankColor = (index: number) => {
        switch (index) {
            case 0: return 'text-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
            case 1: return 'text-slate-400 bg-slate-400/10';
            case 2: return 'text-amber-700 bg-amber-700/10';
            default: return 'text-brand-obsidian/40 dark:text-white/40 bg-brand-obsidian/5 dark:bg-white/5';
        }
    };

    return (
        <div className="flex flex-col min-h-screen animate-reveal pb-32 bg-brand-silk dark:bg-brand-obsidian">
            {/* STICKY HEADER AIREADA */}
            <div className="sticky top-0 z-[100] bg-brand-silk/80 dark:bg-brand-obsidian/80 backdrop-blur-xl px-6 py-6 border-b border-brand-obsidian/5 dark:border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_10px_#ffb700]"></div>
                    <span className="text-brand-obsidian/60 dark:text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">Muro de Sión</span>
                </div>
                <h1 className="text-4xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tight leading-none mb-6">
                    Impacto <span className="text-brand-primary italic">Global</span>
                </h1>

                {/* SEARCH BAR PROFESIONAL */}
                <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-brand-obsidian/30 dark:text-white/30 group-focus-within:text-brand-primary transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="Buscar fiel por nombre..."
                        className="w-full bg-white dark:bg-brand-surface pl-14 pr-6 py-4 rounded-2xl border border-brand-obsidian/5 dark:border-white/5 focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 px-6 pt-8 max-w-2xl mx-auto w-full">
                {isLoading ? (
                    <div className="py-20 text-center text-brand-obsidian/30 dark:text-white/30 font-serif italic text-xl">
                        Calculando impacto...
                    </div>
                ) : (
                    <>
                        {filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-center opacity-30">
                                <span className="material-symbols-outlined text-7xl mb-6 font-thin">person_search</span>
                                <p className="font-bold text-lg">No se encontraron resultados.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredUsers.map((profile: any, index: number) => {
                                    const isMe = profile.id === currentUser?.id;
                                    const rankIcon = getRankIcon(index);
                                    const rankColor = getRankColor(index);

                                    return (
                                        <div
                                            key={profile.id}
                                            className={`flex items-center gap-4 p-4 rounded-[2rem] border transition-all duration-500 group ${isMe
                                                ? 'bg-brand-primary/10 border-brand-primary/40 shadow-xl'
                                                : 'bg-white dark:bg-brand-surface border-brand-obsidian/[0.03] dark:border-white/[0.03] hover:translate-x-1'
                                                }`}
                                        >
                                            {/* POSITION */}
                                            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${rankColor}`}>
                                                {rankIcon ? (
                                                    <span className="material-symbols-outlined text-2xl font-fill">{rankIcon}</span>
                                                ) : (
                                                    <span className="text-xs font-black italic">#{index + 1}</span>
                                                )}
                                            </div>

                                            {/* AVATAR */}
                                            <div className="relative w-12 h-12 shrink-0">
                                                <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-white dark:border-white/5 shadow-inner">
                                                    <img src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} className="w-full h-full object-cover" alt={profile.name} />
                                                </div>
                                                {isMe && <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary rounded-full border-2 border-white dark:border-brand-obsidian flex items-center justify-center text-[8px] font-black">!</div>}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold truncate text-[15px] ${isMe ? 'text-brand-obsidian dark:text-white' : 'text-brand-obsidian/80 dark:text-white/80'}`}>
                                                    {profile.name}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    {index < 3 && <span className="text-[8px] font-black uppercase text-brand-primary tracking-widest">Top Impacto</span>}
                                                    {isMe && <span className="text-[8px] font-black uppercase text-indigo-500 tracking-widest">Tu Perfil</span>}
                                                </div>
                                            </div>

                                            {/* POINTS */}
                                            <div className="text-right">
                                                <p className="text-lg font-black text-brand-primary tracking-tighter leading-none">{profile.impact_points?.toLocaleString() || 0}</p>
                                                <p className="text-[8px] font-black opacity-20 uppercase tracking-widest">points</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* CÓMO SUMAR IMPACTO - REDISEÑO COMPACTO */}
            <div className="px-6 py-12 max-w-2xl mx-auto w-full">
                <div className="bg-brand-obsidian dark:bg-black/40 rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <header className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                                <span className="material-symbols-outlined text-xl">bolt</span>
                            </div>
                            <h3 className="text-lg font-serif font-bold text-white">Guía de Impacto</h3>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            {[
                                { icon: 'login', label: 'Diario', pts: '+10', color: 'text-brand-primary' },
                                { icon: 'event_available', label: 'Eventos', pts: '+50', color: 'text-emerald-400' },
                                { icon: 'record_voice_over', label: 'Devocional', pts: '+15', color: 'text-amber-400' },
                                { icon: 'favorite', label: 'Amén', pts: '+1', color: 'text-rose-400' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-sm ${item.color}`}>{item.icon}</span>
                                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{item.label}</span>
                                    </div>
                                    <span className={`text-xs font-black ${item.color}`}>{item.pts}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ranking;
