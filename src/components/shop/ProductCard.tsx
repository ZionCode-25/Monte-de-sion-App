import React from 'react';
import { Product } from '../../types';
import { SmartImage } from '../ui/SmartImage';

interface ProductCardProps {
    product: Product;
    onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
    const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800';

    return (
        <div
            onClick={() => onSelect(product)}
            className="group bg-white dark:bg-brand-surface rounded-[2rem] overflow-hidden border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full relative"
        >
            {/* Image Container */}
            <div className="aspect-square bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                <SmartImage
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />

                {/* Venture Logo & Category Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    {product.venture && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-md">
                            <img
                                src={product.venture.logo_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=shop'}
                                alt={product.venture.name}
                                className="w-5 h-5 rounded-full object-cover border border-brand-primary"
                            />
                            <span className="text-[10px] font-black uppercase text-white tracking-wider line-clamp-1 max-w-[100px]">
                                {product.venture.name}
                            </span>
                        </div>
                    )}

                    {product.is_featured && (
                        <div className="bg-amber-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg" title="Destacado">
                            <span className="material-symbols-outlined text-[14px]">star</span>
                        </div>
                    )}
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-3 left-3 z-10">
                    <div className="bg-brand-primary text-brand-obsidian font-black text-base px-3.5 py-1 rounded-xl shadow-lg border border-brand-primary/20">
                        ${product.price.toLocaleString('es-AR')}
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    {product.category && (
                        <span className="inline-block text-[9px] font-black uppercase text-brand-primary tracking-widest mb-1">
                            {product.category}
                        </span>
                    )}
                    <h3 className="font-serif font-bold text-lg text-brand-obsidian dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-brand-primary transition-colors">
                        {product.title}
                    </h3>
                    {product.description && (
                        <p className="text-xs text-brand-obsidian/60 dark:text-white/60 line-clamp-2 leading-relaxed font-normal">
                            {product.description}
                        </p>
                    )}
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Verificado Sión
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-black text-brand-primary uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        Ver Producto
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
