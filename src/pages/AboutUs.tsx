
// Build Trigger: 2026-02-19 13:40
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { LOGO_DARK_THEME, LOGO_LIGHT_THEME, LOGO_BG_URL } from '../constants';

interface AboutUsProps {
  theme: 'light' | 'dark';
}

interface Leader {
  id: string;
  name: string;
  roleTitle: string; // The big background title
  roleSubtitle: string; // The specific role
  img: string;
  bio: string;
  color: string;
}

const AboutUs: React.FC<AboutUsProps> = ({ theme }) => {
  const [scrollY, setScrollY] = useState(0);
  const [activeLeaderIndex, setActiveLeaderIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | null>(null);

  const socialLogos = {
    fb: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
    ig: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.584-.071 4.85c-.055 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.056.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.015-4.85-.071c-1.17-.055-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.015-3.584.071-4.85c.055-1.17.249-1.805.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.057 1.646-.07 4.85-.07zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>,
    yt: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
    tk: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12.525.02c1.31-.032 2.612-.019 3.91-.019 0 1.41.13 2.82-.125 4.22-.245 1.332-.88 2.536-1.783 3.5-.72.77-1.583 1.38-2.545 1.79 0 1.37.01 2.74-.01 4.108.01 1.474-.21 2.946-.66 4.35-.453 1.414-1.164 2.73-2.108 3.882-.943 1.15-2.09 2.112-3.38 2.82a10.165 10.165 0 01-5.18 1.32c-1.393.003-2.784-.253-4.088-.756A10.176 10.176 0 01.373 20.84a10.147 10.147 0 01-1.32-5.18.015.015 0 01.01-.01h.01c.003-1.39 0-2.78 0-4.17.436.036.87.054 1.304.054 1.258-.002 2.507-.265 3.666-.77a6.23 6.23 0 002.13-1.384 6.202 6.202 0 001.31-2.004c.324-.87.487-1.78.487-2.7 0-.348-.024-.694-.07-1.036 0-1.22 0-2.438.01-3.657 1.545 0 3.09 0 4.636.01.002.046.012.09.012.136.01 1.708.41 3.395 1.162 4.93.75 1.536 1.838 2.88 3.197 3.94 1.36 1.058 2.923 1.82 4.59 2.235 1.666.416 3.4.526 5.105.32 0-1.42 0-2.838-.01-4.257-.864.062-1.728-.052-2.56-.34-.833-.288-1.597-.735-2.25-1.31a6.16 6.16 0 01-1.51-2.06c-.347-.842-.522-1.745-.522-2.656 0-.327.022-.653.067-.976h.02c.004-.33.013-.658.026-.984l.02-.01z" /></svg>,
    wa: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
  };


  // Fetch all app settings for a dynamic experience
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const { data } = await supabase.from('app_settings').select('*');
      const settingsMap: Record<string, any> = {};
      data?.forEach((item: any) => {
        settingsMap[item.key] = item.value;
      });
      return settingsMap;
    },
    staleTime: 1000 * 60 * 60 // 1 hour cache for public pages
  });

  const leaders: Leader[] = (settings?.leaders_list as Leader[]) || [];
  const churchName = settings?.church_name || 'MONTE DE SIÓN';
  const tagline = settings?.church_tagline || '"Más que una congregación, somos una familia unida por el propósito eterno de Dios."';

  const defaultActivities = [
    { d: 'Lunes', t: '20:00', a: 'Oración en Casas' },
    { d: 'Martes', t: '21:00', a: 'Discipulado Online' },
    { d: 'Miércoles', t: '19:30', a: 'Culto de Oración' },
    { d: 'Jueves', t: '20:00', a: 'Ensayo Alabanza' },
    { d: 'Viernes', t: '22:00', a: 'Vigilia (Mensual)' },
    { d: 'Sábado', t: '18:00', a: 'Reunión de Jóvenes' },
    { d: 'Domingo', t: '10:00 | 18:00', a: 'Escuela & Culto Central', highlight: true },
  ];

  const activeLogo = theme === 'dark'
    ? (settings?.church_logo_dark_url || LOGO_DARK_THEME)
    : (settings?.church_logo_url || LOGO_LIGHT_THEME);

  const activities = (settings?.weekly_activities as any[]) || defaultActivities;

  useEffect(() => {
    const handleScroll = () => requestAnimationFrame(() => setScrollY(window.scrollY));
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use Intersection Observer for fade-in elements
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []); // Run once on mount

  // Carousel Scroll Detection Logic
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleCarouselScroll = () => {
      const containerCenter = container.getBoundingClientRect().left + container.clientWidth / 2;
      let closestIndex = 0;
      let minDistance = Number.MAX_VALUE;

      // Access the children directly from the container
      Array.from(container.children).forEach((child, index) => {
        // Skip spacer divs (first and last children are spacers in our layout)
        // Our layout has: Spacer | Card | Card ... | Spacer. 
        // Leaders start at index 1 in the children array if there is 1 left spacer.
        // Let's rely on the leader mapping index vs child index.
        // The container has [Spacer, ...Leaders, Spacer]. 
        // So Leader[i] corresponds to child[i + 1].

        const cardIndex = index - 1; // Adjust for left spacer
        if (cardIndex < 0 || cardIndex >= leaders.length) return;

        const rect = (child as HTMLElement).getBoundingClientRect();
        const childCenter = rect.left + rect.width / 2;
        const distance = Math.abs(containerCenter - childCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = cardIndex;
        }
      });

      if (closestIndex !== activeLeaderIndex) {
        setActiveLeaderIndex(closestIndex);
      }
    };

    container.addEventListener('scroll', handleCarouselScroll, { passive: true });
    // Initial check
    handleCarouselScroll();

    return () => container.removeEventListener('scroll', handleCarouselScroll);
  }, [leaders.length, activeLeaderIndex]); // Re-attach if length changes

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedLeader) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedLeader]);

  return (
    <div className="flex flex-col min-h-screen bg-brand-silk dark:bg-brand-obsidian font-sans selection:bg-brand-primary selection:text-brand-obsidian overflow-x-hidden">

      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-brand-obsidian">
        {/* Abstract Gradient Background (No Image) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-primary/20 via-brand-obsidian to-black animate-pulse duration-[5000ms]"></div>

        {/* Content - Fixed animations by removing missing plugin classes and using standard opacity transitions */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
          <div
            className="w-24 h-24 md:w-32 md:h-32 mb-12 animate-in fade-in zoom-in duration-1000 delay-300 fill-mode-forwards"
          >
            <img src={activeLogo} alt="Logo" className="w-full h-full drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]" />
          </div>

          <h1 className="text-[15vw] md:text-[10vw] leading-[0.8] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 mb-8 animate-screen-in drop-shadow-2xl uppercase">
            {churchName.split(' ')[0]} <br /> <span className="text-brand-primary">{churchName.split(' ').slice(1).join(' ')}</span>
          </h1>

          <p className="text-xl md:text-3xl font-serif text-brand-obsidian/80 dark:text-white/80 max-w-2xl mx-auto leading-relaxed animate-reveal italic delay-200">
            {tagline}
          </p>

          <div className="mt-16 animate-bounce delay-1000 duration-[2000ms]">
            <span className="material-symbols-outlined text-4xl text-brand-primary/50">keyboard_arrow_down</span>
          </div>
        </div>
      </section>

      {/* 2. HISTORY & IDENTITY (Scroll Reveal) */}
      <section className="py-32 px-6 relative z-10 bg-brand-silk dark:bg-brand-obsidian rounded-t-[4rem] -mt-20 border-t border-white/10 shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          <div className={`transition-all duration-1000 transform ${scrollY > 100 ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <span className="text-brand-primary font-black text-xs uppercase tracking-[0.4em] mb-4 block">Nuestra Historia</span>
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-brand-obsidian dark:text-white mb-8 leading-[0.9] tracking-tight">
              Un Legado de <br /><span className="italic text-brand-primary">Fe y Amor.</span>
            </h2>
            <div className="space-y-6 text-lg text-brand-obsidian/70 dark:text-white/70 font-light leading-relaxed">
              <p>
                Desde nuestros inicios, Monte de Sión ha sido un faro de luz en la comunidad. Lo que comenzó como un pequeño grupo de oración se ha convertido en un movimiento vibrante que impacta vidas diariamente.
              </p>
              <p>
                Creemos en la restauración integral del ser humano, abarcando espíritu, alma y cuerpo. Nuestra misión es equipar a los santos para la obra del ministerio.
              </p>
            </div>
          </div>

          <div className={`grid gap-6 transition-all duration-1000 delay-300 transform ${scrollY > 100 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="bg-white dark:bg-white/5 p-10 rounded-[3rem] border border-brand-obsidian/5 dark:border-white/5 shadow-2xl hover:scale-[1.02] transition-transform duration-500">
              <span className="material-symbols-outlined text-5xl text-brand-primary mb-6">diversity_3</span>
              <h3 className="text-2xl font-bold text-brand-obsidian dark:text-white mb-2">Comunidad</h3>
              <p className="text-brand-obsidian/60 dark:text-white/60">Fomentamos relaciones genuinas y duraderas.</p>
            </div>
            <div className="bg-brand-obsidian dark:bg-brand-primary p-10 rounded-[3rem] shadow-2xl hover:scale-[1.02] transition-transform duration-500">
              <span className="material-symbols-outlined text-5xl text-white dark:text-brand-obsidian mb-6">volunteer_activism</span>
              <h3 className="text-2xl font-bold text-white dark:text-brand-obsidian mb-2">Servicio</h3>
              <p className="text-white/60 dark:text-brand-obsidian/60">Amar es servir. Servimos a nuestra ciudad con pasión.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ULTRA PROFESIONAL LEADERSHIP CAROUSEL */}
      <section className="py-40 bg-brand-silk/30 dark:bg-brand-obsidian relative overflow-hidden transition-colors duration-500">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-gray-100/50 via-transparent to-transparent dark:from-gray-900 dark:via-black dark:to-black opacity-90 z-0"></div>

        <div className="container mx-auto px-6 mb-20 relative z-10 text-center">
          <h2 className="text-brand-primary text-[10px] md:text-sm font-black uppercase tracking-[0.6em] mb-4 animate-pulse">Liderazgo</h2>
          <h3 className="text-5xl md:text-8xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter">Nuestro <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-amber-200 dark:to-amber-100">Equipo</span></h3>
        </div>

        {/* Horizontal Scroll Container - IMPROVED DESIGN */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto gap-4 md:gap-8 px-6 pb-24 snap-x snap-mandatory no-scrollbar h-[800px] md:h-[900px] items-center"
        >
          <div className="w-[10vw] shrink-0"></div> {/* Left spacer */}

          {leaders.map((leader, i) => (
            <div
              key={leader.id}
              onClick={() => setSelectedLeader(leader)}
              className={`snap-center shrink-0 w-[90vw] md:w-[700px] h-[700px] md:h-[800px] relative group cursor-pointer transition-all duration-700 ease-out 
                ${activeLeaderIndex === i ? 'scale-100 opacity-100 z-20 grayscale-0' : 'scale-90 opacity-40 z-10 grayscale-[50%]'}`}
            >
              {/* CARD CONTAINER */}
              <div className={`w-full h-full relative overflow-visible flex flex-col items-center justify-end pb-12 transition-all duration-500 ${activeLeaderIndex === i ? 'opacity-100' : 'opacity-70'}`}>

                {/* 1. LAYER: BACK TITLE (Huge - Reduced size to prevent overlap) */}
                <h4 className={`absolute top-10 left-1/2 -translate-x-1/2 text-[15vw] md:text-[140px] font-black text-brand-obsidian/[0.03] dark:text-white/[0.03] whitespace-nowrap tracking-tighter select-none pointer-events-none z-0 transition-transform duration-700 ${activeLeaderIndex === i ? 'scale-110' : 'scale-100'}`}>
                  {leader.roleTitle}
                </h4>

                {/* 2. LAYER: GLOW */}
                <div className={`absolute bottom-20 w-[400px] h-[400px] rounded-full blur-[120px] bg-gradient-to-t ${leader.color} opacity-20 group-hover:opacity-50 transition-all duration-700`}></div>

                {/* 3. LAYER: IMAGE (No Grayscale, High Quality, Brightness Enhanced, Larger) */}
                <img
                  src={leader.img}
                  alt={leader.name}
                  loading={i < 3 ? "eager" : "lazy"}
                  className={`relative z-10 h-[100%] max-h-[110%] w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 will-change-transform
                    ${activeLeaderIndex === i ? 'brightness-110 contrast-105 scale-105' : 'brightness-90 contrast-90 scale-100 dark:grayscale-[30%]'}`}
                />

                {/* 4. LAYER: FOREGROUND INFO */}
                <div className={`relative z-20 text-center -mt-20 transition-all duration-500 ${activeLeaderIndex === i ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-0'}`}>
                  <div className="inline-block px-4 py-1 mb-3 border border-brand-primary/30 rounded-full bg-white/60 dark:bg-brand-obsidian/60 backdrop-blur-md">
                    <span className="text-brand-primary text-xs font-black uppercase tracking-[0.2em]">{leader.roleSubtitle}</span>
                  </div>
                  <h3 className="text-4xl md:text-6xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tight drop-shadow-2xl">
                    {leader.name}
                  </h3>
                  <div className={`h-1.5 bg-brand-primary mx-auto mt-6 rounded-full shadow-[0_0_20px_rgba(255,183,0,0.5)] transition-all duration-500 ${activeLeaderIndex === i ? 'w-16' : 'w-8 opacity-50'}`}></div>
                </div>

              </div>
            </div>
          ))}

          <div className="w-[10vw] shrink-0"></div> {/* Right spacer */}
        </div>
      </section>

      {/* 4. UBICACIÓN & AGENDA SEMANAL */}
      <section className="py-20 px-6 bg-brand-silk dark:bg-brand-surface relative z-10 border-t border-brand-obsidian/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">

          {/* Left: Location */}
          <div className="lg:w-1/3 flex flex-col justify-center">
            <div className="mb-8">
              <span className="text-brand-primary text-xs font-black uppercase tracking-[0.4em] block mb-2">Nuestra Casa</span>
              <h2 className="text-4xl font-serif font-bold text-brand-obsidian dark:text-white mb-6">Visítanos</h2>
              <p className="text-brand-obsidian/70 dark:text-white/70 text-lg leading-relaxed mb-8">
                Miguel Ridao F. 1-99, <br />
                J5411 Santa Lucía, <br />
                San Juan, Argentina.
              </p>

              <a
                href="https://www.google.com/maps/search/?api=1&query=-31.533130,-68.506879"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined">map</span>
                Ver en Mapa
              </a>
            </div>
          </div>

          {/* Right: Collapsible Schedule */}
          <div className="lg:w-2/3 space-y-4">
            <div className="bg-white dark:bg-brand-obsidian rounded-[3rem] p-8 md:p-12 shadow-xl border border-brand-obsidian/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-8 border-b border-brand-obsidian/10 dark:border-white/10 pb-4">
                <h3 className="text-2xl font-bold text-brand-obsidian dark:text-white">Actividades Semanales</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const text = activities.map(a => `${a.d}: ${a.t} - ${a.a}`).join('\n');
                      if (navigator.share) {
                        navigator.share({ title: 'Actividades Monte de Sión', text });
                      } else {
                        navigator.clipboard.writeText(text);
                        alert('Cronograma copiado al portapapeles');
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-brand-silk dark:bg-white/5 flex items-center justify-center text-brand-obsidian/40 dark:text-white/40 hover:text-brand-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">share</span>
                  </button>
                  <button
                    onClick={() => {
                      const text = activities.map(a => `${a.d}: ${a.t} - ${a.a}`).join('\n');
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'cronograma-semanal.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-10 h-10 rounded-full bg-brand-silk dark:bg-white/5 flex items-center justify-center text-brand-obsidian/40 dark:text-white/40 hover:text-brand-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">download</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {activities.map((item, i) => (
                  <details key={i} className="group bg-brand-silk dark:bg-white/5 rounded-3xl overflow-hidden border border-transparent hover:border-brand-primary/20 transition-all">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <div className="flex items-baseline gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary min-w-[60px]">{item.d}</span>
                        <span className="font-bold text-brand-obsidian dark:text-white">{item.a}</span>
                      </div>
                      <span className="material-symbols-outlined text-brand-primary group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="px-6 pb-6 pt-0 text-sm text-brand-obsidian/60 dark:text-white/60 font-medium">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span className="font-bold">{item.t}</span>
                      </div>
                      <p>Únete a nosotros para este tiempo especial de comunión y crecimiento espiritual.</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER & LEGAL */}
      {/* 5. PROFESSIONAL SOCIAL MEDIA SECTION */}
      <section className="py-32 px-6 bg-white dark:bg-black/40 border-t border-brand-obsidian/5 dark:border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <span className="text-brand-primary font-black text-xs uppercase tracking-[0.4em] mb-4 block text-center">Nuestra Casa Online</span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-brand-obsidian dark:text-white text-center mb-16 px-4">
            Monte de Sión en las <br /><span className="italic text-brand-primary">Redes Sociales.</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4">
            {[
              { id: 'fb', name: 'Facebook', user: settings?.facebook_url?.split('/').filter(Boolean).pop() || '@iglesia', url: settings?.facebook_url || '#', color: 'hover:bg-[#1877F2]', icon: socialLogos.fb },
              { id: 'ig', name: 'Instagram', user: settings?.instagram_url?.split('/').filter(Boolean).pop() || '@iglesia', url: settings?.instagram_url || '#', color: 'hover:bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]', icon: socialLogos.ig },
              { id: 'yt', name: 'YouTube', user: settings?.youtube_url?.split('/').filter(Boolean).pop() || '@iglesia', url: settings?.youtube_url || '#', color: 'hover:bg-[#FF0000]', icon: socialLogos.yt },
              { id: 'tk', name: 'TikTok', user: settings?.tiktok_url?.split('/').filter(Boolean).pop() || '@iglesia', url: settings?.tiktok_url || '#', color: 'hover:bg-[#000000]', icon: socialLogos.tk }
            ].map(social => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className={`flex flex-col items-center p-12 bg-brand-silk dark:bg-white/5 rounded-[3rem] border border-brand-obsidian/5 dark:border-white/5 transition-all duration-500 group ${social.color} hover:text-white hover:-translate-y-2 ${!social.url || social.url === '#' ? 'opacity-30 grayscale pointer-events-none' : ''}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-white/10 shadow-lg group-hover:bg-white/20 transition-all mb-6 text-brand-obsidian dark:text-white group-hover:scale-110`}>
                  {social.icon}
                </div>
                <h4 className="font-bold text-lg mb-1">{social.name}</h4>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-40 group-hover:opacity-100">{social.user}</p>
              </a>
            ))}
          </div>

          <div className="mt-24 w-full h-px bg-brand-obsidian/5 dark:bg-white/5"></div>

          {/* Legal Links Footer */}
          <div className="mt-12 w-full px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-brand-obsidian/40 dark:text-white/40">
            <div className="flex items-center gap-4">
              <img src={activeLogo} className="h-10 opacity-30 grayscale" alt="" />
              <p>© {new Date().getFullYear()} {churchName}. Todos los derechos reservados.</p>
            </div>
            <div className="flex gap-8">
              <button
                onClick={() => setActiveLegalModal('terms')}
                className="hover:text-brand-primary transition-colors cursor-pointer uppercase tracking-widest"
              >
                Términos y Condiciones
              </button>
              <button
                onClick={() => setActiveLegalModal('privacy')}
                className="hover:text-brand-primary transition-colors cursor-pointer uppercase tracking-widest"
              >
                Política de Privacidad
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LEGAL MODALS */}
      {activeLegalModal && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-brand-surface w-full max-w-3xl max-h-[85vh] rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white">
                {activeLegalModal === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad'}
              </h2>
              <button onClick={() => setActiveLegalModal(null)} className="w-10 h-10 rounded-full bg-brand-silk dark:bg-white/10 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-6 text-sm md:text-base leading-relaxed text-brand-obsidian/70 dark:text-white/70 font-medium custom-scrollbar">
              {activeLegalModal === 'terms' ? (
                <>
                  <p className="font-bold text-brand-obsidian dark:text-white">1. Aceptación de los Términos</p>
                  <p>Al acceder y utilizar la aplicación de {churchName}, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso.</p>

                  <p className="font-bold text-brand-obsidian dark:text-white">2. Uso de la Aplicación</p>
                  <p>Esta aplicación está diseñada para facilitar la comunicación, el crecimiento espiritual y la participación en las actividades de nuestra comunidad cristiana. Se prohíbe cualquier uso malintencionado, difamatorio o ilegal.</p>

                  <p className="font-bold text-brand-obsidian dark:text-white">3. Registro de Usuarios</p>
                  <p>Para acceder a ciertas funciones (como inscripciones a eventos o ministerios), es posible que deba registrarse. Usted es responsable de mantener la confidencialidad de su cuenta.</p>

                  <p className="font-bold text-brand-obsidian dark:text-white">4. Contenido de Usuario</p>
                  <p>Al publicar peticiones de oración o testimonios, usted otorga a {churchName} el derecho no exclusivo de compartir dicho contenido dentro de los canales apropiados de la congregación.</p>

                  <p className="font-bold text-brand-obsidian dark:text-white">5. Modificaciones</p>
                  <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado de la app tras dichos cambios constituye su aceptación.</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-brand-obsidian dark:text-white">1. Recolección de Datos</p>
                  <p>En {churchName}, valoramos su privacidad. Recopilamos información personal básica (nombre, email, teléfono) únicamente cuando usted la proporciona voluntariamente para participar en ministerios, eventos o boletines.</p>

                  <p className="font-bold text-brand-obsidian dark:text-white">2. Uso de la Información</p>
                  <p>Sus datos se utilizan exclusivamente para propósitos eclesiásticos: coordinación de servidores, envío de devocionales, notificaciones de eventos y atención pastoral personalizada.</p>

                  <p className="font-bold text-brand-obsidian dark:text-white">3. No Divulgación a Terceros</p>
                  <p>Bajo ninguna circunstancia venderemos o compartiremos su información personal con empresas comerciales o terceros ajenos a la administración de nuestra iglesia.</p>

                  <p className="font-bold text-brand-obsidian dark:text-white">4. Seguridad</p>
                  <p>Implementamos medidas de seguridad técnicas (como encriptación SSL) para proteger sus datos contra el acceso no autorizado o la pérdida de información.</p>

                  <p className="font-bold text-brand-obsidian dark:text-white">5. Sus Derechos</p>
                  <p>Usted tiene derecho a acceder, corregir o solicitar la eliminación de sus datos personales de nuestros registros en cualquier momento a través de la configuración de perfil o contactando a administración.</p>
                </>
              )}
              <div className="pt-8 text-[10px] uppercase font-black tracking-widest opacity-30 text-center">
                Última actualización: Marzo 2026
              </div>
            </div>

            <div className="p-8 bg-gray-50 dark:bg-black/20 flex justify-end">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-8 py-3 bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
              >
                He leído y entiendo
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DETALLE (Portal) */}
      {selectedLeader && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-brand-silk dark:bg-brand-surface w-full md:max-w-4xl max-h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-in slide-in-from-bottom-10 duration-500" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button onClick={() => setSelectedLeader(null)} className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/20 dark:bg-white/10 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
              <span className="material-symbols-outlined font-bold">close</span>
            </button>

            {/* Left: Image Hero */}
            <div className={`w-full md:w-1/2 h-[40vh] md:h-auto relative bg-gradient-to-br ${selectedLeader.color} flex items-end justify-center overflow-hidden shrink-0`}>
              <img src={selectedLeader.img} alt={selectedLeader.name} className="h-[105%] w-auto object-contain translate-y-4" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col bg-brand-silk dark:bg-brand-surface overflow-y-auto">
              <div>
                <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">{selectedLeader.roleSubtitle}</span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight mb-4">{selectedLeader.name}</h2>
                <div className="w-16 h-1 bg-brand-primary rounded-full mb-6"></div>
              </div>

              <div className="space-y-6">
                <p className="text-base md:text-lg text-brand-obsidian/70 dark:text-white/70 font-light leading-relaxed">"{selectedLeader.bio}"</p>
                <div className="flex gap-4 pt-4 mt-auto">
                  <button className="flex-1 py-3 border border-brand-obsidian/10 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-primary hover:border-brand-primary hover:text-brand-obsidian transition-colors group">
                    <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">mail</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Contacto</span>
                  </button>
                  <button className="flex-1 py-3 border border-brand-obsidian/10 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-primary hover:border-brand-primary hover:text-brand-obsidian transition-colors group">
                    <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">share</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Compartir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AboutUs;
