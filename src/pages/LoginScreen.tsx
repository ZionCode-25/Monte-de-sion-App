
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/context/ToastContext';
import { Link } from 'react-router-dom';

interface LoginScreenProps {
    theme?: 'light' | 'dark';
}

const LoginScreen: React.FC<LoginScreenProps> = ({ theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
                if (password !== confirmPassword) {
                    showToast('Las contraseñas no coinciden', 'error');
                    setLoading(false);
                    return;
                }
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

            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-[-10%] left-[-20%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,183,0,0.1)_0%,transparent_50%)] animate-slow-zoom" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,143,0,0.05)_0%,transparent_60%)] animate-pulse-glow" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10" />
            </div>

            <main className="w-full max-w-lg z-10 px-8 flex flex-col items-center">

                {/* Refined Branding Header */}
                <header className="mb-14 text-center animate-reveal">
                    <div className="w-24 h-24 mb-10 mx-auto relative group">
                        <img
                            src="/images/logo-dorado.png"
                            alt="Logo Monte de Sión"
                            className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,183,0,0.3)] group-hover:scale-110 transition-transform duration-700 animate-[breath_6s_ease-in-out_infinite]"
                        />
                        <div className="absolute inset-0 bg-brand-primary/5 blur-3xl rounded-full scale-150 opacity-50" />
                    </div>

                    <div className="h-20 flex items-center justify-center">
                        <h1 className="text-5xl md:text-6xl font-serif font-black tracking-tighter animate-blur-spread leading-none whitespace-nowrap">
                            Monte de <span className="text-brand-primary">Sión</span>
                        </h1>
                    </div>

                    <div className="flex items-center justify-center gap-4 animate-reveal" style={{ animationDelay: '0.8s' }}>
                        <div className="h-px w-8 bg-brand-primary/20" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
                            nuestra Iglesia digital
                        </p>
                        <div className="h-px w-8 bg-brand-primary/20" />
                    </div>
                </header>

                <div className="w-full space-y-12 animate-reveal" style={{ animationDelay: '1s' }}>

                    {/* Primary Action (Google) */}
                    <section className="flex flex-col gap-6">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full h-[72px] bg-white text-black rounded-full flex items-center justify-center gap-4 transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_50px_rgba(255,255,255,0.15)] group"
                        >
                            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
                            <div className="flex flex-col gap-6">
                                <button
                                    onClick={() => setShowEmailFields(true)}
                                    className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-brand-primary transition-all py-4 px-8 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10"
                                >
                                    ¿Otro método?
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-reveal">
                                <form onSubmit={handleAuth} className="space-y-4">
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            value={email}
                                            placeholder="Tu correo"
                                            className="w-full bg-white/10 border border-white/20 rounded-2xl h-14 px-6 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all outline-none text-sm font-medium placeholder:text-white/30"
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            value={password}
                                            placeholder="Tu contraseña"
                                            className="w-full bg-white/10 border border-white/20 rounded-2xl h-14 px-6 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all outline-none text-sm font-medium placeholder:text-white/30"
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {mode === 'register' && (
                                        <div className="relative group animate-in slide-in-from-top-2">
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                placeholder="Confirmar contraseña"
                                                className="w-full bg-white/10 border border-white/20 rounded-2xl h-14 px-6 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all outline-none text-sm font-medium placeholder:text-white/30"
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}
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
                                        className="w-full h-14 bg-brand-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/5"
                                    >
                                        {loading ? '...' : (mode === 'login' ? 'Entrar' : 'Registrarse')}
                                    </button>
                                </form>
                                <div className="flex flex-col gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                        className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-brand-primary p-2 bg-white/5 rounded-xl border border-white/5 transition-all"
                                    >
                                        {mode === 'login' ? '¿No tienes cuenta? Crear una' : 'Ya tengo cuenta - Entrar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmailFields(false)}
                                        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                                    >
                                        Volver al inicio
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

            </main>

            {/* Sidebar Subtle Accents */}
            <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
            <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />

            <style>{`
                @keyframes breath {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.05); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default LoginScreen;
