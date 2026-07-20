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
            tag: 'Apoyo Mutuo',
            lottieUrl: 'https://lottie.host/9a1b4301-0402-437d-9006-c7305bb89c36/xZOF8WIhfB.json'
        },
        {
            title: 'Pedidos Directos por WhatsApp',
            subtitle: 'Sin intermediarios ni comisiones',
            description: 'Explora productos y servicios. Con un solo clic, abrirás un chat en WhatsApp con el vendedor y tu mensaje precargado.',
            tag: 'Contacto Directo',
            lottieUrl: 'https://lottie.host/dedfa042-ffb4-424a-8eae-0d666796be52/B36EsU9JdK.json'
        },
        {
            title: 'Transferencias Rápidas',
            subtitle: 'Copiar Alias o CBU con un toque',
            description: 'Paga de forma ágil copiando los datos bancarios del emprendedor directamente a tu app de homebanking.',
            tag: 'Pagos Transparentes',
            lottieUrl: 'https://lottie.host/755096ad-61f6-4010-9342-67ebe3d1a472/DxyI6hiST5.json'
        },
        {
            title: 'Publica Tu Emprendimiento',
            subtitle: 'Registra tu negocio en 4 pasos',
            description: '¿Tienes un comercio, servicio o producto? Regístralo fácilmente para que los pastores lo aprueben y aparezca en el catálogo.',
            tag: 'Para Toda La Iglesia',
            lottieUrl: 'https://lottie.host/fabb0ca1-df80-42a9-8d41-0d445d56e287/3LEsKCRRbn.json'
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

            {/* CENTER DISPLAY AREA (Shifted up to center everything cleanly) */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full min-h-0 -translate-y-6">

                {/* ANIMATION CONTAINER (No background, no borders) */}
                <div className="w-full aspect-square max-h-[38vh] relative flex items-center justify-center mb-8">
                    <div className="w-full h-full max-w-[280px] max-h-[280px] flex items-center justify-center relative p-4">
                        <DotLottieReact
                            key={currentStep} // Forces re-mount to animate fresh on step change
                            src={slide.lottieUrl}
                            loop
                            autoplay
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* SLIDE TEXT CONTENT (Centered and shifted slightly up) */}
                <div className="space-y-3">
                    <span className="inline-block bg-white/10 backdrop-blur-md border border-white/10 text-brand-primary px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-1">
                        {slide.tag}
                    </span>
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
