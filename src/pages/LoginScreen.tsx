
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../components/context/ToastContext';
import { Link } from 'react-router-dom';

interface LoginScreenProps {
    theme: 'light' | 'dark';
}

const LoginScreen: React.FC<LoginScreenProps> = ({ theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const { showToast } = useToast();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) {
                    if (error.message === 'Invalid login credentials') throw new Error('Credenciales incorrectas.');
                    throw error;
                }
                showToast('¡Bienvenido!', 'success');
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
                showToast('Cuenta creada con éxito', 'success');
                setMode('login');
            }
        } catch (err: any) {
            showToast(err.message || 'Error inesperado', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            showToast('Error al conectar con Google', 'error');
        }
    };

    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-brand-obsidian text-white' : 'bg-brand-silk text-brand-obsidian'}`}>

            {/* Background Dynamics */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-primary/10 blur-[150px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-accent/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

                {/* Visual texture */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="w-full max-w-lg relative z-10">

                {/* Brand Header */}
                <div className="text-center mb-12 animate-reveal">
                    <div className="relative inline-block mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-brand-primary to-brand-accent rounded-[2.5rem] shadow-2xl shadow-brand-primary/30 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500">
                            <span className="material-symbols-outlined text-5xl text-brand-obsidian">church</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-brand-obsidian rounded-full flex items-center justify-center shadow-lg border border-brand-primary/20">
                            <span className="material-symbols-outlined text-brand-primary text-sm font-black">star</span>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter mb-2 leading-none">
                        Monte de <span className="text-brand-primary">Sión</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Experiencia Digital Cristiana</p>
                </div>

                {/* Main Logic Container */}
                <div className="animate-reveal" style={{ animationDelay: '0.2s' }}>
                    <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[3.5rem] border border-white/20 dark:border-white/5 shadow-2xl p-10 md:p-12 overflow-hidden relative">

                        {/* Google Login Section - PRIORITY */}
                        <div className="mb-10 text-center">
                            <h2 className="text-xl font-serif font-bold mb-6 opacity-80">
                                {mode === 'login' ? 'Bienvenido a casa' : 'Únete a nosotros'}
                            </h2>

                            <button
                                onClick={handleGoogleLogin}
                                className="w-full h-16 bg-white dark:bg-white/10 hover:bg-brand-primary dark:hover:bg-brand-primary group rounded-2xl flex items-center justify-center gap-4 transition-all duration-500 shadow-xl hover:shadow-brand-primary/20 border border-brand-obsidian/5 dark:border-white/10 active:scale-95"
                            >
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                <span className="font-black text-[10px] uppercase tracking-widest text-brand-obsidian dark:text-white group-hover:text-brand-obsidian">
                                    Continuar con Google
                                </span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-6 mb-10">
                            <div className="flex-1 h-px bg-current opacity-10" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">O vía Email</span>
                            <div className="flex-1 h-px bg-current opacity-10" />
                        </div>

                        {/* Form Area */}
                        <form onSubmit={handleAuth} className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1 group-focus-within:text-brand-primary transition-colors">Correo Electrónico</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined opacity-30 group-focus-within:text-brand-primary group-focus-within:opacity-100 transition-all">alternate_email</span>
                                    <input
                                        type="email"
                                        value={email}
                                        className="w-full h-16 bg-white dark:bg-white/5 border border-brand-obsidian/5 dark:border-white/10 rounded-2xl pl-16 pr-6 outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium placeholder:opacity-20"
                                        placeholder="ejemplo@vida.com"
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1 group-focus-within:text-brand-primary transition-colors">Contraseña</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined opacity-30 group-focus-within:text-brand-primary group-focus-within:opacity-100 transition-all">password</span>
                                    <input
                                        type="password"
                                        value={password}
                                        className="w-full h-16 bg-white dark:bg-white/5 border border-brand-obsidian/5 dark:border-white/10 rounded-2xl pl-16 pr-6 outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium placeholder:opacity-20"
                                        placeholder="••••••••"
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {mode === 'register' && (
                                <div className="flex items-center gap-3 px-2 py-2 animate-reveal">
                                    <input
                                        type="checkbox"
                                        id="terms-check"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="w-5 h-5 rounded-lg border-brand-primary/30 text-brand-primary focus:ring-brand-primary"
                                        required
                                    />
                                    <label htmlFor="terms-check" className="text-[10px] font-bold opacity-60 leading-tight">
                                        Acepto los <Link to="/terms" className="text-brand-primary underline underline-offset-4">Términos</Link> y <Link to="/privacy" className="text-brand-primary underline underline-offset-4">Privacidad</Link>.
                                    </label>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {mode === 'login' ? 'Identificarse' : 'Crear mi lugar'}
                                        <span className="material-symbols-outlined text-sm">east</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Mode Switcher */}
                        <div className="mt-12 text-center">
                            <button
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-brand-primary transition-all underline underline-offset-8 decoration-brand-primary/30"
                            >
                                {mode === 'login' ? '¿No tienes cuenta? Regístrate gratis' : 'Ya soy parte de la familia - Entrar'}
                            </button>
                        </div>

                    </div>

                    {/* Social/Trust Footer */}
                    <div className="mt-12 flex justify-center items-center gap-6 opacity-40">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Seguro</span>
                        <div className="w-1 h-1 rounded-full bg-current" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Privado</span>
                        <div className="w-1 h-1 rounded-full bg-current" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Comunidad</span>
                    </div>
                </div>

            </div>

            {/* Float Decoratives */}
            <div className="absolute top-[15%] right-[5%] w-24 h-24 border border-brand-primary/10 rounded-[2rem] rotate-12 animate-slow-zoom opacity-20 pointer-events-none" />
            <div className="absolute bottom-[20%] left-[8%] w-16 h-16 border border-brand-accent/10 rounded-full animate-bounce opacity-20 pointer-events-none" style={{ animationDuration: '4s' }} />

        </div>
    );
};

export default LoginScreen;
