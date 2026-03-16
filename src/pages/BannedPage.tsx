import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/context/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';

const BannedPage: React.FC = () => {
    const { user, signOut } = useAuth();
    const [appealMessage, setAppealMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { data: existingAppeal, isLoading: loadingAppeal } = useQuery({
        queryKey: ['ban-appeal', user?.id],
        queryFn: async () => {
            const { data } = await supabase
                .from('ban_appeals')
                .select('*')
                .eq('user_id', user?.id)
                .eq('status', 'pending')
                .single();
            return data;
        },
        enabled: !!user
    });

    const submitAppealMutation = useMutation({
        mutationFn: async (message: string) => {
            const { error } = await supabase.from('ban_appeals').insert({
                user_id: user?.id,
                message
            });
            if (error) throw error;
        },
        onSuccess: () => {
            setIsSubmitted(true);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (appealMessage.trim()) {
            submitAppealMutation.mutate(appealMessage);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg dark:bg-black/95 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white dark:bg-brand-surface rounded-[2.5rem] shadow-2xl border border-rose-500/20 p-8 md:p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 to-amber-500" />
                
                <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-rose-500 text-4xl">block</span>
                </div>

                <h1 className="text-3xl font-serif font-black text-brand-obsidian dark:text-white mb-3">
                    Acceso Restringido
                </h1>
                
                <p className="text-brand-obsidian/60 dark:text-white/40 font-medium mb-8 leading-relaxed">
                    Tu cuenta ha sido baneada de forma permanente por incumplir las normas de la comunidad de Monte de Sión.
                </p>

                {existingAppeal || isSubmitted ? (
                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined mb-2 block">task_alt</span>
                        <p className="text-sm font-bold">Hemos recibido tu reclamo.</p>
                        <p className="text-xs opacity-80 mt-1">Nuestros administradores analizarán tu caso y te informaremos si tu acceso es restaurado.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian/40 dark:text-white/40 ml-2">
                            Enviar reclamo o mensaje
                        </label>
                        <textarea
                            value={appealMessage}
                            onChange={(e) => setAppealMessage(e.target.value)}
                            className="w-full bg-brand-silk/50 dark:bg-black/20 rounded-2xl p-4 border-none ring-1 ring-brand-obsidian/5 focus:ring-2 focus:ring-brand-primary placeholder:text-brand-obsidian/20 dark:placeholder:text-white/10 text-sm min-h-[120px]"
                            placeholder="Explica tu situación aquí..."
                            required
                        />
                        <button
                            type="submit"
                            disabled={submitAppealMutation.isPending}
                            className="w-full bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                        >
                            {submitAppealMutation.isPending ? 'Enviando...' : 'ENVIAR RECLAMO'}
                        </button>
                    </form>
                )}

                <button
                    onClick={() => signOut()}
                    className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-brand-obsidian/30 dark:text-white/20 hover:text-rose-500 transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default BannedPage;
