
import React from 'react';

interface LoadingScreenProps {
  theme?: 'light' | 'dark';
}

const LoadingScreen: React.FC<LoadingScreenProps> = () => {
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-[#080808] overflow-hidden">

      {/* Cinematic Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 blur-[180px] rounded-full animate-pulse-glow" />

      <div className="relative flex flex-col items-center gap-4">

        {/* Tracer Light Logo */}
        <div className="w-24 h-24 mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-none">
            <path
              d="M50 20 L20 50 L20 80 L80 80 L80 50 Z M50 20 L50 80"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand-primary animate-draw"
              strokeDasharray="1000"
              strokeDashoffset="1000"
            />
          </svg>
        </div>

        {/* Ethereal Typography */}
        <div className="text-center overflow-hidden">
          <h1 className="text-6xl md:text-8xl font-serif font-black text-white tracking-[0.2em] animate-blur-spread uppercase">
            Sión
          </h1>
          <div className="h-px w-0 bg-brand-primary mx-auto mt-4 animate-[expand_1.5s_ease-out_forwards_0.5s]" />
          <p className="text-[9px] font-black text-brand-primary/60 uppercase tracking-[1em] mt-6 opacity-0 animate-[fade-in_1s_ease-out_forwards_1.5s]">
            Iglesia Digital
          </p>
        </div>

      </div>

      {/* Ultra-minimalist progress indicator */}
      <div className="absolute top-0 left-0 h-[2px] bg-brand-primary/40 w-full animate-[progress_3s_ease-in-out_infinite]" />

      <style>{`
        @keyframes expand {
            from { width: 0; opacity: 0; }
            to { width: 100%; opacity: 0.3; }
        }
        @keyframes progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
