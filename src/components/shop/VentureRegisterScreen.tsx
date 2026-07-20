import React, { useState, useEffect } from 'react';
import { Venture } from '../../types';
import { SHOP_CATEGORIES } from '../../hooks/useShop';

interface VentureRegisterScreenProps {
    onClose: () => void;
    onSubmit: (data: Partial<Venture>, logoFile: File | null) => Promise<void>;
    isSubmitting: boolean;
    uploadImage: (file: File) => Promise<string | null>;
}

export const VentureRegisterScreen: React.FC<VentureRegisterScreenProps> = ({
    onClose,
    onSubmit,
    isSubmitting,
    uploadImage
}) => {
    const [step, setStep] = useState(1);

    // Lock body scroll while screen is open
    useEffect(() => {
        const originalStyle = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const [formData, setFormData] = useState<Partial<Venture>>({
        name: '',
        description: '',
        category: 'Gastronomía',
        logo_url: '',
        whatsapp_number: '',
        bank_alias: '',
        bank_cbu: '',
        instagram_handle: ''
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const categories = SHOP_CATEGORIES.filter(c => c !== 'Todos');

    const handleNextStep = () => {
        if (step === 1) {
            if (!logoFile && !logoPreview && !formData.logo_url) {
                alert('Por favor selecciona la foto de perfil o logo de tu emprendimiento.');
                return;
            }
            if (!formData.name?.trim()) {
                alert('Por favor ingresa el nombre de tu emprendimiento.');
                return;
            }
        }

        if (step === 2) {
            if (!formData.description?.trim()) {
                alert('Por favor ingresa una breve descripción sobre tus productos o servicios.');
                return;
            }
        }

        if (step === 3) {
            if (!formData.whatsapp_number?.trim()) {
                alert('Por favor ingresa un número de WhatsApp de contacto.');
                return;
            }
        }

        if (step < 4) {
            setStep(prev => prev + 1);
        }
    };

    const handleSubmitFinal = async (e: React.FormEvent) => {
        e.preventDefault();

        let logoUrl = formData.logo_url;
        if (logoFile) {
            const uploaded = await uploadImage(logoFile);
            if (uploaded) logoUrl = uploaded;
        }

        await onSubmit(
            {
                ...formData,
                logo_url: logoUrl || logoPreview || ''
            },
            logoFile
        );
    };

    const totalSteps = 4;
    const progressPercentage = (step / totalSteps) * 100;

    return (
        <div className="fixed inset-0 z-[9999] bg-[#0f0d08] text-white h-[100dvh] w-screen overflow-hidden flex flex-col justify-between select-none animate-in fade-in duration-300">

            {/* TOP HEADER: Progress & Exit */}
            <div className="px-6 pt-8 pb-4 bg-black/40 backdrop-blur-md border-b border-white/10 flex flex-col gap-3 flex-none">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
                            Registro de Emprendimiento • Paso {step} de {totalSteps}
                        </span>
                        <h3 className="text-lg font-serif font-bold leading-tight text-white">
                            {step === 1 && 'Identidad de Tu Negocio'}
                            {step === 2 && 'Rubro y Descripción'}
                            {step === 3 && 'Contacto y Redes'}
                            {step === 4 && 'Datos para Transferencias'}
                        </h3>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 active:scale-95 text-white"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-primary transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_#ffb700]"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* STEP CONTENT BODY (No overall scroll, clean layout) */}
            <div className="flex-1 overflow-y-auto p-6 max-w-xl mx-auto w-full custom-scrollbar flex flex-col justify-center my-auto">

                {/* STEP 1: LOGO & NAME */}
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-6 duration-300">
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-serif font-bold text-white">¿Cómo se llama tu emprendimiento?</h2>
                            <p className="text-xs text-white/60 max-w-xs mx-auto">
                                Sube el logo o foto representativa y dinos el nombre de tu marca.
                            </p>
                        </div>

                        {/* Logo Upload Picker */}
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div
                                onClick={() => document.getElementById('screen-logo-input')?.click()}
                                className="w-32 h-32 rounded-full border-2 border-dashed border-brand-primary/40 bg-white/5 overflow-hidden cursor-pointer relative group flex items-center justify-center shadow-xl hover:border-brand-primary transition-all hover:scale-105"
                            >
                                {logoPreview || formData.logo_url ? (
                                    <img
                                        src={logoPreview || formData.logo_url}
                                        alt="Logo Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center p-3">
                                        <span className="material-symbols-outlined text-3xl text-brand-primary">add_a_photo</span>
                                        <p className="text-[9px] font-black uppercase tracking-widest mt-1 text-white">Logo / Foto *</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-black uppercase">
                                    Cambiar
                                </div>
                            </div>
                            <input
                                id="screen-logo-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                Foto de Perfil / Marca (Obligatoria)
                            </span>
                        </div>

                        {/* Venture Name Input */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 ml-1 mb-2">
                                Nombre del Emprendimiento *
                            </label>
                            <input
                                type="text"
                                autoFocus
                                required
                                placeholder="Ej: Panadería Doña María / Calzados Sión"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 p-4 rounded-2xl font-bold text-sm border border-white/10 focus:border-brand-primary outline-none shadow-sm transition-all text-white placeholder:text-white/30"
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: CATEGORY & DESCRIPTION */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-6 duration-300">
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-serif font-bold text-white">Rubro y Descripción</h2>
                            <p className="text-xs text-white/60 max-w-xs mx-auto">
                                Elige la categoría principal y describe lo que ofreces.
                            </p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 ml-1 mb-2">
                                Categoría Principal *
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {categories.map(cat => (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => setFormData({ ...formData, category: cat })}
                                        className={`p-3.5 rounded-2xl border font-bold text-xs uppercase tracking-wider text-left transition-all ${formData.category === cat
                                                ? 'bg-brand-primary text-brand-obsidian border-brand-primary shadow-lg font-black'
                                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 ml-1 mb-2">
                                Descripción Breve *
                            </label>
                            <textarea
                                rows={3}
                                required
                                placeholder="Ej: Elaboramos pizzas y pastas caseras con ingredientes frescos..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white/5 p-4 rounded-2xl font-medium text-xs border border-white/10 focus:border-brand-primary outline-none resize-none leading-relaxed text-white placeholder:text-white/30"
                            />
                        </div>
                    </div>
                )}

                {/* STEP 3: CONTACT & SOCIAL */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-6 duration-300">
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-serif font-bold text-white">Canales de Contacto</h2>
                            <p className="text-xs text-white/60 max-w-xs mx-auto">
                                Tus compradores te escribirán directo a tu WhatsApp.
                            </p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 ml-1 mb-2">
                                Número de WhatsApp *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-400">
                                    chat
                                </span>
                                <input
                                    type="text"
                                    required
                                    placeholder="+54 9 264 123 4567"
                                    value={formData.whatsapp_number}
                                    onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                    className="w-full bg-white/5 pl-12 pr-4 py-4 rounded-2xl font-bold text-sm border border-white/10 focus:border-emerald-400 outline-none text-white placeholder:text-white/30"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 ml-1 mb-2">
                                Instagram (Opcional)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-rose-400">
                                    camera_alt
                                </span>
                                <input
                                    type="text"
                                    placeholder="@panaderiamaria"
                                    value={formData.instagram_handle}
                                    onChange={e => setFormData({ ...formData, instagram_handle: e.target.value })}
                                    className="w-full bg-white/5 pl-12 pr-4 py-4 rounded-2xl font-bold text-sm border border-white/10 focus:border-rose-400 outline-none text-white placeholder:text-white/30"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: BANK TRANSFER DETAILS */}
                {step === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right-6 duration-300">
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-serif font-bold text-white">Datos de Transferencia</h2>
                            <p className="text-xs text-white/60 max-w-xs mx-auto">
                                Permite que los compradores te transfieran de inmediato.
                            </p>
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl space-y-3">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                                    Alias CBU / CVU (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="MARIA.PANES.MP"
                                    value={formData.bank_alias}
                                    onChange={e => setFormData({ ...formData, bank_alias: e.target.value })}
                                    className="w-full bg-black/40 p-3.5 rounded-xl font-mono font-bold text-xs border border-emerald-500/30 focus:border-emerald-400 outline-none text-emerald-300"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                                    CBU / CVU (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="00000031000..."
                                    value={formData.bank_cbu}
                                    onChange={e => setFormData({ ...formData, bank_cbu: e.target.value })}
                                    className="w-full bg-black/40 p-3.5 rounded-xl font-mono font-bold text-xs border border-emerald-500/30 focus:border-emerald-400 outline-none text-emerald-300"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTTOM CONTROLS FOOTER */}
            <div className="p-6 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center justify-between max-w-xl mx-auto w-full flex-none">
                {step > 1 ? (
                    <button
                        type="button"
                        onClick={() => setStep(prev => prev - 1)}
                        className="px-5 py-3.5 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Atrás
                    </button>
                ) : (
                    <div />
                )}

                {step < 4 ? (
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className="bg-brand-primary text-brand-obsidian px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        Siguiente
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmitFinal}
                        disabled={isSubmitting}
                        className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar a Revisión'}
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                    </button>
                )}
            </div>
        </div>
    );
};
