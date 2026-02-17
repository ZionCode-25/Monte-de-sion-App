
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../components/context/ToastContext';
import { Link } from 'react-router-dom';

interface LoginScreenProps {
    theme?: 'light' | 'dark';
}

const LoginScreen: React.FC<LoginScreenProps> = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [showEmailFields, setShowEmailFields] = useState(false);
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
                if (error) throw error;
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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#080808] text-white overflow-hidden relative selection:bg-brand-primary/30">

            {/* Mesh Gradient Background - Ultra Professional */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-[-10%] left-[-20%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,183,0,0.1)_0%,transparent_50%)] animate-slow-zoom" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,143,0,0.05)_0%,transparent_60%)] animate-pulse-glow" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10" />
            </div>

            <main className="w-full max-w-lg z-10 px-8 flex flex-col items-center">

                {/* Minimal Header */}
                <header className="mb-16 text-center animate-reveal">
                    <div className="w-20 h-20 mb-8 mx-auto relative group">
                        <svg viewBox="0 0 100 100" className="w-full h-full fill-none drop-shadow-[0_0_15px_rgba(255,183,0,0.3)]">
                            <path
                                d="M50 20 L20 50 L20 80 L80 80 L80 50 Z M50 20 L50 80"
                                stroke="#FFB700"
                                strokeWidth="2"
                                strokeLinecap="round"
                                className="animate-draw"
                                strokeDasharray="1000"
                                strokeDashoffset="1000"
                            />
                        </svg>
                        <div className="absolute inset-0 bg-brand-primary/10 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
                    </div>

                    <h1 className="text-7xl md:text-8xl font-serif font-black tracking-[-0.05em] mb-4 animate-blur-spread">
                        Sión<span className="text-brand-primary">.</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/30 ml-2 animate-reveal" style={{ animationDelay: '0.8s' }}>
                        Espiritualidad Digital
                    </p>
                </header>

                <div className="w-full space-y-12 animate-reveal" style={{ animationDelay: '1s' }}>

                    {/* Primary Action (Google) */}
                    <section className="flex flex-col gap-6">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full h-[72px] bg-white text-black rounded-full flex items-center justify-center gap-4 transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="font-black text-sm tracking-tight">Continuar con Google</span>
                        </button>
                    </section>

                    {/* Secondary Actions Collapsible */}
                    <section className="text-center">
                        {!showEmailFields ? (
                            <button
                                onClick={() => setShowEmailFields(true)}
                                className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-brand-primary transition-colors py-4 px-8 border border-white/5 rounded-full hover:border-brand-primary/20"
                            >
                                ¿Usar otro método?
                            </button>
                        ) : (
                            <div className="space-y-8 animate-reveal">
                                <form onSubmit={handleAuth} className="space-y-4">
                                    <input
                                        type="email"
                                        value={email}
                                        placeholder="Tu correo"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 focus:ring-1 focus:ring-brand-primary/50 transition-all outline-none text-sm font-medium"
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="password"
                                        value={password}
                                        placeholder="Tu contraseña"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 focus:ring-1 focus:ring-brand-primary/50 transition-all outline-none text-sm font-medium"
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    {mode === 'register' && (
                                        <div className="flex items-center gap-3 px-2 py-2 text-left">
                                            <input
                                                type="checkbox"
                                                id="terms-check"
                                                checked={acceptTerms}
                                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-primary"
                                                required
                                            />
                                            <label htmlFor="terms-check" className="text-[9px] font-bold text-white/40 leading-tight">
                                                Acepto <Link to="/terms" className="text-brand-primary">Términos</Link> y <Link to="/privacy" className="text-brand-primary">Privacidad</Link>.
                                            </label>
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 bg-brand-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-30"
                                    >
                                        {loading ? '...' : (mode === 'login' ? 'Entrar' : 'Registrarse')}
                                    </button>
                                </form>
                                <button
                                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                    className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-brand-primary"
                                >
                                    {mode === 'login' ? '¿No tienes cuenta? Crear una' : 'Ya tengo cuenta - Entrar'}
                                </button>
                                <button
                                    onClick={() => setShowEmailFields(false)}
                                    className="block mx-auto mt-4 text-[9px] font-black uppercase tracking-widest text-white/10"
                                >
                                    Volver
                                </button>
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer Credits */}
                <footer className="mt-24 opacity-10 flex items-center gap-4">
                    <div className="w-12 h-px bg-white" />
                    <span className="text-[9px] font-black uppercase tracking-[0.5em]">Iglesia Digital</span>
                    <div className="w-12 h-px bg-white" />
                </footer>
            </main>

            {/* Side Accents - Cinematic Borders */}
            <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-brand-primary/20 to-transparent" />
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-brand-primary/20 to-transparent" />

        </div>
    );
};

export default LoginScreen;
