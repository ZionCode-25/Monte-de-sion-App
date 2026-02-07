import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { NewsItem } from '../types';

const NewsFeed: React.FC = () => {
  const navigate = useNavigate();

  const { data: news = [], isLoading: loading, isError, refetch } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*, author:profiles(name, avatar_url)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          image_url: item.image_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2070',
          imageUrl: item.image_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2070',
          videoUrl: item.video_url || undefined,
          date: new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          priority: (item.priority as any) === 'high' || (item.priority as any) === true ? 'high' : 'low',
          author: item.author?.name || 'Mesa Editorial',
          category: item.category || 'General',
          userAvatar: item.author?.avatar_url,
          created_at: item.created_at
        })) as unknown as NewsItem[];
      }
      return [] as NewsItem[];
    },
    refetchOnWindowFocus: true
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-brand-obsidian transition-colors overflow-x-hidden">
      {/* Editorial Header */}
      <header className="px-8 pt-16 pb-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-brand-primary"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Edición Semanal</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-light text-brand-obsidian dark:text-white tracking-tight leading-[0.85]">
              Crónicas de <br />
              <span className="font-bold italic">Sión</span>
            </h1>
          </div>
          <div className="hidden md:block text-right max-w-xs">
            <p className="text-[10px] font-medium text-brand-obsidian/40 dark:text-white/40 leading-relaxed uppercase tracking-widest">
              Información, inspiración y guía para nuestra comunidad digital en constante crecimiento.
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center pb-32">
          <div className="w-6 h-6 rounded-full border-2 border-brand-primary/30 border-t-brand-primary animate-spin"></div>
        </div>
      ) : isError ? (
        <div className="flex-1 flex flex-col items-center justify-center pb-32 gap-6 text-center px-8">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-rose-500">api</span>
          </div>
          <div className="space-y-1">
            <p className="text-brand-obsidian dark:text-white text-sm font-bold">Error de Sincronización</p>
            <p className="text-brand-obsidian/40 dark:text-white/40 text-xs">No pudimos conectar con el servidor editorial.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-8 py-3 bg-brand-obsidian text-white dark:bg-brand-primary dark:text-brand-obsidian rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-primary/10"
          >
            Reconectar
          </button>
        </div>
      ) : news.length > 0 ? (
        <main className="flex-1 max-w-7xl mx-auto w-full px-8 pb-32">
          {/* Featured Hero News */}
          <section className="mb-20">
            <div
              onClick={() => navigate(`/news/${news[0].id}`, { state: news[0] })}
              className="group cursor-pointer relative rounded-[3rem] overflow-hidden bg-brand-obsidian/5 dark:bg-white/5 border border-brand-obsidian/[0.03] dark:border-white/5 aspect-[16/9] md:aspect-[21/9]"
            >
              <img
                src={news[0].imageUrl}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-90"
                alt={news[0].title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-obsidian via-brand-obsidian/40 to-transparent"></div>

              <div className="absolute inset-x-0 bottom-0 p-8 md:p-16 flex flex-col gap-4 max-w-3xl translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-brand-primary text-brand-obsidian text-[8px] font-black uppercase tracking-widest shadow-2xl">
                    {news[0].category || 'Principal'}
                  </span>
                  <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{news[0].date}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tighter leading-none mb-2">
                  {news[0].title}
                </h2>
                <div className="flex items-center gap-4 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                  Explorar Historia
                  <span className="material-symbols-outlined text-sm">trending_flat</span>
                </div>
              </div>
            </div>
          </section>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-x-12 md:gap-y-20">
            {news.slice(1).map((item, idx) => (
              <article
                key={item.id}
                onClick={() => navigate(`/news/${item.id}`, { state: item })}
                className="group cursor-pointer flex flex-col gap-6 animate-reveal"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-brand-obsidian/5 dark:bg-white/5 border border-brand-obsidian/[0.03] dark:border-white/5">
                  <img
                    src={item.imageUrl}
                    className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    alt={item.title}
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-1.5 rounded-full bg-white/90 dark:bg-brand-obsidian/90 backdrop-blur-md text-brand-obsidian dark:text-white text-[8px] font-black uppercase tracking-widest border border-black/5 dark:border-white/10">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 px-2">
                  <div className="flex items-center gap-2 text-brand-obsidian/30 dark:text-white/30 text-[9px] font-black uppercase tracking-widest">
                    <time>{item.date}</time>
                    <span className="w-1 h-1 rounded-full bg-brand-primary"></span>
                    <span>{item.author}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white group-hover:text-brand-primary transition-colors leading-[1.1] tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-brand-obsidian/50 dark:text-white/40 leading-relaxed line-clamp-2 font-light italic">
                    {item.content}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </main>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-40 text-center px-10">
          <div className="w-24 h-24 bg-brand-obsidian/[0.03] dark:bg-white/[0.05] rounded-[2.5rem] flex items-center justify-center text-brand-obsidian/10 dark:text-white/10 mb-8 rotate-12">
            <span className="material-symbols-outlined text-5xl font-light">auto_stories</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white italic">Prensa en reposo</h3>
          <p className="text-brand-obsidian/40 dark:text-white/40 text-xs mt-3 max-w-[250px] font-light leading-relaxed">
            Estamos preparando las crónicas del próximo fluir ministerial.
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
