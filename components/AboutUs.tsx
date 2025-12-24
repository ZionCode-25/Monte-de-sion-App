
import React, { useEffect, useState } from 'react';
import { LOGO_DARK_THEME, LOGO_LIGHT_THEME, LOGO_BG_URL } from '../constants';

interface AboutUsProps {
  theme: 'light' | 'dark';
}

interface Leader {
  name: string;
  role: string;
  img: string; // PNG without background
  bio: string;
  color: string; // For background accent
}

const AboutUs: React.FC<AboutUsProps> = ({ theme }) => {
  const [scrollY, setScrollY] = useState(0);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

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

  const leaders: Leader[] = [
    {
      name: 'Prs. Juan y Elena Montecinos',
      role: 'Pastores Principales',
      img: '/images/Pastores.png',
      bio: 'Fundadores de nuestra casa, con un corazón apasionado por restaurar vidas y levantar una generación que adore a Dios en espíritu y verdad.',
      color: 'bg-brand-primary'
    },
    {
      name: 'Pra. Marcela',
      role: 'Pastora',
      img: '/images/Pastora-Marcela.png',
      bio: 'Una mujer de fe inquebrantable, dedicada a la enseñanza y al cuidado pastoral de la congregación.',
      color: 'bg-rose-500'
    },
    {
      name: 'Mayra Guevara y Rodolfo Vega',
      role: 'Líderes de Alabanza',
      img: '/images/Alabanza.png',
      bio: 'Guiando al pueblo a la presencia de Dios a través de una adoración genuina y profética.',
      color: 'bg-amber-500'
    },
    {
      name: 'Cristian Bordón',
      role: 'Líder Multimedia',
      img: '/images/Multimedia.png',
      bio: 'Llevando el mensaje del Evangelio más allá de las cuatro paredes a través de la excelencia técnica y visual.',
      color: 'bg-cyan-500'
    },
    {
      name: 'Hch 29',
      role: 'Liderazgo Jóvenes',
      img: '/images/Jovenes.png',
      bio: 'Inspirando a la próxima generación a vivir con propósito y pasión por Jesús.',
      color: 'bg-purple-500'
    },
    {
      name: 'Mayra Guevara',
      role: 'Líder de Danza',
      img: '/images/Danza.png',
      bio: 'Expresando la libertad y el gozo del Reino a través del movimiento y las artes.',
      color: 'bg-pink-500'
    },
    {
      name: 'Marcelo Flores',
      role: 'Líder de Evangelización',
      img: '/images/Evangelizacion.png',
      bio: 'Comprometido con la Gran Comisión, llevando luz y esperanza a cada rincón de nuestra ciudad.',
      color: 'bg-emerald-500'
    }
  ];

  return (
    <div className="flex flex-col bg-brand-silk dark:bg-brand-obsidian transition-colors duration-700 font-sans">

      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src={LOGO_BG_URL}
            className="w-full h-full object-cover animate-slow-zoom brightness-[0.35] contrast-125 grayscale"
            alt="Fondo Sión"
          />
          <div className="absolute inset-0 bg-brand-obsidian/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-brand-obsidian/80 via-transparent to-brand-silk dark:to-brand-obsidian"></div>
        </div>

        <div className="relative z-10 text-center px-6 flex flex-col items-center max-w-5xl mx-auto">
          <div className="animate-reveal mb-10">
            <img src={activeLogo} alt="Logo" className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl brightness-110" />
          </div>
          <span className="text-brand-primary text-[10px] md:text-xs font-black uppercase tracking-[0.5em] mb-4 drop-shadow-lg opacity-80">
            Bienvenido a Casa
          </span>
          <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-6 leading-[0.9] tracking-tighter drop-shadow-2xl">
            Somos <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-white to-brand-primary italic pr-2">Familia</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed text-balance opacity-90">
            "Donde cada historia importa y cada corazón encuentra su propósito en Dios."
          </p>
        </div>
      </section>

      {/* 2. VISION & MISSION */}
      <section className="px-6 py-28 bg-brand-silk dark:bg-brand-obsidian relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-brand-primary font-black text-xs uppercase tracking-[0.4em]">Nuestra Identidad</h2>
            <h3 className="text-5xl md:text-6xl font-serif font-bold text-brand-obsidian dark:text-white leading-[0.95] tracking-tight">
              Corazón y <span className="italic text-brand-primary/80">Visión.</span>
            </h3>
            <p className="text-xl text-brand-obsidian/70 dark:text-white/70 font-light leading-relaxed">
              Creemos en una iglesia que no son solo cuatro paredes, sino un movimiento vivo de restauración y esperanza para nuestra ciudad.
            </p>
          </div>
          <div className="grid gap-6">
            <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-brand-obsidian/5 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all group">
              <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <h4 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-2">Visión</h4>
              <p className="text-brand-obsidian/60 dark:text-white/60">Transformar almas en faros de esperanza a través de la Gracia.</p>
            </div>
            <div className="bg-brand-obsidian dark:bg-brand-primary p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all group translate-x-4 md:translate-x-8">
              <div className="w-12 h-12 bg-white/20 dark:bg-brand-obsidian/20 rounded-xl flex items-center justify-center text-white dark:text-brand-obsidian mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">flag</span>
              </div>
              <h4 className="text-2xl font-serif font-bold text-white dark:text-brand-obsidian mb-2">Misión</h4>
              <p className="text-white/60 dark:text-brand-obsidian/60">Predicar, equipar y amar a nuestra ciudad radicalmente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEW LEADERSHIP CAROUSEL - SIN FONDO */}
      <section className="py-32 bg-brand-obsidian relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-6 mb-16 relative z-10">
          <h2 className="text-brand-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4">Nuestro Equipo</h2>
          <h3 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tighter">Liderazgo <span className="italic text-white/20">Sión</span></h3>
        </div>

        {/* Carousel Container */}
        <div className="flex overflow-x-auto gap-8 px-6 pb-20 snap-x mandatory no-scrollbar items-end h-[600px] md:h-[700px]">
          {leaders.map((leader, i) => (
            <div
              key={i}
              onClick={() => setSelectedLeader(leader)}
              className="snap-center min-w-[85vw] md:min-w-[400px] h-[550px] relative group cursor-pointer"
            >
              {/* Character Card */}
              <div className="absolute inset-x-4 bottom-0 h-[480px] bg-gradient-to-t from-white/10 to-transparent rounded-[3rem] border border-white/5 backdrop-blur-sm transition-all duration-500 group-hover:bg-white/15 overflow-visible">

                {/* Abstract Background Shape behind Leader */}
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[60px] opacity-20 transition-opacity duration-700 group-hover:opacity-40 ${leader.color}`}></div>

                {/* Leader Image (PNG - No Background) */}
                <img
                  src={leader.img}
                  alt={leader.name}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[115%] w-auto max-w-none object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[30%] group-hover:grayscale-0"
                />

                {/* Text Overlay (Title) */}
                <div className="absolute bottom-10 left-0 right-0 text-center z-20">
                  <div className="inline-block bg-brand-obsidian/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl transform translate-y-2 group-hover:-translate-y-2 transition-transform duration-500">
                    <span className="text-brand-primary text-[9px] font-black uppercase tracking-[0.3em] block mb-1">{leader.role}</span>
                    <h4 className="text-xl font-serif font-bold text-white tracking-tight">{leader.name}</h4>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Spacer for end of list */}
          <div className="min-w-[4rem]"></div>
        </div>
      </section>

      {/* 4. WEEKLY AGENDA */}
      <section className="px-6 py-28 bg-white dark:bg-brand-surface border-t border-brand-obsidian/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl font-serif font-bold text-brand-obsidian dark:text-white mb-16">Nuestras Reuniones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weeklyActivities.map((act, i) => (
              <div key={i} className="flex flex-col items-center text-center p-10 rounded-[3rem] bg-brand-silk dark:bg-brand-obsidian/30 border border-brand-obsidian/5 dark:border-white/5">
                <div className="w-16 h-16 bg-white dark:bg-brand-surface rounded-2xl shadow-lg flex items-center justify-center text-brand-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">{act.icon}</span>
                </div>
                <h4 className="text-lg font-bold text-brand-obsidian dark:text-white uppercase tracking-widest mb-2">{act.day}</h4>
                <p className="text-2xl font-serif text-brand-primary mb-2">{act.time}</p>
                <p className="text-sm text-brand-obsidian/60 dark:text-white/60">{act.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-brand-obsidian text-white py-20 px-6 text-center border-t border-white/10">
        <img src={LOGO_DARK_THEME} alt="Logo" className="w-20 h-20 mx-auto mb-8 opacity-50 grayscale hover:grayscale-0 transition-all" />
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-8">Monte de Sión © 2025</p>
        <div className="flex justify-center gap-6">
          {['facebook', 'instagram', 'youtube'].map(s => (
            <span key={s} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-brand-primary hover:border-brand-primary cursor-pointer transition-all">
              <span className="material-symbols-outlined text-lg">{s === 'instagram' ? 'photo_camera' : s === 'facebook' ? 'public' : 'smart_display'}</span>
            </span>
          ))}
        </div>
      </footer>

      {/* LEADER DETAIL MODAL */}
      {selectedLeader && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-obsidian/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-brand-surface rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedLeader(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-brand-obsidian dark:text-white hover:bg-red-500 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {/* Left: Image */}
            <div className={`w-full md:w-2/5 h-64 md:h-auto ${selectedLeader.color} relative overflow-visible flex items-end justify-center`}>
              <img
                src={selectedLeader.img}
                alt={selectedLeader.name}
                className="h-[120%] w-auto object-contain object-bottom drop-shadow-2xl relative z-10"
              />
            </div>

            {/* Right: Info */}
            <div className="flex-1 p-10 flex flex-col justify-center">
              <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] mb-3">{selectedLeader.role}</span>
              <h3 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white mb-6 leading-tight">{selectedLeader.name}</h3>
              <p className="text-brand-obsidian/70 dark:text-white/70 font-light leading-relaxed italic text-lg mb-8">
                "{selectedLeader.bio}"
              </p>

              <button className="self-start px-8 py-3 rounded-full border border-brand-obsidian/10 dark:border-white/10 text-brand-obsidian dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-brand-obsidian hover:border-brand-primary transition-all">
                Contactar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AboutUs;
