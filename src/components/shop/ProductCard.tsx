import React from 'react';
import { Product } from '../../types';
import { SmartImage } from '../ui/SmartImage';

interface ProductCardProps {
    product: Product;
    onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
    const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800';

    const themeColor = product.venture?.theme_color || '#ffb700';

    return (
        <div
            onClick={() => onSelect(product)}
            className="group bg-white dark:bg-brand-surface rounded-[2rem] overflow-hidden border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full relative"
            style={{ borderTop: `4px solid ${themeColor}` }}
        >
            {/* Image Container */}
            <div className="aspect-[4/5] bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                <SmartImage
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                    {product.is_sion_offer ? (
                        <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-brand-obsidian px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border border-amber-300/30">
                            <span className="material-symbols-outlined text-[10px]">local_offer</span>
                            Oferta Sión
                        </span>
                    ) : (
                        <div />
                    )}

                    {product.is_featured && (
                        <div className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg" title="Destacado">
                            <span className="material-symbols-outlined text-[12px]">star</span>
                        </div>
                    )}
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-3 left-3 z-10">
                    <div
                        className="text-brand-obsidian font-black text-xs px-3 py-1 rounded-xl shadow-lg border border-white/10"
                        style={{ backgroundColor: themeColor }}
                    >
                        ${product.price.toLocaleString('es-AR')}
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-3 pt-2.5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="font-serif font-bold text-sm text-brand-obsidian dark:text-white leading-snug line-clamp-1 mb-0.5 group-hover:text-brand-primary transition-colors">
                        {product.title}
                    </h3>
                </div>

                {/* Footer Action: Avatar Only */}
                <div className="mt-2 pt-2 border-t border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between">
                    {product.venture ? (
                        <img
                            src={product.venture.logo_url}
                            alt={product.venture.name}
                            className="w-6 h-6 rounded-full object-cover border shadow-sm"
                            style={{ borderColor: themeColor }}
                            title={product.venture.name}
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xs">store</span>
                        </div>
                    )}
                    <span className="material-symbols-outlined text-xs opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: themeColor }}>
                        arrow_forward
                    </span>
                </div>
            </div>
        </div>
    );
};
