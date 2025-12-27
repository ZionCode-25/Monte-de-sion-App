import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
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
          imageUrl: item.image_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2070', // Fallback
          videoUrl: item.video_url || undefined,
          date: new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          priority: (item.priority as 'low' | 'high') || 'low',
          author: item.author?.name || 'Mesa Editorial',
          category: item.category || 'General',
          userAvatar: item.author?.avatar_url
        })) as NewsItem[];
      }
      return [] as NewsItem[];
    },
    refetchOnWindowFocus: true
  });

  return (
    <div className="flex flex-col min-h-screen bg-brand-silk dark:bg-brand-obsidian transition-colors overflow-hidden">
      {/* Header Section */}
      <div className="px-8 pt-10 pb-6 animate-reveal">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-[2px] bg-brand-primary"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Primicias</span>
        </div>
        <h2 className="text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter leading-none">
          Inspiración <br /><span className="gold-text-gradient italic">en Movimiento</span>
        </h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center pb-32">
          <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"></div>
        </div>
      ) : isError ? (
        <div className="flex-1 flex flex-col items-center justify-center pb-32 gap-4 text-center px-8">
          <span className="material-symbols-outlined text-4xl text-rose-500">error_outline</span>
          <p className="text-brand-obsidian/60 dark:text-white/60 text-sm">No pudimos cargar las noticias.</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-brand-obsidian/5 dark:bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-primary hover:text-brand-obsidian transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : news.length > 0 ? (
        <div className="flex-1 flex flex-col justify-center pb-32">
          {/* Interactive Carousel */}
          <div className="flex gap-6 overflow-x-auto px-8 pb-12 snap-x snap-mandatory no-scrollbar scroll-smooth">
            {news.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => navigate(`/news/${item.id}`, { state: item })}
                className="min-w-[85vw] md:min-w-[450px] snap-center animate-reveal group cursor-pointer"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className="relative h-[60vh] rounded-ultra overflow-hidden shadow-2xl shadow-brand-obsidian/20 dark:shadow-brand-primary/5 border border-brand-obsidian/[0.05] dark:border-white/5 bg-brand-surface">
                  {/* Image with zoom effect */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />

                  {/* Premium Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-obsidian via-brand-obsidian/30 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-obsidian/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* Top Badge */}
                  <div className="absolute top-8 left-8 flex items-center gap-3">
                    <div className="bg-brand-primary text-brand-obsidian px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl">
                      {item.category || 'Destacado'}
                    </div>
                    {item.priority === 'high' && (
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-xl fill-1 animate-pulse">priority_high</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col gap-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 font-bold text-[10px] uppercase tracking-widest">{item.date}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_10px_#ffb700]"></div>
                      <span className="text-brand-primary font-black text-[10px] uppercase tracking-widest">{item.author || 'Mesa Editorial'}</span>
                    </div>

                    <h3 className="text-4xl font-serif font-bold text-white mb-2 leading-[0.9] tracking-tighter drop-shadow-2xl">
                      {item.title}
                    </h3>

                    <p className="text-white/60 text-base leading-relaxed line-clamp-2 font-light italic text-balance mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                      "{item.content}"
                    </p>

                    <div className="flex items-center gap-4 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em]">
                      Deslizar para descubrir
                      <div className="w-12 h-[1px] bg-brand-primary/30 group-hover:w-20 transition-all duration-700"></div>
                      <span className="material-symbols-outlined text-xl group-hover:translate-x-3 transition-transform duration-700">trending_flat</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Navigation Indicators */}
          <div className="flex justify-center gap-3 mt-4">
            {news.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-700 ${i === 0 ? 'w-12 bg-brand-primary' : 'w-4 bg-brand-obsidian/10 dark:bg-white/10'}`}
              ></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 text-center px-10">
          <div className="w-32 h-32 bg-brand-obsidian/[0.03] dark:bg-white/[0.03] rounded-full flex items-center justify-center text-brand-obsidian/10 dark:text-white/10 mb-10 border border-brand-obsidian/5">
            <span className="material-symbols-outlined text-7xl font-light">auto_stories</span>
          </div>
          <h3 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white/60">Santuario en Silencio</h3>
          <p className="text-brand-obsidian/40 dark:text-white/40 text-sm mt-4 max-w-xs font-light italic leading-relaxed">
            "Esperando que el Espíritu sople nuevas palabras para nuestra comunidad."
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
