
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[3000] flex flex-col items-center justify-center bg-[#080808] overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 blur-[150px] rounded-full animate-pulse-glow" />
      </div>

      <div className="relative z-10 flex flex-col items-center">

        {/* Logo Dorado - Central Symbol */}
        <div className="relative w-32 h-32 mb-12 animate-reveal">
          <img
            src="/images/logo-dorado.png"
            alt="Logo Monte de Sión"
            className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,183,0,0.4)] animate-[breath_4s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] pointer-events-none" />
        </div>

        {/* Brand Name */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-white tracking-tight animate-blur-spread">
            Monte de <span className="text-brand-primary">Sión</span>
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent mx-auto animate-[expand_2s_ease-out_forwards]" />
        </div>

      </div>

      {/* Ultra-minimalist bottom progress */}
      <div className="absolute bottom-16 w-32 h-[1px] bg-white/5 overflow-hidden">
        <div className="w-full h-full bg-brand-primary/40 animate-[progress_2s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes breath {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes shimmer {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(100%) rotate(45deg); }
        }
        @keyframes expand {
            from { width: 0; opacity: 0; }
            to { width: 120px; opacity: 1; }
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
