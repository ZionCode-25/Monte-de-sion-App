import React, { useState } from 'react';

interface ShopOnboardingProps {
    onFinish: () => void;
}

export const ShopOnboarding: React.FC<ShopOnboardingProps> = ({ onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const slides = [
        {
            title: 'Mercado Monte de Sión',
            subtitle: 'Bendición y Emprendimiento',
            description: 'Un espacio exclusivo creado para conectar, apoyar y potenciar el talento y trabajo de los hermanos de nuestra congregación.',
            image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2070&auto=format&fit=crop',
            icon: 'storefront',
            tag: 'Apoyo Mutuo'
        },
        {
            title: 'Pedidos Directos por WhatsApp',
            subtitle: 'Sin intermediarios ni comisiones',
            description: 'Explora productos y servicios. Con un solo clic, se abrirá un chat directo en WhatsApp con el vendedor y el detalle de tu pedido precargado.',
            image: 'https://images.unsplash.com/photo-1556742049-0a670f4a458d?q=80&w=2070&auto=format&fit=crop',
            icon: 'chat',
            tag: 'Comunicación Directa'
        },
        {
            title: 'Transferencias Rápidas y Seguras',
            subtitle: 'Apoya con un toque',
            description: 'Copia el Alias o CBU del emprendedor de forma instantánea para realizar tus transferencias sin complicaciones desde tu homebanking.',
            image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop',
            icon: 'account_balance',
            tag: 'Pagos Ágiles'
        },
        {
            title: 'Publica Tu Emprendimiento',
            subtitle: 'Crece junto a la iglesia',
            description: '¿Tienes un negocio, comercio o servicio? Regístralo de manera sencilla en 4 pasos. Una vez aprobado por los pastores, estará visible para todos.',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
            icon: 'add_business',
            tag: 'Para Todos Los Hermanos'
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
        <div className="fixed inset-0 z-[6000] bg-black text-white flex flex-col justify-between overflow-hidden animate-in fade-in duration-500">
            {/* Background Image with Cinematic Gradient */}
            <div className="absolute inset-0 z-0">
                <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover transition-all duration-1000 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
            </div>

            {/* TOP BAR: Skip Button & Progress Dots */}
            <div className="relative z-10 px-8 pt-12 flex items-center justify-between">
                {/* Dots */}
                <div className="flex items-center gap-2">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentStep ? 'w-8 bg-brand-primary' : 'w-2 bg-white/30'
                                }`}
                        />
                    ))}
                </div>

                {/* Skip */}
                <button
                    onClick={onFinish}
                    className="text-xs font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors py-2 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10"
                >
                    Saltar
                </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="relative z-10 p-8 md:p-14 max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-6 duration-700">

                {/* Tag & Icon Badge */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary text-brand-obsidian flex items-center justify-center shadow-lg shadow-brand-primary/30">
                        <span className="material-symbols-outlined text-2xl font-black">{slide.icon}</span>
                    </div>
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 text-brand-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {slide.tag}
                    </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary/80">
                        {slide.subtitle}
                    </p>
                    <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight text-white tracking-tight">
                        {slide.title}
                    </h2>
                    <p className="text-sm md:text-base text-white/70 leading-relaxed font-normal pt-2">
                        {slide.description}
                    </p>
                </div>
            </div>

            {/* BOTTOM CONTROLS */}
            <div className="relative z-10 p-8 md:p-14 pt-0 flex items-center justify-between max-w-2xl mx-auto w-full">
                {currentStep > 0 ? (
                    <button
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                ) : (
                    <div className="w-14" />
                )}

                <button
                    onClick={handleNext}
                    className="bg-brand-primary text-brand-obsidian px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                    <span>{currentStep === slides.length - 1 ? 'Explorar Tienda' : 'Siguiente'}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};
