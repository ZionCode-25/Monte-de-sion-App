import React from 'react';

const AdminMinistry: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-brand-bg dark:bg-black/90 p-8">
            <div className="mb-8">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight">
                    Mi Ministerio
                </h2>
                <p className="mt-2 text-brand-obsidian/40 dark:text-white/40 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                    Gestión interna de líderes y voluntarios.
                </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center opacity-50 border-2 border-dashed border-brand-obsidian/10 rounded-[3rem]">
                <span className="material-symbols-outlined text-6xl mb-4">groups</span>
                <p className="font-bold uppercase tracking-widest text-xs">Módulo en Desarrollo</p>
                <p className="text-xs mt-2 max-w-md text-center">Próximamente podrás gestionar equipos de alabanza, ujieres y escuela dominical desde aquí.</p>
            </div>
        </div>
    );
};

export default AdminMinistry;
