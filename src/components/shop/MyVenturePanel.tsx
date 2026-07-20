import React, { useState } from 'react';
import { Venture, Product } from '../../types';
import { ProductFormModal } from './ProductFormModal';
import { SmartImage } from '../ui/SmartImage';

interface MyVenturePanelProps {
    user: any;
    myVenture: Venture | null;
    myProducts: Product[];
    isLoadingVenture: boolean;
    isLoadingProducts: boolean;
    onOpenRegisterModal: () => void;
    onSaveProduct: (productData: Partial<Product>, imageFile: File | null) => Promise<void>;
    onDeleteProduct: (productId: string) => Promise<void>;
    uploadImage: (file: File) => Promise<string | null>;
    triggerToast?: (msg: string) => void;
}

export const MyVenturePanel: React.FC<MyVenturePanelProps> = ({
    user,
    myVenture,
    myProducts,
    isLoadingVenture,
    isLoadingProducts,
    onOpenRegisterModal,
    onSaveProduct,
    onDeleteProduct,
    uploadImage,
    triggerToast
}) => {
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSavingProduct, setIsSavingProduct] = useState(false);

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

    // STATE 4: APPROVED VENTURE DASHBOARD
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

    return (
        <div className="space-y-10">

            {/* Venture Profile Banner */}
            <div className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] border border-brand-obsidian/5 dark:border-white/5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <img
                        src={myVenture.logo_url}
                        alt={myVenture.name}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-primary shadow-md"
                    />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">verified</span>
                                Emprendimiento Aprobado
                            </span>
                            <span className="text-[10px] font-black uppercase text-brand-primary tracking-widest">
                                {myVenture.category}
                            </span>
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white leading-tight">
                            {myVenture.name}
                        </h2>
                        <p className="text-xs text-brand-obsidian/60 dark:text-white/60 line-clamp-1 mt-1 font-medium">
                            {myVenture.description}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => { setEditingProduct(null); setIsCreatingProduct(true); }}
                    className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0"
                >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Nuevo Producto
                </button>
            </div>

            {/* My Products Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black uppercase text-brand-obsidian/40 dark:text-white/40 tracking-[0.3em]">
                        Mis Productos Publicados ({myProducts.length})
                    </h3>
                </div>

                {isLoadingProducts ? (
                    <div className="py-16 text-center opacity-50">
                        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">Cargando tus productos...</span>
                    </div>
                ) : myProducts.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-brand-obsidian/10 dark:border-white/10 rounded-[2.5rem] p-8">
                        <span className="material-symbols-outlined text-4xl text-brand-obsidian/30 dark:text-white/30 mb-2">inventory_2</span>
                        <h4 className="text-lg font-serif font-bold text-brand-obsidian dark:text-white">Aún no has publicado productos</h4>
                        <p className="text-xs text-brand-obsidian/50 dark:text-white/50 mt-1 mb-4">Comienza publicando tu primer producto para la comunidad.</p>
                        <button
                            onClick={() => { setEditingProduct(null); setIsCreatingProduct(true); }}
                            className="bg-brand-primary text-brand-obsidian px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                        >
                            + Publicar Producto
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myProducts.map(product => (
                            <div
                                key={product.id}
                                className="bg-white dark:bg-brand-surface rounded-[2rem] overflow-hidden border border-brand-obsidian/5 dark:border-white/5 shadow-sm flex flex-col justify-between"
                            >
                                <div className="aspect-video bg-gray-100 dark:bg-black/40 relative overflow-hidden">
                                    <SmartImage
                                        src={product.images?.[0] || ''}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3 bg-brand-primary text-brand-obsidian font-black text-xs px-3 py-1 rounded-xl shadow-md">
                                        ${product.price.toLocaleString('es-AR')}
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-serif font-bold text-base text-brand-obsidian dark:text-white line-clamp-1 mb-1">
                                            {product.title}
                                        </h4>
                                        <p className="text-xs text-brand-obsidian/50 dark:text-white/50 line-clamp-2">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-brand-obsidian/5 dark:border-white/5 flex gap-2">
                                        <button
                                            onClick={() => { setEditingProduct(product); setIsCreatingProduct(true); }}
                                            className="flex-1 py-2.5 rounded-xl bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-obsidian dark:hover:bg-brand-primary hover:text-white dark:hover:text-brand-obsidian transition-all"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                            title="Eliminar"
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Form Modal */}
            {isCreatingProduct && (
                <ProductFormModal
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
