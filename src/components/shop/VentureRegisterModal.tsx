import React, { useState } from 'react';
import { Venture } from '../../types';
import { SHOP_CATEGORIES } from '../../hooks/useShop';

interface VentureRegisterModalProps {
    onClose: () => void;
    onSubmit: (data: Partial<Venture>, logoFile: File | null) => Promise<void>;
    isSubmitting: boolean;
    uploadImage: (file: File) => Promise<string | null>;
}

export const VentureRegisterModal: React.FC<VentureRegisterModalProps> = ({
    onClose,
    onSubmit,
    isSubmitting,
    uploadImage
}) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.trim()) {
            alert('Por favor ingresa el nombre de tu emprendimiento.');
            return;
        }

        if (!formData.description?.trim()) {
            alert('Por favor agrega una breve descripción de tu emprendimiento.');
            return;
        }

        if (!formData.whatsapp_number?.trim()) {
            alert('Por favor ingresa un número de WhatsApp de contacto.');
            return;
        }

        let logoUrl = formData.logo_url;
        if (logoFile) {
            const uploaded = await uploadImage(logoFile);
            if (uploaded) logoUrl = uploaded;
        }

        if (!logoUrl && !logoPreview) {
            alert('La foto de perfil/logo es obligatoria.');
            return;
        }

        await onSubmit({ ...formData, logo_url: logoUrl || logoPreview || '' }, logoFile);
    };

    const categories = SHOP_CATEGORIES.filter(c => c !== 'Todos');

    return (
        <div
            className="fixed inset-0 z-[5000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 border border-white/10 max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md z-10">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white">
                            Registrar Mi Emprendimiento
                        </h3>
                        <p className="text-xs text-brand-obsidian/40 dark:text-white/40 font-medium mt-0.5">
                            Tu solicitud será revisada por los pastores/moderadores antes de activarse.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-brand-silk dark:bg-white/5 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-6 flex-1">

                    {/* Logo Upload (Obligatorio) */}
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div
                            onClick={() => document.getElementById('venture-logo-input')?.click()}
                            className="w-28 h-28 rounded-full border-2 border-dashed border-brand-primary/40 bg-brand-silk dark:bg-black/40 overflow-hidden cursor-pointer relative group flex items-center justify-center shadow-md hover:scale-105 transition-all"
                        >
                            {logoPreview || formData.logo_url ? (
                                <img
                                    src={logoPreview || formData.logo_url}
                                    alt="Logo Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center p-2">
                                    <span className="material-symbols-outlined text-3xl text-brand-primary">add_a_photo</span>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-obsidian dark:text-white mt-1">Logo / Foto *</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-black uppercase">
                                Cambiar
                            </div>
                        </div>
                        <input
                            id="venture-logo-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <span className="text-[10px] text-brand-obsidian/40 dark:text-white/40 font-bold uppercase tracking-widest">
                            Foto de Perfil / Logo (Obligatorio)
                        </span>
                    </div>

                    {/* Name & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Nombre del Emprendimiento *</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Panadería Doña María"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-brand-silk dark:bg-black/20 p-4 rounded-xl font-bold text-sm border border-transparent focus:border-brand-primary/50 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Categoría Principal *</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-brand-silk dark:bg-black/20 p-4 rounded-xl font-bold text-sm border border-transparent focus:border-brand-primary/50 outline-none appearance-none"
                            >
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Descripción Breve *</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Cuéntanos brevemente sobre tus productos o servicios..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-brand-silk dark:bg-black/20 p-4 rounded-xl font-medium text-sm border border-transparent focus:border-brand-primary/50 outline-none resize-none leading-relaxed"
                        />
                    </div>

                    {/* WhatsApp */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">WhatsApp de Contacto *</label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: +54 9 264 123 4567"
                            value={formData.whatsapp_number}
                            onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })}
                            className="w-full bg-brand-silk dark:bg-black/20 p-4 rounded-xl font-bold text-sm border border-transparent focus:border-brand-primary/50 outline-none transition-all"
                        />
                    </div>

                    {/* Financial & Social */}
                    <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <span className="material-symbols-outlined text-sm">account_balance</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Datos Bancarios para Transferencias (Opcional)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Alias CBU / CVU</label>
                                <input
                                    type="text"
                                    placeholder="Ej: MARIDA.PANADERO.MP"
                                    value={formData.bank_alias}
                                    onChange={e => setFormData({ ...formData, bank_alias: e.target.value })}
                                    className="w-full bg-white dark:bg-black/40 p-3 rounded-xl font-mono text-xs border border-transparent focus:border-emerald-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">CBU / CVU</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 00000031000..."
                                    value={formData.bank_cbu}
                                    onChange={e => setFormData({ ...formData, bank_cbu: e.target.value })}
                                    className="w-full bg-white dark:bg-black/40 p-3 rounded-xl font-mono text-xs border border-transparent focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Instagram */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Instagram (Opcional)</label>
                        <input
                            type="text"
                            placeholder="Ej: @panaderiamaria"
                            value={formData.instagram_handle}
                            onChange={e => setFormData({ ...formData, instagram_handle: e.target.value })}
                            className="w-full bg-brand-silk dark:bg-black/20 p-4 rounded-xl font-bold text-sm border border-transparent focus:border-brand-primary/50 outline-none transition-all"
                        />
                    </div>

                    {/* Footer buttons */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-brand-obsidian/5 dark:border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-4 rounded-xl font-bold uppercase text-xs text-brand-obsidian/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar a Revisión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
