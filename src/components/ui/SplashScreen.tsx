import React, { useEffect, useState } from 'react';

const SplashScreen: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // (100 / 2500ms) * 30ms interface = 1.2 increment per step roughly
                return Math.min(oldProgress + 1.2, 100);
            });
        }, 30);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[3000] overflow-hidden bg-[#001a33] flex flex-col items-center justify-center">
            <style>{`
        @keyframes parallax {
          0% { transform: scale(1.1) translate(0, 0); }
          50% { transform: scale(1.15) translate(-1%, -1%); }
          100% { transform: scale(1.1) translate(0, 0); }
        }

        @keyframes aura-pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0.3; }
        }

        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }

        .bg-parallax {
          animation: parallax 15s ease-in-out infinite;
        }

        .aura {
          background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
          animation: aura-pulse 4s ease-in-out infinite;
        }

        .particle {
          position: absolute;
          background: #ffd700;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
        }

        .text-glow {
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
      `}</style>

            {/* 1. FONDO CON PARALLAX */}
            <div className="absolute inset-0">
                <img
                    src="/images/fondo-blue.png"
                    alt="Background"
                    className="w-full h-full object-cover bg-parallax"
                />
                <div className="absolute inset-0 bg-[#001a33]/40" />
            </div>

            {/* 2. PARTICULAS (Capas de partículas doradas) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            width: `${Math.random() * 4 + 1}px`,
                            height: `${Math.random() * 4 + 1}px`,
                            left: `${Math.random() * 100}%`,
                            bottom: `-20px`,
                            animation: `float-particle ${Math.random() * 5 + 5}s linear infinite`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            {/* 3. AURA / GLOW */}
            <div className="absolute w-[300px] h-[300px] aura rounded-full blur-3xl" />

            {/* 4. LOGO (ESTÁTICO) */}
            <div className="relative z-10 mb-8 animate-reveal">
                <img
                    src="/images/logo-dorado.png"
                    alt="Logo Monte de Sión"
                    className="w-32 md:w-48 h-auto drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                />
            </div>

            {/* 5. TEXTO */}
            <div className="relative z-10 text-center flex flex-col gap-1 mb-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300 fill-mode-both">
                <h2 className="text-white font-serif font-bold text-3xl tracking-[0.2em] text-glow">
                    MONTE DE SION
                </h2>
                <p className="text-[#ffd700] font-black text-xs tracking-[0.5em] opacity-80">
                    APP
                </p>
            </div>

            {/* 6. BARRA DE CARGA */}
            <div className="relative z-10 w-48 h-1 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div
                    className="h-full bg-gradient-to-r from-[#ffd700] to-[#ffb700] transition-all duration-300 ease-out shadow-[0_0_10px_#ffd700]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="absolute bottom-10 left-0 right-0 text-center">
                <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.5em]">
                    Versión Profesional 2026
                </p>
            </div>
        </div>
    );
};

export default SplashScreen;
