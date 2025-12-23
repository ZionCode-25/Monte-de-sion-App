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
                    if (error.message === 'Invalid login credentials') throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
                    if (error.message === 'Email not confirmed') throw new Error('Tu email no ha sido confirmado. Revisa tu bandeja de entrada.');
                    throw error;
                }
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: email.split('@')[0], // Nombre temporal basado en email
                            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
                        }
                    }
                });
                if (error) throw error;
                alert('¡Registro exitoso! Ya puedes iniciar sesión.');
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
            setError('Error al iniciar con Google: ' + err.message);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-brand-obsidian text-white' : 'bg-brand-silk text-brand-obsidian'}`}>
            <div className={`w-full max-w-md p-8 rounded-2xl border backdrop-blur-xl ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-brand-obsidian/5 border-brand-obsidian/10'}`}>

                <div className="text-center mb-8">
                    <h1 className="font-outfit font-black text-3xl mb-2 uppercase tracking-tight">Monte de Sión</h1>
                    <p className="text-sm opacity-60 font-medium tracking-widest uppercase">Iglesia Digital</p>
                </div>

                <h2 className="text-xl font-bold mb-6 text-center">{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none focus:ring-2 transition-all border-current opacity-50 focus:opacity-100 placeholder-current/30"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none focus:ring-2 transition-all border-current opacity-50 focus:opacity-100 placeholder-current/30"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 bg-brand-primary text-brand-obsidian hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
                        >
                            {loading ? 'Procesando...' : (mode === 'login' ? 'Entrar' : 'Registrarse')}
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-current opacity-10"></div>
                            <span className="flex-shrink-0 mx-4 text-[10px] uppercase font-bold opacity-40">O continúa con</span>
                            <div className="flex-grow border-t border-current opacity-10"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 border hover:bg-white/5 active:scale-95 ${theme === 'dark' ? 'border-white/10 text-white' : 'border-brand-obsidian/10 text-brand-obsidian'}`}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => {
                            setMode(mode === 'login' ? 'register' : 'login');
                            setError(null);
                        }}
                        className="text-xs uppercase tracking-wider font-bold opacity-60 hover:opacity-100 transition-opacity underline decoration-brand-primary underline-offset-4"
                    >
                        {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
