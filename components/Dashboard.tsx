import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Devotional, EventItem, NewsItem } from '../types';

interface DashboardProps {
  theme?: 'light' | 'dark';
}

const Dashboard: React.FC<DashboardProps> = ({ theme }) => {
  const navigate = useNavigate();

  // Queries
  const { data: latestDevotional } = useQuery({
    queryKey: ['latestDevotional'],
    queryFn: async () => {
      // Fetch devotional WITH author profile
      const { data, error } = await supabase
        .from('devotionals')
        .select('*, profiles(name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) console.error("Error fetching devotional:", error);
      if (!data) return null;

      const profile = data.profiles as any; // forceful cast if types aren't perfect yet

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        bibleVerse: data.bible_verse,
        userId: data.user_id,
        userName: profile?.name || 'Anónimo',
        userAvatar: profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        createdAt: data.created_at
      } as Devotional;
    }
  });

  const { data: nextEvent } = useQuery({
    queryKey: ['nextEvent'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').gte('date', new Date().toISOString()).order('date', { ascending: true }).limit(1).maybeSingle();
      if (!data) return null;
      return {
        id: data.id,
        title: data.title,
        date: data.date,
        time: data.time,
        location: data.location,
        imageUrl: data.image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80',
        description: data.description,
        isFeatured: data.is_featured
      } as EventItem;
    }
  });

  const { data: latestNews } = useQuery({
    queryKey: ['latestNews'],
    queryFn: async () => {
      const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (!data) return null;
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        imageUrl: data.image_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80',
        date: data.created_at,
        category: data.category || 'General',
        priority: data.priority || 'low',
        author: { name: 'Admin', role: 'Staff', avatar: '' }
      } as NewsItem;
    }
  });

  const { data: communityPreview } = useQuery({
    queryKey: ['communityPreview'],
    queryFn: async () => {
      const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true });
      return { count: count || 0 };
    }
  });

  const openYoutubeChannel = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col gap-8 px-6 pt-10 pb-40 animate-reveal">

      {/* 1. HEADER: DEVOTIONAL FOCUS (ENHANCED) */}
      <header
        onClick={() => navigate('/devotionals')}
        className="flex flex-col gap-5 cursor-pointer group active:opacity-70 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_10px_#ffb700]"></div>
          <span className="text-brand-obsidian/70 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Inspiración Diaria</span>
        </div>

        <div className="flex flex-col gap-2">
          {latestDevotional ? (
            <>
              <h1 className="text-4xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tight leading-[1] mb-1 group-hover:text-brand-primary transition-colors">
                {latestDevotional.title}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <img
                  src={latestDevotional.userAvatar}
                  alt={latestDevotional.userName}
                  className="w-6 h-6 rounded-full border border-brand-obsidian/10 dark:border-white/10"
                />
                <span className="text-xs font-bold text-brand-obsidian/60 dark:text-white/60">{latestDevotional.userName}</span>
                <div className="w-1 h-1 rounded-full bg-brand-obsidian/20 dark:bg-white/20"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{latestDevotional.bibleVerse}</span>
              </div>
            </>
          ) : (
            <h1 className="text-3xl font-serif font-bold text-brand-obsidian/50 dark:text-white/50">Cargando inspiración...</h1>
          )}
        </div>
      </header>

      {/* 2. BENTO GRID */}
      <div className="grid grid-cols-2 gap-4">

        {/* HERO CARD: FEATURED NEWS */}
        <div
          onClick={() => navigate(`/news/${latestNews?.id || ''}`, { state: latestNews })}
          className="col-span-2 relative aspect-[16/9] rounded-ultra overflow-hidden bg-brand-surface shadow-2xl cursor-pointer group border border-brand-obsidian/5 dark:border-white/5 active:scale-[0.98] transition-all"
        >
          <div className="absolute inset-0 transition-transform duration-[4s] group-hover:scale-110">
            <img
              src={latestNews?.imageUrl || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80'}
              className="w-full h-full object-cover"
              alt={latestNews?.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-obsidian via-brand-obsidian/30 to-transparent"></div>
          </div>

          <div className="absolute top-6 left-6">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-primary text-brand-obsidian shadow-lg">
              <span className="text-[9px] font-black uppercase tracking-widest">Lo Último</span>
            </div>
          </div>

          <div className="absolute inset-0 p-8 flex flex-col justify-end items-start leading-tight">
            <h2 className="text-2xl font-bold font-serif text-white mb-2 drop-shadow-md max-w-xs">
              {latestNews?.title || 'Noticias'}
            </h2>
            <button className="flex items-center gap-2 text-white/90 text-[10px] font-black uppercase tracking-widest group-hover:text-brand-primary transition-colors">
              Leer Ahora
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* REPLACEMENT: YOUTUBE CHANNELS & LATEST VIDEO */}
        <div className="col-span-2 bg-brand-obsidian dark:bg-brand-surface rounded-mega p-8 relative overflow-hidden shadow-2xl border border-white/5 flex flex-col gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-primary">
              <span className="material-symbols-outlined text-xl">play_circle</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">Canales Oficiales</span>
            </div>
            <span className="text-[9px] text-white/40 font-bold">YouTube</span>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4">
            <button
              onClick={() => openYoutubeChannel('https://www.youtube.com/@GeneracionPrivilegiada')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">smart_display</span>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-white uppercase tracking-wider mb-0.5">Generación</p>
                <p className="text-[9px] text-white/50 font-medium">Privilegiada</p>
              </div>
            </button>

            <button
              onClick={() => openYoutubeChannel('https://www.youtube.com/@montedesion-yt')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-brand-obsidian shadow-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">church</span>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-white uppercase tracking-wider mb-0.5">Monte de Sión</p>
                <p className="text-[9px] text-white/50 font-medium">Oficial</p>
              </div>
            </button>
          </div>

          <div className="relative z-10 mt-2 p-4 bg-gradient-to-r from-white/5 to-transparent rounded-2xl border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => openYoutubeChannel('https://www.youtube.com/@montedesion-yt/videos')}>
            <div className="w-16 h-10 rounded-lg bg-black/50 overflow-hidden relative shrink-0">
              <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=200" className="w-full h-full object-cover opacity-60" alt="" />
              <div className="absolute inset-0 flex items-center justify-center"><span className="material-symbols-outlined text-white text-lg drop-shadow-md">play_arrow</span></div>
            </div>
            <div>
              <p className="text-white text-xs font-bold leading-tight line-clamp-1">Ver Últimos Mensajes</p>
              <p className="text-brand-primary text-[9px] uppercase tracking-wider mt-0.5">Disponible Ahora</p>
            </div>
            <span className="material-symbols-outlined text-white/30 ml-auto">chevron_right</span>
          </div>
        </div>

        {/* Next Event Widget */}
        <div
          onClick={() => navigate('/events')}
          className="relative bg-white dark:bg-brand-surface rounded-mega p-6 flex flex-col justify-between overflow-hidden shadow-lg border border-brand-obsidian/10 dark:border-white/5 cursor-pointer active:scale-95 transition-all h-[180px]"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-primary text-lg">calendar_month</span>
            <span className="text-[9px] font-black uppercase tracking-wider text-brand-obsidian/40 dark:text-white/40">Agenda</span>
          </div>
          <div className="mt-2">
            <h3 className="text-brand-obsidian dark:text-white font-bold font-serif text-lg leading-tight mb-2 line-clamp-2">{nextEvent?.title || 'Próximo Evento'}</h3>
            <div className="inline-flex bg-brand-primary/10 px-3 py-1 rounded-md">
              <p className="text-[9px] text-brand-primary font-black uppercase tracking-widest">{nextEvent?.time || 'Pronto'}</p>
            </div>
          </div>
        </div>

        {/* REDESIGNED COMMUNITY/PRAYER WIDGET */}
        <div
          onClick={() => navigate('/prayer-requests')}
          className="relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-mega p-6 flex flex-col justify-between shadow-lg text-white cursor-pointer active:scale-95 transition-all overflow-hidden h-[180px]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full blur-xl"></div>

          <div className="flex justify-between items-start relative z-10">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <span className="material-symbols-outlined text-white">volunteer_activism</span>
            </div>
          </div>

          <div className="relative z-10 mt-auto">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">Tu Comunidad</p>
            <h3 className="text-lg font-serif font-bold leading-none mb-2">Unidos en<br />Oración</h3>
            <div className="flex items-center gap-1.5 opacity-90">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full bg-white/20 border border-white/10"></div>
                <div className="w-5 h-5 rounded-full bg-white/20 border border-white/10"></div>
              </div>
              <span className="text-[9px] font-medium">+ {communityPreview?.count || 12} orando</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTIONS GRID */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-[10px] font-black text-brand-obsidian/60 dark:text-white/30 uppercase tracking-[0.3em]">Acceso Rápido</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { id: 'ministries', label: 'Equipos', icon: 'groups', color: 'text-indigo-600 dark:text-indigo-400' },
            { id: 'about', label: 'Sión', icon: 'church', color: 'text-emerald-600 dark:text-emerald-500' },
            { id: 'profile', label: 'Perfil', icon: 'person', color: 'text-slate-600 dark:text-slate-400' },
            { id: 'notifications', label: 'Avisos', icon: 'notifications', color: 'text-rose-600 dark:text-rose-500' },
          ].map((act) => (
            <div
              key={act.id}
              onClick={() => navigate(`/${act.id}`)}
              className="flex flex-col items-center gap-3 active:scale-90 transition-all cursor-pointer group"
            >
              <div className={`w-14 h-14 rounded-[1.2rem] bg-white dark:bg-brand-surface border border-brand-obsidian/10 dark:border-white/5 shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center ${act.color}`}>
                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform duration-300">{act.icon}</span>
              </div>
              <span className="text-[9px] font-bold text-brand-obsidian/60 dark:text-white/40 uppercase tracking-widest group-hover:text-brand-obsidian dark:group-hover:text-white transition-colors">{act.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. DAILY VERSE CARD */}
      <div className="bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 dark:border-brand-primary/20 rounded-[2.5rem] p-10 flex flex-col items-center text-center relative overflow-hidden group">
        <span className="material-symbols-outlined text-brand-primary mb-4 text-3xl opacity-60">format_quote</span>
        <p className="text-brand-obsidian dark:text-brand-primary text-xl font-serif italic font-medium leading-relaxed mb-6 group-hover:scale-105 transition-transform duration-700">
          "La fe es la certeza de lo que se espera, la convicción de lo que no se ve."
        </p>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Hebreos 11:1</span>
          <div className="w-8 h-[1px] bg-brand-primary/40 mt-3"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
