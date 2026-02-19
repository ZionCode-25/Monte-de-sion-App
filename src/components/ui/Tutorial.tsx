import React, { useState, useEffect } from 'react';

const Tutorial: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('hasSeenWelcomeTutorial');
        if (!hasSeenTutorial) {
            setIsVisible(true);
        }
    }, []);

    const finishTutorial = () => {
        localStorage.setItem('hasSeenWelcomeTutorial', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const steps = [
        {
            title: "¡Bienvenido a Monte de Sión!",
            description: "Estamos muy felices de tenerte aquí. Esta aplicación es tu centro de conexión con nuestra casa.",
            icon: "wb_sunny"
        },
        {
            title: "Explora y Conecta",
            description: "Aquí podrás ver noticias, próximos eventos, inscribirte en ministerios y mucho más.",
            icon: "explore"
        },
        {
            title: "Tu Perfil Espiritual",
            description: "Mantén al día tus devocionales y sigue tu crecimiento personal en la fe.",
            icon: "auto_awesome"
        }
    ];

    const currentStep = steps[step - 1];

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-brand-obsidian/80 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="bg-white dark:bg-brand-surface w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative p-10 text-center animate-in zoom-in-95 duration-500">
                <div className="mb-8 w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary">
                    <span className="material-symbols-outlined text-4xl">{currentStep.icon}</span>
                </div>

                <h2 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-4">
                    {currentStep.title}
                </h2>

                <p className="text-brand-obsidian/60 dark:text-white/60 text-sm leading-relaxed mb-10">
                    {currentStep.description}
                </p>

                <div className="flex flex-col gap-3">
                    {step < steps.length ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="w-full py-4 bg-brand-primary text-brand-obsidian rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            onClick={finishTutorial}
                            className="w-full py-4 bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
                        >
                            ¡Comenzar Experiencia!
                        </button>
                    )}

                    <button
                        onClick={finishTutorial}
                        className="text-[9px] uppercase font-black tracking-[0.2em] text-brand-obsidian/30 dark:text-white/30 hover:text-brand-primary transition-colors py-2"
                    >
                        Saltar tutorial
                    </button>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 mt-8">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-6 bg-brand-primary' : 'w-2 bg-brand-obsidian/10 dark:bg-white/10'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Tutorial;
