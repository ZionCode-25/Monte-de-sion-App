import React, { useState, useEffect } from 'react';

const Tutorial: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(1);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('hasSeenWelcomeTutorial');
        if (!hasSeenTutorial) {
            setIsVisible(true);
        }
    }, []);

    const finishTutorial = () => {
        setIsExiting(true);
        setTimeout(() => {
            localStorage.setItem('hasSeenWelcomeTutorial', 'true');
            setIsVisible(false);
        }, 800);
    };

    if (!isVisible) return null;

    const steps = [
        {
            title: "Bienvenido a Monte de Sión",
            subtitle: "UNA EXPERIENCIA ESPIRITUAL",
            description: "Estamos transformando la manera de conectarnos. Esta es tu casa, ahora en la palma de tu mano.",
            icon: "auto_awesome",
            accent: "from-brand-primary/20 via-brand-primary/5 to-transparent"
        },
        {
            title: "Comunidad y Conexión",
            subtitle: "SIEMPRE UNIDOS",
            description: "Descubre noticias, eventos y ministerios. Mantente unido a tu familia espiritual en todo momento.",
            icon: "groups",
            accent: "from-blue-500/10 via-brand-primary/5 to-transparent"
        },
        {
            title: "Tu Crecimiento Personal",
            subtitle: "PASIÓN POR SU PALABRA",
            description: "Lleva tu lectura bíblica y devocionales al siguiente nivel. Vive una experiencia profunda cada día.",
            icon: "menu_book",
            accent: "from-amber-400/20 via-brand-primary/5 to-transparent"
        }
    ];

    const currentStep = steps[step - 1];

    return (
        <div className={`fixed inset-0 z-[10000] flex items-center justify-center bg-brand-obsidian overflow-hidden transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            <style>{`
                @keyframes orbit {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(10%, 10%) scale(1.1); }
                    66% { transform: translate(-5%, 15%) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                .aura-glow {
                    animation: orbit 15s ease-in-out infinite;
                    filter: blur(80px);
                }
                .step-reveal {
                    animation: reveal-content 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                @keyframes reveal-content {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            {/* Background Animated Auras */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-primary/10 rounded-full aura-glow" style={{ animationDelay: '0s' }} />
                <div className="absolute bottom-[0%] right-[-5%] w-[50%] h-[50%] bg-[#001a33]/40 rounded-full aura-glow" style={{ animationDelay: '-5s' }} />
                <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full aura-glow" style={{ animationDelay: '-10s' }} />
            </div>

            <div className="relative z-10 w-full max-w-lg px-8 flex flex-col items-center">
                {/* Content Card with Glassmorphism */}
                <div 
                    key={step} 
                    className="glass-premium w-full rounded-[3.5rem] p-12 text-center relative overflow-hidden step-reveal border border-white/10"
                >
                    {/* Inner Accent Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${currentStep.accent} pointer-events-none opacity-40`} />

                    <div className="relative z-10">
                        {/* Icon with Bloom */}
                        <div className="mb-10 w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary relative">
                            <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-xl animate-pulse" />
                            <span className="material-symbols-outlined text-5xl relative z-10 fill-1">
                                {currentStep.icon}
                            </span>
                        </div>

                        <p className="text-brand-primary/60 font-black text-[10px] tracking-[0.4em] uppercase mb-3">
                            {currentStep.subtitle}
                        </p>

                        <h2 className="text-4xl font-serif font-bold text-white mb-6 leading-tight">
                            {currentStep.title}
                        </h2>

                        <p className="text-white/60 text-base leading-relaxed mb-12 max-w-[280px] mx-auto text-balance">
                            {currentStep.description}
                        </p>

                        {/* Navigation Actions */}
                        <div className="flex flex-col gap-4">
                            {step < steps.length ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className="w-full py-5 bg-brand-primary text-brand-obsidian rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,183,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Siguiente
                                </button>
                            ) : (
                                <button
                                    onClick={finishTutorial}
                                    className="w-full py-5 bg-white text-brand-obsidian rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    ¡Comenzar Experiencia!
                                </button>
                            )}

                            <button
                                onClick={finishTutorial}
                                className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 hover:text-brand-primary transition-colors py-3"
                            >
                                Saltar bienvenida
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-3 mt-12 relative z-10">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                                i + 1 === step 
                                ? 'w-12 bg-brand-primary shadow-[0_0_10px_rgba(255,183,0,0.5)]' 
                                : 'w-2 bg-white/10'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Version Badge */}
            <div className="absolute bottom-10 left-0 right-0 text-center opacity-20">
                <p className="text-white/50 text-[9px] font-black uppercase tracking-[0.8em]">
                    Premium App 2026
                </p>
            </div>
        </div>
    );
};

export default Tutorial;
