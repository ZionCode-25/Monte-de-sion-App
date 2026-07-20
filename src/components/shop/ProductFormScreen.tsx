import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../../types';
import { SHOP_CATEGORIES } from '../../hooks/useShop';

interface ProductFormScreenProps {
    initialData?: Partial<Product>;
    onClose: () => void;
    onSave: (productData: Partial<Product>, imageFile: File | null) => Promise<void>;
    isSaving: boolean;
    uploadImage: (file: File) => Promise<string | null>;
}

export const ProductFormScreen: React.FC<ProductFormScreenProps> = ({
    initialData,
    onClose,
    onSave,
    isSaving,
    uploadImage
}) => {
    // Lock body scroll while active
    useEffect(() => {
        const originalStyle = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const [formData, setFormData] = useState<Partial<Product>>({
        title: '',
        description: '',
        price: 0,
        category: 'Gastronomía',
        images: [],
        in_stock: true,
        is_featured: false,
        ...initialData
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        formData.images && formData.images.length > 0 ? formData.images[0] : null
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title?.trim()) {
            alert('Por favor ingresa el título del producto.');
            return;
        }

        if (!formData.price || formData.price <= 0) {
            alert('Por favor ingresa un precio válido mayor a 0.');
            return;
        }

        let imgUrl = imagePreview;
        if (imageFile) {
            const uploaded = await uploadImage(imageFile);
            if (uploaded) imgUrl = uploaded;
        }

        if (!imgUrl) {
            alert('Por favor sube al menos una imagen del producto.');
            return;
        }

        await onSave(
            {
                ...formData,
                images: [imgUrl]
            },
            imageFile
        );
    };

    const categories = SHOP_CATEGORIES.filter(c => c !== 'Todos' && c !== 'Oficial Sión');

    const content = (
        <div className="fixed inset-0 z-[99999] bg-[#0f0d08] text-white h-[100dvh] w-screen overflow-hidden flex flex-col justify-between select-none animate-in fade-in duration-300">
            {/* Header */}
            <div className="px-6 pt-8 pb-4 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between flex-none">
                <div>
                    <h3 className="text-xl font-serif font-bold text-white">
                        {initialData?.id ? 'Editar Producto / Servicio' : 'Publicar Nuevo Item'}
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5 font-medium">
                        Completa los detalles de tu publicación.
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/15 active:scale-95 text-white"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 max-w-xl mx-auto w-full custom-scrollbar space-y-6">
                {/* Image Upload Area */}
                <div
                    onClick={() => document.getElementById('product-screen-img-input')?.click()}
                    className="aspect-video w-full rounded-2xl border-2 border-dashed border-brand-primary/40 bg-white/5 overflow-hidden cursor-pointer relative group flex flex-col items-center justify-center shadow-lg hover:border-brand-primary transition-all"
                >
                    {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center p-4">
                            <span className="material-symbols-outlined text-4xl text-brand-primary mb-2">add_a_photo</span>
                            <p className="text-xs font-black uppercase tracking-widest text-white">Subir Foto Principal *</p>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold uppercase tracking-wider">
                        Cambiar Foto
                    </div>
                </div>
                <input
                    id="product-screen-img-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Title & Price */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 ml-1 mb-2">Nombre *</label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: Pizza Casera Muzza"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-white/5 p-4 rounded-xl font-bold text-sm border border-white/10 focus:border-brand-primary outline-none text-white placeholder:text-white/30"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 ml-1 mb-2">Precio ($ ARS) *</label>
                        <input
                            type="number"
                            required
                            min="1"
                            placeholder="8500"
                            value={formData.price || ''}
                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                            className="w-full bg-white/5 p-4 rounded-xl font-bold text-sm border border-white/10 focus:border-brand-primary outline-none text-white placeholder:text-white/30"
                        />
                    </div>
                </div>

                {/* Category Selection */}
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 ml-1 mb-2">Categoría</label>
                    <select
                        value={formData.category || 'Gastronomía'}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-white/5 p-4 rounded-xl font-bold text-sm border border-white/10 focus:border-brand-primary outline-none text-white"
                    >
                        {categories.map(c => (
                            <option key={c} value={c} className="bg-[#0f0d08]">{c}</option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 ml-1 mb-2">Descripción</label>
                    <textarea
                        rows={3}
                        placeholder="Detalles sobre envíos, talles, ingredientes, etc."
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white/5 p-4 rounded-xl font-medium text-xs border border-white/10 focus:border-brand-primary outline-none resize-none leading-relaxed text-white placeholder:text-white/30"
                    />
                </div>

                {/* In Stock toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="product-in-stock-portal"
                            checked={formData.in_stock ?? true}
                            onChange={e => setFormData({ ...formData, in_stock: e.target.checked })}
                            className="w-5 h-5 accent-brand-primary rounded cursor-pointer"
                        />
                        <label htmlFor="product-in-stock-portal" className="text-xs font-bold cursor-pointer select-none">
                            Item Disponible en Stock
                        </label>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-4 rounded-xl font-bold uppercase text-xs text-white/60 hover:bg-white/5"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-brand-primary text-brand-obsidian px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? 'Guardando...' : 'Publicar Item'}
                    </button>
                </div>
            </form>
        </div>
    );

    return createPortal(content, document.body);
};
