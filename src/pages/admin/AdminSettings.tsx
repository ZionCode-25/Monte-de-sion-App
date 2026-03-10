import React, { useState, useEffect, useRef } from 'react';
import { useAdminSettings } from '../../hooks/admin/useAdminSettings';
import { supabase } from '../../lib/supabase';

interface AdminSettingsProps {
    user: any;
    triggerToast: (msg: string) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ user, triggerToast }) => {
    const { settings, isLoading, updateSettingMutation } = useAdminSettings(user);
    const [activeTab, setActiveTab] = useState<'general' | 'leadership' | 'social' | 'schedule'>('general');
    const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (settings) setLocalSettings(settings);
    }, [settings]);

    const handleUpdate = (key: string, value: any) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        updateSettingMutation.mutate({ key, value }, {
            onSuccess: () => triggerToast("Cambio guardado"),
            onError: () => triggerToast("Error al guardar")
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${key}_${Date.now()}.${fileExt}`;
            const filePath = `settings/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('ministry_images') // Using existing bucket for simplicity
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('ministry_images')
                .getPublicUrl(filePath);

            handleUpdate(key, publicUrl);
        } catch (error) {
            console.error('Error uploading:', error);
            triggerToast("Error al subir archivo");
        } finally {
            setIsUploading(false);
        }
    };

    // Table of Contents / Tabs
    const tabs = [
        { id: 'general', label: 'General', icon: 'settings' },
        { id: 'leadership', label: 'Liderazgo', icon: 'groups' },
        { id: 'social', label: 'Redes y Contacto', icon: 'share' },
        { id: 'schedule', label: 'Cronograma', icon: 'calendar_today' },
    ];

    if (isLoading) return <div className="p-20 text-center opacity-50">Sincronizando configuración...</div>;

    return (
        <div className="flex flex-col h-full bg-[#F8F9FA] dark:bg-black/95 text-brand-obsidian dark:text-white overflow-hidden">
            {/* Header */}
            <div className="flex-none p-8 md:p-12 pb-6 border-b border-brand-obsidian/5 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-md">
                <h2 className="text-3xl md:text-5xl font-serif font-bold leading-none tracking-tight mb-2">
                    Panel de <span className="text-brand-primary">Control</span>
                </h2>
                <p className="text-brand-obsidian/40 dark:text-white/40 font-medium text-xs md:text-base max-w-xl">
                    Administra la identidad visual y el comportamiento global de Monte de Sión.
                </p>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-20 md:w-64 border-r border-brand-obsidian/5 dark:border-white/5 bg-brand-silk/30 dark:bg-black/20 p-4 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center justify-center md:justify-start gap-3 p-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'bg-brand-primary text-brand-obsidian shadow-lg' : 'hover:bg-brand-silk dark:hover:bg-white/5 opacity-50'}`}
                        >
                            <span className="material-symbols-outlined">{tab.icon}</span>
                            <span className="hidden md:block font-black text-[10px] uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Settings Area */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                    <div className="max-w-4xl">

                        {/* TAB: GENERAL */}
                        {activeTab === 'general' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                                <section className="space-y-6">
                                    <h3 className="text-2xl font-serif font-bold mb-8 italic">Identidad de la Iglesia</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Nombre Oficial</label>
                                            <input
                                                className="w-full bg-white dark:bg-white/5 p-5 rounded-2xl font-bold border border-brand-obsidian/5 dark:border-white/5 outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                                                value={localSettings.church_name || ''}
                                                onChange={e => handleUpdate('church_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Eslogan / Lema</label>
                                            <input
                                                className="w-full bg-white dark:bg-white/5 p-5 rounded-2xl font-medium border border-brand-obsidian/5 dark:border-white/5 outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                                                value={localSettings.church_tagline || ''}
                                                onChange={e => handleUpdate('church_tagline', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <span className="material-symbols-outlined text-indigo-500 text-3xl">construction</span>
                                            <div>
                                                <h4 className="font-bold text-indigo-900 dark:text-indigo-100">Modo Mantenimiento</h4>
                                                <p className="text-xs opacity-60">Bloquea el acceso público a la App temporalmente.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={localSettings.maintenance_mode || false} onChange={() => handleUpdate('maintenance_mode', !localSettings.maintenance_mode)} />
                                            <div className="w-14 h-7 bg-indigo-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                                        </label>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h3 className="text-2xl font-serif font-bold italic">Logos y Marca</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Logo Light */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Logo Tema Claro</label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-video bg-white rounded-[2rem] border-2 border-dashed border-brand-obsidian/10 flex items-center justify-center cursor-pointer hover:border-brand-primary transition-all overflow-hidden relative group"
                                            >
                                                {localSettings.church_logo_url ? <img src={localSettings.church_logo_url} className="h-20 object-contain group-hover:scale-105 transition-transform" /> : <span className="material-symbols-outlined opacity-20 text-4xl">add_photo_alternate</span>}
                                                <input type="file" ref={fileInputRef} className="hidden" onChange={e => handleFileUpload(e, 'church_logo_url')} />
                                            </div>
                                        </div>
                                        {/* Logo Dark */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Logo Tema Oscuro</label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-video bg-brand-obsidian rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-brand-primary transition-all overflow-hidden group"
                                            >
                                                {localSettings.church_logo_dark_url ? <img src={localSettings.church_logo_dark_url} className="h-20 object-contain group-hover:scale-105 transition-transform" /> : <span className="material-symbols-outlined text-white/20 text-4xl">add_photo_alternate</span>}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* TAB: LEADERSHIP */}
                        {activeTab === 'leadership' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-serif font-bold italic">Gestión de Pastores y Líderes</h3>
                                    <button
                                        onClick={() => {
                                            const newList = [...(localSettings.leaders_list || []), { id: Date.now().toString(), name: 'Nuevo Líder', roleTitle: 'LOWERCASE', roleSubtitle: 'Cargo', img: '', bio: '', color: 'from-blue-600/20 to-purple-600/20' }];
                                            handleUpdate('leaders_list', newList);
                                        }}
                                        className="bg-brand-primary text-brand-obsidian px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">person_add</span> Añadir
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {(localSettings.leaders_list || []).map((leader: any, index: number) => (
                                        <div key={leader.id} className="bg-white dark:bg-brand-surface p-6 rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 flex flex-col lg:flex-row gap-8 items-start group shadow-sm hover:shadow-xl transition-all">
                                            <div className="w-full lg:w-48 aspect-square rounded-[1.5rem] bg-brand-silk dark:bg-black/20 overflow-hidden relative shrink-0">
                                                {leader.img ? (
                                                    <img src={leader.img} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-20"><span className="material-symbols-outlined text-4xl">person</span></div>
                                                )}
                                                <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
                                                    Cambiar Imagen
                                                </button>
                                            </div>

                                            <div className="flex-1 space-y-4 w-full">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black uppercase opacity-40 px-1">Nombre Completo</label>
                                                        <input className="w-full bg-brand-silk dark:bg-black/20 p-3 rounded-xl text-sm font-bold border-none" value={leader.name} onChange={e => {
                                                            const newList = [...localSettings.leaders_list];
                                                            newList[index].name = e.target.value;
                                                            handleUpdate('leaders_list', newList);
                                                        }} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black uppercase opacity-40 px-1">Cargo / Función</label>
                                                        <input className="w-full bg-brand-silk dark:bg-black/20 p-3 rounded-xl text-sm border-none" value={leader.roleSubtitle} onChange={e => {
                                                            const newList = [...localSettings.leaders_list];
                                                            newList[index].roleSubtitle = e.target.value;
                                                            handleUpdate('leaders_list', newList);
                                                        }} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase opacity-40 px-1">Breve Biografía</label>
                                                    <textarea className="w-full bg-brand-silk dark:bg-black/20 p-3 rounded-xl text-sm resize-none h-20 border-none" value={leader.bio} onChange={e => {
                                                        const newList = [...localSettings.leaders_list];
                                                        newList[index].bio = e.target.value;
                                                        handleUpdate('leaders_list', newList);
                                                    }} />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    const newList = localSettings.leaders_list.filter((_: any, i: number) => i !== index);
                                                    handleUpdate('leaders_list', newList);
                                                }}
                                                className="self-end lg:self-start p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB: SOCIAL */}
                        {activeTab === 'social' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="text-2xl font-serif font-bold mb-8 italic">Redes Sociales y Contacto</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] space-y-6 border border-brand-obsidian/5 dark:border-white/5">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">mail</span> Email Corporativo
                                            </label>
                                            <input
                                                className="w-full bg-brand-silk dark:bg-black/20 p-5 rounded-2xl font-bold border-none"
                                                value={localSettings.contact_email || ''}
                                                onChange={e => handleUpdate('contact_email', e.target.value)}
                                                placeholder="contacto@iglesia.com"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2 text-green-500">
                                                <span className="material-symbols-outlined text-sm">chat</span> WhatsApp
                                            </label>
                                            <input
                                                className="w-full bg-brand-silk dark:bg-black/20 p-5 rounded-2xl font-bold border-none"
                                                value={localSettings.whatsapp_url || ''}
                                                onChange={e => handleUpdate('whatsapp_url', e.target.value)}
                                                placeholder="https://wa.me/..."
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] space-y-6 border border-brand-obsidian/5 dark:border-white/5">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2 text-red-500">
                                                <span className="material-symbols-outlined text-sm">smart_display</span> YouTube Channel
                                            </label>
                                            <input className="w-full bg-brand-silk dark:bg-black/20 p-5 rounded-2xl font-bold border-none" value={localSettings.youtube_url || ''} onChange={e => handleUpdate('youtube_url', e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2 text-pink-500">
                                                <span className="material-symbols-outlined text-sm">camera_alt</span> Instagram
                                            </label>
                                            <input className="w-full bg-brand-silk dark:bg-black/20 p-5 rounded-2xl font-bold border-none" value={localSettings.instagram_url || ''} onChange={e => handleUpdate('instagram_url', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: SCHEDULE */}
                        {activeTab === 'schedule' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                                <section className="space-y-6">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-2xl font-serif font-bold italic">Cronograma de Actividades</h3>
                                        <button
                                            onClick={() => {
                                                const newList = [...(localSettings.weekly_activities || []), { d: 'Lunes', t: '20:00', a: 'Nueva Actividad' }];
                                                handleUpdate('weekly_activities', newList);
                                            }}
                                            className="bg-brand-primary text-brand-obsidian px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">add_circle</span> Añadir
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {(localSettings.weekly_activities || []).map((activity: any, index: number) => (
                                            <div key={index} className="flex flex-col md:flex-row gap-2 bg-white dark:bg-brand-surface p-4 rounded-3xl border border-brand-obsidian/5 dark:border-white/5 group relative">
                                                <input
                                                    className="bg-brand-silk dark:bg-black/20 px-4 py-3 rounded-xl text-sm font-bold md:w-32 border-none"
                                                    value={activity.d}
                                                    onChange={e => {
                                                        const newList = [...localSettings.weekly_activities];
                                                        newList[index].d = e.target.value;
                                                        handleUpdate('weekly_activities', newList);
                                                    }}
                                                />
                                                <input
                                                    className="bg-brand-silk dark:bg-black/20 px-4 py-3 rounded-xl text-sm font-bold md:w-40 border-none"
                                                    value={activity.t}
                                                    onChange={e => {
                                                        const newList = [...localSettings.weekly_activities];
                                                        newList[index].t = e.target.value;
                                                        handleUpdate('weekly_activities', newList);
                                                    }}
                                                />
                                                <input
                                                    className="flex-1 bg-brand-silk dark:bg-black/20 px-4 py-3 rounded-xl text-sm font-medium border-none"
                                                    value={activity.a}
                                                    onChange={e => {
                                                        const newList = [...localSettings.weekly_activities];
                                                        newList[index].a = e.target.value;
                                                        handleUpdate('weekly_activities', newList);
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newList = localSettings.weekly_activities.filter((_: any, i: number) => i !== index);
                                                        handleUpdate('weekly_activities', newList);
                                                    }}
                                                    className="md:opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
