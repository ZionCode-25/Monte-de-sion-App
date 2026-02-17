import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../components/context/AuthContext';

const Ranking: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user: currentUser } = useAuth();

    const { data: topUsers = [], isLoading, error: queryError } = useQuery({
        queryKey: ['points-ranking'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, avatar_url, impact_points')
                .order('impact_points', { ascending: false })
                .limit(50);

            if (error) {
                console.error("Error fetching ranking:", error);
                throw error;
            }
            return data || [];
        }
    });

    if (queryError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
                <span className="material-symbols-outlined text-6xl text-rose-500 mb-4 font-thin">error</span>
                <h2 className="text-xl font-bold mb-2 text-brand-obsidian dark:text-white">Error al cargar el ranking</h2>
                <p className="opacity-60 text-sm mb-6 text-brand-obsidian dark:text-white">No pudimos conectar con el servidor de impacto.</p>
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
        <div className="flex flex-col min-h-screen animate-reveal pb-40">
            {/* HEADER INTERNO */}
            <div className="px-6 py-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_10px_#ffb700]"></div>
                    <span className="text-brand-obsidian/60 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Muro de Sión</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tight leading-[0.9]">
                    Ranking <br /> <span className="text-brand-obsidian/80 dark:text-white/80 italic">de Impacto</span>
                </h1>
            </div>

            <div className="flex-1 px-6 relative z-10">
                {isLoading ? (
                    <div className="py-20 text-center text-brand-obsidian/30 dark:text-white/30 font-serif italic text-xl">
                        Calculando impacto...
                    </div>
                ) : (
                    <>
                        {topUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center opacity-60">
                                <span className="material-symbols-outlined text-5xl mb-4 text-brand-primary">emoji_events</span>
                                <p className="font-bold text-brand-obsidian dark:text-white">Aún no hay datos de impacto.</p>
                                <p className="text-xs text-brand-obsidian dark:text-white">Sé el primero en sumar puntos sirviendo.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-w-xl mx-auto">
                                {topUsers.map((profile: any, index: number) => {
                                    const isMe = profile.id === currentUser?.id;
                                    const rankIcon = getRankIcon(index);
                                    const rankColor = getRankColor(index);

                                    return (
                                        <div
                                            key={profile.id}
                                            className={`flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300 ${isMe
                                                ? 'bg-brand-primary/20 border-brand-primary shadow-xl scale-[1.02]'
                                                : 'bg-white dark:bg-brand-surface border-brand-obsidian/5 dark:border-white/5 hover:border-brand-primary/30'
                                                }`}
                                        >
                                            {/* RANK */}
                                            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-transform ${rankColor}`}>
                                                {rankIcon ? (
                                                    <span className="material-symbols-outlined text-2xl font-fill">{rankIcon}</span>
                                                ) : (
                                                    <span className="text-sm font-black italic">#{index + 1}</span>
                                                )}
                                            </div>

                                            {/* USER INFO */}
                                            <div className="w-12 h-12 shrink-0 rounded-2xl overflow-hidden border-2 border-brand-primary/20 bg-brand-silk">
                                                <img src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} className="w-full h-full object-cover" alt={profile.name} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold truncate text-sm ${isMe ? 'text-brand-obsidian dark:text-white' : 'text-brand-obsidian/80 dark:text-white/80'}`}>
                                                    {profile.name}
                                                    {isMe && <span className="ml-2 text-[8px] bg-brand-primary px-2 py-0.5 rounded-full text-brand-obsidian uppercase font-black">Tú</span>}
                                                </h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Pts de Impacto</p>
                                            </div>

                                            {/* POINTS */}
                                            <div className="text-right">
                                                <p className="text-xl font-black text-brand-primary tracking-tighter">{profile.impact_points?.toLocaleString() || 0}</p>
                                                <p className="text-[9px] font-bold opacity-30 uppercase tracking-tighter">impact</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* SECCIÓN INFORMATIVA: CÓMO GANAR PUNTOS */}
            <div className="px-6 mt-12 mb-20">
                <div className="bg-white dark:bg-brand-surface rounded-[2.5rem] p-8 border border-brand-obsidian/5 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-brand-primary/10 transition-colors" />

                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-brand-primary mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">info</span>
                        ¿Cómo sumar impacto?
                    </h3>

                    <div className="grid gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                                <span className="material-symbols-outlined text-xl">event_available</span>
                            </div>
                            <div>
                                <h5 className="font-bold text-sm text-brand-obsidian dark:text-white">Asistencia a Eventos</h5>
                                <p className="text-[11px] opacity-60 leading-relaxed text-brand-obsidian dark:text-white">Escanea el código QR al llegar para sumar <span className="font-black text-brand-primary">50 pts</span>.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                <span className="material-symbols-outlined text-xl">volunteer_activism</span>
                            </div>
                            <div>
                                <h5 className="font-bold text-sm text-brand-obsidian dark:text-white">Peticiones de Oración</h5>
                                <p className="text-[11px] opacity-60 leading-relaxed text-brand-obsidian dark:text-white">Publica y apoya a otros en el altar digital para sumar <span className="font-black text-indigo-500">10 pts</span>.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                <span className="material-symbols-outlined text-xl">share</span>
                            </div>
                            <div>
                                <h5 className="font-bold text-sm text-brand-obsidian dark:text-white">Impacto en Comunidad</h5>
                                <p className="text-[11px] opacity-60 leading-relaxed text-brand-obsidian dark:text-white">Comparte noticias y comenta para sumar <span className="font-black text-emerald-500">5 pts</span>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MI ESTADO (STICKY FOOTER ADJUSTED) */}
            <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-[100] animate-reveal-up" style={{ animationDelay: '0.4s' }}>
                <div className="bg-brand-obsidian dark:bg-zinc-900 p-5 rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-brand-primary p-0.5">
                            <img src={currentUser?.avatar || currentUser?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'} className="w-full h-full rounded-full object-cover" alt="Me" />
                        </div>
                        <div>
                            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Mi Impacto Actual</p>
                            <h5 className="text-white text-sm font-bold">{currentUser?.impact_points || 0} Puntos de Bendición</h5>
                        </div>
                    </div>
                    <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">
                        Nivel {Math.floor((currentUser?.impact_points || 0) / 100) + 1}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ranking;
