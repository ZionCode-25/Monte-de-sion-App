import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product, ProductReview } from '../../types';
import { SmartImage } from '../ui/SmartImage';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface ProductDetailModalProps {
    product: Product;
    onClose: () => void;
    onAddToCart?: (product: Product) => void;
    triggerToast?: (msg: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart, triggerToast }) => {
    const { user } = useAuth();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Reviews State
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
    const [newRating, setNewRating] = useState<number>(5);
    const [newComment, setNewComment] = useState<string>('');
    const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

    // Lock body scroll while active
    useEffect(() => {
        const originalStyle = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    // Fetch reviews on mount
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setIsLoadingReviews(true);
                const { data, error } = await supabase
                    .from('product_reviews')
                    .select('*, user_profile:profiles(name, avatar_url)')
                    .eq('product_id', product.id)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setReviews(data as any);
                }
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setIsLoadingReviews(false);
            }
        };

        fetchReviews();
    }, [product.id]);

    const handleAddReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Debes iniciar sesión para publicar una reseña.');
            return;
        }

        if (!newComment.trim()) {
            alert('Escribe un breve comentario para enviar tu reseña.');
            return;
        }

        try {
            setIsSubmittingReview(true);
            const { data, error } = await supabase
                .from('product_reviews')
                .insert({
                    product_id: product.id,
                    user_id: user.id,
                    rating: newRating,
                    comment: newComment.trim()
                })
                .select('*, user_profile:profiles(name, avatar_url)')
                .single();

            if (error) throw error;

            setReviews(prev => [data as any, ...prev]);
            setNewComment('');
            if (triggerToast) triggerToast('¡Reseña publicada con éxito!');
        } catch (err: any) {
            console.error(err);
            alert(err?.message || 'Error al guardar reseña');
        } finally {
            setIsSubmittingReview(false);
        }
    };

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

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

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
            <div className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-8">
                {/* Main Product Info & Gallery */}
                <div className="flex flex-col md:flex-row gap-8">
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

                            {/* Oferta Sion badge overlay */}
                            {product.is_sion_offer && (
                                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-brand-obsidian font-black text-xs px-3.5 py-1.5 rounded-full shadow-xl flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">local_offer</span>
                                    Oferta Sión
                                </div>
                            )}
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

                    {/* Right Column: Details & Actions */}
                    <div className="md:w-1/2 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                    {product.category}
                                </span>
                                {product.is_sion_offer && (
                                    <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-brand-obsidian text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[10px]">local_offer</span>
                                        Oferta Sión
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                                {product.title}
                            </h1>

                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black font-mono text-amber-400">
                                    ${product.price.toLocaleString('es-AR')}
                                </span>
                                <span className="text-xs text-white/50 uppercase font-bold">{product.currency || 'ARS'}</span>
                            </div>

                            <p className="text-xs text-white/70 leading-relaxed font-normal whitespace-pre-line bg-white/5 p-4 rounded-2xl border border-white/5">
                                {product.description}
                            </p>

                            {/* Bank Details */}
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
                                                onClick={() => copyToClipboard(venture.bank_cbu!, 'CBU/CVU')}
                                                className="bg-black/40 px-4 py-3 rounded-xl text-xs font-bold text-white border border-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] opacity-60 uppercase font-black">CBU/CVU:</span>
                                                    <span className="font-mono text-emerald-300 break-all">{venture.bank_cbu}</span>
                                                </div>
                                                <span className="material-symbols-outlined text-xs">content_copy</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2.5 pt-2">
                            {onAddToCart && (
                                <button
                                    onClick={() => onAddToCart(product)}
                                    className="w-full py-4 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                                    + Agregar al Pedido Múltiple
                                </button>
                            )}

                            <button
                                onClick={handleWhatsApp}
                                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">chat</span>
                                Pedir por WhatsApp
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="pt-6 border-t border-white/10 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-400 text-lg">grade</span>
                            Reseñas ({reviews.length})
                        </h4>
                        {avgRating && (
                            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold">
                                <span>★ {avgRating} / 5</span>
                            </div>
                        )}
                    </div>

                    {/* Add Review Form */}
                    {user ? (
                        <form onSubmit={handleAddReview} className="bg-black/40 p-5 rounded-2xl border border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-white/70">Tu Calificación:</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setNewRating(star)}
                                            className="text-xl transition-transform hover:scale-125"
                                        >
                                            <span className={`material-symbols-outlined ${star <= newRating ? 'text-amber-400 fill-1' : 'text-white/20'}`}>star</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <textarea
                                rows={2}
                                required
                                placeholder="Escribe un testimonio sobre tu experiencia con este producto..."
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                className="w-full bg-white/5 p-3.5 rounded-xl font-medium text-xs border border-white/10 outline-none text-white placeholder:text-white/30 resize-none"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmittingReview}
                                    className="px-6 py-3 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                                >
                                    {isSubmittingReview ? 'Enviando...' : 'Publicar Reseña'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="text-xs text-white/50 bg-white/5 p-4 rounded-xl text-center">
                            Solo los usuarios registrados de la App Monte de Sión pueden dejar un testimonio.
                        </p>
                    )}

                    {/* Reviews List */}
                    {isLoadingReviews ? (
                        <p className="text-xs text-white/40 text-center py-4">Cargando testimonios...</p>
                    ) : reviews.length === 0 ? (
                        <p className="text-xs text-white/40 text-center py-4">Aún no hay reseñas. ¡Sé el primero en calificarlo!</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {reviews.map(rev => (
                                <div key={rev.id} className="bg-black/30 p-4 rounded-2xl space-y-2 border border-white/5 relative group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-500/20 border border-white/10 shrink-0">
                                                {rev.user_profile?.avatar_url ? (
                                                    <img src={rev.user_profile.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-amber-300">
                                                        {rev.user_profile?.name?.[0] || 'H'}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs font-bold text-white">{rev.user_profile?.name || 'Hermano/a'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-amber-400 text-xs">
                                                {'★'.repeat(rev.rating)}
                                            </div>
                                            {(user?.id === rev.user_id || user?.role === 'PASTOR' || user?.role === 'SUPER_ADMIN') && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteReview(rev.id)}
                                                    className="text-white/30 hover:text-rose-400 p-1 transition-colors"
                                                    title="Eliminar Reseña"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-white/70 leading-relaxed font-normal">{rev.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
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
