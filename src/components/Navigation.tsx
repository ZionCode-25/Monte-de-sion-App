
// Build Trigger: 2026-02-19 13:40
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './context/AuthContext';
import { AppScreen, AppRole } from '../types';

interface NavigationProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  userRole: AppRole;
  theme: 'light' | 'dark';
  isAdmin?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentScreen, onNavigate, userRole, theme, isAdmin = false }) => {
  const { user } = useAuth();
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  // Fetch Unread Notifications Count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false); // Note: using is_read (snake_case) as per DB

      if (error) return 0;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Polling every 30s as fallback to realtime
  });

  // Lock body scroll when menu is open
  React.useEffect(() => {
    if (isPortalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPortalOpen]);

  const navItems = [
    { id: 'dashboard', icon: 'home', label: 'Inicio' },
    { id: 'news', icon: 'newspaper', label: 'Noticias' },
    { id: 'community', icon: 'diversity_3', label: 'Comunidad' },
    { id: 'events', icon: 'event', label: 'Agenda' },
  ];

  const portalSections = [
    {
      title: 'Mi Camino',
      items: [
        { id: 'devotionals', label: 'Devocionales', icon: 'auto_stories', color: 'bg-brand-primary' },
        { id: 'ministries', label: 'Ministerios', icon: 'groups', color: 'bg-rose-500' },
        { id: 'prayer-requests', label: 'Peticiones', icon: 'volunteer_activism', color: 'bg-indigo-500' },
      ]
    },
    {
      title: 'Explorar',
      items: [
        { id: 'notifications', label: 'Notificaciones', icon: 'notifications', color: 'bg-blue-500', badge: unreadCount > 0 ? unreadCount : null },
        { id: 'about', label: 'Nosotros', icon: 'church', color: 'bg-emerald-500' },
        { id: 'profile', label: 'Mi Perfil', icon: 'person_filled', color: 'bg-amber-500' },
        { id: 'ranking', label: 'Ranking', icon: 'military_tech', color: 'bg-amber-600' },
      ]
    }
  ];

  const handleNav = (screen: string) => {
    onNavigate(screen as AppScreen);
    setIsPortalOpen(false);
  };

  return (
    <>
      {/* --- FULLSCREEN PORTAL --- */}
      <div
        className={`fixed inset-0 z-[500] transition-all duration-700 ease-[cubic-bezier(0.32,0,0.07,1)] ${isPortalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className={`absolute inset-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-3xl`}></div>

        <div className={`relative h-full flex flex-col p-8 pt-24 md:p-12 md:pt-32 transition-all duration-700 ${isPortalOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}>
          <div className="flex justify-between items-start mb-16">
            <div>
              <h2 className={`text-5xl md:text-6xl font-serif font-bold ${theme === 'dark' ? 'text-white' : 'text-brand-obsidian'} tracking-tighter leading-none`}>Menú <br /><span className="gold-text-gradient italic">Espiritual</span></h2>
              <p className={`${theme === 'dark' ? 'text-white/30' : 'text-brand-obsidian/30'} text-[10px] font-black uppercase tracking-[0.4em] mt-4`}>Iglesia Digital Sión</p>
            </div>
            <button
              onClick={() => setIsPortalOpen(false)}
              className={`w-14 h-14 rounded-2xl ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-brand-obsidian/5 border-brand-obsidian/10 text-brand-obsidian hover:bg-brand-obsidian/10'} border flex items-center justify-center active:scale-90 transition-all`}
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          <div className="flex-1 space-y-12 overflow-y-auto no-scrollbar pb-20">
            {isAdmin ? (
              /* ADMIN SIMPLIFIED MENU */
              <div className="flex flex-col items-center justify-center h-full gap-8">
                <div className="w-full">
                  <button
                    onClick={() => handleNav('dashboard')}
                    className="w-full bg-brand-obsidian/5 dark:bg-white/10 p-4 rounded-xl flex items-center justify-between group active:scale-95 transition-all"
                  >
                    <span className="text-brand-obsidian dark:text-white font-bold">Volver al Inicio</span>
                    <span className="material-symbols-outlined text-brand-obsidian dark:text-white group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
                <p className="text-white/40 text-center max-w-xs text-sm">Estás en modo administrador a pantalla completa.</p>
              </div>
            ) : (
              /* STANDARD MENU */
              <>
                {portalSections.map((section, idx) => (
                  <div key={idx} className="animate-reveal" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-6 ml-2">{section.title}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNav(item.id)}
                          className={`relative p-6 ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-brand-obsidian/5 border-brand-obsidian/5 hover:border-brand-obsidian/10'} rounded-[2.5rem] border flex flex-col gap-5 active:scale-95 transition-all text-left group`}
                        >
                          {/* Badge inside Menu Item */}
                          {item.badge && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg animate-bounce">
                              {item.badge > 9 ? '9+' : item.badge}
                            </div>
                          )}

                          <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-brand-obsidian shadow-lg group-hover:scale-110 transition-transform overflow-hidden`}>
                            <span className="material-symbols-outlined text-[22px] block">{item.icon}</span>
                          </div>
                          <span className={`font-bold ${theme === 'dark' ? 'text-white/90' : 'text-brand-obsidian/90'} text-sm tracking-tight`}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {(userRole === 'PASTOR' || userRole === 'SUPER_ADMIN') && (
                  <button
                    onClick={() => handleNav('admin')}
                    className="w-full py-8 bg-brand-primary rounded-[2.5rem] flex items-center justify-center gap-4 text-brand-obsidian font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                    Panel Administrativo
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- DOCK OR FLOATING ADMIN BUTTON --- */}
      {isAdmin ? (
        /* Floating Button for Admin */
        <button
          onClick={() => setIsPortalOpen(true)}
          className="fixed top-6 right-6 z-[400] w-12 h-12 rounded-full bg-brand-obsidian/10 dark:bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg border border-brand-obsidian/5 dark:border-white/5 active:scale-90 transition-all text-brand-obsidian dark:text-white"
        >
          <span className="material-symbols-outlined text-2xl">grid_view</span>
        </button>
      ) : (
        /* Standard Dock */
        <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[400] w-[94%] max-w-md">
          <div className="bg-brand-silk/90 dark:bg-brand-obsidian/90 backdrop-blur-2xl border border-brand-obsidian/20 dark:border-white/10 p-2 rounded-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1 justify-evenly">
              {navItems.map((item) => {
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as AppScreen)}
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'text-brand-primary' : 'text-brand-obsidian/60 dark:text-white/20'
                      }`}
                  >
                    <span className={`material-symbols-outlined text-[26px] ${isActive ? 'fill-1 scale-110' : 'scale-100 hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-brand-primary rounded-full shadow-[0_0_10px_#ffb700]"></div>}
                  </button>
                );
              })}
            </div>
            <div className="w-[1px] h-8 bg-brand-obsidian/10 dark:bg-white/5 mx-1"></div>
            <button
              onClick={() => setIsPortalOpen(true)}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 relative group overflow-hidden text-brand-obsidian/60 dark:text-white/30"
            >
              <span className="material-symbols-outlined text-[26px] relative z-10">grid_view</span>
              {/* Dock Badge */}
              {unreadCount > 0 && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-brand-obsidian dark:border-black z-20"></div>
              )}
            </button>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navigation;
