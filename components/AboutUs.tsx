
import React, { useEffect, useState, useRef } from 'react';
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

  const activeLogo = theme === 'dark' ? LOGO_DARK_THEME : LOGO_LIGHT_THEME;

  // Case-sensitive paths based on previous list_dir
  const leaders: Leader[] = [
    {
      id: 'pastores',
      name: 'Prs. Juan y Elena',
      roleTitle: 'PASTORES',
      roleSubtitle: 'Pastores Principales',
      img: '/images/Pastores.png',
      bio: 'Fundadores de nuestra casa, con un corazón apasionado por restaurar vidas y levantar una generación que adore a Dios en espíritu y verdad. Llevan más de 20 años sirviendo al Señor y guiando a la congregación con amor y sabiduría.',
      color: 'from-blue-600/20 to-purple-600/20'
    },
    {
      id: 'marcela',
      name: 'Pra. Marcela',
      roleTitle: 'PASTORA',
      roleSubtitle: 'Liderazgo Pastoral',
      img: '/images/Pastora-Marcela.png',
      bio: 'Una mujer de fe inquebrantable, dedicada a la enseñanza y al cuidado pastoral de la congregación. Su ministerio se enfoca en la sanidad interior y el fortalecimiento de la mujer virtuosa.',
      color: 'from-rose-500/20 to-pink-500/20'
    },
    {
      id: 'alabanza',
      name: 'Mayra & Rodolfo',
      roleTitle: 'ADORACIÓN',
      roleSubtitle: 'Líderes de Alabanza',
      img: '/images/Alabanza.png',
      bio: 'Guiando al pueblo a la presencia de Dios a través de una adoración genuina y profética. Creen en el poder de la música para romper cadenas y transformar atmósferas.',
      color: 'from-amber-500/20 to-orange-500/20'
    },
    {
      id: 'multimedia',
      name: 'Cristian Bordón',
      roleTitle: 'MEDIA',
      roleSubtitle: 'Director Multimedia',
      img: '/images/Multimedia.png',
      bio: 'Llevando el mensaje del Evangelio más allá de las cuatro paredes a través de la excelencia técnica y visual. Innovación y creatividad al servicio del Reino.',
      color: 'from-cyan-500/20 to-blue-500/20'
    },
    {
      id: 'jovenes',
      name: 'Hch 29',
      roleTitle: 'JÓVENES',
      roleSubtitle: 'Liderazgo Juvenil',
      img: '/images/Jovenes.png',
      bio: 'Inspirando a la próxima generación a vivir con propósito y pasión por Jesús. Una comunidad vibrante que busca marcar la diferencia en su entorno.',
      color: 'from-violet-500/20 to-fuchsia-500/20'
    },
    {
      id: 'danza',
      name: 'Mayra Guevara',
      roleTitle: 'DANZA',
      roleSubtitle: 'Artes Creativas',
      img: '/images/Danza.png',
      bio: 'Expresando la libertad y el gozo del Reino a través del movimiento y las artes. Entrenando adoradores que danzan con entendimiento y poder.',
      color: 'from-pink-500/20 to-rose-500/20'
    },
    {
      id: 'evangelizacion',
      name: 'Marcelo Flores',
      roleTitle: 'MISIONES',
      roleSubtitle: 'Evangelización',
      img: '/images/Evangelizacion.png',
      bio: 'Comprometido con la Gran Comisión, llevando luz y esperanza a cada rincón de nuestra ciudad. Pasión por las almas y el servicio comunitario.',
      color: 'from-emerald-500/20 to-green-500/20'
    }
  ];

  useEffect(() => {
    const handleScroll = () => requestAnimationFrame(() => setScrollY(window.scrollY));
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle intersection observer for carousel snapping active state
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      const center = container.scrollLeft + container.clientWidth / 2;
      const children = Array.from(container.children) as HTMLElement[];

      let closest = 0;
      let minDiff = Infinity;

      children.forEach((child, index) => {
        // Skip spacer divs
        if (!child.classList.contains('snap-center')) return;

        const childCenter = child.offsetLeft + child.clientWidth / 2;
        const diff = Math.abs(childCenter - center);
        if (diff < minDiff) {
          minDiff = diff;
          closest = index;
        }
      });
      setActiveLeaderIndex(closest);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-brand-silk dark:bg-brand-obsidian font-sans selection:bg-brand-primary selection:text-brand-obsidian overflow-x-hidden">

      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div
          className="absolute inset-0 z-0 bg-brand-obsidian"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <img
            src={LOGO_BG_URL}
            className="w-full h-full object-cover opacity-30 mix-blend-overlay grayscale contrast-125 scale-110"
            alt="Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-silk dark:from-brand-obsidian via-transparent to-black/80"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
          <div
            className="w-24 h-24 md:w-32 md:h-32 mb-12 animate-in fade-in zoom-in duration-1000 delay-300 opacity-0 fill-mode-forwards"
          >
            <img src={activeLogo} alt="Logo" className="w-full h-full drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]" />
          </div>

          <h1 className="text-[12vw] md:text-[8vw] leading-[0.8] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-brand-primary to-brand-obsidian/20 dark:to-white/10 mb-8 animate-in slide-in-from-bottom duration-1000 fill-mode-forwards opacity-0">
            NOSOTROS
          </h1>

          <p className="text-xl md:text-3xl font-serif text-brand-obsidian/80 dark:text-white/80 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 opacity-0 fill-mode-forwards italic">
            "Más que una congregación, somos una familia unida por el propósito eterno de Dios."
          </p>

          <div className="mt-16 animate-bounce delay-1000 duration-[2000ms]">
            <span className="material-symbols-outlined text-4xl text-brand-primary/50">keyboard_arrow_down</span>
          </div>
        </div>
      </section>

      {/* 2. HISTORY & IDENTITY (Scroll Reveal) */}
      <section className="py-32 px-6 relative z-10 bg-brand-silk dark:bg-brand-obsidian rounded-t-[4rem] -mt-20 border-t border-white/10 shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          <div className={`transition-all duration-1000 transform ${scrollY > 300 ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
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

          <div className={`grid gap-6 transition-all duration-1000 delay-300 transform ${scrollY > 300 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="bg-white dark:bg-white/5 p-10 rounded-[3rem] border border-brand-obsidian/5 dark:border-white/5 shadow-2xl hover:scale-[1.02] transition-transform duration-500">
              <span className="material-symbols-outlined text-5xl text-brand-primary mb-6">diversity_3</span>
              <h3 className="text-2xl font-bold text-brand-obsidian dark:text-white mb-2">Comunidad</h3>
              <p className="text-brand-obsidian/60 dark:text-white/60">Fomentamos relaciones genuinas y duraderas.</p>
            </div>
            <div className="bg-brand-obsidian dark:bg-brand-primary p-10 rounded-[3rem] shadow-2xl hover:scale-[1.02] transition-transform duration-500 translate-x-8">
              <span className="material-symbols-outlined text-5xl text-white dark:text-brand-obsidian mb-6">volunteer_activism</span>
              <h3 className="text-2xl font-bold text-white dark:text-brand-obsidian mb-2">Servicio</h3>
              <p className="text-white/60 dark:text-brand-obsidian/60">Amar es servir. Servimos a nuestra ciudad con pasión.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ULTRA PROFESIONAL LEADERSHIP CAROUSEL */}
      <section className="py-40 bg-brand-obsidian relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-90 z-0"></div>

        <div className="container mx-auto px-6 mb-20 relative z-10 text-center">
          <h2 className="text-brand-primary text-[10px] md:text-sm font-black uppercase tracking-[0.6em] mb-4 animate-pulse">Liderazgo</h2>
          <h3 className="text-5xl md:text-8xl font-serif font-bold text-white tracking-tighter">Nuestro <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-amber-200">Equipo</span></h3>
        </div>

        {/* Horizontal Scroll Container */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto gap-8 px-6 pb-24 snap-x snap-mandatory no-scrollbar h-[700px] md:h-[800px] items-center"
        >
          <div className="w-[10vw] shrink-0"></div> {/* Left spacer */}

          {leaders.map((leader, i) => (
            <div
              key={leader.id}
              onClick={() => setSelectedLeader(leader)}
              className={`snap-center shrink-0 w-[85vw] md:w-[500px] h-[600px] md:h-[700px] relative group cursor-pointer transition-all duration-500 ${activeLeaderIndex === i ? 'scale-100 opacity-100' : 'scale-90 opacity-40 blur-[2px]'}`}
            >
              {/* CARD CONTAINER */}
              <div className="w-full h-full relative overflow-visible flex flex-col items-center justify-end pb-12">

                {/* 1. LAYER: BACK TITLE (Huge) */}
                <h4 className="absolute top-10 left-1/2 -translate-x-1/2 text-[18vw] md:text-[150px] font-black text-white/[0.03] whitespace-nowrap tracking-tighter select-none pointer-events-none z-0 transition-transform duration-700 group-hover:scale-110">
                  {leader.roleTitle}
                </h4>

                {/* 2. LAYER: GLOW */}
                <div className={`absolute bottom-32 w-[300px] h-[300px] rounded-full blur-[100px] bg-gradient-to-t ${leader.color} opacity-20 group-hover:opacity-60 transition-all duration-700`}></div>

                {/* 3. LAYER: IMAGE (No Grayscale, High Quality) */}
                <img
                  src={leader.img}
                  alt={leader.name}
                  loading="eager"
                  className="relative z-10 h-[85%] w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:-translate-y-4 group-hover:scale-105 will-change-transform"
                />

                {/* 4. LAYER: FOREGROUND INFO */}
                <div className="relative z-20 text-center -mt-10 transition-transform duration-300 group-hover:translate-y-2">
                  <div className="inline-block px-4 py-1 mb-2 border border-brand-primary/30 rounded-full bg-brand-obsidian/50 backdrop-blur-md">
                    <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.2em]">{leader.roleSubtitle}</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight drop-shadow-2xl">
                    {leader.name}
                  </h3>
                  <div className="h-1 w-12 bg-brand-primary mx-auto mt-4 rounded-full group-hover:w-24 transition-all duration-500"></div>
                </div>

              </div>
            </div>
          ))}

          <div className="w-[10vw] shrink-0"></div> {/* Right spacer */}
        </div>
      </section>

      {/* 4. CALL TO ACTION - PARALLAX */}
      <section className="relative py-40 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-brand-primary z-0">
          <img src="https://images.unsplash.com/photo-1548120231-1d6f891ad49a?q=80&w=2000" className="w-full h-full object-cover opacity-20 mix-blend-multiply" alt="" />
        </div>
        <div className="relative z-10 text-center px-6">
          <h2 className="text-6xl md:text-9xl font-serif font-bold text-brand-obsidian mb-8 tracking-tighter">Únete a la <br />Familia</h2>
          <p className="text-xl md:text-2xl text-brand-obsidian/70 max-w-2xl mx-auto mb-12 font-medium">
            Hay un lugar reservado para ti en nuestra mesa. Ven tal como eres.
          </p>
          <button className="bg-brand-obsidian text-white px-12 py-5 rounded-full text-sm font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl border border-white/10">
            Planear mi Visita
          </button>
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="bg-brand-obsidian text-brand-silk/40 py-12 text-center text-xs uppercase tracking-widest border-t border-white/5">
        <p>Monte de Sión App • {new Date().getFullYear()}</p>
      </footer>

      {/* MODAL DETALLE */}
      {selectedLeader && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="bg-brand-silk dark:bg-brand-surface w-full md:max-w-4xl h-[85vh] md:h-auto rounded-t-[3rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-in slide-in-from-bottom md:zoom-in-95 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedLeader(null)}
              className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Left: Image Hero */}
            <div className={`w-full md:w-1/2 h-1/2 md:h-auto relative bg-gradient-to-br ${selectedLeader.color} flex items-end justify-center overflow-hidden`}>
              <img
                src={selectedLeader.img}
                alt={selectedLeader.name}
                className="h-[110%] w-auto object-contain translate-y-10"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-silk dark:from-brand-surface via-transparent to-transparent opacity-90 md:opacity-40"></div>
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-brand-silk dark:bg-brand-surface">
              <div className="mb-8">
                <span className="text-brand-primary text-xs font-black uppercase tracking-[0.4em] mb-2 block">{selectedLeader.roleSubtitle}</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight mb-6">
                  {selectedLeader.name}
                </h2>
                <div className="w-20 h-1 bg-brand-primary rounded-full"></div>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[30vh] md:max-h-none pr-4">
                <p className="text-lg text-brand-obsidian/70 dark:text-white/70 font-light leading-relaxed">
                  "{selectedLeader.bio}"
                </p>
                <div className="flex gap-4 pt-4">
                  <button className="flex-1 py-4 border border-brand-obsidian/10 dark:border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-primary hover:border-brand-primary hover:text-brand-obsidian transition-colors group">
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">mail</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Contacto</span>
                  </button>
                  <button className="flex-1 py-4 border border-brand-obsidian/10 dark:border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-primary hover:border-brand-primary hover:text-brand-obsidian transition-colors group">
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">share</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Compartir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutUs;
