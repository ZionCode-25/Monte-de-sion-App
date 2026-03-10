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
    const [uploadKey, setUploadKey] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (settings) {
            // Need a deep clone to avoid mutating the React Query cache directly
            setLocalSettings(JSON.parse(JSON.stringify(settings)));
        }
    }, [settings]);

    const handleUpdate = (key: string, value: any) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        updateSettingMutation.mutate({ key, value }, {
            onSuccess: () => triggerToast("Cambio guardado"),
            onError: () => triggerToast("Error al guardar")
        });
    };

    const triggerUpload = (key: string) => {
        setUploadKey(key);
        fileInputRef.current?.click();
    };

    const handleLeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `leader_${Date.now()}.${fileExt}`;
            const filePath = `settings/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('ministry_images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('ministry_images')
                .getPublicUrl(filePath);

            const newList = [...(localSettings.leaders_list || [])];
            newList[index].img = publicUrl;
            handleUpdate('leaders_list', newList);

            triggerToast("Imagen actualizada");
        } catch (error) {
            console.error('Error:', error);
            triggerToast("Error al subir archivo");
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadKey) return;

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${uploadKey}_${Date.now()}.${fileExt}`;
            const filePath = `settings/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('ministry_images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('ministry_images')
                .getPublicUrl(filePath);

            handleUpdate(uploadKey, publicUrl);
        } catch (error) {
            console.error('Error uploading:', error);
            triggerToast("Error al subir archivo");
        } finally {
            setIsUploading(false);
            setUploadKey('');
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: 'settings', desc: 'Identidad y preferencias' },
        { id: 'leadership', label: 'Liderazgo', icon: 'groups', desc: 'Pastores y equipo' },
        { id: 'social', label: 'Contacto', icon: 'share', desc: 'Redes y correos' },
        { id: 'schedule', label: 'Agenda', icon: 'calendar_today', desc: 'Días y horarios' },
    ];

    if (isLoading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-2rem)] h-[calc(100dvh-5rem)] bg-gray-50 dark:bg-[#0a0a0a] text-brand-obsidian dark:text-white overflow-hidden rounded-2xl mx-1 shadow-2xl">
            {/* Sleek Header */}
            <div className="flex-none px-6 py-6 md:px-8 md:py-8 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#111] z-10 relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-0.5 md:mb-1">Ajustes del Sistema</h2>
                        <p className="text-[10px] md:text-xs font-medium opacity-50">Administra la configuración global de la plataforma.</p>
                    </div>
                    {isUploading && (
                        <div className="bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-2 animate-pulse self-start sm:self-auto">
                            <span className="material-symbols-outlined text-[14px] md:text-[16px]">sync</span>
                            Guardando...
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 lg:w-72 shrink-0 bg-white/50 dark:bg-[#111]/50 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 overflow-x-auto md:overflow-y-auto p-3 md:p-6 flex flex-row md:flex-col gap-2 custom-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-none md:w-full text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-3 p-3 md:p-4 rounded-xl transition-all min-w-[80px] md:min-w-0 ${activeTab === tab.id
                                ? 'bg-white dark:bg-[#222] shadow-sm border border-black/5 dark:border-white/10'
                                : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 border border-transparent'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[18px] md:text-[20px] ${activeTab === tab.id ? 'text-brand-primary' : ''}`}>
                                {tab.icon}
                            </span>
                            <div>
                                <p className={`text-[10px] md:text-sm font-bold ${activeTab === tab.id ? 'text-black dark:text-white' : ''}`}>
                                    {tab.label}
                                </p>
                                <p className="hidden md:block text-[9px] uppercase tracking-wider opacity-60 mt-0.5">{tab.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-gray-50/50 dark:bg-[#0a0a0a]/50 custom-scrollbar">
                    <div className="max-w-4xl mx-auto md:mx-0">

                        {/* Hidden main file input */}
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

                        {/* TAB: GENERAL */}
                        {activeTab === 'general' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4 md:space-y-8">
                                {/* Identity Card */}
                                <div className="bg-white dark:bg-[#111] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
                                    <div className="px-5 py-4 md:px-8 md:py-5 border-b border-black/5 dark:border-white/5">
                                        <h3 className="text-sm md:text-base font-bold">Identidad de la Iglesia</h3>
                                        <p className="text-[10px] md:text-xs opacity-50 mt-0.5">Define el nombre y lema que verán los usuarios.</p>
                                    </div>
                                    <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Nombre Oficial</label>
                                            <input
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1a] p-3.5 rounded-xl text-sm font-bold border border-black/5 dark:border-white/5 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                                                value={localSettings.church_name || ''}
                                                onChange={e => handleUpdate('church_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Eslogan / Lema</label>
                                            <input
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1a] p-3.5 rounded-xl text-sm font-medium border border-black/5 dark:border-white/5 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                                                value={localSettings.church_tagline || ''}
                                                onChange={e => handleUpdate('church_tagline', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Logos Card */}
                                <div className="bg-white dark:bg-[#111] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
                                    <div className="px-5 py-4 md:px-8 md:py-5 border-b border-black/5 dark:border-white/5">
                                        <h3 className="text-sm md:text-base font-bold">Logotipos</h3>
                                        <p className="text-[10px] md:text-xs opacity-50 mt-0.5">Logos para la barra de navegación en diferentes temas.</p>
                                    </div>
                                    <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Tema Claro</label>
                                            <div
                                                onClick={() => triggerUpload('church_logo_url')}
                                                className="aspect-[2.5/1] bg-gray-50 rounded-xl border-2 border-dashed border-black/10 flex items-center justify-center cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all relative group overflow-hidden"
                                            >
                                                {localSettings.church_logo_url ? (
                                                    <img src={localSettings.church_logo_url} className="h-14 object-contain group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <div className="text-gray-400 flex flex-col items-center">
                                                        <span className="material-symbols-outlined text-2xl mb-1">add_photo_alternate</span>
                                                        <span className="text-[9px] font-bold uppercase tracking-wider">Subir</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Tema Oscuro</label>
                                            <div
                                                onClick={() => triggerUpload('church_logo_dark_url')}
                                                className="aspect-[2.5/1] bg-[#1a1a1a] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-brand-primary transition-all relative group overflow-hidden"
                                            >
                                                {localSettings.church_logo_dark_url ? (
                                                    <img src={localSettings.church_logo_dark_url} className="h-14 object-contain group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <div className="text-gray-500 flex flex-col items-center">
                                                        <span className="material-symbols-outlined text-2xl mb-1">add_photo_alternate</span>
                                                        <span className="text-[9px] font-bold uppercase tracking-wider">Subir</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Maintenance */}
                                <div className="bg-red-50 dark:bg-rose-950/20 rounded-2xl border border-red-100 dark:border-rose-900/30 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xs md:text-sm font-bold text-red-900 dark:text-rose-400 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">warning</span>
                                            Modo Mantenimiento
                                        </h3>
                                        <p className="text-xs text-red-700/70 dark:text-rose-400/70 mt-1 max-w-md">
                                            Activa esto para bloquear el acceso a usuarios no administradores mientras realizas cambios.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer pb-2">
                                        <input type="checkbox" className="sr-only peer" checked={localSettings.maintenance_mode || false} onChange={() => handleUpdate('maintenance_mode', !localSettings.maintenance_mode)} />
                                        <div className="w-12 h-6 bg-red-200 dark:bg-rose-900/40 rounded-full peer peer-checked:bg-rose-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[24px]"></div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* TAB: LEADERSHIP */}
                        {activeTab === 'leadership' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4 md:space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111] p-5 md:p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                                    <div>
                                        <h3 className="text-sm md:text-base font-bold">Dirección y Liderazgo</h3>
                                        <p className="text-[10px] md:text-xs opacity-50 mt-0.5">Estos perfiles aparecerán en la sección de "Nosotros".</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newList = [...(localSettings.leaders_list || []), { id: Date.now().toString(), name: 'Nuevo Perfil', roleTitle: 'LOWERCASE', roleSubtitle: 'Cargo', img: '', bio: '', color: 'from-blue-600/20 to-purple-600/20' }];
                                            handleUpdate('leaders_list', newList);
                                        }}
                                        className="bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">person_add</span> Añadir
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {(localSettings.leaders_list || []).map((leader: any, index: number) => (
                                        <div key={leader.id} className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-black/5 dark:border-white/5 flex flex-col md:flex-row gap-5 shadow-sm relative group">

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newList = localSettings.leaders_list.filter((_: any, i: number) => i !== index);
                                                    handleUpdate('leaders_list', newList);
                                                }}
                                                className="absolute top-2 right-2 md:top-4 md:right-4 w-10 h-10 md:w-8 md:h-8 rounded-full md:rounded-lg flex items-center justify-center text-red-500 bg-red-50/50 dark:bg-rose-500/10 hover:bg-red-500 hover:text-white dark:hover:bg-rose-500 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 z-10 shadow-sm md:shadow-none"
                                                title="Eliminar Perfil"
                                            >
                                                <span className="material-symbols-outlined text-[20px] md:text-[18px]">delete</span>
                                            </button>

                                            <div className="flex flex-col gap-2 shrink-0">
                                                <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden relative border border-black/5">
                                                    {leader.img ? (
                                                        <img src={leader.img} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-20"><span className="material-symbols-outlined text-3xl">person</span></div>
                                                    )}
                                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold uppercase tracking-widest cursor-pointer">
                                                        Imagen
                                                        <input type="file" className="hidden" onChange={(e) => handleLeaderImageUpload(e, index)} />
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 pr-2">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold uppercase tracking-wider opacity-40">Nombre Competo</label>
                                                    <input className="w-full bg-gray-50 dark:bg-[#1a1a1a] px-3 py-2 rounded-lg text-sm font-bold border border-transparent focus:border-brand-primary outline-none" value={leader.name} onChange={e => {
                                                        const newList = [...localSettings.leaders_list];
                                                        newList[index].name = e.target.value;
                                                        handleUpdate('leaders_list', newList);
                                                    }} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold uppercase tracking-wider opacity-40">Cargo</label>
                                                    <input className="w-full bg-gray-50 dark:bg-[#1a1a1a] px-3 py-2 rounded-lg text-sm border border-transparent focus:border-brand-primary outline-none" value={leader.roleSubtitle} onChange={e => {
                                                        const newList = [...localSettings.leaders_list];
                                                        newList[index].roleSubtitle = e.target.value;
                                                        handleUpdate('leaders_list', newList);
                                                    }} />
                                                </div>
                                                <div className="space-y-1 sm:col-span-2">
                                                    <label className="text-[9px] font-bold uppercase tracking-wider opacity-40">Biografía</label>
                                                    <textarea className="w-full bg-gray-50 dark:bg-[#1a1a1a] px-3 py-2 rounded-lg text-sm border border-transparent focus:border-brand-primary outline-none resize-none h-16" value={leader.bio} onChange={e => {
                                                        const newList = [...localSettings.leaders_list];
                                                        newList[index].bio = e.target.value;
                                                        handleUpdate('leaders_list', newList);
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB: SOCIAL */}
                        {activeTab === 'social' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4 md:space-y-6">
                                <div className="bg-white dark:bg-[#111] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
                                    <div className="px-5 py-4 md:px-8 md:py-5 border-b border-black/5 dark:border-white/5">
                                        <h3 className="text-sm md:text-base font-bold">Enlaces de Contacto</h3>
                                        <p className="text-[10px] md:text-xs opacity-50 mt-0.5">Configura los accesos directos de redes sociales.</p>
                                    </div>
                                    <div className="p-5 md:p-8 space-y-4 md:space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 opacity-70">
                                                <span className="material-symbols-outlined text-[14px]">mail</span> Email Principal
                                            </label>
                                            <input
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1a] p-3.5 rounded-xl text-sm font-medium border border-black/5 dark:border-white/5 focus:border-brand-primary outline-none"
                                                value={localSettings.contact_email || ''}
                                                placeholder="ejemplo@iglesia.com"
                                                onChange={e => handleUpdate('contact_email', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 text-green-600 dark:text-green-500">
                                                <span className="material-symbols-outlined text-[14px]">chat</span> WhatsApp URL
                                            </label>
                                            <input
                                                className="w-full bg-green-50 dark:bg-green-900/10 p-3.5 rounded-xl text-sm font-medium border border-green-100 dark:border-green-900/30 focus:border-green-500 outline-none"
                                                value={localSettings.whatsapp_url || ''}
                                                placeholder="https://wa.me/numerotelefono"
                                                onChange={e => handleUpdate('whatsapp_url', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 text-red-600 dark:text-red-500">
                                                <span className="material-symbols-outlined text-[14px]">smart_display</span> YouTube URL
                                            </label>
                                            <input
                                                className="w-full bg-red-50 dark:bg-red-900/10 p-3.5 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30 focus:border-red-500 outline-none"
                                                value={localSettings.youtube_url || ''}
                                                placeholder="https://youtube.com/..."
                                                onChange={e => handleUpdate('youtube_url', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 text-blue-600 dark:text-blue-500">
                                                <span className="material-symbols-outlined text-[14px]">public</span> Facebook URL
                                            </label>
                                            <input
                                                className="w-full bg-blue-50 dark:bg-blue-900/10 p-3.5 rounded-xl text-sm font-medium border border-blue-100 dark:border-blue-900/30 focus:border-blue-500 outline-none"
                                                value={localSettings.facebook_url || ''}
                                                placeholder="https://facebook.com/..."
                                                onChange={e => handleUpdate('facebook_url', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 text-pink-600 dark:text-pink-500">
                                                <span className="material-symbols-outlined text-[14px]">camera_alt</span> Instagram URL
                                            </label>
                                            <input
                                                className="w-full bg-pink-50 dark:bg-pink-900/10 p-3.5 rounded-xl text-sm font-medium border border-pink-100 dark:border-pink-900/30 focus:border-pink-500 outline-none"
                                                value={localSettings.instagram_url || ''}
                                                placeholder="https://instagram.com/..."
                                                onChange={e => handleUpdate('instagram_url', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 text-gray-900 dark:text-white">
                                                <span className="material-symbols-outlined text-[14px]">music_note</span> TikTok URL
                                            </label>
                                            <input
                                                className="w-full bg-gray-50 dark:bg-white/5 p-3.5 rounded-xl text-sm font-medium border border-black/5 dark:border-white/10 focus:border-brand-primary outline-none"
                                                value={localSettings.tiktok_url || ''}
                                                placeholder="https://tiktok.com/@..."
                                                onChange={e => handleUpdate('tiktok_url', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: SCHEDULE */}
                        {activeTab === 'schedule' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4 md:space-y-6">
                                <div className="bg-white dark:bg-[#111] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
                                    <div className="px-5 py-4 md:px-8 md:py-5 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50 dark:bg-white/5">
                                        <div>
                                            <h3 className="text-sm md:text-base font-bold">Programa Semanal</h3>
                                            <p className="text-[10px] md:text-xs opacity-50 mt-0.5">Horarios de reuniones y actividades fijas.</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newList = [...(localSettings.weekly_activities || []), { d: 'Lunes', t: '20:00', a: 'Culto General' }];
                                                handleUpdate('weekly_activities', newList);
                                            }}
                                            className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:scale-105 transition-transform"
                                        >
                                            Añadir <span className="material-symbols-outlined text-[16px]">add</span>
                                        </button>
                                    </div>

                                    <div className="p-5 md:p-8 space-y-3 md:space-y-4 overflow-x-auto">
                                        {(localSettings.weekly_activities || []).length === 0 && (
                                            <div className="text-center py-8 opacity-40 text-xs md:text-sm">No hay actividades programadas.</div>
                                        )}

                                        {(localSettings.weekly_activities || []).map((activity: any, index: number) => (
                                            <div key={index} className="flex gap-2 items-center bg-gray-50 dark:bg-[#1a1a1a] p-2 md:p-3 rounded-xl group border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-colors min-w-[500px]">
                                                <div className="px-2 opacity-20 cursor-move">
                                                    <span className="material-symbols-outlined text-[16px] md:text-[18px]">drag_indicator</span>
                                                </div>

                                                <input
                                                    className="w-24 md:w-28 bg-white dark:bg-[#222] px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold border border-black/5 dark:border-white/5 outline-none"
                                                    value={activity.d}
                                                    placeholder="Día"
                                                    onChange={e => {
                                                        const newList = [...localSettings.weekly_activities];
                                                        newList[index].d = e.target.value;
                                                        handleUpdate('weekly_activities', newList);
                                                    }}
                                                />
                                                <input
                                                    className="w-20 md:w-24 bg-white dark:bg-[#222] px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold border border-black/5 dark:border-white/5 text-brand-primary outline-none text-center"
                                                    value={activity.t}
                                                    placeholder="Hora"
                                                    onChange={e => {
                                                        const newList = [...localSettings.weekly_activities];
                                                        newList[index].t = e.target.value;
                                                        handleUpdate('weekly_activities', newList);
                                                    }}
                                                />
                                                <input
                                                    className="flex-1 bg-white dark:bg-[#222] px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium border border-black/5 dark:border-white/5 outline-none"
                                                    value={activity.a}
                                                    placeholder="Actividad"
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
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-rose-500/10 transition-colors mx-1 sm:opacity-0 sm:group-hover:opacity-100"
                                                    title="Quitar"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="h-12"></div> {/* Bottom padding */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
