
import React from 'react';

interface LoadingScreenProps {
  theme: 'light' | 'dark';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ theme }) => {
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-brand-silk dark:bg-brand-obsidian transition-colors duration-700">
      <style>{`
        .loading svg polyline {
          fill: none;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .loading svg polyline#back {
          fill: none;
          stroke: #ff4d5033;
        }

        .loading svg polyline#front {
          fill: none;
          stroke: #ff4d4f;
          stroke-dasharray: 48, 144;
          stroke-dashoffset: 192;
          animation: dash_682 1.4s linear infinite;
        }

        @keyframes dash_682 {
          72.5% {
            opacity: 0;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      <div className="flex flex-col items-center gap-8 animate-reveal">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter">
          Monte de Sión
        </h1>

        {/* From Uiverse.io by milley69 */}
        <div className="loading">
          <svg width="64px" height="48px">
            <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="back"></polyline>
            <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="front"></polyline>
          </svg>
        </div>

        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] opacity-60">
          Cargando...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
