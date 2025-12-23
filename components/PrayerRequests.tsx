import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './context/AuthContext';
import { PrayerRequest, PrayerCategory } from '../types';

interface Props {
  onBack: () => void;
}

const PrayerRequests: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'create' | 'wall'>('wall');
  const [request, setRequest] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('Espiritual');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [interceded, setInterceded] = useState<Set<string>>(new Set());

  const { data: prayers = [] } = useQuery({
    queryKey: ['prayers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*, user:profiles(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((p: any) => ({
        id: p.id,
        userName: (p.user?.name || 'Usuario'),
        content: p.content,
        category: (p.category as PrayerCategory) || 'Otro',
        isPrivate: p.is_private,
        amenCount: p.amen_count || 0,
        createdAt: p.created_at
      })) as PrayerRequest[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!request.trim() || !user) throw new Error("Datos incompletos");
      const { error } = await supabase.from('prayer_requests').insert({
        user_id: user.id,
        content: request,
        category,
        is_private: isPrivate,
        amen_count: 0
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] });
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setRequest('');
        setActiveTab('wall');
      }, 2500);
    },
    onError: (e) => {
      console.error(e);
      alert("Error al enviar petición");
    }
  });

  const amenMutation = useMutation({
    mutationFn: async ({ id, currentAmen }: { id: string, currentAmen: number }) => {
      const { error } = await supabase.from('prayer_requests').update({ amen_count: currentAmen + 1 }).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['prayers'] });
      const previousPrayers = queryClient.getQueryData<PrayerRequest[]>(['prayers']);
      if (previousPrayers) {
        queryClient.setQueryData<PrayerRequest[]>(['prayers'], old =>
          old?.map(p => p.id === id ? { ...p, amenCount: p.amenCount + 1 } : p)
        );
      }
      return { previousPrayers };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['prayers'], context?.previousPrayers);
      console.error(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] });
    }
  });

  const categories: PrayerCategory[] = ['Salud', 'Familia', 'Finanzas', 'Gratitud', 'Espiritual', 'Otro'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const handleIntercede = (id: string, currentAmen: number) => {
    if (interceded.has(id)) return;
    setInterceded(prev => new Set(prev).add(id));
    amenMutation.mutate({ id, currentAmen });
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-silk dark:bg-brand-obsidian animate-reveal">

      {/* --- HEADER --- */}
      <header className="px-8 pt-12 pb-8 sticky top-0 bg-brand-silk/80 dark:bg-brand-obsidian/80 backdrop-blur-3xl z-[120] border-b border-brand-obsidian/5 dark:border-white/5">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Altar Digital</span>
            </div>
            <h2 className="text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter leading-none">
              Peticiones <br /><span className="gold-text-gradient italic">de Fe</span>
            </h2>
          </div>
          <button
            onClick={onBack}
            className="w-14 h-14 bg-white dark:bg-brand-surface rounded-2xl border border-brand-obsidian/5 dark:border-white/10 flex items-center justify-center text-brand-obsidian dark:text-white active:scale-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        <div className="flex bg-brand-obsidian/[0.03] dark:bg-white/[0.03] p-1.5 rounded-2xl border border-brand-obsidian/5 dark:border-white/5">
          <button
            onClick={() => setActiveTab('wall')}
            className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'wall' ? 'bg-white dark:bg-brand-surface text-brand-obsidian dark:text-brand-primary shadow-sm' : 'text-brand-obsidian/40 dark:text-white/30'}`}
          >
            Muro Público
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-white dark:bg-brand-surface text-brand-obsidian dark:text-brand-primary shadow-sm' : 'text-brand-obsidian/40 dark:text-white/30'}`}
          >
            Nuevo Clamor
          </button>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <main className="flex-1 px-8 pt-10 pb-44 max-w-2xl mx-auto w-full">

        {activeTab === 'create' ? (
          <div className="animate-reveal">
            {isSent ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-8 shadow-2xl">
                  <span className="material-symbols-outlined text-5xl">done_all</span>
                </div>
                <h3 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white mb-4 italic">Clamor Recibido</h3>
                <p className="text-brand-obsidian/60 dark:text-white/40 leading-relaxed font-light italic">"Pedid, y se os dará..."</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-5">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] ml-2">¿Cuál es el motivo?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${category === cat ? 'bg-brand-primary border-brand-primary text-brand-obsidian' : 'bg-white dark:bg-brand-surface border-brand-obsidian/5 dark:border-white/5 text-brand-obsidian/40 dark:text-white/40'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] ml-2">Tu petición al Señor</label>
                  <div className="bg-white dark:bg-brand-surface p-8 rounded-[3.5rem] border border-brand-obsidian/5 dark:border-white/5 shadow-2xl">
                    <textarea
                      placeholder="Escribe aquí..."
                      className="w-full bg-brand-silk dark:bg-brand-obsidian/40 border-none rounded-[2.5rem] p-8 text-brand-obsidian dark:text-white placeholder:text-brand-obsidian/20 dark:placeholder:text-white/20 min-h-[200px] focus:ring-2 focus:ring-indigo-500 transition-all text-xl font-light italic leading-relaxed resize-none"
                      value={request}
                      onChange={(e) => setRequest(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="flex items-center justify-between p-7 bg-white dark:bg-brand-surface rounded-[2.5rem] border border-brand-obsidian/5 shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPrivate ? 'bg-brand-obsidian text-brand-primary' : 'bg-brand-obsidian/5 text-brand-obsidian/30'}`}>
                      <span className="material-symbols-outlined text-[24px]">{isPrivate ? 'lock' : 'public'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-obsidian dark:text-white leading-none">Petición Privada</p>
                      <p className="text-[9px] text-brand-obsidian/30 dark:text-white/30 font-black uppercase tracking-widest mt-1.5">Solo pastores lo verán</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${isPrivate ? 'bg-indigo-500' : 'bg-brand-obsidian/10'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!request.trim()}
                  className="w-full py-8 bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-4"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Presentar Clamor
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-10 animate-reveal">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-8 rounded-[3rem] text-center">
              <p className="text-xl font-serif font-medium text-indigo-600 dark:text-indigo-400 leading-relaxed italic mb-3">
                "Ayudaos unos a otros a llevar vuestras cargas..."
              </p>
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em]">Gálatas 6:2</span>
            </div>

            <div className="space-y-6">
              {prayers.map((pr, idx) => (
                <div
                  key={pr.id}
                  className="bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/[0.03] dark:border-white/[0.05] shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary font-black uppercase text-xs">
                        {pr.userName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-brand-obsidian dark:text-white leading-none">{pr.userName}</h4>
                        <span className="text-[9px] text-brand-obsidian/30 dark:text-white/20 font-black uppercase tracking-widest mt-1.5 inline-block">{new Date(pr.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="bg-brand-obsidian/5 dark:bg-white/5 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest text-brand-primary border border-brand-primary/10">
                      {pr.category}
                    </span>
                  </div>

                  <p className="text-lg font-serif font-light text-brand-obsidian/70 dark:text-white/70 italic leading-relaxed mb-8 pl-4 border-l-2 border-brand-primary/20">
                    "{pr.content}"
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-brand-obsidian/5 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-brand-primary text-[18px] fill-1">favorite</span>
                      <span className="text-[9px] font-bold text-brand-obsidian/40 dark:text-white/30 uppercase tracking-widest">{pr.amenCount} intercesores</span>
                    </div>

                    <button
                      onClick={() => handleIntercede(pr.id, pr.amenCount)}
                      disabled={interceded.has(pr.id)}
                      className={`h-11 flex items-center gap-2.5 px-6 rounded-2xl transition-all active:scale-95 ${interceded.has(pr.id)
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-brand-primary text-brand-obsidian shadow-lg'
                        }`}
                    >
                      <span className={`material-symbols-outlined text-[18px] leading-none ${interceded.has(pr.id) ? 'fill-1' : ''}`}>
                        {interceded.has(pr.id) ? 'check_circle' : 'favorite'}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                        {interceded.has(pr.id) ? 'INTERCEDIENDO' : 'DECIR AMÉN'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrayerRequests;
