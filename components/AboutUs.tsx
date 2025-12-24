
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

  // Case-sensitive paths based on corrected info
  const leaders: Leader[] = [
    {
      id: 'pastores-rafael',
      name: 'Rafael y Karina',
      roleTitle: 'PASTORES',
      roleSubtitle: 'Pastores Principales',
      img: 'https://res.cloudinary.com/dkl5uieu5/image/upload/v1766546760/Pastores_onvvwp.png',
      bio: 'Fundadores de nuestra casa, con un corazón apasionado por restaurar vidas y levantar una generación que adore a Dios en espíritu y verdad.',
      color: 'from-blue-600/20 to-purple-600/20'
    },
    {
      id: 'pastores-jorge',
      name: 'Jorge y Yesica',
      roleTitle: 'PASTORES',
      roleSubtitle: 'Pastores',
      img: 'https://res.cloudinary.com/dkl5uieu5/image/upload/v1766546759/pastores-2_to7e7d.png',
      bio: 'Liderando con amor y sabiduría, comprometidos con el crecimiento espiritual de cada familia.',
      color: 'from-indigo-600/20 to-blue-500/20'
    },
    {
      id: 'marcela',
      name: 'Pra. Marcela',
      roleTitle: 'PASTORA',
      roleSubtitle: 'Pastora',
      img: 'https://res.cloudinary.com/dkl5uieu5/image/upload/v1766546760/Pastora-Marcela_lawty6.png',
      bio: 'Una mujer de fe inquebrantable, dedicada a la enseñanza y al cuidado pastoral de la congregación.',
      color: 'from-rose-500/20 to-pink-500/20'
    },
    {
      id: 'alabanza',
      name: 'Mayra y Rodolfo',
      roleTitle: 'ALABANZA',
      roleSubtitle: 'Líderes de Alabanza',
      img: 'https://res.cloudinary.com/dkl5uieu5/image/upload/v1766546759/Alabanza_th1c1n.png',
      bio: 'Guiando al pueblo a la presencia de Dios a través de una adoración genuina y profética.',
      color: 'from-amber-500/20 to-orange-500/20'
    },
    {
      id: 'multimedia',
      name: 'Cristian Bordón',
      roleTitle: 'MEDIA',
      roleSubtitle: 'Director Multimedia',
      img: 'https://res.cloudinary.com/dkl5uieu5/image/upload/v1766546763/Multimedia_u81qtz.png',
      bio: 'Llevando el mensaje del Evangelio más allá de las cuatro paredes a través de la excelencia técnica.',
      color: 'from-cyan-500/20 to-blue-500/20'
    },
    {
      id: 'jovenes',
      name: 'Samir Medawar',
      roleTitle: 'JÓVENES',
      roleSubtitle: 'Liderazgo Juvenil',
      img: 'https://res.cloudinary.com/dkl5uieu5/image/upload/v1766546759/Jovenes_jyzb0n.png',
      bio: 'Inspirando a la próxima generación a vivir con propósito y pasión por Jesús.',
      color: 'from-violet-500/20 to-fuchsia-500/20'
    },
    {
      id: 'danza',
      name: 'Mayra Guevara',
      roleTitle: 'DANZA',
      roleSubtitle: 'Líder de Danza',
      img: 'https://res.cloudinary.com/dkl5uieu5/image/upload/v1766546759/Danza_evlh1r.png',
      bio: 'Expresando la libertad y el gozo del Reino a través del movimiento y las artes.',
      color: 'from-pink-500/20 to-rose-500/20'
    },
    {
      id: 'evangelizacion',
      name: 'Marcelo Flores',
      roleTitle: 'MISIÓN',
      roleSubtitle: 'Evangelización',
      img: 'https://res.cloudinary.com/dkl5uieu5/image/upload/v1766546759/Evangelizacion_aj8ila.png',
      bio: 'Comprometido con la Gran Comisión, llevando luz y esperanza a cada rincón de nuestra ciudad.',
      color: 'from-emerald-500/20 to-green-500/20'
    }
  ];

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

  // ... (carousel logic) ...

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

          <h1 className="text-[15vw] md:text-[10vw] leading-[0.8] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 mb-8 animate-screen-in drop-shadow-2xl">
            MONTE <br /> <span className="text-brand-primary">DE SIÓN</span>
          </h1>

          <p className="text-xl md:text-3xl font-serif text-brand-obsidian/80 dark:text-white/80 max-w-2xl mx-auto leading-relaxed animate-reveal italic delay-200">
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
      <section className="py-40 bg-brand-obsidian relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-90 z-0"></div>

        <div className="container mx-auto px-6 mb-20 relative z-10 text-center">
          <h2 className="text-brand-primary text-[10px] md:text-sm font-black uppercase tracking-[0.6em] mb-4 animate-pulse">Liderazgo</h2>
          <h3 className="text-5xl md:text-8xl font-serif font-bold text-white tracking-tighter">Nuestro <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-amber-200">Equipo</span></h3>
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
              <div className="w-full h-full relative overflow-visible flex flex-col items-center justify-end pb-12">

                {/* 1. LAYER: BACK TITLE (Huge - Reduced size to prevent overlap) */}
                <h4 className={`absolute top-10 left-1/2 -translate-x-1/2 text-[15vw] md:text-[140px] font-black text-white/[0.03] whitespace-nowrap tracking-tighter select-none pointer-events-none z-0 transition-transform duration-700 ${activeLeaderIndex === i ? 'scale-110' : 'scale-100'}`}>
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
                    ${activeLeaderIndex === i ? 'brightness-110 contrast-105 scale-105' : 'brightness-75 contrast-90 scale-100'}`}
                />

                {/* 4. LAYER: FOREGROUND INFO */}
                <div className={`relative z-20 text-center -mt-20 transition-all duration-500 ${activeLeaderIndex === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <div className="inline-block px-4 py-1 mb-3 border border-brand-primary/30 rounded-full bg-brand-obsidian/60 backdrop-blur-md">
                    <span className="text-brand-primary text-xs font-black uppercase tracking-[0.2em]">{leader.roleSubtitle}</span>
                  </div>
                  <h3 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight drop-shadow-2xl">
                    {leader.name}
                  </h3>
                  <div className="h-1.5 w-16 bg-brand-primary mx-auto mt-6 rounded-full shadow-[0_0_20px_rgba(255,183,0,0.5)]"></div>
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
                Calle Falsa 123, <br />
                Barrio Monte de Sión, <br />
                Ciudad de Bendición.
              </p>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined">map</span>
                Ver en Mapa
              </a>
            </div>
          </div>

          {/* Right: Compact Schedule */}
          <div className="lg:w-2/3 bg-white dark:bg-brand-obsidian rounded-[3rem] p-8 md:p-12 shadow-xl border border-brand-obsidian/5 dark:border-white/5">
            <h3 className="text-2xl font-bold text-brand-obsidian dark:text-white mb-8 border-b border-brand-obsidian/10 dark:border-white/10 pb-4">Actividades Semanales</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
              {[
                { d: 'Lunes', t: '20:00', a: 'Oración en Casas' },
                { d: 'Martes', t: '21:00', a: 'Discipulado Online' },
                { d: 'Miércoles', t: '19:30', a: 'Culto de Oración' },
                { d: 'Jueves', t: '20:00', a: 'Ensayo Alabanza' },
                { d: 'Viernes', t: '22:00', a: 'Vigilia (Mensual)' },
                { d: 'Sábado', t: '18:00', a: 'Reunión de Jóvenes' },
                { d: 'Domingo', t: '10:00 | 18:00', a: 'Escuela & Culto Central', highlight: true },
              ].map((item, i) => (
                <div key={i} className={`flex flex-col ${item.highlight ? 'md:col-span-2 lg:col-span-1 bg-brand-primary/10 -m-2 p-2 rounded-xl' : ''}`}>
                  <span className="text-xs font-bold text-brand-obsidian/40 dark:text-white/40 uppercase tracking-wider">{item.d}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`font-bold ${item.highlight ? 'text-brand-primary text-xl' : 'text-brand-obsidian dark:text-white text-lg'}`}>{item.t}</span>
                  </div>
                  <span className="text-sm text-brand-obsidian/80 dark:text-white/80 font-medium">{item.a}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER & LEGAL */}
      <footer className="bg-brand-obsidian pt-24 pb-12 px-6 border-t border-white/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">

          {/* Logo & Socials */}
          <img src={activeLogo} alt="Logo" className="w-24 h-24 mb-8 opacity-80" />
          <div className="flex gap-6 mb-12">
            {['facebook', 'instagram', 'youtube', 'tiktok'].map(s => (
              <a key={s} href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-brand-primary hover:bg-white/10 hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">{s === 'instagram' ? 'photo_camera' : s === 'facebook' ? 'public' : s === 'tiktok' ? 'music_note' : 'smart_display'}</span>
              </a>
            ))}
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 text-xs font-bold uppercase tracking-widest text-white/40 mb-12">
            <a href="#" className="hover:text-white transition-colors">Inicio</a>
            <a href="#" className="hover:text-white transition-colors">Ministerios</a>
            <a href="#" className="hover:text-white transition-colors">Donaciones</a>
            <a href="#" className="hover:text-white transition-colors">Contacto</a>
          </div>

          <div className="w-full h-px bg-white/10 mb-8"></div>

          {/* Legal */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center w-full text-[10px] text-white/30 uppercase tracking-wider">
            <p>© {new Date().getFullYear()} Monte de Sión. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
              <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL DETALLE */}
      {selectedLeader && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-brand-silk dark:bg-brand-surface w-full md:max-w-4xl h-[85vh] md:h-auto rounded-t-[3rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-in slide-in-from-bottom md:zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button onClick={() => setSelectedLeader(null)} className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Left: Image Hero */}
            <div className={`w-full md:w-1/2 h-1/2 md:h-auto relative bg-gradient-to-br ${selectedLeader.color} flex items-end justify-center overflow-hidden`}>
              <img src={selectedLeader.img} alt={selectedLeader.name} className="h-[110%] w-auto object-contain translate-y-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-silk dark:from-brand-surface via-transparent to-transparent opacity-90 md:opacity-40"></div>
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-brand-silk dark:bg-brand-surface">
              <div className="mb-8">
                <span className="text-brand-primary text-xs font-black uppercase tracking-[0.4em] mb-2 block">{selectedLeader.roleSubtitle}</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight mb-6">{selectedLeader.name}</h2>
                <div className="w-20 h-1 bg-brand-primary rounded-full"></div>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[30vh] md:max-h-none pr-4">
                <p className="text-lg text-brand-obsidian/70 dark:text-white/70 font-light leading-relaxed">"{selectedLeader.bio}"</p>
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
