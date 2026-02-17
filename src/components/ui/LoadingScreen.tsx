
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[4000] flex flex-col items-center justify-center bg-[#05050A] overflow-hidden">

      {/* 1. LAYER: MOVIDO AMBIENTAL (MESH GRADIENT & MIST) */}
      <div className="absolute inset-0 z-0">
        {/* Deep blue depth gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0A0A1A_0%,#05050A_100%)]" />

        {/* Animated Mist Chunks */}
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20 animate-mist-drift blur-[100px]">
          <div className="absolute top-[20%] left-[30%] w-96 h-96 bg-brand-primary/10 rounded-full" />
          <div className="absolute bottom-[30%] right-[20%] w-[500px] h-[500px] bg-brand-accent/10 rounded-full" />
        </div>

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 shadow-[inner_0_0_150px_rgba(0,0,0,0.9)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* 2. LAYER: CENTRAL ASSET (LOGO CINEMÁTICO) */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Brand Icon with Halo */}
        <div className="relative w-40 h-40 mb-10 flex items-center justify-center group">
          {/* Outer Light Halo */}
          <div className="absolute inset-[-20%] bg-brand-primary/10 blur-[60px] rounded-full animate-pulse-glow" />

          {/* Logo oficial con efecto metálico */}
          <div className="relative w-32 h-32 overflow-hidden animate-reveal">
            <img
              src="/images/logo-dorado.png"
              alt="Logo Monte de Sión"
              className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(212,175,55,0.4)] brightness-110"
            />

            {/* Metal Shine Sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent animate-shine-metallic pointer-events-none" />
          </div>
        </div>

        {/* 3. LAYER: TYPOGRAPHY (MONTE DE SIÓN) */}
        <div className="text-center space-y-4 animate-reveal" style={{ animationDelay: '0.4s' }}>
          <h1 className="text-5xl md:text-7xl font-serif font-black text-white tracking-[-0.02em] leading-none mb-2">
            Monte de <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(255,183,0,0.3)]">Sión</span>
          </h1>

          <div className="flex items-center justify-center gap-6 opacity-40">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white" />
            <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white">
              App Profesional
            </p>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white" />
          </div>
        </div>

      </div>

      {/* 4. LAYER: LASER PROGRESS INDICATOR */}
      <div className="absolute bottom-12 left-0 w-full flex flex-col items-center gap-4 animate-reveal" style={{ animationDelay: '1s' }}>
        <div className="w-48 h-[1px] bg-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-transparent via-brand-primary to-transparent animate-laser-move" />
        </div>
        <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em]">
          Versión Profesional 2026
        </p>
      </div>

      <style>{`
        @keyframes laser-move {
            0% { transform: translateX(-200%); }
            100% { transform: translateX(200%); }
        }
        .animate-laser-move {
            animation: laser-move 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

    </div>
  );
};

export default LoadingScreen;
