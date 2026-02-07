import React, { useState, useEffect } from 'react';
import { useAdminSettings } from '../../hooks/admin/useAdminSettings';

interface AdminSettingsProps {
    user: any;
    triggerToast: (msg: string) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ user, triggerToast }) => {
    const { settings, isLoading, updateSettingMutation } = useAdminSettings(user);

    // Local state for immediate UI feedback
    const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

    useEffect(() => {
        if (settings) setLocalSettings(settings);
    }, [settings]);

    const handleToggle = (key: string) => {
        const newValue = !localSettings[key];
        setLocalSettings(prev => ({ ...prev, [key]: newValue }));

        updateSettingMutation.mutate({ key, value: newValue }, {
            onSuccess: () => triggerToast("Configuración guardada"),
            onError: () => {
                setLocalSettings(prev => ({ ...prev, [key]: !newValue })); // Revert on error
                triggerToast("Error al guardar");
            }
        });
    };

    const handleTextChange = (key: string, value: string) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleBlur = (key: string, value: string) => {
        if (settings[key] !== value) {
            updateSettingMutation.mutate({ key, value }, {
                onSuccess: () => triggerToast("Configuración guardada")
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-brand-bg dark:bg-black/90">

            {/* Header */}
            <div className="flex-none p-6 md:p-8 border-b border-brand-obsidian/5 dark:border-white/5">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight">
                    Ajustes del Sistema
                </h2>
                <p className="mt-2 text-brand-obsidian/40 dark:text-white/40 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                    Controla el comportamiento global de la aplicación.
                </p>
            </div>

            {/* Settings Grid */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {isLoading ? (
                    <div className="text-center p-10 opacity-50">Cargando configuración...</div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Maintenance Mode Section */}
                        <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined">construction</span>
                                    Modo Mantenimiento
                                </h3>
                                <p className="text-xs text-indigo-900/60 dark:text-indigo-100/60 mt-1 max-w-md">
                                    Si se activa, solo los administradores podrán acceder a la aplicación. Los usuarios verán una pantalla de mantenimiento.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={localSettings['maintenance_mode'] || false} onChange={() => handleToggle('maintenance_mode')} />
                                <div className="w-14 h-7 bg-indigo-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* General section */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-black uppercase tracking-widest text-brand-obsidian/40 dark:text-white/40 px-2">General</h4>

                                <div className="bg-white dark:bg-brand-surface p-6 rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-brand-obsidian dark:text-white">Nombre de la Iglesia</label>
                                        <input
                                            className="w-full bg-brand-silk dark:bg-black/20 p-3 rounded-xl border-none focus:ring-2 focus:ring-brand-primary text-sm font-medium"
                                            value={localSettings['church_name'] || ''}
                                            onChange={e => handleTextChange('church_name', e.target.value)}
                                            onBlur={e => handleBlur('church_name', e.target.value)}
                                            placeholder="Monte de Sión"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-brand-obsidian dark:text-white">Email de Contacto</label>
                                        <input
                                            className="w-full bg-brand-silk dark:bg-black/20 p-3 rounded-xl border-none focus:ring-2 focus:ring-brand-primary text-sm font-medium"
                                            value={localSettings['contact_email'] || ''}
                                            onChange={e => handleTextChange('contact_email', e.target.value)}
                                            onBlur={e => handleBlur('contact_email', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Social Section */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-black uppercase tracking-widest text-brand-obsidian/40 dark:text-white/40 px-2">Redes Sociales & Links</h4>

                                <div className="bg-white dark:bg-brand-surface p-6 rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-600 font-bold text-xs uppercase tracking-widest">YouTube</span>
                                        </div>
                                        <input
                                            className="w-full bg-brand-silk dark:bg-black/20 p-3 rounded-xl border-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                                            value={localSettings['youtube_url'] || ''}
                                            onChange={e => handleTextChange('youtube_url', e.target.value)}
                                            onBlur={e => handleBlur('youtube_url', e.target.value)}
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-pink-600 font-bold text-xs uppercase tracking-widest">Instagram</span>
                                        </div>
                                        <input
                                            className="w-full bg-brand-silk dark:bg-black/20 p-3 rounded-xl border-none focus:ring-2 focus:ring-pink-500 text-sm font-medium"
                                            value={localSettings['instagram_url'] || ''}
                                            onChange={e => handleTextChange('instagram_url', e.target.value)}
                                            onBlur={e => handleBlur('instagram_url', e.target.value)}
                                            placeholder="https://instagram.com/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-600 font-bold text-xs uppercase tracking-widest">WhatsApp</span>
                                        </div>
                                        <input
                                            className="w-full bg-brand-silk dark:bg-black/20 p-3 rounded-xl border-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
                                            value={localSettings['whatsapp_url'] || ''}
                                            onChange={e => handleTextChange('whatsapp_url', e.target.value)}
                                            onBlur={e => handleBlur('whatsapp_url', e.target.value)}
                                            placeholder="https://wa.me/..."
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSettings;
