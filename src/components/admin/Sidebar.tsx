import React from 'react';

interface SidebarProps {
    activeModule: string;
    setActiveModule: (module: string) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    showHelp: boolean;
    setShowHelp: (show: boolean) => void;
}

const SidebarItem = ({ icon, label, isActive, onClick }: { icon: string, label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 group
      ${isActive
                ? 'bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian shadow-lg'
                : 'hover:bg-brand-primary/10 text-brand-obsidian/60 dark:text-white/60'} 
    `}
    >
        <span className={`material-symbols-outlined transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
        <span className="font-bold text-xs uppercase tracking-[0.15em]">{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />}
    </button>
);

export const AdminSidebar: React.FC<SidebarProps> = ({
    activeModule, setActiveModule, isMobileMenuOpen, setIsMobileMenuOpen, showHelp, setShowHelp
}) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm animate-in fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className={`
        fixed top-0 bottom-0 left-0 z-50 w-[85vw] md:w-72 bg-white dark:bg-brand-surface border-r border-brand-obsidian/5 dark:border-white/5 flex flex-col h-[100dvh]
        transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 md:h-screen
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}
      `}>
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-center">
                    <div className="flex items-center gap-4 text-brand-obsidian dark:text-white mb-2">
                        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-obsidian">
                            <span className="material-symbols-outlined font-black">admin_panel_settings</span>
                        </div>
                        <div>
                            <h1 className="font-serif font-bold text-lg leading-none">Panel Admin</h1>
                            <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mt-1">Monte de Sión</p>
                        </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-brand-obsidian/50">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                    <p className="px-6 text-[10px] font-black text-brand-obsidian/30 dark:text-white/30 uppercase tracking-widest mb-4">Módulos</p>
                    <SidebarItem icon="dashboard" label="Dashboard" isActive={activeModule === 'dashboard'} onClick={() => { setActiveModule('dashboard'); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon="newspaper" label="Noticias" isActive={activeModule === 'news'} onClick={() => { setActiveModule('news'); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon="calendar_today" label="Agenda" isActive={activeModule === 'events'} onClick={() => { setActiveModule('events'); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon="groups" label="Mi Ministerio" isActive={activeModule === 'my-ministry'} onClick={() => { setActiveModule('my-ministry'); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon="qr_code" label="Asistencia" isActive={activeModule === 'attendance'} onClick={() => { setActiveModule('attendance'); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon="group" label="Comunidad" isActive={activeModule === 'users'} onClick={() => { setActiveModule('users'); setIsMobileMenuOpen(false); }} />

                    <div className="my-4 h-px bg-brand-obsidian/5 dark:bg-white/5 mx-6"></div>

                    <SidebarItem icon="settings" label="Ajustes" isActive={activeModule === 'settings'} onClick={() => { setActiveModule('settings'); setIsMobileMenuOpen(false); }} />
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-brand-obsidian/5 dark:border-white/5">
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-xs font-bold uppercase tracking-widest
            ${showHelp ? 'bg-amber-100 text-amber-600' : 'bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white hover:bg-brand-primary/20'} `}
                    >
                        <span className="material-symbols-outlined text-sm">{showHelp ? 'lightbulb' : 'help'}</span>
                        {showHelp ? 'Ocultar Ayuda' : 'Ver Ayuda'}
                    </button>
                </div>
            </div>
        </>
    );
};
