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
            <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-20">
                {isLoading ? (
                    <div className="py-20 text-center opacity-40">CARGANDO...</div>
                ) : ministries.length === 0 ? (
                    <div className="py-32 text-center border-2 border-dashed border-brand-obsidian/5 dark:border-white/5 rounded-[3rem]">
                        <span className="material-symbols-outlined text-6xl opacity-20 mb-4">diversity_3</span>
                        <p className="text-brand-obsidian/40 dark:text-white/40 font-bold">No hay ministerios registrados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {ministries.map(m => (
                            <div key={m.id} className="bg-white dark:bg-brand-surface p-6 rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl" style={{ backgroundColor: m.color || '#666' }}>
                                        <span className="material-symbols-outlined font-light">
                                            {m.category === 'Alabanza' ? 'music_note' : m.category === 'Enseñanza' ? 'school' : 'diversity_3'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(m)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('¿Eliminar ministerio?')) deleteMinistry.mutate(m.id); }}
                                            className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-brand-obsidian dark:text-white mb-2">{m.name}</h3>
                                <p className="text-xs text-brand-obsidian/50 dark:text-white/50 line-clamp-2 mb-4 h-[2.5em]">{m.vision || 'Sin descripción definida.'}</p>

                                <div className="pt-4 border-t border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{m.category}</span>
                                    <span className="text-[10px] font-bold bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">{m.leader_id ? 'Líder Asignado' : 'Sin Líder'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <h3 className="text-2xl font-serif font-bold mb-6 dark:text-white">{editingId ? 'Editar' : 'Crear'} Ministerio</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase opacity-40">Nombre</label>
                                <input className="w-full bg-brand-silk/50 dark:bg-white/5 p-3 rounded-xl dark:text-white outline-none font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Ministerio de Alabanza" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-40">Categoría</label>
                                    <select className="w-full bg-brand-silk/50 dark:bg-white/5 p-3 rounded-xl dark:text-white outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option>Alabanza</option>
                                        <option>Enseñanza</option>
                                        <option>Servicio</option>
                                        <option>Misiones</option>
                                        <option>Jóvenes</option>
                                        <option>Niños</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-40">Color (Hex)</label>
                                    <div className="flex items-center gap-2 bg-brand-silk/50 dark:bg-white/5 p-2 rounded-xl">
                                        <input type="color" className="w-8 h-8 rounded cursor-pointer border-none" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                                        <span className="text-xs opacity-50 font-mono">{formData.color}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase opacity-40">Visión / Descripción</label>
                                <textarea className="w-full bg-brand-silk/50 dark:bg-white/5 p-3 rounded-xl dark:text-white outline-none resize-none h-24 text-sm" value={formData.vision} onChange={e => setFormData({ ...formData, vision: e.target.value })} placeholder="Breve descripción del propósito..." />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase opacity-40">Horarios (Texto)</label>
                                <input className="w-full bg-brand-silk/50 dark:bg-white/5 p-3 rounded-xl dark:text-white outline-none text-sm" value={formData.schedule} onChange={e => setFormData({ ...formData, schedule: e.target.value })} placeholder="Ej: Domingos 10:00 AM" />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8 pt-6 border-t border-brand-obsidian/5 dark:border-white/5">
                            <button onClick={resetForm} className="px-6 py-3 rounded-xl font-bold uppercase text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                            <button onClick={handleSubmit} className="flex-1 bg-brand-obsidian dark:bg-amber-500 text-white dark:text-brand-obsidian rounded-xl py-3 font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform">{editingId ? 'Guardar Cambios' : 'Crear'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMinistry;
