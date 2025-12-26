import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<Props> = ({ onClose }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdate = async () => {
        if (password.length < 6) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setTimeout(onClose, 2000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Error al actualizar' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-brand-obsidian w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-10">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-brand-obsidian dark:text-white">close</span>
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
                        <span className="material-symbols-outlined text-3xl">lock_reset</span>
                    </div>
                    <h3 className="text-xl font-bold text-center text-brand-obsidian dark:text-white">Nueva Contraseña</h3>
                    <p className="text-xs text-center text-gray-400 mt-1">Protege tu cuenta con una clave segura</p>
                </div>

                <div className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Escribe tu nueva clave..."
                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-brand-primary rounded-xl px-4 py-3 outline-none text-brand-obsidian dark:text-white transition-all"
                    />

                    {message && (
                        <div className={`p-3 rounded-xl text-xs font-bold text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full py-4 bg-brand-primary rounded-xl font-bold text-brand-obsidian uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
                    >
                        {loading ? 'Actualizando...' : 'Confirmar Cambio'}
                    </button>
                </div>
            </div>
        </div>
    );
};
