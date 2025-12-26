
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { useProfile } from '../../src/hooks/useProfile';
import { supabase } from '../../lib/supabase';

interface Props {
    user: User;
    onClose: () => void;
}

export const EditProfileModal: React.FC<Props> = ({ user, onClose }) => {
    const { updateProfile, isUpdating } = useProfile();

    // Form State
    const [name, setName] = useState(user.name || '');
    const [bio, setBio] = useState(user.bio || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // Initial load
    useEffect(() => {
        setName(user.name || '');
        setBio(user.bio || '');
    }, [user]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        try {
            let avatarUrl = user.avatar;

            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // 1. Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, {
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                // 2. Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                avatarUrl = publicUrl;
            }

            await updateProfile({
                name,
                bio,
                avatar_url: avatarUrl || undefined
            });
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error al actualizar perfil');
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-brand-obsidian w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">

                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white">Editar Perfil</h3>
                    <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 transition-colors">
                        <span className="material-symbols-outlined text-brand-obsidian dark:text-white">close</span>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Avatar Selection */}
                    <div className="flex justify-center">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-brand-primary/20">
                                <img
                                    src={avatarPreview || user.avatar || 'https://via.placeholder.com/150'}
                                    className="w-full h-full object-cover"
                                    alt="Avatar"
                                />
                            </div>
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform hover:bg-brand-primary/90">
                                <span className="material-symbols-outlined text-brand-obsidian text-sm">edit</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </label>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-brand-obsidian/40 dark:text-white/40 uppercase tracking-widest pl-3 mb-1 block">Nombre Completo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-brand-obsidian/5 dark:bg-white/5 border border-transparent focus:border-brand-primary/50 text-brand-obsidian dark:text-white rounded-2xl px-5 py-4 font-bold outline-none transition-all placeholder:font-normal"
                                placeholder="Tu nombre..."
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-brand-obsidian/40 dark:text-white/40 uppercase tracking-widest pl-3 mb-1 block">Biografía / Frase</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-brand-obsidian/5 dark:bg-white/5 border border-transparent focus:border-brand-primary/50 text-brand-obsidian dark:text-white rounded-2xl px-5 py-4 font-medium outline-none transition-all min-h-[100px] resize-none"
                                placeholder="Cuéntanos un poco sobre ti..."
                            />
                        </div>
                    </div>

                    <p className="text-xs text-center text-brand-obsidian/40 dark:text-white/30 italic">
                        La gestión de Ministerios se realiza desde la sección "Mi Camino".
                    </p>

                    <button
                        onClick={handleSubmit}
                        disabled={isUpdating}
                        className="w-full py-4 bg-brand-primary rounded-2xl font-black text-brand-obsidian uppercase tracking-widest shadow-lg shadow-brand-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                        {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

            </div>
        </div>
    );
};
