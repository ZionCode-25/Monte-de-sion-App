import React, { useState, useEffect } from 'react';
import { useShop, SHOP_CATEGORIES } from '../hooks/useShop';
import { ProductCard } from '../components/shop/ProductCard';
import { ProductDetailModal } from '../components/shop/ProductDetailModal';
import { VentureRegisterScreen } from '../components/shop/VentureRegisterScreen';
import { ShopOnboarding } from '../components/shop/ShopOnboarding';
import { MyVenturePanel } from '../components/shop/MyVenturePanel';
import { Product, Venture } from '../types';
import { useAuth } from '../components/context/AuthContext';
import { useToast } from '../components/context/ToastContext';
import { supabase } from '../lib/supabase';

export const ShopView: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'products' | 'ventures' | 'my-venture'>('products');
    const [activeCategory, setActiveCategory] = useState<string>('Todos');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isRegisteringVenture, setIsRegisteringVenture] = useState<boolean>(false);
    const [isSubmittingVenture, setIsSubmittingVenture] = useState<boolean>(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem('has_seen_shop_onboarding');
        if (!hasSeen) {
            setShowOnboarding(true);
        }
    }, []);

    const finishOnboarding = () => {
        localStorage.setItem('has_seen_shop_onboarding', 'true');
        setShowOnboarding(false);
    };

    const [selectedVentureCatalog, setSelectedVentureCatalog] = useState<Venture | null>(null);

    const {
        products,
        ventures,
        myVenture,
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

    // Shuffle products client-side for dynamic Mercado Libre-like presentation
    const shuffledProducts = React.useMemo(() => {
        if (!products || products.length === 0) return [];
        return [...products].sort(() => 0.5 - Math.random());
    }, [products]);

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
            // Fallback: Convert to Base64 data URL
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => resolve(reader.result as string);
            });
        }
    };

    // Handle Venture Registration Submission
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

    return (
        <div className="flex flex-col min-h-screen bg-brand-silk dark:bg-brand-obsidian pb-44 animate-reveal">

            {/* --- HERO HEADER --- */}
            <header className="relative h-80 w-full overflow-hidden rounded-b-[4rem] shadow-2xl">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2070&auto=format&fit=crop')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-obsidian via-brand-obsidian/50 to-transparent" />

                <div className="absolute bottom-10 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-5xl font-bold leading-none text-white tracking-tighter">
                            Tienda <br /><span className="gold-text-gradient italic">Monte de Sión</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <button
                            onClick={() => setShowOnboarding(true)}
                            className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 shadow-lg"
                            title="Ver tutorial de la tienda"
                        >
                            <span className="material-symbols-outlined text-xl">help</span>
                        </button>

                        <button
                            onClick={() => {
                                if (!user) {
                                    showToast('Inicia sesión para registrar tu emprendimiento', 'info');
                                    return;
                                    setSelectedVentureCatalog(null);
                                }
                                if (myVenture) {
                                    setActiveTab('my-venture');
                                    setSelectedVentureCatalog(null);
                                } else {
                                    setIsRegisteringVenture(true);
                                }
                            }}
                            className="bg-brand-primary text-brand-obsidian px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">storefront</span>
                            {myVenture ? 'Mi Emprendimiento' : 'Registrar Mi Emprendimiento'}
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MAIN NAVIGATION TABS & FILTERS --- */}
            <div className="px-6 pt-8 space-y-6">

                {/* Tabs Switcher */}
                <div className="flex p-1.5 bg-white dark:bg-brand-surface rounded-2xl border border-brand-obsidian/5 dark:border-white/5 shadow-md max-w-xl mx-auto">
                    {[
                        { id: 'products', label: 'Productos', icon: 'shopping_bag' },
                        { id: 'ventures', label: 'Emprendedores', icon: 'store' },
                        { id: 'my-venture', label: 'Mi Negocio', icon: 'inventory_2' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setSelectedVentureCatalog(null);
                            }}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                                    ? 'bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian shadow-lg'
                                    : 'text-brand-obsidian/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search & Category Filter (only for products & ventures tabs) */}
                {activeTab !== 'my-venture' && !selectedVentureCatalog && (
                    <div className="space-y-4">
                        {/* Search Input */}
                        <div className="relative w-full max-w-xl mx-auto group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-brand-obsidian/30 dark:text-white/30 group-focus-within:text-brand-primary transition-colors">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar productos, servicios o emprendedores..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-brand-surface pl-12 pr-4 py-3.5 rounded-2xl border border-brand-obsidian/5 dark:border-white/5 font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all shadow-sm"
                            />
                        </div>

                        {/* Category Pills */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 justify-start md:justify-center">
                            {SHOP_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${activeCategory === cat
                                            ? 'bg-brand-primary text-brand-obsidian border-brand-primary shadow-md shadow-brand-primary/10'
                                            : 'bg-white dark:bg-brand-surface border-brand-obsidian/5 dark:border-white/5 text-brand-obsidian/40 dark:text-white/40 hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- TAB CONTENT --- */}
            <div className="px-6 pt-8">

                {/* VENTURE CUSTOM CATALOG VIEW */}
                {selectedVentureCatalog ? (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Catalog Header */}
                        <div className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] border border-brand-obsidian/5 dark:border-white/5 shadow-xl relative overflow-hidden">
                            {/* Accent line using venture's custom theme_color */}
                            <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: selectedVentureCatalog.theme_color || '#ffb700' }} />

                            <button
                                onClick={() => setSelectedVentureCatalog(null)}
                                className="mb-6 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Volver a Tiendas
                            </button>

                            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
                                    <img
                                        src={selectedVentureCatalog.logo_url}
                                        alt={selectedVentureCatalog.name}
                                        className="w-24 h-24 rounded-3xl object-cover border-2 shadow-lg"
                                        style={{ borderColor: selectedVentureCatalog.theme_color || '#ffb700' }}
                                    />
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-center md:justify-start gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                {selectedVentureCatalog.category}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white leading-tight flex items-center gap-1.5 justify-center md:justify-start">
                                            {selectedVentureCatalog.name}
                                            <span className="material-symbols-outlined text-emerald-500 fill-1 text-2xl" title="Tienda Verificada">verified</span>
                                        </h2>
                                        <p className="text-sm text-brand-obsidian/70 dark:text-white/70 max-w-lg leading-relaxed pt-1">
                                            {selectedVentureCatalog.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                                    <button
                                        onClick={() => {
                                            let cleanNumber = selectedVentureCatalog.whatsapp_number.replace(/\D/g, '');
                                            if (!cleanNumber.startsWith('54')) cleanNumber = '54' + cleanNumber;
                                            const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(`¡Hola! Estoy viendo tu catálogo en la App Monte de Sión.`)}`;
                                            window.open(url, '_blank');
                                        }}
                                        className="px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">chat</span>
                                        WhatsApp
                                    </button>

                                    {selectedVentureCatalog.instagram_handle && (
                                        <button
                                            onClick={() => window.open(`https://instagram.com/${selectedVentureCatalog.instagram_handle?.replace('@', '')}`, '_blank')}
                                            className="px-6 py-3.5 bg-brand-silk dark:bg-white/5 border border-brand-obsidian/10 dark:border-white/10 hover:bg-gray-100 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-rose-500 text-sm">camera_alt</span>
                                            @{selectedVentureCatalog.instagram_handle.replace('@', '')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Venture's Products Grid */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 ml-2">Catálogo de Productos</h3>
                            {shuffledProducts.filter(p => p.venture_id === selectedVentureCatalog.id).length === 0 ? (
                                <div className="py-16 text-center opacity-50 border-2 border-dashed border-brand-obsidian/10 dark:border-white/10 rounded-[2.5rem]">
                                    <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                                    <p className="text-xs font-bold uppercase tracking-widest">Esta tienda aún no tiene productos publicados.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {shuffledProducts
                                        .filter(p => p.venture_id === selectedVentureCatalog.id)
                                        .map(product => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                onSelect={setSelectedProduct}
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
                            <div>
                                {isLoadingProducts ? (
                                    <div className="py-24 flex flex-col items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Cargando catálogo...</span>
                                    </div>
                                ) : shuffledProducts.length === 0 ? (
                                    <div className="py-24 text-center border-2 border-dashed border-brand-obsidian/10 dark:border-white/10 rounded-[3rem] p-8 max-w-md mx-auto">
                                        <span className="material-symbols-outlined text-5xl text-brand-obsidian/20 dark:text-white/20 mb-4">
                                            storefront
                                        </span>
                                        <h3 className="text-xl font-serif font-bold text-brand-obsidian dark:text-white mb-1">
                                            No hay productos disponibles
                                        </h3>
                                        <p className="text-xs text-brand-obsidian/50 dark:text-white/50">
                                            Intenta cambiando la categoría o término de búsqueda.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {shuffledProducts.map(product => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                onSelect={setSelectedProduct}
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
                                ) : ventures.length === 0 ? (
                                    <div className="py-24 text-center border-2 border-dashed border-brand-obsidian/10 dark:border-white/10 rounded-[3rem] p-8 max-w-md mx-auto">
                                        <span className="material-symbols-outlined text-5xl text-brand-obsidian/20 dark:text-white/20 mb-4">
                                            store
                                        </span>
                                        <h3 className="text-xl font-serif font-bold text-brand-obsidian dark:text-white mb-1">
                                            No se encontraron emprendimientos
                                        </h3>
                                        <p className="text-xs text-brand-obsidian/50 dark:text-white/50">
                                            Sé el primero en publicar tu emprendimiento en esta categoría.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {ventures.map(v => (
                                            <div
                                                key={v.id}
                                                onClick={() => setSelectedVentureCatalog(v)}
                                                className="group bg-white dark:bg-brand-surface rounded-[2rem] p-6 border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
                                                style={{ borderTop: `4px solid ${v.theme_color || '#ffb700'}` }}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <img
                                                            src={v.logo_url}
                                                            alt={v.name}
                                                            className="w-16 h-16 rounded-2xl object-cover border-2 shadow-md shrink-0"
                                                            style={{ borderColor: v.theme_color || '#ffb700' }}
                                                        />
                                                        <div className="min-w-0">
                                                            <span className="inline-block text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: v.theme_color || '#ffb700' }}>
                                                                {v.category}
                                                            </span>
                                                            <h3 className="font-serif font-bold text-xl text-brand-obsidian dark:text-white truncate flex items-center gap-1">
                                                                {v.name}
                                                                <span className="material-symbols-outlined text-emerald-500 fill-1 text-base shrink-0">verified</span>
                                                            </h3>
                                                            {v.owner_profile && (
                                                                <p className="text-xs opacity-60 line-clamp-1">
                                                                    Por: {v.owner_profile.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-brand-obsidian/70 dark:text-white/70 line-clamp-3 leading-relaxed mb-6 font-medium">
                                                        {v.description}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            let cleanNumber = v.whatsapp_number.replace(/\D/g, '');
                                                            if (!cleanNumber.startsWith('54')) cleanNumber = '54' + cleanNumber;
                                                            const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(`¡Hola! Te contacto desde la App Monte de Sión.`)}`;
                                                            window.open(url, '_blank');
                                                        }}
                                                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-md hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">chat</span>
                                                        WhatsApp
                                                    </button>
                                                    <div
                                                        className="w-11 h-11 rounded-xl bg-brand-silk dark:bg-white/5 border border-brand-obsidian/5 dark:border-white/5 flex items-center justify-center transition-all group-hover:scale-105"
                                                        style={{ color: v.theme_color || '#ffb700' }}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                    </div>
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

            {/* --- OVERLAYS & MODALS --- */}
            {showOnboarding && (
                <ShopOnboarding onFinish={finishOnboarding} />
            )}

            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
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
        </div>
    );
};

export default ShopView;
