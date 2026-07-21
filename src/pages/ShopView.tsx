import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useShop, SHOP_CATEGORIES } from '../hooks/useShop';
import { ProductCard } from '../components/shop/ProductCard';
import { ProductDetailModal } from '../components/shop/ProductDetailModal';
import { VentureRegisterScreen } from '../components/shop/VentureRegisterScreen';
import { ShopOnboarding } from '../components/shop/ShopOnboarding';
import { MyVenturePanel } from '../components/shop/MyVenturePanel';
import { CartOrderModal, CartItem } from '../components/shop/CartOrderModal';
import { Product, Venture } from '../types';
import { useAuth } from '../components/context/AuthContext';
import { useToast } from '../components/context/ToastContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const ShopView: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'products' | 'ventures' | 'my-venture'>('products');
    const [activeCategory, setActiveCategory] = useState<string>('Todos');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isRegisteringVenture, setIsRegisteringVenture] = useState<boolean>(false);
    const [isSubmittingVenture, setIsSubmittingVenture] = useState<boolean>(false);
    const [selectedVentureCatalog, setSelectedVentureCatalog] = useState<Venture | null>(null);

    // Cart / Multiple Order State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

    const handleAddToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        showToast(`¡"${product.title}" agregado al pedido!`, 'success');
    };

    const handleUpdateCartQuantity = (productId: string, delta: number) => {
        setCart(prev =>
            prev
                .map(item => item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item)
                .filter(item => item.quantity > 0)
        );
    };

    const handleRemoveCartItem = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const handleClearCart = () => {
        setCart([]);
        setIsCartOpen(false);
    };

    const {
        products,
        ventures,
        myVenture,
        userVentures,
        selectedVentureMode,
        setSelectedVentureMode,
        myProducts,
        isLoadingProducts,
        isLoadingVentures,
        isLoadingMyVenture,
        isLoadingMyProducts,
        registerVentureMutation,
        updateVentureMutation,
        saveProductMutation,
        deleteProductMutation
    } = useShop(user, activeCategory, searchTerm);

    // Sorting state for products
    const [sortBy, setSortBy] = useState<'destacados' | 'recientes' | 'precio_asc' | 'precio_desc'>('destacados');

    // Sort products based on selected quick filter
    const sortedProducts = React.useMemo(() => {
        if (!products || products.length === 0) return [];
        let list = [...products];

        if (sortBy === 'destacados') {
            return list.sort((a, b) => {
                const aOfficial = a.venture?.is_official ? 1 : 0;
                const bOfficial = b.venture?.is_official ? 1 : 0;
                if (bOfficial !== aOfficial) return bOfficial - aOfficial;
                const aFeatured = a.is_featured ? 1 : 0;
                const bFeatured = b.is_featured ? 1 : 0;
                return bFeatured - aFeatured;
            });
        } else if (sortBy === 'recientes') {
            return list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        } else if (sortBy === 'precio_asc') {
            return list.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'precio_desc') {
            return list.sort((a, b) => b.price - a.price);
        }

        return list;
    }, [products, sortBy]);

    // Sort ventures so that the church's official store (Tienda Sion) is always first
    const sortedVentures = React.useMemo(() => {
        if (!ventures || ventures.length === 0) return [];
        return [...ventures].sort((a, b) => (b.is_official ? 1 : 0) - (a.is_official ? 1 : 0));
    }, [ventures]);

    // Handle deep links on mount/update
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('product');
        const ventureId = params.get('venture');

        if (productId && products.length > 0) {
            const prod = products.find(p => p.id === productId);
            if (prod) setSelectedProduct(prod);
        }

        if (ventureId && ventures.length > 0) {
            const vent = ventures.find(v => v.id === ventureId);
            if (vent) setSelectedVentureCatalog(vent);
        }
    }, [products, ventures]);

    useEffect(() => {
        const hasSeen = localStorage.getItem('has_seen_shop_onboarding');
        if (!hasSeen) {
            setShowOnboarding(true);
        }
    }, []);

    // Slide state for venture banners
    const [activeSlide, setActiveSlide] = useState(0);
    useEffect(() => {
        if (!selectedVentureCatalog?.carousel_images || selectedVentureCatalog.carousel_images.length <= 1) return;
        const timer = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % selectedVentureCatalog.carousel_images!.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [selectedVentureCatalog]);

    const finishOnboarding = () => {
        localStorage.setItem('has_seen_shop_onboarding', 'true');
        setShowOnboarding(false);
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `shop_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `shop/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('public_assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('public_assets')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => resolve(reader.result as string);
            });
        }
    };

    const handleRegisterVenture = async (data: Partial<Venture>, logoFile: File | null) => {
        try {
            setIsSubmittingVenture(true);
            let logoUrl = data.logo_url;
            if (logoFile) {
                const uploaded = await uploadImage(logoFile);
                if (uploaded) logoUrl = uploaded;
            }

            await registerVentureMutation.mutateAsync({ ...data, logo_url: logoUrl });
            showToast('¡Solicitud enviada! Estará en revisión por los moderadores.', 'success');
            setIsRegisteringVenture(false);
            setActiveTab('my-venture');
        } catch (err: any) {
            console.error(err);
            showToast(err?.message || 'Error al enviar registro de emprendimiento', 'error');
        } finally {
            setIsSubmittingVenture(false);
        }
    };

    const handleUpdateVenture = async (data: Partial<Venture>) => {
        await updateVentureMutation.mutateAsync(data);
    };

    const handleShareVenture = (v: Venture) => {
        const shareUrl = `${window.location.origin}/shop?venture=${v.id}`;
        if (navigator.share) {
            navigator.share({
                title: v.name,
                text: `Conoce la tienda de "${v.name}" en el Mercado de Monte de Sión`,
                url: shareUrl
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareUrl);
            showToast('¡Enlace de la tienda copiado!', 'success');
        }
    };

    const content = (
        <div className="fixed inset-0 z-[99999] bg-[#0f0d08] text-white w-screen h-[100dvh] overflow-y-auto flex flex-col justify-between select-none animate-in fade-in duration-300">
            {/* Top Toolbar Navigation Header */}
            <div className="px-6 pt-6 pb-4 bg-black/45 backdrop-blur-md border-b border-white/10 flex items-center justify-between flex-none">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/')}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">Comunidad Sion</span>
                        <h2 className="text-base font-serif font-bold">Mercado de Emprendedores</h2>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowOnboarding(true)}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined">help</span>
                    </button>
                </div>
            </div>

            {/* Main Tabs Switcher */}
            <div className="px-6 pt-5 flex-none max-w-md mx-auto w-full">
                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                    {[
                        { id: 'products', label: 'Productos', icon: 'shopping_bag' },
                        { id: 'ventures', label: 'Tiendas', icon: 'store' },
                        { id: 'my-venture', label: 'Mi Negocio', icon: 'inventory_2' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setSelectedVentureCatalog(null);
                            }}
                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${activeTab === tab.id
                                ? 'bg-brand-primary text-brand-obsidian font-black shadow-md'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Pills & Search */}
            {activeTab !== 'my-venture' && !selectedVentureCatalog && (
                <div className="px-6 pt-5 space-y-3 flex-none max-w-xl mx-auto w-full">
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/40 group-focus-within:text-brand-primary transition-colors">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar productos, servicios o emprendedores..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all text-white placeholder:text-white/30"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {SHOP_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${activeCategory === cat
                                    ? 'bg-brand-primary text-brand-obsidian border-brand-primary'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Scrollable Center Body Area */}
            <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full custom-scrollbar">

                {/* VENTURE CUSTOM CATALOG VIEW */}
                {selectedVentureCatalog ? (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Custom Portal Header Cover */}
                        <div className="bg-white/5 rounded-3xl border border-white/10 shadow-xl overflow-hidden relative">
                            {/* Banner Carousel or nice gradient fallback */}
                            {selectedVentureCatalog.carousel_images && selectedVentureCatalog.carousel_images.length > 0 ? (
                                <div className="h-48 md:h-64 w-full relative overflow-hidden bg-black">
                                    <img
                                        src={selectedVentureCatalog.carousel_images[activeSlide]}
                                        className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                                        alt="Banner Rotativo"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d08] via-black/40 to-transparent" />
                                    {selectedVentureCatalog.carousel_images.length > 1 && (
                                        <div className="absolute bottom-3 right-4 flex gap-1.5 z-15">
                                            {selectedVentureCatalog.carousel_images.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full transition-all ${i === activeSlide ? 'bg-brand-primary w-4' : 'bg-white/40'}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-24 w-full bg-gradient-to-r from-brand-primary/20 to-emerald-500/10" />
                            )}

                            <div className="p-6 relative">
                                <button
                                    onClick={() => setSelectedVentureCatalog(null)}
                                    className="mb-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white"
                                >
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                    Volver
                                </button>

                                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                                        <img
                                            src={selectedVentureCatalog.logo_url}
                                            alt={selectedVentureCatalog.name}
                                            className="w-20 h-20 rounded-2xl object-cover border-2 shadow-lg -mt-12 relative z-10"
                                            style={{ borderColor: selectedVentureCatalog.theme_color || '#ffb700' }}
                                        />
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                                                {selectedVentureCatalog.category}
                                            </span>
                                            <h2 className="text-2xl font-serif font-black flex items-center gap-1.5 justify-center md:justify-start">
                                                {selectedVentureCatalog.name}
                                                <span className="material-symbols-outlined text-emerald-400 fill-1 text-xl">verified</span>
                                            </h2>
                                            <p className="text-xs text-white/70 max-w-lg mt-1">
                                                {selectedVentureCatalog.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button
                                            onClick={() => handleShareVenture(selectedVentureCatalog)}
                                            className="flex-1 md:flex-none px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5"
                                        >
                                            <span className="material-symbols-outlined text-sm">share</span>
                                            Compartir
                                        </button>
                                        <button
                                            onClick={() => {
                                                let cleanNumber = selectedVentureCatalog.whatsapp_number.replace(/\D/g, '');
                                                if (!cleanNumber.startsWith('54')) cleanNumber = '54' + cleanNumber;
                                                const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(`¡Hola! Te contacto desde el Mercado Monte de Sión.`)}`;
                                                window.open(url, '_blank');
                                            }}
                                            className="flex-1 md:flex-none px-5 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5"
                                        >
                                            <span className="material-symbols-outlined text-sm">chat</span>
                                            WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Productos Disponibles</h3>
                            {sortedProducts.filter(p => p.venture_id === selectedVentureCatalog.id).length === 0 ? (
                                <div className="py-16 text-center opacity-40 border border-dashed border-white/10 rounded-3xl">
                                    <p className="text-xs font-bold uppercase tracking-widest">Esta tienda aún no tiene productos publicados.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
                                    {sortedProducts
                                        .filter(p => p.venture_id === selectedVentureCatalog.id)
                                        .map(product => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                onSelect={setSelectedProduct}
                                                onAddToCart={handleAddToCart}
                                            />
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* TAB 1: PRODUCTS CATALOG */}
                        {activeTab === 'products' && (
                            <div className="space-y-6">
                                {/* Compact Quick Sorting Dropdown */}
                                <div className="flex items-center justify-between gap-2 px-1">
                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">
                                        Productos ({sortedProducts.length})
                                    </span>
                                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                                        <span className="material-symbols-outlined text-xs text-brand-primary">swap_vert</span>
                                        <select
                                            value={sortBy}
                                            onChange={e => setSortBy(e.target.value as any)}
                                            className="bg-transparent text-[10px] font-black uppercase tracking-wider text-white outline-none cursor-pointer"
                                        >
                                            <option value="destacados" className="bg-[#0f0d08]">Destacados Sión</option>
                                            <option value="recientes" className="bg-[#0f0d08]">Más Recientes</option>
                                            <option value="precio_asc" className="bg-[#0f0d08]">Menor Precio</option>
                                            <option value="precio_desc" className="bg-[#0f0d08]">Mayor Precio</option>
                                        </select>
                                    </div>
                                </div>

                                {isLoadingProducts ? (
                                    <div className="py-24 flex flex-col items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Cargando catálogo...</span>
                                    </div>
                                ) : sortedProducts.length === 0 ? (
                                    <div className="py-24 text-center border border-dashed border-white/10 rounded-[2.5rem] p-8 max-w-md mx-auto">
                                        <h3 className="text-lg font-serif font-bold text-white mb-1">
                                            No hay productos disponibles
                                        </h3>
                                        <p className="text-xs text-white/50">
                                            Intenta cambiando la categoría o término de búsqueda.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
                                        {sortedProducts.map(product => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                onSelect={setSelectedProduct}
                                                onAddToCart={handleAddToCart}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: VENTURES DIRECTORY */}
                        {activeTab === 'ventures' && (
                            <div>
                                {isLoadingVentures ? (
                                    <div className="py-24 flex flex-col items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Cargando emprendimientos...</span>
                                    </div>
                                ) : sortedVentures.length === 0 ? (
                                    <div className="py-24 text-center border border-dashed border-white/10 rounded-[2.5rem] p-8 max-w-md mx-auto">
                                        <h3 className="text-lg font-serif font-bold text-white mb-1">
                                            No se encontraron emprendimientos
                                        </h3>
                                        <p className="text-xs text-white/50">
                                            Sé el primero en registrar tu emprendimiento.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {sortedVentures.map(v => (
                                            <div
                                                key={v.id}
                                                onClick={() => setSelectedVentureCatalog(v)}
                                                className="group bg-white/5 rounded-3xl p-6 border border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
                                                style={{ borderTop: `4px solid ${v.theme_color || '#ffb700'}` }}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <img
                                                            src={v.logo_url}
                                                            alt={v.name}
                                                            className="w-16 h-16 rounded-2xl object-cover border shadow-md shrink-0"
                                                            style={{ borderColor: v.theme_color || '#ffb700' }}
                                                        />
                                                        <div className="min-w-0">
                                                            <span className="inline-block text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: v.theme_color || '#ffb700' }}>
                                                                {v.category}
                                                            </span>
                                                            <h3 className="font-serif font-bold text-xl text-white truncate flex items-center gap-1">
                                                                {v.name}
                                                                <span className="material-symbols-outlined text-emerald-400 fill-1 text-base shrink-0">verified</span>
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 line-clamp-3 leading-relaxed mb-6 font-medium">
                                                        {v.description}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            let cleanNumber = v.whatsapp_number.replace(/\D/g, '');
                                                            if (!cleanNumber.startsWith('54')) cleanNumber = '54' + cleanNumber;
                                                            const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(`¡Hola! Te contacto desde el Mercado Monte de Sión.`)}`;
                                                            window.open(url, '_blank');
                                                        }}
                                                        className="flex-1 py-3 bg-emerald-500/20 text-emerald-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">chat</span>
                                                        WhatsApp
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShareVenture(v);
                                                        }}
                                                        className="w-11 h-11 bg-white/5 text-white/70 hover:text-white rounded-xl border border-white/10 flex items-center justify-center transition-all"
                                                        title="Compartir Emprendimiento"
                                                    >
                                                        <span className="material-symbols-outlined text-base">share</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: MY VENTURE PANEL */}
                        {activeTab === 'my-venture' && (
                            <MyVenturePanel
                                user={user}
                                myVenture={myVenture || null}
                                userVentures={userVentures}
                                selectedVentureMode={selectedVentureMode}
                                setSelectedVentureMode={setSelectedVentureMode}
                                myProducts={myProducts}
                                isLoadingVenture={isLoadingMyVenture}
                                isLoadingProducts={isLoadingMyProducts}
                                onOpenRegisterModal={() => setIsRegisteringVenture(true)}
                                onUpdateVenture={handleUpdateVenture}
                                onSaveProduct={async (data, file) => {
                                    await saveProductMutation.mutateAsync(data);
                                }}
                                onDeleteProduct={async (id) => {
                                    await deleteProductMutation.mutateAsync(id);
                                }}
                                uploadImage={uploadImage}
                                triggerToast={(msg) => showToast(msg, 'info')}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Overlays & Modals */}
            {showOnboarding && (
                <ShopOnboarding onFinish={finishOnboarding} />
            )}

            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={handleAddToCart}
                    triggerToast={(msg) => showToast(msg, 'info')}
                />
            )}

            {isRegisteringVenture && (
                <VentureRegisterScreen
                    onClose={() => setIsRegisteringVenture(false)}
                    onSubmit={handleRegisterVenture}
                    isSubmitting={isSubmittingVenture}
                    uploadImage={uploadImage}
                />
            )}

            {/* Cart Order Modal */}
            {isCartOpen && (
                <CartOrderModal
                    cart={cart}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    onRemoveItem={handleRemoveCartItem}
                    onClearCart={handleClearCart}
                    onClose={() => setIsCartOpen(false)}
                />
            )}
        </div>
    );

    return createPortal(content, document.body);
};

export default ShopView;
