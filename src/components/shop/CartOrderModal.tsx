import React from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../../types';
import { SmartImage } from '../ui/SmartImage';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartOrderModalProps {
    cart: CartItem[];
    onUpdateQuantity: (productId: string, delta: number) => void;
    onRemoveItem: (productId: string) => void;
    onClearCart: () => void;
    onClose: () => void;
}

export const CartOrderModal: React.FC<CartOrderModalProps> = ({
    cart,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onClose
}) => {
    if (cart.length === 0) return null;

    const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const handleSendWhatsApp = () => {
        // Group items by venture or send to primary venture
        const primaryVenture = cart[0]?.product.venture;
        const phone = primaryVenture?.whatsapp_number || '+5492640000000';

        let cleanNumber = phone.replace(/\D/g, '');
        if (!cleanNumber.startsWith('54')) {
            cleanNumber = '54' + cleanNumber;
        }

        let messageLines = [`¡Hola! Te contacto desde el Mercado Monte de Sión con el siguiente pedido:\n`];
        cart.forEach(item => {
            const lineTotal = item.product.price * item.quantity;
            messageLines.push(`• ${item.quantity}x ${item.product.title} ($${lineTotal.toLocaleString('es-AR')})`);
        });

        messageLines.push(`\n*Total estimado:* $${totalPrice.toLocaleString('es-AR')} ARS`);

        const fullMessage = encodeURIComponent(messageLines.join('\n'));
        const url = `https://wa.me/${cleanNumber}?text=${fullMessage}`;
        window.open(url, '_blank');
    };

    const content = (
        <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-6 animate-in fade-in duration-300 select-none">
            <div className="bg-[#14120c] border border-white/15 w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 max-h-[90vh] flex flex-col justify-between shadow-2xl">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary text-brand-obsidian flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-xl">shopping_cart</span>
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">Mercado Monte de Sión</span>
                            <h3 className="text-base font-serif font-bold text-white">Mi Pedido Múltiple</h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar my-4 space-y-3 pr-1">
                    {cart.map(item => (
                        <div key={item.product.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                            <img
                                src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'}
                                alt={item.product.title}
                                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-serif font-bold text-xs text-white truncate">{item.product.title}</h4>
                                <span className="text-[10px] text-amber-400 font-bold font-mono">
                                    ${item.product.price.toLocaleString('es-AR')} c/u
                                </span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
                                <button
                                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold"
                                >
                                    -
                                </button>
                                <span className="text-xs font-mono font-bold w-5 text-center text-white">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={() => onRemoveItem(item.product.id)}
                                className="w-7 h-7 rounded-xl text-white/40 hover:text-rose-400 flex items-center justify-center transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer Total & Submit Action */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-white/60">Total Estimado:</span>
                        <span className="text-2xl font-black text-emerald-400 font-mono">
                            ${totalPrice.toLocaleString('es-AR')} ARS
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onClearCart}
                            className="px-4 py-3.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Vaciar
                        </button>
                        <button
                            onClick={handleSendWhatsApp}
                            className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">chat</span>
                            Enviar Pedido por WhatsApp
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );

    return createPortal(content, document.body);
};
