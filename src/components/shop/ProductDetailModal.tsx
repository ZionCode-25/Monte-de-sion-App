import React, { useState } from 'react';
import { Product } from '../../types';
import { SmartImage } from '../ui/SmartImage';

interface ProductDetailModalProps {
    product: Product;
    onClose: () => void;
    triggerToast?: (msg: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, triggerToast }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const images = product.images && product.images.length > 0
        ? product.images
        : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'];

    const currentImage = images[selectedImageIndex] || images[0];

    const venture = product.venture;

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (triggerToast) {
            triggerToast(`¡${label} copiado al portapapeles!`);
        } else {
            alert(`¡${label} copiado!`);
        }
    };

    const handleWhatsApp = () => {
        if (!venture?.whatsapp_number) {
            alert('El emprendedor no ha registrado su número de WhatsApp.');
            return;
        }

        let cleanNumber = venture.whatsapp_number.replace(/\D/g, '');
        if (!cleanNumber.startsWith('54')) {
            cleanNumber = '54' + cleanNumber;
        }

        const message = encodeURIComponent(
            `¡Hola! Vi tu producto "${product.title}" ($${product.price.toLocaleString('es-AR')}) en la App de Monte de Sión y me gustaría consultar/comprar.`
        );

        const url = `https://wa.me/${cleanNumber}?text=${message}`;
        window.open(url, '_blank');
    };

    return (
        <div
            className="fixed inset-0 z-[5000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[#1A1A1A] w-full max-w-3xl rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 border border-white/10 max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-30 w-11 h-11 rounded-full bg-black/40 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all border border-white/20 active:scale-95"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* LEFT: Image Gallery */}
                <div className="md:w-1/2 bg-gray-100 dark:bg-black/40 relative flex flex-col justify-between">
                    <div className="aspect-square relative overflow-hidden">
                        <SmartImage
                            src={currentImage}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Thumbnails if multiple images */}
                    {images.length > 1 && (
                        <div className="p-4 flex gap-2 overflow-x-auto bg-black/20 backdrop-blur-sm">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(idx)}
                                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-brand-primary scale-105' : 'border-transparent opacity-60'
                                        }`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: Content & Actions */}
                <div className="md:w-1/2 p-8 overflow-y-auto custom-scrollbar flex flex-col justify-between gap-6">
                    <div className="space-y-4">

                        {/* Venture Header */}
                        {venture && (
                            <div className="flex items-center gap-3 p-3 bg-brand-silk/40 dark:bg-white/5 rounded-2xl border border-brand-obsidian/5 dark:border-white/5">
                                <img
                                    src={venture.logo_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=shop'}
                                    alt={venture.name}
                                    className="w-12 h-12 rounded-xl object-cover border border-brand-primary"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-serif font-bold text-base text-brand-obsidian dark:text-white truncate">
                                        {venture.name}
                                    </h4>
                                    <p className="text-[10px] font-black uppercase text-brand-primary tracking-widest">
                                        {venture.category} • Verificado
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1">
                                {product.category || 'Producto'}
                            </span>
                            <h2 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white leading-tight">
                                {product.title}
                            </h2>
                            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                                ${product.price.toLocaleString('es-AR')}
                            </div>
                        </div>

                        {product.description && (
                            <div className="bg-brand-silk/30 dark:bg-white/5 p-4 rounded-2xl">
                                <p className="text-xs text-brand-obsidian/70 dark:text-white/70 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Bank Transfer Details (Alias / CBU) */}
                        {venture && (venture.bank_alias || venture.bank_cbu) && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <span className="material-symbols-outlined text-sm">account_balance</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Datos de Transferencia</span>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    {venture.bank_alias && (
                                        <button
                                            onClick={() => copyToClipboard(venture.bank_alias!, 'Alias')}
                                            className="bg-white dark:bg-black/40 px-3 py-2 rounded-xl text-xs font-bold text-brand-obsidian dark:text-white border border-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                                        >
                                            <span className="text-[10px] opacity-60 uppercase font-black">Alias:</span>
                                            <span className="font-mono text-emerald-600 dark:text-emerald-400">{venture.bank_alias}</span>
                                            <span className="material-symbols-outlined text-xs">content_copy</span>
                                        </button>
                                    )}

                                    {venture.bank_cbu && (
                                        <button
                                            onClick={() => copyToClipboard(venture.bank_cbu!, 'CBU')}
                                            className="bg-white dark:bg-black/40 px-3 py-2 rounded-xl text-xs font-bold text-brand-obsidian dark:text-white border border-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                                        >
                                            <span className="text-[10px] opacity-60 uppercase font-black">CBU:</span>
                                            <span className="font-mono text-emerald-600 dark:text-emerald-400">{venture.bank_cbu}</span>
                                            <span className="material-symbols-outlined text-xs">content_copy</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-4 border-t border-brand-obsidian/5 dark:border-white/5">
                        <button
                            onClick={handleWhatsApp}
                            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">chat</span>
                            Pedir por WhatsApp
                        </button>

                        {venture?.instagram_handle && (
                            <button
                                onClick={() => window.open(`https://instagram.com/${venture.instagram_handle?.replace('@', '')}`, '_blank')}
                                className="w-full py-3 bg-white dark:bg-white/5 text-brand-obsidian dark:text-white rounded-2xl font-bold text-xs uppercase tracking-wider border border-brand-obsidian/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-rose-500 text-sm">camera_alt</span>
                                Ver Instagram @{venture.instagram_handle.replace('@', '')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
