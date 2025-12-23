import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
    theme: 'light' | 'dark';
}

const LoginScreen: React.FC<LoginScreenProps> = ({ theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'register'>('login');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) {
                    if (error.message === 'Invalid login credentials') throw new Error('El correo o la contraseña no son correctos.');
                    if (error.message === 'Email not confirmed') throw new Error('Por favor confirma tu correo electrónico antes de entrar.');
                    throw error;
                }
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: email.split('@')[0],
                            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
                        }
                    }
                });
                if (error) throw error;
                alert('¡Cuenta creada! Ya puedes entrar.');
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (err: any) {
            setError('No pudimos conectar con Google: ' + err.message);
        }
    };

    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 relative overflow-hidden ${isDark ? 'bg-brand-obsidian' : 'bg-[#F2F2EB]'}`}>

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-primary/10 to-transparent pointer-events-none"></div>
            <div className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none ${isDark ? 'bg-brand-primary/10' : 'bg-brand-primary/20'}`}></div>

            <div className="w-full max-w-sm relative z-10 flex flex-col gap-8 animate-screen-in">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-primary to-brand-accent rounded-[2rem] shadow-xl shadow-brand-primary/20 flex items-center justify-center mb-6 rotate-3">
                        <span className="material-symbols-outlined text-4xl text-brand-obsidian">church</span>
                    </div>
                    <h1 className={`font-serif text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-brand-obsidian'}`}>
                        Monte de Sión
                    </h1>
                    <p className={`text-sm font-medium tracking-widest uppercase opacity-60 ${isDark ? 'text-brand-primary' : 'text-brand-obsidian'}`}>
                        Iglesia Digital
                    </p>
                </div>

                {/* Main Card */}
                <div className={`p-8 rounded-[2.5rem] shadow-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-brand-obsidian/5'}`}>

                    <h2 className={`text-xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-brand-obsidian'}`}>
                        {mode === 'login' ? '¡Hola! Bendiciones' : 'Únete a la Familia'}
                    </h2>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 items-start">
                            <span className="material-symbols-outlined text-red-500 text-xl shrink-0">error</span>
                            <p className="text-red-500 text-sm font-medium leading-tight">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="flex flex-col gap-5">
                        <div className="space-y-2">
                            <label className={`text-xs font-black uppercase tracking-widest ml-1 opacity-50 ${isDark ? 'text-white' : 'text-brand-obsidian'}`}>
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <span className={`absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl opacity-40 ${isDark ? 'text-white' : 'text-brand-obsidian'}`}>mail</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full h-14 pl-14 pr-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary transition-all text-base font-medium ${isDark
                                            ? 'bg-black/20 focus:bg-black/40 text-white placeholder-white/20'
                                            : 'bg-brand-obsidian/5 focus:bg-white text-brand-obsidian placeholder-brand-obsidian/30'
                                        }`}
                                    placeholder="ejemplo@correo.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={`text-xs font-black uppercase tracking-widest ml-1 opacity-50 ${isDark ? 'text-white' : 'text-brand-obsidian'}`}>
                                Contraseña
                            </label>
                            <div className="relative">
                                <span className={`absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl opacity-40 ${isDark ? 'text-white' : 'text-brand-obsidian'}`}>lock</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full h-14 pl-14 pr-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary transition-all text-base font-medium ${isDark
                                            ? 'bg-black/20 focus:bg-black/40 text-white placeholder-white/20'
                                            : 'bg-brand-obsidian/5 focus:bg-white text-brand-obsidian placeholder-brand-obsidian/30'
                                        }`}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 mt-2 rounded-2xl bg-brand-primary text-brand-obsidian font-bold text-sm uppercase tracking-widest shadow-lg shadow-brand-primary/25 active:scale-95 transition-all flex items-center justify-center gap-2 hover:brightness-110"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-brand-obsidian border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{mode === 'login' ? 'Ingresar' : 'Registrarme'}</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-8 flex items-center gap-4 opacity-50">
                        <div className={`h-[1px] flex-1 ${isDark ? 'bg-white/20' : 'bg-brand-obsidian/20'}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-brand-obsidian'}`}>O ingresa con</span>
                        <div className={`h-[1px] flex-1 ${isDark ? 'bg-white/20' : 'bg-brand-obsidian/20'}`}></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className={`w-full h-14 rounded-2xl border flex items-center justify-center gap-3 font-bold text-sm transition-all active:scale-95 hover:bg-brand-primary/5 ${isDark
                                ? 'border-white/10 text-white bg-white/5'
                                : 'border-brand-obsidian/10 text-brand-obsidian bg-white'
                            }`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'register' : 'login');
                                setError(null);
                            }}
                            className={`text-xs font-bold uppercase tracking-widest underline decoration-2 underline-offset-4 opacity-70 hover:opacity-100 transition-opacity ${isDark ? 'decoration-brand-primary text-white' : 'decoration-brand-primary text-brand-obsidian'}`}
                        >
                            {mode === 'login' ? 'Crear cuenta nueva' : 'Ya tengo cuenta'}
                        </button>
                    </div>

                </div>

                <p className={`text-center text-[10px] opacity-40 max-w-[200px] mx-auto leading-relaxed ${isDark ? 'text-white' : 'text-brand-obsidian'}`}>
                    Al ingresar aceptas nuestros Términos de Servicio y Política de Privacidad.
                </p>

            </div>
        </div>
    );
};

export default LoginScreen;
