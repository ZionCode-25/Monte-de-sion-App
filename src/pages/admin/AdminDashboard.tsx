import React from 'react';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';

interface AdminDashboardProps {
    user: any;
    setActiveModule: (module: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, setActiveModule }) => {
    const { stats, recentActivity, isLoading } = useAdminDashboard(user);

    const statCards = [
        { title: 'Usuarios Totales', value: stats.users, icon: 'group', color: 'bg-blue-500' },
        { title: 'Noticias Publicadas', value: stats.news, icon: 'article', color: 'bg-emerald-500' },
        { title: 'Eventos Activos', value: stats.events, icon: 'event', color: 'bg-violet-500' },
        { title: 'App Version', value: '1.2.0', icon: 'smartphone', color: 'bg-brand-primary' },
    ];

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-12 animate-in fade-in duration-500 bg-brand-bg dark:bg-black/90 h-full overflow-y-auto">
            <div className="mb-12">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight">
                    Dashboard
                </h2>
                <p className="mt-2 text-brand-obsidian/40 dark:text-white/40 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                    Bienvenido, {user?.user_metadata?.full_name || 'Administrador'}. Resumen general.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-brand-surface p-6 rounded-[2.5rem] border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                <span className="material-symbols-outlined">{stat.icon}</span>
                            </div>
                            <span className="text-[10px] font-black opacity-30 uppercase bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg">Estadística</span>
                        </div>
                        <h3 className="text-4xl font-black text-brand-obsidian dark:text-white mb-1 tracking-tighter">{stat.value}</h3>
                        <p className="text-xs font-bold text-brand-obsidian/50 dark:text-white/50 uppercase tracking-widest">{stat.title}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/5 dark:border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl text-brand-obsidian dark:text-white">Últimas Noticias</h3>
                        <button onClick={() => setActiveModule('news')} className="text-xs font-black uppercase tracking-widest text-brand-primary hover:underline">Ver todo</button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.news.map((n: any) => (
                            <div key={n.id} className="flex gap-4 items-center p-3 hover:bg-brand-silk dark:hover:bg-white/5 rounded-2xl transition-colors cursor-pointer" onClick={() => setActiveModule('news')}>
                                <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                                    {n.image_url && <img src={n.image_url} className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-brand-obsidian dark:text-white line-clamp-1">{n.title}</h4>
                                    <p className="text-xs opacity-50">{new Date(n.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/5 dark:border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl text-brand-obsidian dark:text-white">Próximos Eventos</h3>
                        <button onClick={() => setActiveModule('events')} className="text-xs font-black uppercase tracking-widest text-brand-primary hover:underline">Ver todo</button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.events.map((e: any) => (
                            <div key={e.id} className="flex gap-4 items-center p-3 hover:bg-brand-silk dark:hover:bg-white/5 rounded-2xl transition-colors cursor-pointer" onClick={() => setActiveModule('events')}>
                                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex flex-col items-center justify-center text-brand-primary shrink-0">
                                    <span className="text-xs font-black">{e.date.split('/')[0] || e.date.split('-')[2]}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-brand-obsidian dark:text-white line-clamp-1">{e.title}</h4>
                                    <p className="text-xs opacity-50">{e.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
