import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Venture, Product } from '../../types';
import { ProductFormScreen } from './ProductFormScreen';
import { SmartImage } from '../ui/SmartImage';

interface MyVenturePanelProps {
    user: any;
    myVenture: Venture | null;
    userVentures?: { personal: Venture | null; official: Venture | null };
    selectedVentureMode?: 'personal' | 'official';
    setSelectedVentureMode?: (mode: 'personal' | 'official') => void;
    myProducts: Product[];
    isLoadingVenture: boolean;
    isLoadingProducts: boolean;
    onOpenRegisterModal: () => void;
    onUpdateVenture: (data: Partial<Venture>) => Promise<void>;
    onSaveProduct: (productData: Partial<Product>, imageFile: File | null) => Promise<void>;
    onDeleteProduct: (productId: string) => Promise<void>;
    uploadImage: (file: File) => Promise<string | null>;
    triggerToast?: (msg: string) => void;
}

interface FinancialRecord {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    date: string;
}

export const MyVenturePanel: React.FC<MyVenturePanelProps> = ({
    user,
    myVenture,
    userVentures,
    selectedVentureMode = 'personal',
    setSelectedVentureMode,
    myProducts,
    isLoadingVenture,
    isLoadingProducts,
    onOpenRegisterModal,
    onUpdateVenture,
    onSaveProduct,
    onDeleteProduct,
    uploadImage,
    triggerToast
}) => {
    const [subTab, setSubTab] = useState<'products' | 'analytics' | 'customize' | 'edit_profile'>('products');
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSavingProduct, setIsSavingProduct] = useState(false);
    const [pendingVentureModeSwitch, setPendingVentureModeSwitch] = useState<'personal' | 'official' | null>(null);

    // Personalization State
    const [themeColor, setThemeColor] = useState(myVenture?.theme_color || '#ffb700');
    const [carouselImages, setCarouselImages] = useState<string[]>(myVenture?.carousel_images || []);
    const [isUpdatingStyle, setIsUpdatingStyle] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    // Edit Profile State
    const [profileForm, setProfileForm] = useState({
        name: myVenture?.name || '',
        description: myVenture?.description || '',
        logo_url: myVenture?.logo_url || '',
        whatsapp_number: myVenture?.whatsapp_number || '',
        bank_alias: myVenture?.bank_alias || '',
        bank_cbu: myVenture?.bank_cbu || '',
        instagram_handle: myVenture?.instagram_handle || ''
    });
    const [profileLogoFile, setProfileLogoFile] = useState<File | null>(null);
    const [profileLogoPreview, setProfileLogoPreview] = useState<string | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Financial Tools State (Local Storage)
    const [financials, setFinancials] = useState<FinancialRecord[]>(() => {
        const saved = localStorage.getItem(`venture_finances_${myVenture?.id}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [newAmount, setNewAmount] = useState<number>(0);
    const [newDesc, setNewDesc] = useState<string>('');
    const [newType, setNewType] = useState<'income' | 'expense'>('income');

    useEffect(() => {
        if (myVenture?.id) {
            localStorage.setItem(`venture_finances_${myVenture.id}`, JSON.stringify(financials));
        }
    }, [financials, myVenture?.id]);

    useEffect(() => {
        if (myVenture) {
            setThemeColor(myVenture.theme_color || '#ffb700');
            setCarouselImages(myVenture.carousel_images || []);
            setProfileForm({
                name: myVenture.name || '',
                description: myVenture.description || '',
                logo_url: myVenture.logo_url || '',
                whatsapp_number: myVenture.whatsapp_number || '',
                bank_alias: myVenture.bank_alias || '',
                bank_cbu: myVenture.bank_cbu || '',
                instagram_handle: myVenture.instagram_handle || ''
            });
        }
    }, [myVenture]);

    const colors = [
        { code: '#ffb700', label: 'Dorado' },
        { code: '#10b981', label: 'Esmeralda' },
        { code: '#3b82f6', label: 'Azul' },
        { code: '#a855f7', label: 'Morado' },
        { code: '#f97316', label: 'Naranja' },
        { code: '#ef4444', label: 'Rojo' },
        { code: '#6b7280', label: 'Plata' }
    ];

    if (!user) {
        return (
            <div className="py-24 text-center px-6">
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">storefront</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-2">
                    Inicia Sesión para Emprender
                </h3>
                <p className="text-sm text-brand-obsidian/50 dark:text-white/50 max-w-md mx-auto mb-6">
                    Regístrate en la aplicación para publicar tu propio emprendimiento y ofrecer tus productos a la comunidad.
                </p>
            </div>
        );
    }

    if (isLoadingVenture) {
        return (
            <div className="py-24 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-50">Cargando tu emprendimiento...</span>
            </div>
        );
    }

    // STATE 1: NO VENTURE REGISTERED YET
    if (!myVenture) {
        return (
            <div className="py-16 px-6 max-w-2xl mx-auto text-center">
                <div className="bg-gradient-to-br from-brand-primary/10 via-amber-500/5 to-transparent p-10 rounded-[3rem] border border-brand-primary/20 shadow-2xl">
                    <div className="w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center text-brand-obsidian mx-auto mb-6 shadow-xl shadow-brand-primary/20">
                        <span className="material-symbols-outlined text-5xl">storefront</span>
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white mb-3">
                        ¿Tienes un Emprendimiento?
                    </h3>
                    <p className="text-sm text-brand-obsidian/60 dark:text-white/60 leading-relaxed mb-8">
                        Únete al **Mercado Monte de Sión**. Puedes publicar tus productos o servicios, agregar tu WhatsApp y CBU para recibir pedidos y transferencias directamente de los hermanos de la iglesia.
                    </p>
                    <button
                        onClick={onOpenRegisterModal}
                        className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                    >
                        <span className="material-symbols-outlined text-base">add_business</span>
                        Registrar Mi Emprendimiento
                    </button>
                </div>
            </div>
        );
    }

    // STATE 2: PENDING APPROVAL
    if (myVenture.status === 'pending') {
        return (
            <div className="py-16 px-6 max-w-xl mx-auto text-center">
                <div className="bg-amber-500/10 border border-amber-500/30 p-10 rounded-[3rem] space-y-6 shadow-xl">
                    <div className="w-20 h-20 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
                        <span className="material-symbols-outlined text-4xl">hourglass_top</span>
                    </div>
                    <div>
                        <span className="inline-block px-4 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[10px] uppercase tracking-widest mb-3">
                            En Revisión
                        </span>
                        <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-2">
                            "{myVenture.name}"
                        </h3>
                        <p className="text-xs text-brand-obsidian/60 dark:text-white/60 leading-relaxed">
                            Tu solicitud fue recibida con éxito y está siendo evaluada por los pastores y moderadores. Tan pronto como sea aprobada, podrás comenzar a subir tus productos.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // STATE 3: REJECTED
    if (myVenture.status === 'rejected') {
        return (
            <div className="py-16 px-6 max-w-xl mx-auto text-center">
                <div className="bg-rose-500/10 border border-rose-500/30 p-10 rounded-[3rem] space-y-6 shadow-xl">
                    <div className="w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <span className="material-symbols-outlined text-4xl">cancel</span>
                    </div>
                    <div>
                        <span className="inline-block px-4 py-1 rounded-full bg-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-widest mb-3">
                            Solicitud No Aprobada
                        </span>
                        <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-2">
                            "{myVenture.name}"
                        </h3>
                        <p className="text-xs text-brand-obsidian/60 dark:text-white/60 leading-relaxed mb-6">
                            Tu solicitud no cumple por el momento con los requisitos de la tienda. Si tienes dudas, puedes consultar con un pastor o moderador.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Handlers
    const handleSaveProduct = async (productData: Partial<Product>, imageFile: File | null) => {
        try {
            setIsSavingProduct(true);
            await onSaveProduct(productData, imageFile);
            if (triggerToast) triggerToast(editingProduct ? 'Producto actualizado correctamente' : 'Producto publicado con éxito');
            setIsCreatingProduct(false);
            setEditingProduct(null);
        } catch (err: any) {
            console.error(err);
            alert(err?.message || 'Error al guardar producto');
        } finally {
            setIsSavingProduct(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
        try {
            await onDeleteProduct(id);
            if (triggerToast) triggerToast('Producto eliminado');
        } catch (err) {
            console.error(err);
            alert('Error al eliminar producto');
        }
    };

    const handleUpdateStyle = async () => {
        try {
            setIsUpdatingStyle(true);
            await onUpdateVenture({
                theme_color: themeColor,
                carousel_images: carouselImages
            });
            if (triggerToast) triggerToast('Estilo de tienda actualizado con éxito');
        } catch (err) {
            console.error(err);
            alert('Error al actualizar estilo de tienda');
        } finally {
            setIsUpdatingStyle(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSavingProfile(true);
            let logoUrl = profileForm.logo_url;
            if (profileLogoFile) {
                const uploaded = await uploadImage(profileLogoFile);
                if (uploaded) logoUrl = uploaded;
            }

            await onUpdateVenture({
                ...profileForm,
                logo_url: logoUrl
            });
            if (triggerToast) triggerToast('Perfil de emprendimiento actualizado');
            setSubTab('products');
        } catch (err: any) {
            console.error(err);
            alert(err?.message || 'Error al actualizar perfil');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAddCarouselImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (carouselImages.length >= 3) {
            alert('Puedes agregar un máximo de 3 imágenes al carrusel de tu tienda.');
            return;
        }

        try {
            setIsUploadingBanner(true);
            const url = await uploadImage(file);
            if (url) {
                const newList = [...carouselImages, url];
                setCarouselImages(newList);
                await onUpdateVenture({ carousel_images: newList });
                if (triggerToast) triggerToast('Imagen agregada al carrusel');
            }
        } catch (err) {
            console.error(err);
            alert('Error al subir imagen de carrusel');
        } finally {
            setIsUploadingBanner(false);
        }
    };

    const handleAddFinancial = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAmount || newAmount <= 0) return;
        const record: FinancialRecord = {
            id: Date.now().toString(),
            type: newType,
            amount: newAmount,
            description: newDesc || (newType === 'income' ? 'Venta' : 'Gasto'),
            date: new Date().toLocaleDateString('es-AR')
        };
        setFinancials(prev => [record, ...prev]);
        setNewAmount(0);
        setNewDesc('');
        if (triggerToast) triggerToast(newType === 'income' ? 'Ingreso registrado' : 'Egreso registrado');
    };

    const downloadQRCode = () => {
        if (!myVenture) return;
        const canvas = document.getElementById('venture-qr-canvas') as HTMLCanvasElement;
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = `QR_Tienda_${myVenture.name.replace(/\s+/g, '_')}.png`;
            a.click();
            if (triggerToast) triggerToast('¡Código QR descargado!');
        }
    };

    const handleConfirmModeSwitch = () => {
        if (!pendingVentureModeSwitch) return;
        const targetMode = pendingVentureModeSwitch;
        setPendingVentureModeSwitch(null);
        if (setSelectedVentureMode) {
            setSelectedVentureMode(targetMode);
        }
        if (targetMode === 'personal' && !userVentures?.personal) {
            onOpenRegisterModal();
        } else if (triggerToast) {
            triggerToast(`Modo cambiado a ${targetMode === 'official' ? 'Tienda Oficial' : 'Mi Emprendimiento'}`);
        }
    };

    const totalIncome = financials.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
    const totalExpense = financials.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const estimatedInventoryValue = myProducts.reduce((sum, p) => sum + p.price, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-300">

            {/* Venture Profile Banner */}
            <div className="bg-white/5 p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 text-center md:text-left flex-col sm:flex-row">
                    <img
                        src={myVenture.logo_url}
                        alt={myVenture.name}
                        className="w-20 h-20 rounded-2xl object-cover border-2 shadow-md"
                        style={{ borderColor: themeColor }}
                    />
                    <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                {myVenture.category}
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight flex items-center justify-center sm:justify-start gap-2">
                            {myVenture.name}
                            <span className="material-symbols-outlined text-emerald-400 fill-1 text-2xl" title="Tienda Verificada">verified</span>
                        </h2>
                        <p className="text-xs text-white/60 line-clamp-1 mt-1 font-medium">
                            {myVenture.description}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setSubTab('edit_profile')}
                        className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 flex-1 md:flex-none"
                    >
                        <span className="material-symbols-outlined text-base">edit</span>
                        Editar Perfil
                    </button>
                    <button
                        onClick={() => { setEditingProduct(null); setIsCreatingProduct(true); }}
                        className="bg-brand-primary text-brand-obsidian px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Publicar Item
                    </button>
                </div>
            </div>

            {/* Sub Tabs Navigation */}
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 max-w-xl mx-auto overflow-x-auto no-scrollbar">
                {[
                    { id: 'products', label: 'Mis Productos', icon: 'inventory_2' },
                    { id: 'analytics', label: 'Herramientas & Finanzas', icon: 'analytics' },
                    { id: 'customize', label: 'Estilo & Banners', icon: 'palette' },
                    { id: 'edit_profile', label: 'Datos Perfil', icon: 'settings' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setSubTab(t.id as any)}
                        className={`flex-1 py-3 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${subTab === t.id
                                ? 'bg-brand-primary text-brand-obsidian shadow-md font-black'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* SUB TAB 1: PRODUCTS GRID */}
            {subTab === 'products' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase text-white/40 tracking-[0.3em]">
                            Mis Productos Publicados ({myProducts.length})
                        </h3>
                    </div>

                    {isLoadingProducts ? (
                        <div className="py-16 text-center opacity-50">
                            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">Cargando tus productos...</span>
                        </div>
                    ) : myProducts.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed border-white/10 rounded-[2.5rem] p-8">
                            <span className="material-symbols-outlined text-4xl text-white/30 mb-2">inventory_2</span>
                            <h4 className="text-lg font-serif font-bold text-white">Aún no has publicado productos</h4>
                            <p className="text-xs text-white/50 mt-1 mb-4">Comienza publicando tu primer producto para la comunidad.</p>
                            <button
                                onClick={() => { setEditingProduct(null); setIsCreatingProduct(true); }}
                                className="bg-brand-primary text-brand-obsidian px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                            >
                                + Publicar Producto
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
                            {myProducts.map(product => (
                                <div
                                    key={product.id}
                                    className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-sm flex flex-col justify-between"
                                >
                                    <div className="aspect-[4/5] bg-black/40 relative overflow-hidden">
                                        <SmartImage
                                            src={product.images?.[0] || ''}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div
                                            className="absolute top-3 right-3 text-brand-obsidian font-black text-xs px-3 py-1 rounded-xl shadow-md"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            ${product.price.toLocaleString('es-AR')}
                                        </div>
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-serif font-bold text-sm text-white line-clamp-1 mb-1">
                                                {product.title}
                                            </h4>
                                        </div>

                                        <div className="pt-3 mt-3 border-t border-white/10 flex gap-2">
                                            <button
                                                onClick={() => { setEditingProduct(product); setIsCreatingProduct(true); }}
                                                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* SUB TAB 2: ANALYTICS & FINANCIAL TOOLS */}
            {subTab === 'analytics' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-3xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Total Ingresos</span>
                            <h3 className="text-2xl font-black text-emerald-300 mt-1">${totalIncome.toLocaleString('es-AR')}</h3>
                        </div>

                        <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-3xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Total Egresos</span>
                            <h3 className="text-2xl font-black text-rose-300 mt-1">${totalExpense.toLocaleString('es-AR')}</h3>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-3xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Balance Neto</span>
                            <h3 className="text-2xl font-black text-amber-300 mt-1">${netBalance.toLocaleString('es-AR')}</h3>
                        </div>
                    </div>

                    {/* Additional Business Insights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 text-brand-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">inventory</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Inventario Estimado</span>
                                <h4 className="text-xl font-bold text-white">${estimatedInventoryValue.toLocaleString('es-AR')} ARS</h4>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Ítems Activos</span>
                                <h4 className="text-xl font-bold text-white">{myProducts.length} Productos</h4>
                            </div>
                        </div>
                    </div>

                    {/* Financial Tracker Input */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">payments</span>
                            Registrar Transacción (Ingreso / Egreso)
                        </h4>

                        <form onSubmit={handleAddFinancial} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <select
                                value={newType}
                                onChange={e => setNewType(e.target.value as any)}
                                className="bg-black/40 p-3.5 rounded-xl border border-white/10 font-bold text-xs outline-none text-white"
                            >
                                <option value="income">Ingreso (+)</option>
                                <option value="expense">Egreso (-)</option>
                            </select>

                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="Monto $"
                                value={newAmount || ''}
                                onChange={e => setNewAmount(Number(e.target.value))}
                                className="bg-black/40 p-3.5 rounded-xl border border-white/10 font-bold text-xs outline-none text-white placeholder:text-white/30"
                            />

                            <input
                                type="text"
                                placeholder="Descripción (Ej: Venta torta / Insumos)"
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                className="bg-black/40 p-3.5 rounded-xl border border-white/10 font-bold text-xs outline-none text-white placeholder:text-white/30 sm:col-span-2"
                            />

                            <button
                                type="submit"
                                className="sm:col-span-4 py-3.5 bg-brand-primary text-brand-obsidian font-black text-xs uppercase tracking-widest rounded-xl shadow-md hover:scale-[1.01] transition-all"
                            >
                                Guardar Transacción
                            </button>
                        </form>

                        {/* Recent Transactions List */}
                        {financials.length > 0 && (
                            <div className="pt-4 border-t border-white/10 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Historial Reciente</span>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    {financials.map(f => (
                                        <div key={f.id} className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className={`material-symbols-outlined text-base ${f.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {f.type === 'income' ? 'add_circle' : 'remove_circle'}
                                                </span>
                                                <span className="font-medium">{f.description}</span>
                                                <span className="text-[9px] opacity-40">({f.date})</span>
                                            </div>
                                            <span className={`font-mono font-bold ${f.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {f.type === 'income' ? '+' : '-'}${f.amount.toLocaleString('es-AR')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SUB TAB 3: CUSTOMIZE STYLE & BANNERS */}
            {subTab === 'customize' && (
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 text-brand-primary">
                        <span className="material-symbols-outlined text-lg">palette</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Personalizar Estilo & Banners</span>
                    </div>

                    {/* Color Picker */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div className="space-y-1">
                            <p className="text-xs font-bold">Color de Marca Preferido</p>
                            <p className="text-[10px] opacity-50">Elige un color para destacar tus productos y perfilar tu tienda.</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {colors.map(col => (
                                <button
                                    key={col.code}
                                    onClick={() => setThemeColor(col.code)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all relative ${themeColor === col.code ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    style={{ backgroundColor: col.code }}
                                    title={col.label}
                                >
                                    {themeColor === col.code && (
                                        <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-white text-xs font-bold">check</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleUpdateStyle}
                            disabled={isUpdatingStyle}
                            className="px-6 py-3 bg-brand-primary text-brand-obsidian rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            {isUpdatingStyle ? 'Guardando...' : 'Aplicar Estilo'}
                        </button>
                    </div>

                    {/* Banner Carousel customizer */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <p className="text-xs font-bold">Carrusel de Banners para Tu Tienda ({carouselImages.length}/3)</p>
                                <p className="text-[10px] opacity-50">Sube hasta 3 banners publicitarios que rotarán al inicio de tu catálogo.</p>
                            </div>

                            {carouselImages.length < 3 && (
                                <div>
                                    <button
                                        onClick={() => document.getElementById('banner-carousel-file-input')?.click()}
                                        disabled={isUploadingBanner}
                                        className="px-4 py-2.5 bg-brand-primary text-brand-obsidian hover:scale-105 active:scale-95 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                                    >
                                        <span className="material-symbols-outlined text-sm">upload</span>
                                        {isUploadingBanner ? 'Subiendo...' : 'Subir Banner'}
                                    </button>
                                    <input
                                        id="banner-carousel-file-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAddCarouselImage}
                                    />
                                </div>
                            )}
                        </div>

                        {carouselImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 pt-2">
                                {carouselImages.map((url, idx) => (
                                    <div key={idx} className="aspect-video rounded-xl overflow-hidden bg-white/5 relative group border border-white/10 shadow-md">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => {
                                                const newList = carouselImages.filter((_, i) => i !== idx);
                                                setCarouselImages(newList);
                                                onUpdateVenture({ carousel_images: newList });
                                            }}
                                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-500/80 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SUB TAB 4: EDIT PROFILE DATA */}
            {subTab === 'edit_profile' && (
                <form onSubmit={handleSaveProfile} className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-5 animate-in fade-in duration-300 max-w-xl mx-auto">
                    <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">edit</span>
                        Editar Perfil del Emprendimiento
                    </h4>

                    {/* Dual Mode Switcher for Pastors/Admins */}
                    {(user.role === 'PASTOR' || user.role === 'SUPER_ADMIN') && (
                        <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">shield_person</span>
                                Conmutar Modo de Gestión (Pastores / Admin)
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPendingVentureModeSwitch('official')}
                                    className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${selectedVentureMode === 'official'
                                            ? 'bg-amber-500 text-brand-obsidian shadow-md'
                                            : 'bg-black/40 text-white/60 hover:bg-black/60'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    Tienda Oficial
                                </button>

                                {userVentures?.personal ? (
                                    <button
                                        type="button"
                                        onClick={() => setPendingVentureModeSwitch('personal')}
                                        className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${selectedVentureMode === 'personal'
                                                ? 'bg-brand-primary text-brand-obsidian shadow-md'
                                                : 'bg-black/40 text-white/60 hover:bg-black/60'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        Mi Negocio
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setPendingVentureModeSwitch('personal')}
                                        className="py-2.5 px-3 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">add_business</span>
                                        + Registrar Mío
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* QR Code Generator Section */}
                    {myVenture && (
                        <div className="bg-black/30 p-5 rounded-2xl border border-white/10 space-y-4 text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center justify-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">qr_code_2</span>
                                Código QR Promocional de Tu Tienda
                            </span>
                            <p className="text-[10px] text-white/60">
                                Imprime este código QR para colocarlo en tus folletos, tarjetas o puesto físico. Al escanearlo, tus clientes entrarán directo a tu catálogo.
                            </p>
                            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl w-48 h-48 mx-auto shadow-xl">
                                <QRCodeCanvas
                                    id="venture-qr-canvas"
                                    value={`${window.location.origin}/shop?venture=${myVenture.id}`}
                                    size={160}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="H"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={downloadQRCode}
                                className="w-full py-3 bg-brand-primary text-brand-obsidian rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
                            >
                                <span className="material-symbols-outlined text-sm">download</span>
                                Descargar Código QR (PNG)
                            </button>
                        </div>
                    )}

                    {/* Logo Picker */}
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => document.getElementById('edit-profile-logo-input')?.click()}
                            className="w-20 h-20 rounded-2xl border-2 border-dashed border-brand-primary/40 overflow-hidden cursor-pointer relative group flex items-center justify-center bg-black/40"
                        >
                            {profileLogoPreview || profileForm.logo_url ? (
                                <img src={profileLogoPreview || profileForm.logo_url} className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-2xl text-brand-primary">add_a_photo</span>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-black uppercase text-white">
                                Cambiar
                            </div>
                        </div>
                        <input
                            id="edit-profile-logo-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setProfileLogoFile(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => setProfileLogoPreview(reader.result as string);
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <div>
                            <span className="text-xs font-bold text-white block">Foto de Perfil / Logo</span>
                            <span className="text-[10px] text-white/50">Haz clic para actualizar la imagen de tu negocio.</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-white/50 mb-1">Nombre Comercial</label>
                        <input
                            type="text"
                            required
                            value={profileForm.name}
                            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full bg-black/40 p-3.5 rounded-xl font-bold text-xs border border-white/10 outline-none text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-white/50 mb-1">Descripción Breve</label>
                        <textarea
                            rows={3}
                            required
                            value={profileForm.description}
                            onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                            className="w-full bg-black/40 p-3.5 rounded-xl font-medium text-xs border border-white/10 outline-none text-white resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-white/50 mb-1">WhatsApp de Contacto</label>
                            <input
                                type="text"
                                required
                                value={profileForm.whatsapp_number}
                                onChange={e => setProfileForm({ ...profileForm, whatsapp_number: e.target.value })}
                                className="w-full bg-black/40 p-3.5 rounded-xl font-bold text-xs border border-white/10 outline-none text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-white/50 mb-1">Instagram (@usuario)</label>
                            <input
                                type="text"
                                value={profileForm.instagram_handle || ''}
                                onChange={e => setProfileForm({ ...profileForm, instagram_handle: e.target.value })}
                                className="w-full bg-black/40 p-3.5 rounded-xl font-bold text-xs border border-white/10 outline-none text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-white/50 mb-1">Alias CBU / CVU</label>
                            <input
                                type="text"
                                value={profileForm.bank_alias || ''}
                                onChange={e => setProfileForm({ ...profileForm, bank_alias: e.target.value })}
                                className="w-full bg-black/40 p-3.5 rounded-xl font-mono font-bold text-xs border border-white/10 outline-none text-emerald-300"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-white/50 mb-1">Número de CBU / CVU</label>
                            <input
                                type="text"
                                value={profileForm.bank_cbu || ''}
                                onChange={e => setProfileForm({ ...profileForm, bank_cbu: e.target.value })}
                                className="w-full bg-black/40 p-3.5 rounded-xl font-mono font-bold text-xs border border-white/10 outline-none text-emerald-300"
                            />
                        </div>
                    </div>

                    <div className="pt-3 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setSubTab('products')}
                            className="px-5 py-3 text-xs font-bold text-white/60 uppercase"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="px-7 py-3.5 bg-brand-primary text-brand-obsidian rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all"
                        >
                            {isSavingProfile ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            )}

            {/* Confirmation Modal for Mode Switch */}
            {pendingVentureModeSwitch && (
                <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-[#181611] border border-white/15 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl">
                        <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-3xl">help_outline</span>
                        </div>
                        <h4 className="text-lg font-serif font-bold text-white">¿Cambiar Modo de Gestión?</h4>
                        <p className="text-xs text-white/70 leading-relaxed font-normal">
                            Vas a conmutar a gestionar{' '}
                            <span className="font-bold text-amber-300">
                                {pendingVentureModeSwitch === 'official' ? 'la Tienda Oficial Sión' : 'tu Emprendimiento Personal'}
                            </span>
                            . Puedes regresar en cualquier momento.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setPendingVentureModeSwitch(null)}
                                className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-bold uppercase hover:bg-white/20 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmModeSwitch}
                                className="flex-1 py-3 rounded-xl bg-amber-500 text-brand-obsidian text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Product Form Screen */}
            {isCreatingProduct && (
                <ProductFormScreen
                    initialData={editingProduct || {}}
                    onClose={() => { setIsCreatingProduct(false); setEditingProduct(null); }}
                    onSave={handleSaveProduct}
                    isSaving={isSavingProduct}
                    uploadImage={uploadImage}
                />
            )}
        </div>
    );
};
