import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../../types';
import { SmartImage } from '../ui/SmartImage';

interface ProductDetailModalProps {
    product: Product;
    onClose: () => void;
    triggerToast?: (msg: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, triggerToast }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Lock body scroll while active
    useEffect(() => {
        const originalStyle = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const images = product.images && product.images.length > 0
        ? product.images
        : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'];

    const currentImage = images[selectedImageIndex] || images[0];
    const venture = product.venture;
    const themeColor = venture?.theme_color || '#ffb700';

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (triggerToast) {
            triggerToast(`¡${label} copiado al portapapeles!`);
        } else {
            alert(`¡${label} copiado!`);
        }
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/shop?product=${product.id}`;
        if (navigator.share) {
            navigator.share({
                title: product.title,
                text: `Mira este producto en el Mercado Monte de Sión: ${product.title}`,
                url: shareUrl
            }).catch(console.error);
        } else {
            copyToClipboard(shareUrl, 'Enlace de producto');
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

    const content = (
        <div className="fixed inset-0 z-[99999] bg-[#0f0d08] text-white w-screen h-[100dvh] overflow-y-auto flex flex-col justify-between select-none animate-in fade-in duration-300">
            {/* Header */}
            <div className="px-6 pt-8 pb-4 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between flex-none">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/15 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                    </button>
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">Detalle del Producto</span>
                        <h3 className="text-base font-serif font-bold text-white truncate max-w-[200px] sm:max-w-xs">{product.title}</h3>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleShare}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/15 active:scale-95"
                        title="Compartir Producto"
                    >
                        <span className="material-symbols-outlined text-lg">share</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/15 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col md:flex-row gap-8">
                {/* LEFT: Image Gallery */}
                <div className="md:w-1/2 flex flex-col gap-4">
                    <div
                        onClick={() => setIsLightboxOpen(true)}
                        className="aspect-square w-full rounded-3xl overflow-hidden border border-white/10 relative cursor-zoom-in group shadow-xl"
                    >
                        <SmartImage
                            src={currentImage}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold uppercase tracking-wider gap-2">
                            <span className="material-symbols-outlined">zoom_in</span>
                            Ver Pantalla Completa
                        </div>
                    </div>

                    {/* Thumbnails if multiple images */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(idx)}
                                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${selectedImageIndex === idx ? 'scale-105' : 'opacity-60'}`}
                                    style={{ borderColor: selectedImageIndex === idx ? themeColor : 'transparent' }}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: Content & Actions */}
                <div className="md:w-1/2 flex flex-col justify-between gap-6">
                    <div className="space-y-6">
                        {/* Venture Header */}
                        {venture && (
                            <div
                                className="flex items-center gap-3 p-4 bg-white/5 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                                style={{ borderLeft: `4px solid ${themeColor}` }}
                            >
                                <img
                                    src={venture.logo_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=shop'}
                                    alt={venture.name}
                                    className="w-12 h-12 rounded-xl object-cover border"
                                    style={{ borderColor: themeColor }}
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-serif font-bold text-base text-white truncate flex items-center gap-1">
                                        {venture.name}
                                        <span className="material-symbols-outlined text-emerald-400 fill-1 text-base">verified</span>
                                    </h4>
                                    <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">
                                        {venture.category}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <span className="inline-block text-[10px] font-black uppercase tracking-widest mb-1 text-white/50">
                                {product.category || 'Categoría'}
                            </span>
                            <h2 className="text-3xl font-serif font-black text-white leading-tight">
                                {product.title}
                            </h2>
                            <div className="text-4xl font-black mt-2" style={{ color: themeColor }}>
                                ${product.price.toLocaleString('es-AR')}
                            </div>
                        </div>

                        {product.description && (
                            <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                                <p className="text-sm text-white/80 leading-relaxed font-normal">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Bank Transfer Details (Alias / CBU) */}
                        {venture && (venture.bank_alias || venture.bank_cbu) && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <span className="material-symbols-outlined text-sm">account_balance</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Datos de Transferencia bancaria</span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {venture.bank_alias && (
                                        <button
                                            onClick={() => copyToClipboard(venture.bank_alias!, 'Alias')}
                                            className="bg-black/40 px-4 py-3 rounded-xl text-xs font-bold text-white border border-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] opacity-60 uppercase font-black">Alias:</span>
                                                <span className="font-mono text-emerald-300">{venture.bank_alias}</span>
                                            </div>
                                            <span className="material-symbols-outlined text-xs">content_copy</span>
                                        </button>
                                    )}

                                    {venture.bank_cbu && (
                                        <button
                                            onClick={() => copyToClipboard(venture.bank_cbu!, 'CBU')}
                                            className="bg-black/40 px-4 py-3 rounded-xl text-xs font-bold text-white border border-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] opacity-60 uppercase font-black">CBU:</span>
                                                <span className="font-mono text-emerald-300">{venture.bank_cbu}</span>
                                            </div>
                                            <span className="material-symbols-outlined text-xs">content_copy</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-6 border-t border-white/10">
                        <button
                            onClick={handleWhatsApp}
                            className="w-full py-4.5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">chat</span>
                            Pedir por WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            {/* LIGHTBOX / FULLSCREEN IMAGE ZOOM */}
            {isLightboxOpen && (
                <div
                    onClick={() => setIsLightboxOpen(false)}
                    className="fixed inset-0 z-[999999] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
                >
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white text-lg active:scale-95"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <img src={currentImage} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
                </div>
            )}
        </div>
    );

    return createPortal(content, document.body);
};
