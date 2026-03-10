import React from 'react';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { formatDateForDisplay, formatTimeForDisplay, getDayNumber, getMonthName } from '../../utils/dateUtils';

interface AdminDashboardProps {
    user: any;
    setActiveModule: (module: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, setActiveModule }) => {
    const { stats, recentActivity, isLoading } = useAdminDashboard(user);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    const metricCards = [
        {
            title: 'Alcance Total',
            subtitle: 'Usuarios registrados',
            value: stats.users,
            icon: 'groups',
            color: 'from-blue-600 to-indigo-600',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'Noticias',
            subtitle: 'Historias publicadas',
            value: stats.news,
            icon: 'menu_book',
            color: 'from-emerald-600 to-teal-600',
            bg: 'bg-emerald-500/10'
        },
        {
            title: 'Eventos',
            subtitle: 'Próximas citas',
            value: stats.events,
            icon: 'event_available',
            color: 'from-violet-600 to-purple-600',
            bg: 'bg-violet-500/10'
        },
        {
            title: 'Ministerios',
            subtitle: 'Grupos activos',
            value: stats.ministries,
            icon: 'account_tree',
            color: 'from-amber-600 to-orange-600',
            bg: 'bg-amber-500/10'
        },
    ];

    const quickActions = [
        { label: 'Nueva Noticia', icon: 'add_box', module: 'news', desc: 'Publicar avance' },
        { label: 'Crear Evento', icon: 'calendar_add_on', module: 'events', desc: 'Gestionar agenda' },
        { label: 'Ver Usuarios', icon: 'person_search', module: 'users', desc: 'Gestionar perfiles' },
        { label: 'Ajustes', icon: 'tune', module: 'settings', desc: 'Configuración' },
    ];

    if (isLoading) return (
        <div className="flex h-full items-center justify-center bg-brand-bg dark:bg-black">
            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-black/40">
            <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 1. PREMIUM HEADER */}
                <header className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary opacity-80">Sistema en Línea</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-brand-obsidian dark:text-white leading-[0.9] tracking-tighter">
                            {greeting()}, <br className="hidden md:block" />
                            <span className="text-brand-primary">{user?.user_metadata?.name?.split(' ')[0] || 'Admin'}</span>
                        </h1>
                        <p className="text-sm font-medium text-brand-obsidian/40 dark:text-white/40 max-w-md">
                            Aquí tienes el pulso actual de la congregación y el estado general de la plataforma.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-2 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="px-6 py-2 text-right hidden sm:block">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none">Hoy es</p>
                            <p className="text-base font-bold font-serif dark:text-white capitalize">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        </div>
                        <div className="w-14 h-14 bg-brand-primary rounded-[1.5rem] flex items-center justify-center text-brand-obsidian shadow-lg">
                            <span className="material-symbols-outlined text-3xl font-black">dashboard_customize</span>
                        </div>
                    </div>
                </header>

                {/* 2. METRIC CONSOLE (Glassmorphism) */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metricCards.map((metric, idx) => (
                        <div key={idx} className="group relative overflow-hidden bg-white dark:bg-brand-surface p-6 rounded-[2.5rem] border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metric.color} opacity-[0.03] rounded-bl-full group-hover:scale-125 transition-transform duration-700`}></div>
                            <div className="flex justify-between items-start relative z-10 mb-6">
                                <div className={`w-14 h-14 rounded-2xl ${metric.bg} flex items-center justify-center text-brand-obsidian dark:text-white group-hover:scale-110 transition-transform duration-500`}>
                                    <span className={`material-symbols-outlined text-2xl bg-gradient-to-br ${metric.color} bg-clip-text text-transparent font-black`}>
                                        {metric.icon}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Premium Stats</span>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-5xl font-serif font-black text-brand-obsidian dark:text-white leading-none tracking-tighter mb-1">
                                    {metric.value}
                                </h3>
                                <p className="text-[11px] font-black uppercase tracking-widest text-brand-primary">{metric.title}</p>
                                <p className="text-[10px] opacity-40 font-medium mt-1">{metric.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* 3. QUICK COMMAND CENTER */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-brand-primary rounded-full"></div>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-obsidian/40 dark:text-white/40 italic">Comandos Rápidos</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveModule(action.module)}
                                className="group bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 md:p-6 rounded-[2rem] flex flex-col items-center text-center gap-3 hover:bg-brand-obsidian hover:dark:bg-brand-primary transition-all duration-300 shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-brand-silk dark:bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <span className="material-symbols-outlined text-2xl group-hover:text-white transition-colors">{action.icon}</span>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest group-hover:text-white">{action.label}</p>
                                    <p className="text-[9px] opacity-40 uppercase font-bold group-hover:text-white/60 group-hover:opacity-100">{action.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 4. ACTIVITY SPLIT VIEW */}
                <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Recent News - 3 columns */}
                    <div className="lg:col-span-3 bg-white dark:bg-brand-surface rounded-[3.5rem] p-8 md:p-10 border border-brand-obsidian/5 dark:border-white/5 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white">Editorial</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Últimas Historias</p>
                            </div>
                            <button onClick={() => setActiveModule('news')} className="w-10 h-10 rounded-full bg-brand-silk dark:bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-brand-obsidian transition-all group/btn">
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {recentActivity.news.map((n: any) => (
                                <div
                                    key={n.id}
                                    onClick={() => setActiveModule('news')}
                                    className="group flex gap-5 items-center p-4 bg-gray-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-brand-primary/10 rounded-[2rem] transition-all cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/10"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-white/10 overflow-hidden flex-shrink-0 shadow-inner">
                                        {n.image_url ? (
                                            <img src={n.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={n.title} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-20"><span className="material-symbols-outlined">newspaper</span></div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">{n.category || 'General'}</span>
                                        </div>
                                        <h4 className="font-bold text-base text-brand-obsidian dark:text-white line-clamp-1 leading-tight">{n.title}</h4>
                                        <p className="text-[10px] opacity-50 font-medium uppercase tracking-tight">{formatDateForDisplay(n.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                            {recentActivity.news.length === 0 && (
                                <div className="text-center py-10 opacity-30 italic text-sm font-serif">Sin noticias recientes</div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events - 2 columns */}
                    <div className="lg:col-span-2 bg-brand-obsidian rounded-[3.5rem] p-8 md:p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-brand-primary/20 transition-all duration-700"></div>

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h3 className="text-2xl font-serif font-bold italic">Agenda</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Citas Próximas</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {recentActivity.events.map((e: any) => (
                                <div
                                    key={e.id}
                                    onClick={() => setActiveModule('events')}
                                    className="group flex gap-4 items-center p-4 bg-white/5 hover:bg-white/10 rounded-[2.2rem] transition-all cursor-pointer backdrop-blur-md border border-white/5"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-brand-primary text-brand-obsidian flex flex-col items-center justify-center shrink-0 shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                                        <span className="text-lg font-black leading-none">{getDayNumber(e.date)}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{getMonthName(e.date)}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm line-clamp-1 mb-1">{e.title}</h4>
                                        <div className="flex items-center gap-3 opacity-60">
                                            <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px] text-brand-primary">schedule</span>
                                                {formatTimeForDisplay(e.time)}
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                            <p className="text-[9px] font-black uppercase tracking-widest truncate max-w-[80px]">{e.location || 'Monte de Sión'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recentActivity.events.length === 0 && (
                                <div className="text-center py-10 opacity-30 italic text-sm font-serif">Sin eventos programados</div>
                            )}
                        </div>

                        <button
                            onClick={() => setActiveModule('events')}
                            className="mt-10 w-full py-4 bg-white/10 hover:bg-brand-primary hover:text-brand-obsidian rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10"
                        >
                            Ver Calendario Completo
                        </button>
                    </div>
                </section>

                {/* 5. SYSTEM FOOTER */}
                <footer className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-black/5 dark:border-white/5 opacity-50">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" className="h-6 grayscale opacity-50" alt="Logo" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Monte de Sión Console v1.2.0 • Premium Experience</p>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-[9px] font-black uppercase tracking-widest bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full">Encrypted Connection</span>
                        <span className="text-[9px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full">Pro Enterprise</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AdminDashboard;
