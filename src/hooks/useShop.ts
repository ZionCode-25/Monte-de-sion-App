import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Venture, Product } from '../types';

export const SHOP_CATEGORIES = [
    'Todos',
    'Gastronomía',
    'Indumentaria',
    'Servicios Profesionales',
    'Artesanías',
    'Tecnología',
    'Oficial Sión'
];

export const useShop = (user?: any, activeCategory: string = 'Todos', searchTerm: string = '') => {
    const queryClient = useQueryClient();

    // --- 1. FETCH APPROVED PRODUCTS ---
    const { data: products = [], isLoading: isLoadingProducts } = useQuery({
        queryKey: ['shop-products', activeCategory, searchTerm],
        queryFn: async () => {
            try {
                let query = supabase
                    .from('products')
                    .select('*, venture:ventures(*)')
                    .order('created_at', { ascending: false });

                if (activeCategory !== 'Todos') {
                    query = query.eq('category', activeCategory);
                }

                if (searchTerm.trim()) {
                    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
                }

                const { data, error } = await query;
                if (error) {
                    console.error('Error fetching shop products:', error);
                    return [];
                }

                return (data || [])
                    .filter((p: any) => p.venture && p.venture.status === 'approved')
                    .map((p: any) => ({
                        id: p.id,
                        venture_id: p.venture_id,
                title: p.title,
                description: p.description,
                price: Number(p.price),
                currency: p.currency || 'ARS',
                images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images) : []),
                category: p.category,
                in_stock: p.in_stock,
                is_featured: p.is_featured,
                is_sion_offer: p.is_sion_offer ?? false,
                created_at: p.created_at,
                venture: p.venture ? {
                    id: p.venture.id,
                    owner_id: p.venture.owner_id,
                    name: p.venture.name,
                    description: p.venture.description,
                    category: p.venture.category,
                    logo_url: p.venture.logo_url,
                    banner_url: p.venture.banner_url,
                    whatsapp_number: p.venture.whatsapp_number,
                    bank_alias: p.venture.bank_alias,
                    bank_cbu: p.venture.bank_cbu,
                    instagram_handle: p.venture.instagram_handle,
                    status: p.venture.status,
                    is_official: p.venture.is_official,
                    theme_color: p.venture.theme_color,
                    carousel_images: p.venture.carousel_images || [],
                    owner_profile: p.venture.owner_profile
                } : undefined
            })) as Product[];
            } catch (err) {
                console.error(err);
                return [];
            }
        }
    });

    // --- 2. FETCH APPROVED VENTURES ---
    const { data: ventures = [], isLoading: isLoadingVentures } = useQuery({
        queryKey: ['shop-ventures', activeCategory],
        queryFn: async () => {
            try {
                let query = supabase
                    .from('ventures')
                    .select('*')
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false });

                if (activeCategory !== 'Todos') {
                    query = query.eq('category', activeCategory);
                }

                const { data, error } = await query;
                if (error) {
                    console.error('Error fetching ventures:', error);
                    return [];
                }
                return (data || []) as Venture[];
            } catch (err) {
                console.error(err);
                return [];
            }
        }
    });

    // --- 3. FETCH CURRENT USER'S VENTURES (PERSONAL & OFFICIAL) ---
    const [selectedVentureMode, setSelectedVentureMode] = useState<'personal' | 'official'>('personal');

    const { data: userVentures, isLoading: isLoadingMyVenture } = useQuery({
        queryKey: ['my-venture-all', user?.id, user?.role],
        queryFn: async () => {
            if (!user?.id) return { personal: null, official: null };

            try {
                const { data: personal } = await supabase
                    .from('ventures')
                    .select('*')
                    .eq('owner_id', user.id)
                    .or('is_official.eq.false,is_official.is.null')
                    .maybeSingle();

                let official = null;
                if (user.role === 'PASTOR' || user.role === 'SUPER_ADMIN') {
                    const { data: off } = await supabase
                        .from('ventures')
                        .select('*')
                        .eq('is_official', true)
                        .maybeSingle();
                    official = off as Venture;
                }

                return {
                    personal: (personal as Venture) || null,
                    official: official || null
                };
            } catch (err) {
                console.error(err);
                return { personal: null, official: null };
            }
        },
        enabled: !!user?.id
    });

    const myVenture = selectedVentureMode === 'official'
        ? (userVentures?.official || null)
        : (userVentures?.personal || null);

    // --- 4. FETCH CURRENT USER'S PRODUCTS ---
    const { data: myProducts = [], isLoading: isLoadingMyProducts } = useQuery({
        queryKey: ['my-products', myVenture?.id],
        queryFn: async () => {
            if (!myVenture?.id) return [];
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('venture_id', myVenture.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching my products:', error);
                    return [];
                }
                return (data || []).map((p: any) => ({
                    ...p,
                    price: Number(p.price),
                    images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images) : [])
                })) as Product[];
            } catch (err) {
                console.error(err);
                return [];
            }
        },
        enabled: !!myVenture?.id && myVenture?.status === 'approved'
    });

    // --- 5. REGISTER VENTURE MUTATION ---
    const registerVentureMutation = useMutation({
        mutationFn: async (ventureData: Partial<Venture>) => {
            if (!user?.id) throw new Error('Debes iniciar sesión');
            const payload = {
                owner_id: user.id,
                name: ventureData.name,
                description: ventureData.description,
                category: ventureData.category || 'Servicios Profesionales',
                logo_url: ventureData.logo_url,
                banner_url: ventureData.banner_url || null,
                whatsapp_number: ventureData.whatsapp_number,
                bank_alias: ventureData.bank_alias || null,
                bank_cbu: ventureData.bank_cbu || null,
                instagram_handle: ventureData.instagram_handle || null,
                theme_color: ventureData.theme_color || '#ffb700',
                carousel_images: ventureData.carousel_images || [],
                status: 'pending'
            };

            const { data, error } = await supabase
                .from('ventures')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-venture'] });
            queryClient.invalidateQueries({ queryKey: ['my-venture-all'] });
            queryClient.invalidateQueries({ queryKey: ['admin-ventures'] });
        }
    });

    // --- 5B. UPDATE VENTURE MUTATION ---
    const updateVentureMutation = useMutation({
        mutationFn: async (ventureData: Partial<Venture>) => {
            if (!user?.id || !myVenture?.id) throw new Error('No tienes un emprendimiento registrado');
            const payload = {
                name: ventureData.name,
                description: ventureData.description,
                logo_url: ventureData.logo_url,
                whatsapp_number: ventureData.whatsapp_number,
                bank_alias: ventureData.bank_alias || null,
                bank_cbu: ventureData.bank_cbu || null,
                instagram_handle: ventureData.instagram_handle || null,
                theme_color: ventureData.theme_color || myVenture.theme_color || '#ffb700',
                carousel_images: ventureData.carousel_images || myVenture.carousel_images || []
            };

            const { data, error } = await supabase
                .from('ventures')
                .update(payload)
                .eq('id', myVenture.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-venture'] });
            queryClient.invalidateQueries({ queryKey: ['my-venture-all'] });
            queryClient.invalidateQueries({ queryKey: ['shop-ventures'] });
            queryClient.invalidateQueries({ queryKey: ['shop-products'] });
        }
    });

    // --- 6. SAVE PRODUCT MUTATION (ADD / UPDATE) ---
    const saveProductMutation = useMutation({
        mutationFn: async (productData: Partial<Product>) => {
            if (!myVenture?.id || myVenture.status !== 'approved') {
                throw new Error('Tu emprendimiento debe estar aprobado para publicar productos.');
            }

            const payload = {
                venture_id: myVenture.id,
                title: productData.title,
                description: productData.description || '',
                price: productData.price,
                currency: productData.currency || 'ARS',
                images: JSON.stringify(productData.images || []),
                category: productData.category || myVenture.category,
                in_stock: productData.in_stock ?? true,
                is_featured: productData.is_featured ?? false,
                is_sion_offer: productData.is_sion_offer ?? false
            };

            if (productData.id) {
                const { data, error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', productData.id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            } else {
                const { data, error } = await supabase
                    .from('products')
                    .insert(payload)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-products'] });
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
        }
    });

    // --- 7. DELETE PRODUCT MUTATION ---
    const deleteProductMutation = useMutation({
        mutationFn: async (productId: string) => {
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-products'] });
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
        }
    });

    return {
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
    };
};
