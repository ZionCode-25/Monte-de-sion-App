import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './context/AuthContext';
import { LOGO_BG_URL } from '../constants';

interface Props {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const ProfileView: React.FC<Props> = ({ theme, onToggleTheme }) => {
  const { user, signOut, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch approved inscriptions specifically for this user
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

  // Calculate days since joined (mocked joined date or use created_at if available in user object)
  const daysSinceJoined = React.useMemo(() => {
    // Assuming user object has a joined_date or similar, if not we mock it relative to today for demo or use a fixed date
    // Since our User type might not have joined_date populated from context properly yet, let's just use a random number for now 
    // or 0 if we want to be strict.
    return 154; // Placeholder
  }, [user]);

  const stats = [
    { label: 'Días de Fe', value: daysSinceJoined.toString(), icon: 'star', color: 'text-brand-primary' },
    { label: 'Servicios', value: activeMinistries.length.toString(), icon: 'volunteer_activism', color: 'text-rose-500' },
    { label: 'Impacto', value: '4.8k', icon: 'favorite', color: 'text-indigo-500' },
  ];

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

      {/* Hero Header with Glassmorphism */}
      <section className="relative h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-sm brightness-50"
          style={{ backgroundImage: `url(${LOGO_BG_URL})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-obsidian/20 via-transparent to-brand-silk dark:to-brand-obsidian"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center mt-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-brand-primary shadow-2xl relative z-10">
              <img src={user.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200'} className="w-full h-full object-cover" alt="Profile" />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-brand-obsidian border-4 border-brand-silk dark:border-brand-obsidian shadow-xl z-20 active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined">photo_camera</span>
            </button>
          </div>
          <h2 className="mt-6 text-4xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tight">{user.name}</h2>
          <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.4em] mt-2">Miembro de Honor</p>
        </div>
      </section>

      <div className="px-6 space-y-8 -mt-6 relative z-30">

        {/* Stats Grid Bento */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-brand-surface p-6 rounded-ultra flex flex-col items-center gap-2 border border-brand-obsidian/[0.03] dark:border-white/[0.05] shadow-sm">
              <span className={`material-symbols-outlined ${stat.color} text-xl`}>{stat.icon}</span>
              <span className="text-2xl font-outfit font-extrabold text-brand-obsidian dark:text-white leading-none">{stat.value}</span>
              <span className="text-[8px] font-black text-brand-obsidian/30 dark:text-white/30 uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Identity Card (Membership Pass) */}
        <div className="bg-brand-obsidian dark:bg-brand-surface rounded-[3rem] p-10 relative overflow-hidden group border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[80px] rounded-full"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-brand-primary/60 text-[8px] font-black uppercase tracking-[0.4em] mb-1">Estatus Ministerial</p>
                <h3 className="text-2xl font-serif font-bold text-white italic tracking-tight">Liderazgo Activo</h3>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-brand-primary">
                <span className="material-symbols-outlined">verified</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Ministerios Asignados</span>
                <div className="flex flex-wrap gap-2">
                  {activeMinistries.length > 0 ? (
                    activeMinistries.map((ministryName: string, index: number) => (
                      <span key={index} className="bg-brand-primary/20 text-brand-primary px-4 py-1.5 rounded-full text-[10px] font-black border border-brand-primary/20">
                        {ministryName.toUpperCase()}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/40 text-xs italic">Sin asignaciones activas</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action List */}
        <div className="bg-white dark:bg-brand-surface rounded-[2.5rem] p-2 border border-brand-obsidian/[0.03] dark:border-white/[0.05] shadow-sm">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between p-6 hover:bg-brand-obsidian/[0.02] dark:hover:bg-white/[0.02] rounded-[2rem] transition-all group"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-brand-obsidian/[0.03] dark:bg-white/[0.05] flex items-center justify-center text-brand-primary">
                <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-brand-obsidian dark:text-white text-sm">Modo de Interfaz</h4>
                <p className="text-[10px] text-brand-obsidian/40 dark:text-white/40 font-bold uppercase tracking-widest">{theme === 'dark' ? 'Claridad' : 'Penumbra'}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-500 ${theme === 'dark' ? 'bg-brand-primary' : 'bg-brand-obsidian/10'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-500 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-6 hover:bg-brand-obsidian/[0.02] dark:hover:bg-white/[0.02] rounded-[2rem] transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-brand-obsidian/[0.03] dark:bg-white/[0.05] flex items-center justify-center text-brand-primary">
                <span className="material-symbols-outlined">shield_person</span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-brand-obsidian dark:text-white text-sm">Privacidad y Seguridad</h4>
                <p className="text-[10px] text-brand-obsidian/40 dark:text-white/40 font-bold uppercase tracking-widest">Protección de Siervo</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-brand-obsidian/20 dark:text-white/20">chevron_right</span>
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={signOut}
          className="w-full py-8 bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
        >
          <span className="material-symbols-outlined">logout</span>
          Finalizar Sesión
        </button>

      </div>
    </div>
  );
};

export default ProfileView;