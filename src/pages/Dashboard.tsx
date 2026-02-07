import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useYouTube } from '../hooks/useYouTube';
import { useDashboardData } from '../hooks/useDashboardData';

interface DashboardProps {
  theme?: 'light' | 'dark';
}

const Dashboard: React.FC<DashboardProps> = ({ theme }) => {
  const navigate = useNavigate();

  // Custom Hooks
  const { latestVideo } = useYouTube();
  const {
    latestDevotional,
    nextEvent,
    latestNews,
    communityPreview,
    activeAttendanceSession
  } = useDashboardData();

  const LOGO_GENERACION = "https://res.cloudinary.com/dkl5uieu5/image/upload/v1762629261/20240811_040334_239_jtkm4w.jpg";
  const LOGO_MONTE = "https://res.cloudinary.com/dkl5uieu5/image/upload/v1761826906/logonew-montedesion_ixejfe.jpg";

  const openYoutubeChannel = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col gap-8 px-6 pt-10 pb-40 animate-reveal">

      {/* 1. HEADER: DEVOTIONAL FOCUS */}
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

      {/* 2.5 QR ATTENDANCE CTA */}
      {activeAttendanceSession && (
        <section
          onClick={() => navigate('/scan')}
          className="relative overflow-hidden bg-brand-obsidian dark:bg-brand-primary rounded-[2.5rem] p-8 flex items-center justify-between cursor-pointer active:scale-95 transition-all shadow-xl group animate-in zoom-in-95 duration-500"
        >
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary dark:bg-brand-obsidian flex items-center justify-center text-brand-obsidian dark:text-brand-primary shadow-lg group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined text-4xl">qr_code_scanner</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white dark:text-brand-obsidian uppercase tracking-tight">Marcar Asistencia</h3>
              <p className="text-[10px] font-bold text-brand-primary dark:text-brand-obsidian/60 uppercase tracking-widest mt-1">{activeAttendanceSession.event_name || 'Suma puntos de impacto hoy'}</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-white/20 dark:text-brand-obsidian/20 text-4xl relative z-10">chevron_right</span>
        </section>
      )}

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

        {/* EVENT CARD */}
        <div onClick={() => navigate('/events')} className="bg-brand-obsidian text-brand-cream p-6 rounded-[2.5rem] flex flex-col justify-between aspect-square cursor-pointer hover:bg-brand-obsidian/90 transition-colors relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-3xl opacity-50">calendar_today</span>
            {nextEvent && (
              <div className="bg-white/10 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {new Date(nextEvent.date).getDate()} {new Date(nextEvent.date).toLocaleString('es-ES', { month: 'short' }).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest opacity-50 mb-1">Próximo Evento</p>
            <h3 className="text-xl font-bold leading-none line-clamp-2">{nextEvent?.title || 'Sin eventos'}</h3>
          </div>
        </div>

        {/* COMMUNITY CARD */}
        <div onClick={() => navigate('/community')} className="bg-white dark:bg-brand-surface p-6 rounded-[2.5rem] flex flex-col justify-between aspect-square cursor-pointer hover:shadow-xl transition-all border border-brand-obsidian/5 dark:border-white/5">
          <div className="flex -space-x-3">
            {communityPreview?.avatars.map((url: string, i: number) => (
              <img key={i} src={url} className="w-8 h-8 rounded-full border-2 border-white dark:border-brand-obsidian" alt="" />
            ))}
            {(!communityPreview?.avatars || communityPreview.avatars.length === 0) && (
              <div className="w-8 h-8 rounded-full bg-brand-obsidian/10 flex items-center justify-center text-[10px]">?</div>
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-black text-brand-obsidian dark:text-white">{communityPreview?.count || 0}</h3>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Miembros</span>
            </div>
            <p className="text-[10px] text-brand-obsidian/40 dark:text-white/40 font-bold uppercase tracking-widest mt-1">Comunidad Activa</p>
          </div>
        </div>

      </div>

      {/* 3. LATEST YOUTUBE VIDEO */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-brand-obsidian/30 dark:text-white/30 uppercase tracking-[0.2em]">Multimedia</h3>
          <div className="flex gap-2">
            <img src={LOGO_GENERACION} onClick={() => openYoutubeChannel('https://www.youtube.com/@GeneracionPrivilegiada')} className="w-6 h-6 rounded-full grayscale hover:grayscale-0 cursor-pointer transition-all border border-brand-obsidian/10" alt="GP" />
            <img src={LOGO_MONTE} onClick={() => openYoutubeChannel('https://www.youtube.com/@IglesiaMontedeSion')} className="w-6 h-6 rounded-full grayscale hover:grayscale-0 cursor-pointer transition-all border border-brand-obsidian/10" alt="MS" />
          </div>
        </div>

        {latestVideo ? (
          <div onClick={() => window.open(latestVideo.link, '_blank')} className="group relative aspect-video rounded-3xl overflow-hidden shadow-xl cursor-pointer">
            <img src={latestVideo.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={latestVideo.title} />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300">
                <span className="material-symbols-outlined text-4xl">play_arrow</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mb-1">{latestVideo.channel}</p>
              <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{latestVideo.title}</h3>
            </div>
          </div>
        ) : (
          <div className="aspect-video rounded-3xl bg-brand-obsidian/5 dark:bg-white/5 animate-pulse flex items-center justify-center">
            <span className="text-brand-obsidian/20 dark:text-white/20 font-bold text-xs uppercase tracking-widest">Cargando Video...</span>
          </div>
        )}
      </section>

    </div>
  );
};

export default Dashboard;
