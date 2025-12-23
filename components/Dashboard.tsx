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
      const { data } = await supabase.from('devotionals').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (!data) return null;
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        bibleVerse: data.bible_verse,
        userId: data.user_id,
        userName: '', userAvatar: '',
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
      const { data } = await supabase.from('posts').select('user:profiles(avatar_url)').order('created_at', { ascending: false }).limit(3);
      const avatars = data?.map((p: any) => p.user?.avatar_url).filter(Boolean) || [];
      return { count: count || 0, avatars };
    }
  });

  const navigateTo = (path: string, state?: any) => {
    navigate(path, { state });
  };

  return (
    <div className="flex flex-col gap-8 px-6 pt-10 pb-40 animate-reveal">

      {/* 1. HEADER: DEVOTIONAL FOCUS */}
      <header
        onClick={() => navigate('/devotionals')}
        className="flex flex-col gap-4 cursor-pointer group active:opacity-70 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
          <span className="text-brand-obsidian/70 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Palabra del Día</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-4xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tight leading-[1.1] mb-2 group-hover:text-brand-primary transition-colors">
            {latestDevotional?.title || 'Sin devocional hoy'}
          </h1>
          <p className="text-lg text-brand-obsidian/80 dark:text-white/60 font-light italic line-clamp-2 border-l-2 border-brand-primary/50 pl-4">
            "{latestDevotional?.content || 'Esperando palabra...'}"
          </p>
        </div>
      </header>

      {/* 2. BENTO GRID */}
      <div className="grid grid-cols-2 gap-4">

        {/* HERO CARD: FEATURED NEWS */}
        <div
          onClick={() => navigate(`/news/${latestNews?.id || ''}`, { state: latestNews })}
          className="col-span-2 relative aspect-[16/10] rounded-ultra overflow-hidden bg-brand-surface shadow-2xl cursor-pointer group border border-brand-obsidian/5 dark:border-white/5 active:scale-[0.98] transition-all"
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

          <div className="absolute inset-0 p-8 flex flex-col justify-end items-start">
            <h2 className="text-2xl font-bold font-serif text-white mb-2 leading-tight drop-shadow-md">
              {latestNews?.title || 'Noticias'}
            </h2>
            <button className="flex items-center gap-2 text-white/90 text-[10px] font-black uppercase tracking-widest group-hover:text-brand-primary transition-colors">
              Explorar Visión
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* LIVE STREAM SPOTLIGHT */}
        <div
          className="col-span-2 bg-gradient-to-br from-brand-obsidian to-brand-surface rounded-mega p-8 flex items-center justify-between relative overflow-hidden group shadow-xl active:scale-[0.98] transition-all cursor-pointer border border-brand-primary/30"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-white/80 text-[9px] font-black uppercase tracking-widest">Próxima Transmisión</span>
            </div>
            <h3 className="text-white font-bold font-serif text-2xl mb-1">Servicio en Vivo</h3>
            <p className="text-brand-primary text-[10px] font-black uppercase tracking-widest">Domingo • 10:00 AM</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center text-brand-obsidian relative z-10 backdrop-blur-md shadow-[0_0_20px_rgba(255,183,0,0.4)]">
            <span className="material-symbols-outlined text-3xl fill-1">play_circle</span>
          </div>
        </div>

        {/* Next Event Widget */}
        <div
          onClick={() => navigate('/events')}
          className="relative bg-white dark:bg-brand-surface rounded-mega p-6 flex flex-col justify-between overflow-hidden shadow-lg border border-brand-obsidian/10 dark:border-white/5 cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-primary text-lg">calendar_today</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-obsidian/60 dark:text-white/40">Agenda</span>
          </div>
          <div className="mt-6">
            <h3 className="text-brand-obsidian dark:text-white font-bold font-serif text-base leading-tight mb-1">{nextEvent?.title || 'Próximo Evento'}</h3>
            <p className="text-[9px] text-brand-primary font-black uppercase tracking-widest">{nextEvent?.time || 'Pronto'}</p>
          </div>
        </div>

        {/* Community Activity Widget */}
        <div
          onClick={() => navigate('/community')}
          className="relative bg-white dark:bg-brand-surface rounded-mega p-6 flex flex-col justify-between shadow-lg border border-brand-obsidian/10 dark:border-white/5 cursor-pointer active:scale-95 transition-all overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="material-symbols-outlined text-brand-primary">diversity_3</span>
            <div className="bg-brand-primary/20 px-2 py-0.5 rounded-full border border-brand-primary/30">
              <span className="text-[8px] font-bold text-brand-primary">{communityPreview?.count || 0} Feed</span>
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex -space-x-2 mb-2">
              {communityPreview?.avatars.map((ava, i) => (
                <img key={i} src={ava} className="w-7 h-7 rounded-full border-2 border-white dark:border-brand-surface object-cover" alt="" />
              ))}
            </div>
            <p className="text-[10px] font-bold text-brand-obsidian/80 dark:text-white/90">Pulso Comunidad</p>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS GRID */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-[10px] font-black text-brand-obsidian/60 dark:text-white/30 uppercase tracking-[0.3em]">Servicios</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { id: 'ministries', label: 'Equipos', icon: 'groups', color: 'text-indigo-600 dark:text-indigo-400' },
            { id: 'about', label: 'Nosotros', icon: 'church', color: 'text-emerald-600 dark:text-emerald-500' },
            { id: 'profile', label: 'Ajustes', icon: 'settings', color: 'text-slate-600 dark:text-slate-400' },
            { id: 'notifications', label: 'Alertas', icon: 'notifications_active', color: 'text-rose-600 dark:text-rose-500' },
          ].map((act) => (
            <div
              key={act.id}
              onClick={() => navigate(`/${act.id}`)}
              className="flex flex-col items-center gap-3 active:scale-90 transition-all cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-brand-surface border border-brand-obsidian/10 dark:border-white/5 shadow-sm flex items-center justify-center ${act.color}`}>
                <span className="material-symbols-outlined text-2xl">{act.icon}</span>
              </div>
              <span className="text-[9px] font-bold text-brand-obsidian/70 dark:text-white/40 uppercase tracking-widest">{act.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DAILY VERSE CARD */}
      <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-[2.5rem] p-10 flex flex-col items-center text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent"></div>
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
