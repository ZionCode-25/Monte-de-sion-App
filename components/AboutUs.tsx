
import React, { useEffect, useState, useRef } from 'react';
// Fix: Import theme-specific logos instead of non-existent LOGO_URL
import { LOGO_DARK_THEME, LOGO_LIGHT_THEME, LOGO_BG_URL } from '../constants';
import { Icons } from '../icons';

interface AboutUsProps {
  theme: 'light' | 'dark';
}

// Fix: Update component signature to accept theme prop
const AboutUs: React.FC<AboutUsProps> = ({ theme }) => {
  const [scrollY, setScrollY] = useState(0);

  // Fix: Select active logo based on current theme
  const activeLogo = theme === 'dark' ? LOGO_DARK_THEME : LOGO_LIGHT_THEME;

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const weeklyActivities = [
    { day: 'Domingo', event: 'Servicio Principal', time: '10:00 AM', icon: 'church' },
    { day: 'Miércoles', event: 'Noche de Oración', time: '07:30 PM', icon: 'auto_awesome' },
    { day: 'Sábado', event: 'Jóvenes Sión', time: '06:00 PM', icon: 'diversity_1' },
  ];

  const pastors = [
    { name: 'Pr. Juan Montecinos', role: 'Pastor General', img: 'https://images.unsplash.com/photo-1548120231-1d6f891ad49a?q=80&w=2000&auto=format&fit=crop', bio: 'Liderando con visión y amor por más de 15 años en el servicio del Reino.' },
    { name: 'Pra. Elena Montecinos', role: 'Co-Pastora', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2000&auto=format&fit=crop', bio: 'Dedicada al ministerio de la familia y restauración emocional de la mujer.' },
    { name: 'Pr. Lucas Varela', role: 'Líder de Misiones', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2000&auto=format&fit=crop', bio: 'Coordinador global de alcance comunitario y expansión de evangelismo.' }
  ];

  return (
    <div className="flex flex-col bg-brand-silk dark:bg-brand-obsidian transition-colors duration-700">
      
      {/* 1. HERO SECTION - ULTRA PREMIUM CONTRAST */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={LOGO_BG_URL} 
            className="w-full h-full object-cover animate-slow-zoom brightness-[0.4] contrast-125"
            alt="Fondo Sión"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-obsidian/60 via-transparent to-brand-obsidian"></div>
        </div>

        <div className="relative z-10 text-center px-8 flex flex-col items-center max-w-4xl mx-auto">
          <div className="animate-reveal mb-8">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-brand-primary/40 rounded-full animate-pulse-glow"></div>
              {/* Fix: Use activeLogo instead of LOGO_URL */}
              <img src={activeLogo} alt="Logo" className="relative w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl dark:brightness-125" />
            </div>
          </div>
          <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.6em] mb-6 drop-shadow-lg">Establecidos en la Verdad</span>
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-6 leading-[0.9] tracking-tighter drop-shadow-2xl">
            Nuestra <br/> <span className="gold-text-gradient italic">Esencia</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light max-w-xl mx-auto leading-relaxed italic text-balance">
            "Un refugio sagrado para corazones que buscan la luz en medio del ruido."
          </p>
        </div>
      </section>

      {/* 2. VISION & MISSION - HIGH READABILITY */}
      <section className="px-6 py-32 flex flex-col gap-12 bg-white dark:bg-brand-obsidian">
        <div className="flex flex-col gap-4 text-center mb-10">
          <h2 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Identidad</h2>
          <h3 className="text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter">Corazón y <span className="italic">Visión.</span></h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
          <div className="group rounded-mega bg-brand-silk dark:bg-brand-surface p-12 border border-brand-obsidian/5 dark:border-white/5 shadow-xl transition-all hover:scale-[1.02]">
            <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-8 border border-brand-primary/20">
              <span className="material-symbols-outlined text-3xl fill-1">visibility</span>
            </div>
            <h4 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white mb-4 italic tracking-tight underline decoration-brand-primary/30 underline-offset-8">La Visión</h4>
            <p className="text-xl font-light leading-relaxed text-brand-obsidian/80 dark:text-brand-silk/90 italic">
              "Transformar cada alma en un faro de esperanza, restaurando la dignidad humana a través de la Gracia."
            </p>
          </div>

          <div className="group rounded-mega bg-brand-obsidian dark:bg-brand-primary p-12 border border-white/5 dark:border-brand-primary shadow-2xl transition-all hover:scale-[1.02]">
            <div className="w-14 h-14 bg-brand-primary dark:bg-brand-obsidian rounded-2xl flex items-center justify-center text-brand-primary mb-8 shadow-lg">
              <span className="material-symbols-outlined text-3xl fill-1">flag</span>
            </div>
            <h4 className="text-3xl font-serif font-bold text-white dark:text-brand-obsidian mb-4 italic tracking-tight">Nuestra Misión</h4>
            <p className="text-xl font-light leading-relaxed text-white/90 dark:text-brand-obsidian/90 italic">
              "Predicar con integridad, equipar siervos con excelencia y amar a nuestra ciudad de forma radical."
            </p>
          </div>
        </div>
      </section>

      {/* 3. PASTORAL LEADERSHIP - PREMIUM SLIDER */}
      <section className="py-32 bg-brand-obsidian dark:bg-brand-carbon">
        <div className="px-10 mb-20 text-center md:text-left md:flex md:items-end md:justify-between max-w-6xl mx-auto">
          <div>
            <h2 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] mb-4">Liderazgo</h2>
            <h3 className="text-6xl font-serif font-bold text-white tracking-tighter leading-tight">Pastores & <br/><span className="gold-text-gradient italic">Guías.</span></h3>
          </div>
          <p className="hidden md:block text-white/50 max-w-xs text-sm font-light italic leading-relaxed">Un equipo dedicado a caminar junto a ti en cada etapa de tu crecimiento espiritual.</p>
        </div>

        <div className="flex gap-8 overflow-x-auto px-10 pb-16 snap-x no-scrollbar">
          {pastors.map((pastor, i) => (
            <div key={i} className="min-w-[85vw] md:min-w-[380px] snap-center">
              <div className="relative h-[600px] rounded-[3.5rem] overflow-hidden group shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5">
                <img 
                  src={pastor.img} 
                  alt={pastor.name} 
                  className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-[1.5s] group-hover:grayscale-0 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-obsidian via-brand-obsidian/10 to-transparent"></div>
                
                <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
                  <div className="glass-premium p-8 rounded-[2.5rem] border border-white/10 translate-y-6 group-hover:translate-y-0 transition-all duration-700">
                    <span className="text-brand-primary font-black text-[9px] uppercase tracking-[0.4em] mb-2 block">{pastor.role}</span>
                    <h4 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-3 tracking-tight">{pastor.name}</h4>
                    <p className="text-brand-obsidian/70 dark:text-white/60 text-xs font-light leading-relaxed line-clamp-3 mb-6 italic">"{pastor.bio}"</p>
                    <button className="flex items-center gap-3 text-brand-primary text-[10px] font-black uppercase tracking-widest group/btn">
                      Ver trayectoria
                      <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:translate-x-2">trending_flat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WEEKLY CALENDAR - HIGH CONTRAST BENTO */}
      <section className="px-8 py-32 bg-white dark:bg-brand-obsidian">
        <div className="text-center mb-20">
          <h2 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4">La Vida en Sión</h2>
          <h3 className="text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter">Agenda de <span className="italic">Casa.</span></h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {weeklyActivities.map((act, i) => (
            <div key={i} className="group relative p-10 bg-brand-silk dark:bg-brand-surface rounded-[3rem] border border-brand-obsidian/[0.05] dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col gap-8">
                <div className="w-16 h-16 rounded-2xl bg-brand-obsidian dark:bg-brand-primary flex items-center justify-center text-brand-primary dark:text-brand-obsidian shadow-xl group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl font-bold">{act.icon}</span>
                </div>
                <div>
                  <p className="text-brand-primary font-black text-[10px] uppercase tracking-[0.4em] mb-2">{act.day}</p>
                  <h4 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white leading-tight mb-4">{act.event}</h4>
                  <div className="flex items-center gap-3 text-brand-obsidian/60 dark:text-white/40">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="text-xs font-black uppercase tracking-widest">{act.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LOCATION & CONNECT - DARK SECTION */}
      <section className="px-6 pb-40">
        <div className="bg-brand-obsidian rounded-ultra p-12 md:p-24 relative overflow-hidden shadow-2xl border border-white/10 max-w-7xl mx-auto">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px]"></div>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-10 tracking-tighter leading-none">
                Te esperamos <br/> <span className="gold-text-gradient italic">en Casa.</span>
              </h2>
              
              <div className="space-y-12 inline-block lg:block">
                <div className="flex items-start gap-8 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary shrink-0 shadow-lg">
                    <span className="material-symbols-outlined text-3xl fill-1">location_on</span>
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-xl leading-none mb-3">Sede Principal</h5>
                    <p className="text-white/60 text-base font-light leading-relaxed">Av. Santuario de Sión 1234, <br/>Distrito de la Fe.</p>
                    <button className="mt-6 text-brand-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group">
                      <span className="border-b border-brand-primary/40 pb-1">Ver en Google Maps</span>
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-2 transition-transform">open_in_new</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-8 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary shrink-0 shadow-lg">
                    <span className="material-symbols-outlined text-3xl fill-1">hub</span>
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-xl leading-none mb-4">Comunidad Global</h5>
                    <div className="flex gap-5">
                       {['instagram', 'facebook', 'youtube'].map((social) => (
                         <button key={social} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-brand-primary hover:bg-white/10 transition-all active:scale-90">
                            <span className="material-symbols-outlined text-2xl">{social === 'instagram' ? 'photo_camera' : social === 'facebook' ? 'share' : 'play_circle'}</span>
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative aspect-square rounded-[4rem] overflow-hidden border border-white/10 bg-slate-900 group shadow-3xl">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center brightness-50 opacity-40 group-hover:opacity-60 transition-all duration-1000 scale-110 group-hover:scale-100"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-brand-obsidian via-transparent to-transparent"></div>
               
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute inset-0 w-24 h-24 bg-brand-primary rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-12 h-12 bg-brand-primary rounded-full border-[6px] border-brand-obsidian shadow-2xl flex items-center justify-center">
                       {/* Fix: Use activeLogo instead of non-existent LOGO_URL */}
                       <img src={activeLogo} className="w-6 h-6 invert brightness-0" alt="" />
                    </div>
                  </div>
               </div>

               <div className="absolute bottom-10 left-10 right-10 glass-premium p-8 rounded-[2.5rem] border border-white/10 translate-y-4 group-hover:translate-y-0 transition-all">
                  <p className="text-brand-obsidian dark:text-white font-bold text-sm mb-1 tracking-tight">Estamos aquí para ti</p>
                  <p className="text-brand-obsidian/60 dark:text-white/50 text-[10px] uppercase font-black tracking-widest">Santuario Sión • Sede Central</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER MINI - IMPROVED CONTRAST */}
      <footer className="py-24 flex flex-col items-center justify-center text-center px-10 border-t border-brand-obsidian/[0.08] dark:border-white/[0.08] bg-brand-silk dark:bg-brand-obsidian">
        {/* Fix: Use activeLogo instead of non-existent LOGO_URL */}
        <img src={activeLogo} alt="Logo" className="w-20 h-20 opacity-60 mb-10 dark:brightness-125 dark:invert-0" />
        <p className="text-[10px] font-bold text-brand-obsidian/60 dark:text-white/60 uppercase tracking-[0.5em] leading-relaxed max-w-sm">
          Monte de Sión © 2025 • Santuario Digital <br className="md:hidden"/> <span className="mx-2 hidden md:inline">•</span> Paz sea contigo
        </p>
        <div className="mt-8 flex gap-4 text-brand-primary/40 text-[8px] font-black uppercase tracking-widest">
           <span>Términos</span>
           <span>Privacidad</span>
           <span>Ayuda</span>
        </div>
      </footer>

    </div>
  );
};

export default AboutUs;
