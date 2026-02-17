
import React from 'react';

interface LoadingScreenProps {
  theme: 'light' | 'dark';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ theme }) => {
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-brand-silk dark:bg-brand-obsidian transition-colors duration-700 overflow-hidden">

      {/* Dynamic Background Ambiance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-primary/5 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-accent/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative flex flex-col items-center gap-12 animate-reveal">

        {/* Premium Geometric Loader */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Outer rings */}
          <div className="absolute inset-0 border-[1px] border-brand-primary/10 rounded-full" />
          <div className="absolute inset-2 border-[1px] border-brand-primary/20 rounded-full animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-4 border-t-2 border-brand-primary rounded-full animate-[spin_2s_cubic-bezier(0.5,0,0.5,1)_infinite]" />

          {/* Center Logo/Icon Container */}
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-3xl shadow-2xl shadow-brand-primary/20 flex items-center justify-center transform rotate-12 animate-pulse">
            <span className="material-symbols-outlined text-3xl text-brand-obsidian font-light">church</span>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter mb-2">
            Monte de <span className="text-brand-primary">Sión</span>
          </h1>

          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1 h-1 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="text-[10px] font-black text-brand-obsidian/40 dark:text-brand-primary/40 uppercase tracking-[0.5em] pl-2">
              Iniciando Experiencia
            </p>
          </div>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 animate-fade-in opacity-20">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] dark:text-white">Iglesia Digital</p>
      </div>

    </div>
  );
};

export default LoadingScreen;
