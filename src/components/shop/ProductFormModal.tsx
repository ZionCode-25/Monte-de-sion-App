import React, { useState } from 'react';
import { Product } from '../../types';
import { SHOP_CATEGORIES } from '../../hooks/useShop';

interface ProductFormModalProps {
    initialData?: Partial<Product>;
    onClose: () => void;
    onSave: (productData: Partial<Product>, imageFile: File | null) => Promise<void>;
    isSaving: boolean;
    uploadImage: (file: File) => Promise<string | null>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
    initialData,
    onClose,
    onSave,
    isSaving,
    uploadImage
}) => {
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

    const categories = SHOP_CATEGORIES.filter(c => c !== 'Todos');

    return (
        <div
            className="fixed inset-0 z-[5000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[#1A1A1A] w-full max-w-xl rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 border border-white/10 max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md z-10">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white">
                            {initialData?.id ? 'Editar Producto' : 'Publicar Nuevo Producto'}
                        </h3>
                        <p className="text-xs text-brand-obsidian/40 dark:text-white/40 font-medium mt-0.5">
                            Completa la información para exhibirlo en la tienda.
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

                    {/* Image Upload */}
                    <div
                        onClick={() => document.getElementById('product-img-input')?.click()}
                        className="aspect-video w-full rounded-3xl border-2 border-dashed border-brand-primary/40 bg-brand-silk dark:bg-black/40 overflow-hidden cursor-pointer relative group flex flex-col items-center justify-center shadow-sm hover:border-brand-primary transition-all"
                    >
                        {imagePreview ? (
                            <img src={imagePreview} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-2 text-brand-primary">
                                    <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian dark:text-white">
                                    Subir Foto Principal *
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold uppercase tracking-wider">
                            Cambiar Foto
                        </div>
                        <input
                            id="product-img-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Title & Price */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Nombre del Producto / Servicio *</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Pizza Artesanal Muzza"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-brand-silk dark:bg-black/20 p-4 rounded-xl font-bold text-sm border border-transparent focus:border-brand-primary/50 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Precio ($ ARS) *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="8500"
                                value={formData.price || ''}
                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="w-full bg-brand-silk dark:bg-black/20 p-4 rounded-xl font-bold text-sm border border-transparent focus:border-brand-primary/50 outline-none"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Categoría</label>
                        <select
                            value={formData.category || 'Gastronomía'}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-brand-silk dark:bg-black/20 p-4 rounded-xl font-bold text-sm border border-transparent focus:border-brand-primary/50 outline-none appearance-none"
                        >
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Descripción</label>
                        <textarea
                            rows={3}
                            placeholder="Detalles sobre ingredientes, talles, tiempos de entrega, etc."
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-brand-silk dark:bg-black/20 p-4 rounded-xl font-medium text-sm border border-transparent focus:border-brand-primary/50 outline-none resize-none leading-relaxed"
                        />
                    </div>

                    {/* Status Toggles */}
                    <div className="flex items-center justify-between p-4 bg-brand-silk dark:bg-black/20 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="in_stock"
                                checked={formData.in_stock ?? true}
                                onChange={e => setFormData({ ...formData, in_stock: e.target.checked })}
                                className="w-5 h-5 accent-brand-primary rounded cursor-pointer"
                            />
                            <label htmlFor="in_stock" className="text-xs font-bold cursor-pointer select-none">
                                Producto Disponible en Stock
                            </label>
                        </div>
                    </div>

                    {/* Footer Buttons */}
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
                            disabled={isSaving}
                            className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
