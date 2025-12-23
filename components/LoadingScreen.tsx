
import React from 'react';
import { LOGO_DARK_THEME, LOGO_LIGHT_THEME } from '../constants';

interface LoadingScreenProps {
  theme: 'light' | 'dark';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ theme }) => {
  const activeLogo = theme === 'dark' ? LOGO_DARK_THEME : LOGO_LIGHT_THEME;
  
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-brand-silk dark:bg-brand-obsidian transition-colors duration-700">
      <div className="flex flex-col items-center gap-12 animate-reveal">
        {/* Brand Logo Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-3xl group-hover:bg-brand-primary/30 transition-all duration-1000 animate-pulse"></div>
          <img 
            src={activeLogo} 
            alt="Logo Monte de Sión" 
            className="w-40 h-40 md:w-52 md:h-52 object-contain relative z-10 drop-shadow-2xl dark:brightness-125"
          />
        </div>

        {/* Uiverse.io Loader Component */}
        <div className="loader-wrapper mt-4">
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
          <div className="loader-shadow"></div>
          <div className="loader-shadow"></div>
          <div className="loader-shadow"></div>
        </div>

        {/* Experience Message */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] animate-pulse">
            Santuario Digital
          </p>
          <p className="text-brand-obsidian/60 dark:text-white/30 text-[9px] font-medium uppercase tracking-widest italic">
            Preparando tu espacio de paz...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
