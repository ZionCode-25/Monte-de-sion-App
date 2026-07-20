import React, { useState, useEffect } from 'react';

interface ShopOnboardingProps {
    onFinish: () => void;
}

export const ShopOnboarding: React.FC<ShopOnboardingProps> = ({ onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);

    // Lock body scroll while onboarding is active
    useEffect(() => {
        const originalStyle = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const slides = [
        {
            title: 'Mercado Monte de Sión',
            subtitle: 'Bendición y Emprendimiento',
            description: 'Un espacio exclusivo creado para conectar, apoyar y potenciar el trabajo y talento de los hermanos de nuestra congregación.',
            icon: 'storefront',
            tag: 'Apoyo Mutuo',
            lottieUrl: 'https://lottiefiles.com/iframe/dd1bb686-ba91-4231-9141-a83b599ed956'
        },
        {
            title: 'Pedidos Directos por WhatsApp',
            subtitle: 'Sin intermediarios ni comisiones',
            description: 'Explora productos y servicios de hermanos. Con un solo clic, abrirás un chat en WhatsApp con el pedido listo para enviar.',
            icon: 'chat',
            tag: 'Contacto Directo',
            gradient: 'from-emerald-500/20 to-teal-500/5'
        },
        {
            title: 'Transferencias Rápidas',
            subtitle: 'Copiar Alias o CBU con un toque',
            description: 'Paga de forma ágil y segura copiando los datos bancarios del vendedor directamente a tu homebanking.',
            icon: 'account_balance',
            tag: 'Pagos Transparentes',
            gradient: 'from-amber-500/20 to-orange-500/5'
        },
        {
            title: 'Publica Tu Emprendimiento',
            subtitle: 'Registra tu negocio en 4 pasos',
            description: '¿Tienes un comercio, servicio o producto? Regístralo fácilmente para que los pastores lo aprueben y aparezca en la tienda.',
            icon: 'add_business',
            tag: 'Para Toda La Iglesia',
            gradient: 'from-indigo-500/20 to-purple-500/5'
        }
    ];

    const slide = slides[currentStep];

    const handleNext = () => {
        if (currentStep < slides.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onFinish();
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-[#0f0d08] text-white h-[100dvh] w-screen overflow-hidden flex flex-col justify-between select-none animate-in fade-in duration-300">

            {/* Ambient Background Glow (No photo backgrounds) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/15 blur-[120px] rounded-full" />
                <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[140px] rounded-full" />
                <div className="absolute top-10 left-0 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full" />
            </div>

            {/* TOP HEADER: Navigation & Dots */}
            <div className="relative z-10 px-8 pt-8 flex items-center justify-between flex-none">
                {/* Step Dots */}
                <div className="flex items-center gap-2">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-2 rounded-full transition-all duration-500 ${idx === currentStep ? 'w-8 bg-brand-primary shadow-[0_0_12px_#ffb700]' : 'w-2 bg-white/20'
                                }`}
                        />
                    ))}
                </div>

                {/* Skip Button */}
                <button
                    onClick={onFinish}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors py-2.5 px-5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 active:scale-95"
                >
                    Saltar
                </button>
            </div>

            {/* CENTER DISPLAY: Lottie / Vector Graphic Container (Zero scroll, fits any screen) */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto w-full min-h-0">

                {/* ANIMATED GRAPHIC CONTAINER */}
                <div className="w-full aspect-square max-h-[45vh] relative flex items-center justify-center my-auto">
                    {currentStep === 0 ? (
                        /* LOTTIE ANIMATED EMBED */
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-black/30 border border-brand-primary/20 backdrop-blur-md flex items-center justify-center shadow-2xl relative">
                            <iframe
                                src="https://lottiefiles.com/iframe/dd1bb686-ba91-4231-9141-a83b599ed956"
                                className="w-full h-full border-none pointer-events-none scale-110"
                                title="Mercado Sión Tutorial"
                            />
                            {/* Fallback overlay glow */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d08] via-transparent to-transparent opacity-80" />
                        </div>
                    ) : (
                        /* VECTOR ICON BADGE DISPLAY */
                        <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-br from-brand-primary/20 via-white/5 to-transparent border border-white/10 flex flex-col items-center justify-center shadow-2xl relative group">
                            <div className="w-24 h-24 rounded-2xl bg-brand-primary text-brand-obsidian flex items-center justify-center shadow-xl shadow-brand-primary/30">
                                <span className="material-symbols-outlined text-5xl font-black">{slide.icon}</span>
                            </div>
                            <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                                {slide.tag}
                            </span>
                        </div>
                    )}
                </div>

                {/* SLIDE TEXT CONTENT */}
                <div className="space-y-2 mt-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
                        {slide.subtitle}
                    </p>
                    <h2 className="text-3xl md:text-4xl font-serif font-black leading-tight text-white tracking-tight">
                        {slide.title}
                    </h2>
                    <p className="text-xs md:text-sm text-white/70 leading-relaxed font-normal max-w-sm mx-auto pt-1">
                        {slide.description}
                    </p>
                </div>
            </div>

            {/* BOTTOM FOOTER CONTROLS */}
            <div className="relative z-10 p-6 md:p-8 flex items-center justify-between max-w-lg mx-auto w-full flex-none">
                {currentStep > 0 ? (
                    <button
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                ) : (
                    <div className="w-14" />
                )}

                <button
                    onClick={handleNext}
                    className="bg-brand-primary text-brand-obsidian px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                    <span>{currentStep === slides.length - 1 ? 'Ingresar a la Tienda' : 'Siguiente'}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};
