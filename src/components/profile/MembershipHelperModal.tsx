import React from 'react';
import { createPortal } from 'react-dom';

interface Props {
    onClose: () => void;
}

export const MembershipHelperModal: React.FC<Props> = ({ onClose }) => {
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-white dark:bg-brand-surface rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">

                {/* Header Visual */}
                <div className="h-32 bg-brand-obsidian relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10 text-center">
                        <span className="material-symbols-outlined text-5xl text-brand-primary mb-2">verified</span>
                        <h2 className="text-white font-serif font-bold text-xl tracking-wide">Membresía Digital</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0 text-brand-primary">
                            <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-obsidian dark:text-white text-lg">Tu Identidad en Sión</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Este código QR es tu pase digital. Úsalo para registrar tu asistencia en los servicios y eventos especiales.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-500">
                            <span className="material-symbols-outlined text-2xl">loyalty</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-obsidian dark:text-white text-lg">Beneficios Exclusivos</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Como miembro fiel, accederás a contenido exclusivo, descuentos en eventos y recursos especiales.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                        <p className="text-xs text-center text-gray-400 uppercase tracking-widest font-bold">
                            Escanea en la entrada
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-brand-obsidian dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                        Entendido
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};
