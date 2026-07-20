import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

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
            lottieUrl: 'https://lottie.host/9a1b4301-0402-437d-9006-c7305bb89c36/xZOF8WIhfB.json'
        },
        {
            title: 'Pedidos Directos por WhatsApp',
            subtitle: 'Sin intermediarios ni comisiones',
            description: 'Explora productos y servicios. Con un solo clic, abrirás un chat en WhatsApp con el vendedor y tu mensaje precargado.',
            icon: 'chat',
            tag: 'Contacto Directo'
        },
        {
            title: 'Transferencias Rápidas',
            subtitle: 'Copiar Alias o CBU con un toque',
            description: 'Paga de forma ágil copiando los datos bancarios del emprendedor directamente a tu app de homebanking.',
            icon: 'account_balance',
            tag: 'Pagos Transparentes'
        },
        {
            title: 'Publica Tu Emprendimiento',
            subtitle: 'Registra tu negocio en 4 pasos',
            description: '¿Tienes un comercio, servicio o producto? Regístralo fácilmente para que los pastores lo aprueben y aparezca en el catálogo.',
            icon: 'add_business',
            tag: 'Para Toda La Iglesia'
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

    const content = (
        <div className="fixed inset-0 z-[99999] bg-[#0f0d08] text-white h-[100dvh] w-screen overflow-hidden flex flex-col justify-between select-none animate-in fade-in duration-300">

            {/* Ambient Background Glow (Sleek dark mode) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/15 blur-[140px] rounded-full" />
                <div className="absolute bottom-10 right-0 w-[350px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full" />
                <div className="absolute top-10 left-0 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full" />
            </div>

            {/* TOP HEADER: Dots & Skip */}
            <div className="relative z-10 px-6 pt-6 pb-2 flex items-center justify-between flex-none">
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
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors py-2.5 px-5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 active:scale-95 shadow-md"
                >
                    Saltar
                </button>
            </div>

            {/* CENTER DISPLAY AREA */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full min-h-0">

                {/* ANIMATION CONTAINER */}
                <div className="w-full aspect-square max-h-[38vh] relative flex items-center justify-center my-auto">
                    {currentStep === 0 ? (
                        /* LOTTIE ANIMATION REACT COMPONENT */
                        <div className="w-full h-full max-w-[280px] max-h-[280px] rounded-3xl overflow-hidden bg-black/40 border border-brand-primary/20 backdrop-blur-md flex items-center justify-center shadow-2xl relative p-4">
                            <DotLottieReact
                                src="https://lottie.host/9a1b4301-0402-437d-9006-c7305bb89c36/xZOF8WIhfB.json"
                                loop
                                autoplay
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ) : (
                        /* VECTOR ICON BADGE DISPLAY */
                        <div className="w-44 h-44 rounded-[3rem] bg-gradient-to-br from-brand-primary/20 via-white/5 to-transparent border border-white/10 flex flex-col items-center justify-center shadow-2xl relative group">
                            <div className="w-20 h-20 rounded-2xl bg-brand-primary text-brand-obsidian flex items-center justify-center shadow-xl shadow-brand-primary/30">
                                <span className="material-symbols-outlined text-4xl font-black">{slide.icon}</span>
                            </div>
                            <span className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
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
                    <h2 className="text-2xl md:text-3xl font-serif font-black leading-tight text-white tracking-tight">
                        {slide.title}
                    </h2>
                    <p className="text-xs text-white/70 leading-relaxed font-normal max-w-xs mx-auto pt-1">
                        {slide.description}
                    </p>
                </div>
            </div>

            {/* BOTTOM FOOTER CONTROLS */}
            <div className="relative z-10 p-6 flex items-center justify-between max-w-md mx-auto w-full flex-none">
                {currentStep > 0 ? (
                    <button
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="w-13 h-13 py-3.5 px-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 shadow-md"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                ) : (
                    <div className="w-13" />
                )}

                <button
                    onClick={handleNext}
                    className="bg-brand-primary text-brand-obsidian px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span>{currentStep === slides.length - 1 ? 'Ingresar a la Tienda' : 'Siguiente'}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
            </div>
        </div>
    );

    return createPortal(content, document.body);
};
