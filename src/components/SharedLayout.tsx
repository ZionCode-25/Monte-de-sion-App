import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { AppRole, User } from '../../types';
import Navigation from './Navigation';
import { LOGO_DARK_THEME, LOGO_LIGHT_THEME } from '../../constants';

interface Props {
    user: User;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const SharedLayout: React.FC<Props> = ({ user, theme, toggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const activeLogo = theme === 'dark' ? LOGO_DARK_THEME : LOGO_LIGHT_THEME;

    // Use location.pathname to determine current screen loosely for active states if needed
    // mapping route to AppScreen ID if Navigation needs it
    const getCurrentScreenId = () => {
        const path = location.pathname.split('/')[1] || 'dashboard';
        if (path === '') return 'dashboard';
        return path as any;
    };

    // Fetch unread notifications count
    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications', 'unread', user.id],
        queryFn: async () => {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;
            return count || 0;
        },
        // Refetch every minute to keep badge updated
        refetchInterval: 60000,
        enabled: !!user.id
    });

    return (
        <div className="transition-all duration-1000 pb-32 bg-brand-silk dark:bg-brand-obsidian opacity-100 min-h-screen">
            <header className={`fixed top-0 left-0 right-0 z-[110] h-20 px-5 flex items-center justify-between transition-all duration-500 backdrop-blur-3xl border-b ${location.pathname === '/about' ? 'bg-transparent border-transparent' : 'bg-brand-silk/70 dark:bg-brand-obsidian/70 border-brand-obsidian/10 dark:border-white/5'}`}>

                <button
                    className="relative group active:scale-90 transition-all"
                    onClick={() => navigate('/profile')}
                    aria-label="Perfil de usuario"
                >
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-brand-primary/30 p-[2px] bg-brand-silk dark:bg-brand-obsidian">
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-[10px]" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-brand-silk dark:border-brand-obsidian rounded-full"></div>
                </button>

                <div className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all" onClick={() => navigate('/')}>
                    <img src={activeLogo} alt="Logo" className="w-8 h-8 object-contain dark:brightness-125" />
                    <div className="flex flex-col text-center">
                        <span className="font-outfit font-black text-brand-obsidian dark:text-white tracking-tighter text-lg leading-none uppercase">Monte de Sión</span>
                        <span className="text-[7px] font-black text-brand-primary uppercase tracking-[0.4em] leading-none mt-1">Iglesia Digital</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/notifications')}
                    className="w-10 h-10 rounded-xl bg-brand-obsidian/10 dark:bg-white/5 flex items-center justify-center text-brand-obsidian dark:text-white/60 relative active:scale-90 transition-all border border-brand-obsidian/5 dark:border-white/5"
                    aria-label="Notificaciones"
                >
                    <span className="material-symbols-outlined text-2xl">notifications</span>
                    {unreadCount > 0 && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full shadow-[0_0_8px_#ffb700]"></div>
                    )}
                </button>
            </header>

            <main className="animate-screen-in pt-20 overflow-x-hidden">
                <Outlet />
            </main>

            <Navigation
                currentScreen={getCurrentScreenId()}
                // We pass a wrapper to onNavigate to use react-router navigate
                onNavigate={(screen) => navigate(screen === 'dashboard' ? '/' : `/${screen}`)}
                userRole={user.role}
                theme={theme}
            />
        </div>
    );
};

export default SharedLayout;
