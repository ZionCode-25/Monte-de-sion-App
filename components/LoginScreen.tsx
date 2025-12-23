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
                if (error) throw error;
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
                alert('Registro exitoso. Por favor revisa tu correo para confirmar si es necesario, o inicia sesión.');
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error');
        } finally {
            setLoading(false);
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
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
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
                            className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none focus:ring-2 transition-all border-current opacity-50 focus:opacity-100"
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
                            className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none focus:ring-2 transition-all border-current opacity-50 focus:opacity-100"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 bg-brand-primary text-brand-obsidian hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Procesando...' : (mode === 'login' ? 'Entrar' : 'Registrarse')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="text-xs uppercase tracking-wider font-bold opacity-60 hover:opacity-100 transition-opacity underline decoration-brand-primary"
                    >
                        {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
