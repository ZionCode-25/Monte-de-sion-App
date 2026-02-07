import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../components/context/AuthContext';

const Ranking: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user: currentUser } = useAuth();

    const { data: topUsers = [], isLoading } = useQuery({
        queryKey: ['points-ranking'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, avatar_url, impact_points')
                .order('impact_points', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data;
        }
    });

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
        <div className="fixed inset-0 z-[100] bg-brand-silk dark:bg-brand-obsidian flex flex-col animate-in fade-in slide-in-from-right-10 overflow-hidden">
            {/* BACKGROUND DECORATION */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <header className="relative z-10 p-6 flex items-center justify-between border-b border-brand-obsidian/5 dark:border-white/5 bg-white/50 dark:bg-brand-obsidian/50 backdrop-blur-xl">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-brand-obsidian dark:text-white shadow-sm">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-primary">Muro de Impacto</h2>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Ranking Anual</p>
                </div>
                <div className="w-10" />
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-8 relative z-10 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-40 italic">
                        Calculando impacto...
                    </div>
                ) : (
                    <>
                        {topUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                                <span className="material-symbols-outlined text-4xl mb-2">emoji_events</span>
                                <p className="font-bold">Aún no hay datos de impacto.</p>
                                <p className="text-xs">Sé el primero en sumar puntos.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-w-xl mx-auto pb-20">
                                {topUsers.map((profile: any, index: number) => {
                                    const isMe = profile.id === currentUser?.id;
                                    const rankIcon = getRankIcon(index);
                                    const rankColor = getRankColor(index);

                                    return (
                                        <div
                                            key={profile.id}
                                            className={`flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300 ${isMe
                                                ? 'bg-brand-primary/20 border-brand-primary shadow-xl scale-105'
                                                : 'bg-white dark:bg-white/5 border-brand-obsidian/5 dark:border-white/5 hover:border-brand-primary/30'
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
                                            <div className="w-12 h-12 shrink-0 rounded-2xl overflow-hidden border-2 border-brand-primary/20">
                                                <img src={profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'} className="w-full h-full object-cover" alt={profile.name} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold truncate ${isMe ? 'text-brand-obsidian dark:text-white' : 'text-brand-obsidian/80 dark:text-white/80'}`}>
                                                    {profile.name}
                                                    {isMe && <span className="ml-2 text-[10px] bg-brand-primary px-2 py-0.5 rounded-full text-brand-obsidian uppercase font-black">Tú</span>}
                                                </h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Impacto Generado</p>
                                            </div>

                                            {/* POINTS */}
                                            <div className="text-right">
                                                <p className="text-xl font-black text-brand-primary tracking-tighter">{profile.impact_points?.toLocaleString() || 0}</p>
                                                <p className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">pts</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MY STATS BOX (If I'm not in top 50, show persistent footer) */}
            <div className="p-6 bg-brand-obsidian dark:bg-brand-surface border-t border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-brand-primary p-0.5">
                            <img src={currentUser?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'} className="w-full h-full rounded-full object-cover" alt="Me" />
                        </div>
                        <div>
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Mi Impacto Actual</p>
                            <h5 className="text-white font-bold">{currentUser?.impact_points || 0} Puntos</h5>
                        </div>
                    </div>
                    <button className="bg-brand-primary text-brand-obsidian px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        Cómo Ganar Más
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Ranking;
