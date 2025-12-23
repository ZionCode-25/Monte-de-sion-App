
import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { NewsItem } from '../types';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state as NewsItem | undefined;

  const { data: news, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('news')
        .select('*, author:profiles(name, avatar_url)')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        imageUrl: data.image_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2070',
        videoUrl: data.video_url || undefined,
        date: new Date(data.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        priority: (data.priority as 'low' | 'high') || 'low',
        author: data.author?.name || 'Mesa Editorial',
        category: data.category || 'General',
        userAvatar: data.author?.avatar_url
      } as NewsItem;
    },
    initialData: initialData,
    enabled: !!id
  });

  const handleBack = () => {
    navigate('/news');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-silk dark:bg-brand-obsidian">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-silk dark:bg-brand-obsidian text-brand-obsidian dark:text-white p-10 text-center">
        <h2 className="text-2xl font-serif font-bold mb-4">Noticia no encontrada</h2>
        <button
          onClick={handleBack}
          className="text-brand-primary font-bold uppercase tracking-widest text-xs"
        >
          Volver a Noticias
        </button>
      </div>
    );
  }

  return (
    <div className="bg-brand-silk dark:bg-brand-obsidian min-h-screen transition-colors duration-500">
      {/* Top Navigation Bar - Professional & Subtle */}
      <div className="fixed top-0 left-0 right-0 z-[130] h-20 px-6 flex items-center justify-between pointer-events-none">
        <button
          onClick={handleBack}
          className="w-12 h-12 bg-white/10 dark:bg-brand-obsidian/20 backdrop-blur-2xl rounded-2xl shadow-xl flex items-center justify-center text-brand-obsidian dark:text-white border border-brand-obsidian/5 dark:border-white/10 active:scale-90 transition-all pointer-events-auto"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div className="w-12 h-12 bg-white/10 dark:bg-brand-obsidian/20 backdrop-blur-2xl rounded-2xl border border-brand-obsidian/5 dark:border-white/10 flex items-center justify-center text-brand-primary pointer-events-auto">
          <span className="material-symbols-outlined">share</span>
        </div>
      </div>

      <article className="animate-reveal">
        {/* HERO SECTION: High Impact */}
        <header className="relative w-full h-[65vh] overflow-hidden bg-brand-obsidian">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover opacity-80 scale-105"
          />
          {/* Multi-layered Gradients for Smooth Blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-silk dark:from-brand-obsidian via-transparent to-black/20"></div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-silk dark:from-brand-obsidian to-transparent"></div>

          {/* Featured Badge Overlay */}
          {news.priority === 'high' && (
            <div className="absolute bottom-32 left-8">
              <div className="bg-brand-primary text-brand-obsidian px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(255,183,0,0.3)]">
                Primicia Sión
              </div>
            </div>
          )}
        </header>

        {/* CONTENT CONTAINER: Premium Card Reveal */}
        <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-10 pb-40">
          <div className="bg-white dark:bg-brand-surface rounded-[3.5rem] p-10 md:p-20 shadow-2xl shadow-brand-obsidian/5 dark:shadow-none border border-brand-obsidian/[0.03] dark:border-white/[0.05]">

            {/* Metadata Hub */}
            <div className="flex flex-col gap-6 mb-12">
              <div className="flex items-center gap-4">
                <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                  {news.category || 'Actualidad'}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/30"></div>
                <time className="text-brand-obsidian/30 dark:text-white/30 font-bold text-[10px] uppercase tracking-widest">{news.date}</time>
              </div>

              <h1 className="text-4xl md:text-7xl font-serif font-bold text-brand-obsidian dark:text-white leading-[1] tracking-tighter">
                {news.title}
              </h1>

              {/* Enhanced Author Section */}
              <div className="flex items-center gap-5 pt-8 mt-4 border-t border-brand-obsidian/[0.05] dark:border-white/5">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-primary rounded-2xl blur-md opacity-20"></div>
                  <img
                    src={news.userAvatar || `https://i.pravatar.cc/150?u=${news.id}`}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-primary/30 relative z-10"
                    alt="Autor"
                  />
                </div>
                <div>
                  <p className="text-xs font-black text-brand-obsidian dark:text-white uppercase tracking-[0.2em]">{news.author || 'Mesa Editorial'}</p>
                  <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mt-0.5">Voz Monte de Sión</p>
                </div>
              </div>
            </div>

            {/* TYPOGRAPHY CENTERED CONTENT */}
            <div className="space-y-10">
              {/* Highlight Intro */}
              <p className="text-2xl md:text-3xl text-brand-obsidian/80 dark:text-brand-cream/90 leading-tight font-serif italic font-medium border-l-4 border-brand-primary pl-8 py-2">
                "{news.content}"
              </p>

              {/* Detailed Narrative */}
              <div className="space-y-8 text-brand-obsidian/70 dark:text-white/60 leading-relaxed font-light text-xl">
                <p>
                  En una jornada histórica para nuestra congregación, hemos presenciado la manifestación de una nueva etapa ministerial. Lo que hoy compartimos no es simplemente una actualización institucional, sino un testimonio de crecimiento y fe que impacta directamente a cada miembro de la familia Monte de Sión.
                </p>

                <p>
                  Bajo la guía de nuestro equipo pastoral, se ha delineado un camino claro que prioriza la excelencia en el servicio y la profundidad en la comunión. Este anuncio marca el inicio de preparativos para los próximos meses, donde la unidad será nuestro mayor activo.
                </p>

                {/* Mid-Content Visual Asset */}
                <figure className="my-16 group">
                  <div className="rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-primary/5 border border-brand-obsidian/[0.05] dark:border-white/10">
                    <img
                      src={`https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=1200&auto=format&fit=crop`}
                      alt="Evento detalle"
                      className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="mt-6 text-center text-brand-obsidian/30 dark:text-white/20 text-[10px] font-bold uppercase tracking-[0.3em] italic">
                    Perspectiva espiritual • Registro comunitario
                  </figcaption>
                </figure>

                <p>
                  Invitamos a toda la comunidad a permanecer en oración por este nuevo proyecto. Los detalles específicos de logística y participación ciudadana se estarán canalizando a través de los líderes de cada ministerio, asegurando que nadie se quede fuera de este fluir del Espíritu.
                </p>

                {/* Callout Box - Matches App Style */}
                <div className="bg-brand-primary/5 dark:bg-brand-primary/[0.02] rounded-[2.5rem] p-10 my-16 border-2 border-brand-primary/10 flex flex-col gap-6 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl transition-all group-hover:scale-150"></div>
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center text-brand-obsidian shadow-lg">
                    <span className="material-symbols-outlined font-bold">priority_high</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-bold text-brand-obsidian dark:text-brand-primary italic mb-2">Nota Importante</h4>
                    <p className="text-brand-obsidian/60 dark:text-white/40 text-sm leading-relaxed font-medium">
                      Para participar en las mesas de trabajo de esta iniciativa, es requisito indispensable estar registrado en el ministerio correspondiente a través de esta plataforma.
                    </p>
                  </div>
                </div>

                <p>
                  Seguiremos comunicando los avances de esta visión de manera oportuna. Que la gracia del Señor siga sosteniendo cada paso que damos como cuerpo de Cristo en esta ciudad.
                </p>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-24 pt-12 border-t border-brand-obsidian/[0.03] dark:border-white/5 flex flex-col gap-10">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-black text-brand-obsidian/20 dark:text-white/20 uppercase tracking-[0.4em]">Propagar Palabra</h5>
                <div className="flex gap-4">
                  {['Instagram', 'Facebook', 'WhatsApp'].map((platform) => (
                    <button key={platform} className="w-12 h-12 rounded-2xl bg-brand-obsidian/[0.03] dark:bg-white/5 flex items-center justify-center text-brand-obsidian/30 dark:text-white/30 hover:bg-brand-primary hover:text-brand-obsidian transition-all active:scale-90 border border-brand-obsidian/[0.05] dark:border-white/10">
                      <span className="material-symbols-outlined text-xl">
                        {platform === 'WhatsApp' ? 'chat' : platform === 'Facebook' ? 'share' : 'photo_camera'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleBack}
                className="w-full py-7 rounded-[2rem] bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian font-black text-xs uppercase tracking-[0.5em] shadow-2xl shadow-brand-primary/10 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                Volver a Noticias
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Recommended News - Premium Cards */}
      <section className="bg-brand-obsidian/[0.02] dark:bg-white/[0.02] py-24 px-8 border-t border-brand-obsidian/[0.05] dark:border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white italic">Te puede interesar</h3>
            <div className="flex-1 h-[1px] bg-brand-primary/20"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-brand-surface p-6 rounded-[2.5rem] shadow-sm border border-brand-obsidian/[0.03] dark:border-white/[0.05] flex flex-col gap-5 hover:scale-[1.02] transition-transform cursor-pointer group">
                <div className="h-44 rounded-[2rem] overflow-hidden relative">
                  <img src={`https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-obsidian/60 to-transparent"></div>
                </div>
                <div>
                  <h4 className="font-bold text-brand-obsidian dark:text-white leading-tight mb-2 group-hover:text-brand-primary transition-colors">Crecimiento Integral: Nuevas sesiones de consejería</h4>
                  <span className="text-[9px] text-brand-primary font-black uppercase tracking-widest">Hace 2 días • Comunidad</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsDetail;
