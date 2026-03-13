import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/context/ToastContext';
import { useNavigate } from 'react-router-dom';

const UpdatePasswordScreen: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Check password strength
    const isStrongPassword = password.length >= 8;

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isStrongPassword) {
            showToast('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            showToast('Contraseña actualizada con éxito', 'success');
            // Redirigir al inicio
            navigate('/', { replace: true });
        } catch (err: any) {
            showToast(err.message || 'Error al actualizar la contraseña', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#080808] text-white">
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-[-10%] left-[-20%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,183,0,0.1)_0%,transparent_50%)] animate-slow-zoom" />
            </div>

            <main className="w-full max-w-md z-10 px-8 flex flex-col items-center animate-reveal">
                <div className="w-20 h-20 mb-8 mx-auto relative group">
                    <img
                        src="/images/logo-dorado.png"
                        alt="Logo Monte de Sión"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,183,0,0.3)]"
                    />
                </div>
                
                <h2 className="text-3xl font-black mb-2 text-center">Nueva Contraseña</h2>
                <p className="text-white/50 text-center mb-8 text-sm">
                    Por favor, ingresa tu nueva contraseña a continuación.
                </p>

                <form onSubmit={handleUpdatePassword} className="w-full space-y-5">
                    <div className="space-y-1 group">
                        <input
                            type="password"
                            value={password}
                            placeholder="Nueva contraseña"
                            className="w-full bg-white/10 border border-white/20 rounded-2xl h-14 px-6 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all outline-none text-sm font-medium placeholder:text-white/30"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {password && (
                            <div className="px-2 pt-1 flex items-center justify-between">
                                <div className="flex gap-1">
                                    <div className={`h-1 w-8 rounded-full ${password.length > 0 ? (password.length >= 8 ? 'bg-green-500' : 'bg-red-500') : 'bg-white/10'}`} />
                                    <div className={`h-1 w-8 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-white/10'}`} />
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-white/40">
                                    {password.length === 0 ? '' : (password.length >= 8 ? 'Segura' : 'Muy corta')}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="group">
                        <input
                            type="password"
                            value={confirmPassword}
                            placeholder="Confirmar contraseña"
                            className="w-full bg-white/10 border border-white/20 rounded-2xl h-14 px-6 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all outline-none text-sm font-medium placeholder:text-white/30"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !isStrongPassword}
                        className="w-full h-14 mt-4 bg-brand-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full text-center text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white mt-4"
                    >
                        Volver al inicio
                    </button>
                </form>
            </main>
        </div>
    );
};

export default UpdatePasswordScreen;
