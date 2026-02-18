import * as React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { NewsItem } from '../types';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state as NewsItem | undefined;
  const [showZoom, setShowZoom] = React.useState(false);
  const [zoomImg, setZoomImg] = React.useState<string | null>(null);

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
        ...data,
        imageUrl: data.image_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2070',
        date: new Date(data.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        author: (data.author as any)?.name || 'Mesa Editorial',
        userAvatar: (data.author as any)?.avatar_url,
      } as unknown as NewsItem;
    },
    initialData: initialData,
    enabled: !!id
  });

  const handleBack = () => {
    navigate('/news');
  };

  const toggleZoom = (src?: string) => {
    if (src) setZoomImg(src);
    setShowZoom(!showZoom);
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
    <div className="bg-[#FDFDFD] dark:bg-brand-obsidian min-h-screen transition-colors duration-500 selection:bg-brand-primary/30">
      {/* Editorial Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[150] h-20 px-8 flex items-center justify-between pointer-events-none">
        <button
          onClick={handleBack}
          className="w-11 h-11 bg-white dark:bg-brand-surface rounded-2xl shadow-xl flex items-center justify-center text-brand-obsidian dark:text-white border border-brand-obsidian/5 dark:border-white/5 active:scale-90 transition-all pointer-events-auto hover:border-brand-primary group"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back_ios_new</span>
        </button>
        <button className="w-11 h-11 bg-white dark:bg-brand-surface rounded-2xl border border-brand-obsidian/5 dark:border-white/5 flex items-center justify-center text-brand-obsidian/40 dark:text-white/40 hover:text-brand-primary transition-colors pointer-events-auto">
          <span className="material-symbols-outlined text-xl">ios_share</span>
        </button>
      </nav>

      <article className="animate-reveal">
        {/* Modern Image Header */}
        <header
          className="relative w-full aspect-[4/3] md:aspect-[21/9] overflow-hidden bg-brand-obsidian cursor-zoom-in group"
          onClick={() => toggleZoom(news.imageUrl)}
        >
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover opacity-90 scale-100 group-hover:scale-105 transition-transform duration-[2s]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFDFD] dark:from-brand-obsidian to-transparent opacity-60"></div>

        </header>

        {/* Editorial Body */}
        <main className="max-w-4xl mx-auto px-6 -mt-32 md:-mt-48 relative z-10 pb-40">
          <div className="bg-white dark:bg-brand-surface rounded-[4rem] px-8 md:px-24 py-16 md:py-24 shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-brand-obsidian/[0.02] dark:border-white/[0.04]">

            {/* Meta & Breadcrumb */}
            <div className="flex flex-col gap-8 mb-16 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <span className="px-4 py-1 bg-brand-primary text-brand-obsidian text-[8px] font-black uppercase tracking-[0.2em] rounded-full">
                  {news.category || 'Actualidad'}
                </span>
                <span className="h-4 w-[1px] bg-brand-obsidian/10 dark:bg-white/10"></span>
                <time className="text-[10px] font-bold text-brand-obsidian/30 dark:text-white/30 uppercase tracking-widest leading-none">
                  {news.date}
                </time>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-8xl font-serif font-bold text-brand-obsidian dark:text-white leading-[0.9] tracking-tighter">
                  {news.title}
                </h1>
                {news.subtitle && (
                  <p className="text-xl md:text-2xl font-serif font-medium text-brand-obsidian/50 dark:text-white/40 italic leading-relaxed">
                    {news.subtitle}
                  </p>
                )}
              </div>

              {/* Minimal Author */}
              <div className="flex items-center justify-center md:justify-start gap-4 pt-8 border-t border-brand-obsidian/[0.03] dark:border-white/5">
                <div className="w-12 h-12 rounded-[1.2rem] overflow-hidden bg-brand-obsidian/5 rotate-3 p-1 border border-brand-primary/20 shadow-lg">
                  <img
                    src={news.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${news.author}`}
                    className="w-full h-full object-cover rounded-[1rem]"
                    alt={news.author}
                  />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-[10px] font-black text-brand-obsidian dark:text-white uppercase tracking-widest">
                    Escrito por <span className="text-brand-primary">{news.author}</span>
                  </p>
                  <p className="text-[9px] text-brand-obsidian/30 dark:text-white/20 font-medium uppercase tracking-widest">Editor de Comunidad</p>
                </div>
              </div>
            </div>

            {/* Typography Content */}
            <div className="space-y-12">
              <div
                className="prose dark:prose-invert max-w-none text-brand-obsidian/70 dark:text-white/80 font-serif leading-relaxed text-xl mb-20 prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12 prose-img:cursor-zoom-in"
                dangerouslySetInnerHTML={{ __html: news.content }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'IMG') {
                    toggleZoom((target as HTMLImageElement).src);
                  }
                }}
              />

              {/* Editorial Footer */}
              <div className="mt-32 pt-16 border-t border-brand-obsidian/[0.03] dark:border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-brand-obsidian dark:text-white uppercase tracking-[0.4em] leading-none">Continuar Lectura</p>
                    <p className="text-xs text-brand-obsidian/40 dark:text-white/30 font-light italic">Descubra más historias del Reino.</p>
                  </div>
                  <button
                    onClick={handleBack}
                    className="px-12 py-5 rounded-3xl bg-brand-obsidian text-white dark:bg-brand-primary dark:text-brand-obsidian font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    Volver al Índice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </article>

      {/* Lightbox / Zoom Overlay */}
      {showZoom && (
        <div
          className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-4 overflow-hidden animate-in fade-in zoom-in duration-300"
          onClick={() => toggleZoom()}
        >
          <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all z-[2010]">
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={zoomImg || news.imageUrl}
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 select-none"
              alt="Zoomed"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          </div>

          <p className="absolute bottom-10 text-white/40 text-[10px] font-bold uppercase tracking-[0.5em] pointer-events-none">
            Vista Previa de Editorial
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsDetail;
