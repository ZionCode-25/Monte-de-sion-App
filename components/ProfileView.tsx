import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './context/AuthContext';

interface Props {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const COVER_STYLES = [
  { id: 'sunset', name: 'Atardecer', classes: 'bg-gradient-to-r from-orange-400 to-rose-400' },
  { id: 'ocean', name: 'Océano', classes: 'bg-gradient-to-br from-cyan-400 to-blue-600' },
  { id: 'midnight', name: 'Medianoche', classes: 'bg-gradient-to-b from-slate-900 to-purple-900' },
  { id: 'royal', name: 'Realeza', classes: 'bg-gradient-to-tr from-amber-200 to-yellow-500' },
  { id: 'nature', name: 'Bosque', classes: 'bg-gradient-to-bl from-emerald-400 to-teal-600' },
  { id: 'berry', name: 'Frutos', classes: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { id: 'obsidian', name: 'Obsidiana', classes: 'bg-brand-obsidian' },
];

const ProfileView: React.FC<Props> = ({ theme, onToggleTheme }) => {
  const { user, signOut, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist cover style in localStorage interaction
  const [coverStyle, setCoverStyle] = useState(COVER_STYLES[1]);
  const [isChoosingCover, setIsChoosingCover] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`cover_${user.id}`);
      if (saved) {
        const found = COVER_STYLES.find(s => s.id === saved);
        if (found) setCoverStyle(found);
      }
    }
  }, [user]);

  const handleSetCover = (style: typeof COVER_STYLES[0]) => {
    setCoverStyle(style);
    if (user?.id) localStorage.setItem(`cover_${user.id}`, style.id);
    setIsChoosingCover(false);
  };

  // 1. Fetch Ministries (Real Data)
  const { data: activeMinistries = [] } = useQuery({
    queryKey: ['my-ministries', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('inscriptions')
        .select('*, ministry:ministries(name)')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (!data) return [];
      return data.map((item: any) => item.ministry?.name || 'Ministerio');
    },
    enabled: !!user?.id
  });

  // 2. Calculate Real Stats
  const stats = React.useMemo(() => {
    if (!user) return [];

    // Days since joined
    const joined = user.joinedDate ? new Date(user.joinedDate) : new Date();
    const diffTime = Math.abs(new Date().getTime() - joined.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Impact Score (Mock algorithm based on real engagement placeholders)
    // In a real app, this would sum up comments, likes, attendance, etc.
    const impactScore = (diffDays * 5) + (activeMinistries.length * 100);

    return [
      { label: 'Días de Fe', value: diffDays.toString(), icon: 'calendar_month', color: 'text-brand-primary' },
      { label: 'Ministerios', value: activeMinistries.length.toString(), icon: 'volunteer_activism', color: 'text-rose-500' },
      { label: 'Puntos de Impacto', value: impactScore.toLocaleString(), icon: 'star', color: 'text-amber-500' },
    ];
  }, [user, activeMinistries]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-silk dark:bg-brand-obsidian pb-44 animate-reveal">
      <input type="file" ref={fileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => updateProfile({ avatar: reader.result as string });
          reader.readAsDataURL(file);
        }
      }} accept="image/*" className="hidden" />

      {/* CUSTOMIZABLE HERO HEADER */}
      <section className={`relative h-96 transition-all duration-700 ease-in-out ${coverStyle.classes}`}>
        {/* Overlay Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-brand-silk dark:to-brand-obsidian"></div>

        {/* Edit Cover Button */}
        <button
          onClick={() => setIsChoosingCover(!isChoosingCover)}
          className="absolute top-6 right-6 z-40 bg-black/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white hover:text-black transition-all"
        >
          <span className="material-symbols-outlined text-xl">palette</span>
        </button>

        {/* Cover Selector Drawer */}
        <div className={`absolute top-0 left-0 w-full bg-black/80 backdrop-blur-xl z-30 transition-all duration-300 overflow-hidden ${isChoosingCover ? 'h-32 opacity-100' : 'h-0 opacity-0'}`}>
          <div className="flex items-center gap-4 p-8 overflow-x-auto no-scrollbar">
            <span className="text-white text-xs font-bold uppercase tracking-widest shrink-0 mr-4">Elige tu estilo:</span>
            {COVER_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => handleSetCover(style)}
                className={`w-12 h-12 shrink-0 rounded-full border-2 ${style.classes} ${coverStyle.id === style.id ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-110'} transition-all`}
                title={style.name}
              />
            ))}
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center mt-10">
          <div className="relative group">
            <div className={`w-36 h-36 rounded-[2.5rem] overflow-hidden border-4 border-white/20 shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105`}>
              <img src={user.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200'} className="w-full h-full object-cover" alt="Profile" />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-obsidian shadow-xl z-20 hover:scale-110 active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          </div>
          <h2 className="mt-6 text-4xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tight drop-shadow-md">{user.name}</h2>
          <p className="text-brand-obsidian/60 dark:text-white/60 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Miembro de la Familia</p>
        </div>
      </section>

      <div className="px-6 space-y-8 -mt-8 relative z-30">

        {/* Real Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/80 dark:bg-brand-surface/80 backdrop-blur-md p-5 rounded-[2rem] flex flex-col items-center gap-3 border border-white/20 shadow-lg hover:-translate-y-1 transition-transform duration-300">
              <span className={`material-symbols-outlined ${stat.color} text-2xl`}>{stat.icon}</span>
              <span className="text-xl font-black text-brand-obsidian dark:text-white leading-none">{stat.value}</span>
              <span className="text-[7px] font-bold text-brand-obsidian/50 dark:text-white/50 uppercase tracking-widest text-center">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Identity Card (Membership Pass) */}
        <div className="bg-brand-obsidian dark:bg-black rounded-[2.5rem] p-8 relative overflow-hidden text-white border border-white/10 shadow-2xl">
          <div className={`absolute top-0 right-0 w-64 h-64 opacity-20 blur-[80px] rounded-full ${coverStyle.classes}`}></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-brand-primary text-[9px] font-black uppercase tracking-[0.3em] mb-2">Credencial Digital</p>
                <h3 className="text-2xl font-serif font-bold italic">Liderazgo Activo</h3>
              </div>
              <span className="material-symbols-outlined text-4xl text-brand-primary">verified</span>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Ministerios Asignados</span>
                <div className="flex flex-wrap gap-2">
                  {activeMinistries.length > 0 ? (
                    activeMinistries.map((ministryName: string, index: number) => (
                      <span key={index} className="bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-xl text-[10px] font-bold border border-white/5">
                        {ministryName.toUpperCase()}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/30 text-xs italic px-2">Sin asignaciones activas</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings & Interface */}
        <div className="overflow-hidden rounded-[2.5rem] bg-white dark:bg-brand-surface shadow-xl border border-brand-obsidian/5 dark:border-white/5">

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between p-6 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-black/5 dark:border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <span className="material-symbols-outlined">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-brand-obsidian dark:text-white text-sm">Tema de la App</h4>
                <p className="text-[10px] text-brand-obsidian/40 dark:text-white/40 font-bold uppercase tracking-widest">
                  {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                </p>
              </div>
            </div>
            <div className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-brand-primary' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </button>

          {/* Functional Placeholder for Password Change (Example of "Functional") */}
          <button className="w-full flex items-center justify-between p-6 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                <span className="material-symbols-outlined">lock_reset</span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-brand-obsidian dark:text-white text-sm">Seguridad</h4>
                <p className="text-[10px] text-brand-obsidian/40 dark:text-white/40 font-bold uppercase tracking-widest">Cambiar Contraseña</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-brand-obsidian/20 dark:text-white/20">chevron_right</span>
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={signOut}
          className="w-full py-6 bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 mb-8 hover:opacity-90"
        >
          <span className="material-symbols-outlined">logout</span>
          Cerrar Sesión
        </button>

      </div>
    </div>
  );
};

export default ProfileView;