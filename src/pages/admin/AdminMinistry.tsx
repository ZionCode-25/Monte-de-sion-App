import React, { useState } from 'react';
import { useMinistries, Ministry } from '../../hooks/useMinistries';

const AdminMinistry: React.FC = () => {
    const { ministries, isLoading, createMinistry, updateMinistry, deleteMinistry } = useMinistries();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Ministry>>({
        name: '',
        leader_id: '',
        category: 'Alabanza',
        vision: '',
        purpose: '',
        activities: '',
        schedule: '',
        color: '#EAB308',
    });

    const resetForm = () => {
        setFormData({ name: '', leader_id: '', category: 'Alabanza', vision: '', purpose: '', activities: '', schedule: '', color: '#EAB308' });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (m: Ministry) => {
        setFormData(m);
        setEditingId(m.id);
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name) return;
        try {
            if (editingId) {
                await updateMinistry.mutateAsync({ id: editingId, updates: formData });
            } else {
                await createMinistry.mutateAsync(formData);
            }
            resetForm();
        } catch (error) {
            console.error(error);
            alert("Error al guardar");
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F8F9FA] dark:bg-black/95">
            {/* Header */}
            <div className="p-8 md:p-12 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight mb-2">
                        Gestión de <span className="text-amber-500">Ministerios</span>
                    </h2>
                    <p className="text-brand-obsidian/40 dark:text-white/40 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                        Administra los equipos, líderes y visión de cada área ministerial.
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-brand-obsidian dark:bg-amber-500 text-white dark:text-brand-obsidian px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nuevo Ministerio
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-20 scrollbar-hide">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-40">
                        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cargando Ministerios</span>
                    </div>
                ) : ministries.length === 0 ? (
                    <div className="py-32 text-center border-2 border-dashed border-brand-obsidian/5 dark:border-white/5 rounded-[4rem]">
                        <span className="material-symbols-outlined text-7xl opacity-10 mb-6">diversity_3</span>
                        <p className="text-brand-obsidian/30 dark:text-white/30 font-serif italic text-2xl">No hay ministerios registrados aún.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {ministries.map(m => (
                            <div key={m.id} className="group relative bg-white dark:bg-brand-surface rounded-[3rem] border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full">

                                {/* Header Color Strip */}
                                <div className="h-2 w-full" style={{ backgroundColor: m.color || '#666' }} />

                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transform group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: m.color || '#666', boxShadow: `0 10px 30px ${m.color}33` }}>
                                            <span className="material-symbols-outlined text-3xl font-light">
                                                {m.category === 'Alabanza' ? 'music_note' : m.category === 'Enseñanza' ? 'school' : m.category === 'Servicio' ? 'volunteer_activism' : m.category === 'Misiones' ? 'public' : m.category === 'Jóvenes' ? 'bolt' : m.category === 'Niños' ? 'child_care' : 'diversity_3'}
                                            </span>
                                        </div>

                                        {/* Actions Visible & Accessible */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(m)}
                                                className="w-10 h-10 bg-brand-obsidian/5 dark:bg-white/5 hover:bg-brand-obsidian dark:hover:bg-amber-500 hover:text-white dark:hover:text-brand-obsidian rounded-2xl transition-all duration-300 flex items-center justify-center shadow-sm"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={() => { if (confirm('¿Eliminar ministerio?')) deleteMinistry.mutate(m.id); }}
                                                className="w-10 h-10 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl transition-all duration-300 flex items-center justify-center shadow-sm"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">{m.category}</span>
                                        </div>
                                        <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-3 group-hover:text-amber-500 transition-colors">{m.name}</h3>
                                        <p className="text-xs text-brand-obsidian/50 dark:text-white/40 line-clamp-3 leading-relaxed font-medium italic">
                                            {m.vision ? `"${m.vision}"` : 'Sin misión definida.'}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${m.leader_id ? 'bg-emerald-500 animate-pulse' : 'bg-brand-obsidian/20'}`} />
                                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{m.leader_id ? 'Líder Asignado' : 'Sin Líder'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            <span className="text-[10px] font-black">{m.schedule || '--:--'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[#F8F9FA] dark:bg-[#1A1A1A] w-full max-w-5xl rounded-[3rem] shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-hidden flex flex-col md:flex-row">

                        {/* Editor Side */}
                        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar border-r border-brand-obsidian/5 dark:border-white/5">
                            <h3 className="text-3xl font-serif font-bold mb-8 dark:text-white">{editingId ? 'Editar' : 'Crear'} Ministerio</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Nombre del Ministerio</label>
                                    <input className="w-full bg-white dark:bg-white/5 p-4 rounded-2xl dark:text-white outline-none font-bold shadow-sm focus:ring-2 focus:ring-brand-primary transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Ministerio de Alabanza" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Categoría</label>
                                        <select className="w-full bg-white dark:bg-white/5 p-4 rounded-2xl dark:text-white outline-none shadow-sm" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                            <option>Alabanza</option>
                                            <option>Enseñanza</option>
                                            <option>Servicio</option>
                                            <option>Misiones</option>
                                            <option>Jóvenes</option>
                                            <option>Niños</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Color Identificador</label>
                                        <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-3 rounded-2xl shadow-sm">
                                            <input type="color" className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                                            <span className="text-xs font-mono font-bold opacity-60 uppercase">{formData.color}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Visión / Misión</label>
                                    <textarea className="w-full bg-white dark:bg-white/5 p-4 rounded-2xl dark:text-white outline-none resize-none h-32 text-sm leading-relaxed shadow-sm" value={formData.vision} onChange={e => setFormData({ ...formData, vision: e.target.value })} placeholder="Describe el propósito de este ministerio..." />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Horarios de Reunión</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm opacity-30">schedule</span>
                                        <input className="w-full bg-white dark:bg-white/5 pl-12 pr-4 py-4 rounded-2xl dark:text-white outline-none text-sm shadow-sm" value={formData.schedule} onChange={e => setFormData({ ...formData, schedule: e.target.value })} placeholder="Ej: Domingos 10:00 AM" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-12 bg-white/50 dark:bg-black/20 p-4 rounded-3xl">
                                <button onClick={resetForm} className="px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                                <button onClick={handleSubmit} className="flex-1 bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian rounded-2xl py-4 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                    {editingId ? 'Actualizar Ministerio' : 'Publicar Ministerio'}
                                </button>
                            </div>
                        </div>

                        {/* Preview Side */}
                        <div className="hidden lg:flex flex-col w-[380px] bg-brand-silk dark:bg-zinc-900 border-l border-brand-obsidian/5 dark:border-white/5 p-8 overflow-y-auto">
                            <div className="flex items-center gap-2 mb-8 opacity-40">
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">Vista Previa en App</span>
                            </div>

                            <div className="bg-white dark:bg-brand-surface rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-obsidian/5 dark:border-white/5">
                                <div className="h-40 flex items-center justify-center text-white" style={{ backgroundColor: formData.color }}>
                                    <span className="material-symbols-outlined text-6xl font-light">
                                        {formData.category === 'Alabanza' ? 'music_note' : formData.category === 'Enseñanza' ? 'school' : 'diversity_3'}
                                    </span>
                                </div>
                                <div className="p-8">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-primary mb-2 block">{formData.category}</span>
                                    <h4 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-4">{formData.name || 'Nombre del Ministerio'}</h4>
                                    <div className="h-px bg-brand-obsidian/5 dark:bg-white/5 mb-6" />
                                    <p className="text-xs text-brand-obsidian/60 dark:text-white/60 leading-relaxed mb-6 italic">
                                        "{formData.vision || 'Aquí se mostrará la visión de tu ministerio una vez que la redactes.'}"
                                    </p>
                                    <div className="flex items-center gap-3 text-brand-obsidian/40 dark:text-white/40">
                                        <span className="material-symbols-outlined text-base">schedule</span>
                                        <span className="text-[10px] font-bold">{formData.schedule || 'Horario no definido'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-8">
                                <p className="text-[9px] text-center opacity-30 font-bold leading-relaxed">
                                    Esta es una representación aproximada de cómo los miembros verán el ministerio en su feed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMinistry;
