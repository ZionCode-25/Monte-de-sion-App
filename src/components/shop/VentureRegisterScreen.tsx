import React, { useState } from 'react';
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
        <div className="fixed inset-0 z-[6000] bg-brand-silk dark:bg-brand-obsidian text-brand-obsidian dark:text-white flex flex-col justify-between overflow-hidden animate-in fade-in duration-300">

            {/* TOP HEADER: Progress & Exit */}
            <div className="px-6 pt-10 pb-4 bg-white/80 dark:bg-brand-surface/80 backdrop-blur-md border-b border-brand-obsidian/5 dark:border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
                            Registro de Emprendimiento • Paso {step} de {totalSteps}
                        </span>
                        <h3 className="text-xl font-serif font-bold leading-tight">
                            {step === 1 && 'Identidad de Tu Negocio'}
                            {step === 2 && 'Rubro y Descripción'}
                            {step === 3 && 'Contacto y Redes'}
                            {step === 4 && 'Datos para Transferencias'}
                        </h3>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-11 h-11 rounded-2xl bg-brand-silk dark:bg-white/5 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all border border-brand-obsidian/5 dark:border-white/5 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-2 bg-brand-obsidian/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-primary transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* STEP CONTENT BODY */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-2xl mx-auto w-full custom-scrollbar flex flex-col justify-center">

                {/* STEP 1: LOGO & NAME */}
                {step === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-6 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-serif font-bold">¿Cómo se llama tu emprendimiento?</h2>
                            <p className="text-xs opacity-60 max-w-md mx-auto">
                                Sube el logo o foto representativa y dinos el nombre oficial con el que te conocen los hermanos.
                            </p>
                        </div>

                        {/* Logo Upload Picker */}
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div
                                onClick={() => document.getElementById('screen-logo-input')?.click()}
                                className="w-36 h-36 rounded-full border-4 border-dashed border-brand-primary/40 bg-white dark:bg-white/5 overflow-hidden cursor-pointer relative group flex items-center justify-center shadow-xl hover:border-brand-primary transition-all hover:scale-105"
                            >
                                {logoPreview || formData.logo_url ? (
                                    <img
                                        src={logoPreview || formData.logo_url}
                                        alt="Logo Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center p-3">
                                        <span className="material-symbols-outlined text-4xl text-brand-primary">add_a_photo</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest mt-1">Sube Logo / Foto *</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-black uppercase">
                                    Cambiar Imagen
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
                            <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">
                                Nombre del Emprendimiento *
                            </label>
                            <input
                                type="text"
                                autoFocus
                                required
                                placeholder="Ej: Panadería Doña María / Estudio Jurídico Perez"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white dark:bg-brand-surface p-5 rounded-2xl font-bold text-base border border-brand-obsidian/5 dark:border-white/5 focus:border-brand-primary outline-none shadow-sm transition-all"
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: CATEGORY & DESCRIPTION */}
                {step === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-6 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-serif font-bold">Rubro y Detalles</h2>
                            <p className="text-xs opacity-60 max-w-md mx-auto">
                                Selecciona la categoría principal y redacta una breve descripción sobre tus productos o servicios.
                            </p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">
                                Categoría Principal *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {categories.map(cat => (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => setFormData({ ...formData, category: cat })}
                                        className={`p-4 rounded-2xl border font-bold text-xs uppercase tracking-wider text-left transition-all ${formData.category === cat
                                                ? 'bg-brand-primary text-brand-obsidian border-brand-primary shadow-lg scale-[1.02]'
                                                : 'bg-white dark:bg-brand-surface border-brand-obsidian/5 dark:border-white/5 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">
                                Descripción Breve *
                            </label>
                            <textarea
                                rows={4}
                                required
                                placeholder="Ej: Elaboramos panes artesanales, facturas y pizzas caseras con masa madre. Envíos en la zona."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white dark:bg-brand-surface p-5 rounded-2xl font-medium text-sm border border-brand-obsidian/5 dark:border-white/5 focus:border-brand-primary outline-none resize-none leading-relaxed shadow-sm transition-all"
                            />
                        </div>
                    </div>
                )}

                {/* STEP 3: CONTACT & SOCIAL */}
                {step === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right-6 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-serif font-bold">Canales de Contacto</h2>
                            <p className="text-xs opacity-60 max-w-md mx-auto">
                                Los pedidos se realizarán directamente a tu número de WhatsApp.
                            </p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">
                                Número de WhatsApp *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-500">
                                    chat
                                </span>
                                <input
                                    type="text"
                                    required
                                    placeholder="+54 9 264 123 4567"
                                    value={formData.whatsapp_number}
                                    onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                    className="w-full bg-white dark:bg-brand-surface pl-12 pr-5 py-5 rounded-2xl font-bold text-base border border-brand-obsidian/5 dark:border-white/5 focus:border-emerald-500 outline-none shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">
                                Instagram (Opcional)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-rose-500">
                                    camera_alt
                                </span>
                                <input
                                    type="text"
                                    placeholder="@panaderiamaria"
                                    value={formData.instagram_handle}
                                    onChange={e => setFormData({ ...formData, instagram_handle: e.target.value })}
                                    className="w-full bg-white dark:bg-brand-surface pl-12 pr-5 py-5 rounded-2xl font-bold text-base border border-brand-obsidian/5 dark:border-white/5 focus:border-rose-500 outline-none shadow-sm transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: BANK TRANSFER DETAILS */}
                {step === 4 && (
                    <div className="space-y-8 animate-in slide-in-from-right-6 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-serif font-bold">Datos de Transferencia</h2>
                            <p className="text-xs opacity-60 max-w-md mx-auto">
                                Permite que los hermanos copien tu Alias o CBU con un toque para pagarte fácilmente.
                            </p>
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                                    Alias CBU / CVU (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="MARIA.PANES.MP"
                                    value={formData.bank_alias}
                                    onChange={e => setFormData({ ...formData, bank_alias: e.target.value })}
                                    className="w-full bg-white dark:bg-black/40 p-4 rounded-2xl font-mono font-bold text-sm border border-emerald-500/30 focus:border-emerald-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                                    CBU / CVU de 22 dígitos (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="00000031000..."
                                    value={formData.bank_cbu}
                                    onChange={e => setFormData({ ...formData, bank_cbu: e.target.value })}
                                    className="w-full bg-white dark:bg-black/40 p-4 rounded-2xl font-mono font-bold text-sm border border-emerald-500/30 focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTTOM CONTROLS FOOTER */}
            <div className="p-6 md:p-10 bg-white/80 dark:bg-brand-surface/80 backdrop-blur-md border-t border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between max-w-2xl mx-auto w-full">
                {step > 1 ? (
                    <button
                        type="button"
                        onClick={() => setStep(prev => prev - 1)}
                        className="px-6 py-4 rounded-2xl bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Atrás
                    </button>
                ) : (
                    <div />
                )}

                {step < 4 ? (
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        Siguiente
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmitFinal}
                        disabled={isSubmitting}
                        className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar a Revisión'}
                        <span className="material-symbols-outlined text-base">check_circle</span>
                    </button>
                )}
            </div>
        </div>
    );
};
