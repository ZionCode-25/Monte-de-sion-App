import React, { useState, useEffect, useRef } from 'react';
import { useMinistries, Ministry } from '../../hooks/useMinistries';
import MinistryManager from '../../components/MinistryManager';
import { supabase } from '../../lib/supabase';

const AdminMinistry: React.FC = () => {
    const { ministries, isLoading, createMinistry, updateMinistry, deleteMinistry } = useMinistries();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeMinistryId, setActiveMinistryId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [potentialLeaders, setPotentialLeaders] = useState<{ id: string, name: string, avatar_url: string | null }[]>([]);

    const [formData, setFormData] = useState<Partial<Ministry>>({
        name: '',
        leader_id: '',
        category: 'Alabanza',
        vision: '',
        purpose: '',
        activities: '',
        schedule: '',
        color: '#EAB308',
        leader_image_url: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchLeaders = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, avatar_url')
                .in('role', ['SUPER_ADMIN', 'PASTOR', 'MINISTRY_LEADER']);
            if (!error && data) setPotentialLeaders(data);
        };
        fetchLeaders();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            leader_id: '',
            category: 'Alabanza',
            vision: '',
            purpose: '',
            activities: '',
            schedule: '',
            color: '#EAB308',
            leader_image_url: ''
        });
        setEditingId(null);
        setIsModalOpen(false);
        setActiveTab('editor'); // Reset tab
    };

    const handleEdit = (m: Ministry) => {
        setFormData({
            ...m,
            leader_id: m.leader_id || '',
        });
        setEditingId(m.id);
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `leader_${Date.now()}.${fileExt}`;
            const filePath = `leaders/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('ministry_images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('ministry_images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, leader_image_url: publicUrl }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
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

    if (activeMinistryId) {
        return (
            <div className="flex flex-col h-full bg-[#F8F9FA] dark:bg-black/95">
                <div className="p-8 md:p-12 pb-6 flex items-center gap-4">
                    <button
                        onClick={() => setActiveMinistryId(null)}
                        className="w-10 h-10 rounded-full bg-brand-silk dark:bg-white/5 flex items-center justify-center hover:bg-brand-primary transition-all"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-3xl font-serif font-bold dark:text-white">Gestionar <span className="text-amber-500">Equipo</span></h2>
                </div>
                <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-20">
                    <MinistryManager ministryId={activeMinistryId} isSuperAdmin={true} />
                </div>
            </div>
        );
    }

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
                            <div
                                key={m.id}
                                className="group relative bg-white/70 dark:bg-brand-surface/70 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-all duration-700 overflow-hidden flex flex-col h-[400px] cursor-pointer hover:-translate-y-2"
                                onClick={() => setActiveMinistryId(m.id)}
                            >
                                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 animate-pulse" style={{ backgroundColor: m.color || '#666' }} />
                                <div className="h-1.5 w-full shrink-0 opacity-50" style={{ backgroundColor: m.color || '#666' }} />

                                <div className="p-10 flex flex-col flex-1 relative z-10">
                                    <div className="flex justify-between items-start mb-10">
                                        <div
                                            className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transform group-hover:rotate-[10deg] transition-all duration-500 shrink-0 border-4 border-white dark:border-brand-surface/50 overflow-hidden bg-zinc-100 dark:bg-white/5"
                                            style={{
                                                backgroundColor: m.color || '#666',
                                                boxShadow: m.color ? `0 15px 40px ${m.color}44` : 'none'
                                            }}
                                        >
                                            {m.leader_image_url ? (
                                                <img src={m.leader_image_url} alt="Líder" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl font-light">
                                                    {m.category === 'Alabanza' ? 'music_note' : m.category === 'Enseñanza' ? 'school' : m.category === 'Servicio' ? 'volunteer_activism' : m.category === 'Misiones' ? 'public' : m.category === 'Jóvenes' ? 'bolt' : m.category === 'Niños' ? 'child_care' : 'diversity_3'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2 opacity-40 group-hover:opacity-100 translate-y-0 transition-all duration-500">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(m); }}
                                                className="w-11 h-11 bg-brand-silk dark:bg-white/10 hover:bg-brand-primary dark:hover:bg-brand-primary text-brand-obsidian dark:text-white hover:text-brand-obsidian rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg backdrop-blur-md"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); if (confirm('¿Eliminar ministerio?')) deleteMinistry.mutate(m.id); }}
                                                className="w-11 h-11 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg backdrop-blur-md"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60 dark:text-brand-primary">{m.category}</span>
                                        </div>
                                        <h3 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white mb-4 group-hover:text-amber-500 transition-colors line-clamp-2 tracking-tight">
                                            {m.name}
                                        </h3>
                                        <p className="text-sm text-brand-obsidian/50 dark:text-white/40 line-clamp-3 leading-relaxed font-medium italic">
                                            {m.vision ? `"${m.vision}"` : 'Sin misión definida.'}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-3 text-[11px] uppercase font-black tracking-[0.2em] text-brand-primary group-hover:gap-5 transition-all">
                                            Gestionar Equipo <span className="material-symbols-outlined text-lg">arrow_forward</span>
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
                <div className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-md flex items-center justify-center p-0 md:p-10 animate-in fade-in transition-all">
                    <div className="bg-[#F8F9FA] dark:bg-[#1A1A1A] w-full max-w-7xl h-full max-h-none md:max-h-[900px] rounded-none md:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 overflow-hidden flex flex-col relative">

                        {/* Persistent Header */}
                        <div className="flex flex-none justify-between items-center p-6 md:p-8 bg-white/50 dark:bg-white/5 backdrop-blur-md border-b border-brand-obsidian/5 dark:border-white/5 z-20">
                            <div>
                                <h3 className="text-xl md:text-3xl font-serif font-bold dark:text-white leading-tight">
                                    {editingId ? 'Editar' : 'Nuevo'} <span className="text-amber-500">Ministerio</span>
                                </h3>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Tab Toggle for Mobile */}
                                <div className="lg:hidden flex bg-brand-silk dark:bg-white/5 p-1 rounded-xl">
                                    <button
                                        onClick={() => setActiveTab('editor')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-white dark:bg-white/10 shadow-sm text-brand-primary' : 'opacity-40'}`}
                                    >
                                        Editor
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('preview')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-white/10 shadow-sm text-brand-primary' : 'opacity-40'}`}
                                    >
                                        Vista Previa
                                    </button>
                                </div>

                                <button onClick={resetForm} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand-silk dark:bg-white/5 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Form Area */}
                            <div className={`flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar border-r border-brand-obsidian/5 dark:border-white/5 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    {/* Leader Section */}
                                    <div className="md:col-span-2 bg-white/50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-white dark:border-white/5 flex flex-col md:flex-row items-center gap-10">
                                        <div className="relative group/avatar">
                                            <div className="w-32 h-32 rounded-full border-4 border-amber-500 overflow-hidden bg-zinc-100 dark:bg-white/10 flex items-center justify-center shadow-xl">
                                                {uploading ? (
                                                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                                ) : formData.leader_image_url ? (
                                                    <img src={formData.leader_image_url} alt="Líder" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-4xl opacity-20">person</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 w-10 h-10 bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-xl">upload</span>
                                            </button>
                                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                        </div>
                                        <div className="flex-1 space-y-4 text-center md:text-left">
                                            <div>
                                                <label className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-2 block">Imagen del Líder (PNG Recomendado)</label>
                                                <p className="text-xs opacity-40 leading-relaxed">Sube una fotografía profesional del líder. Se recomienda fondo transparente para mayor estética.</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-2 block">Asignar Líder del Sistema</label>
                                                <select
                                                    className="w-full bg-white dark:bg-black/40 p-3 rounded-2xl dark:text-white outline-none font-bold text-sm"
                                                    value={formData.leader_id}
                                                    onChange={e => setFormData({ ...formData, leader_id: e.target.value })}
                                                >
                                                    <option value="">Seleccionar líder...</option>
                                                    {potentialLeaders.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* General Info */}
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Nombre del Ministerio</label>
                                        <input
                                            className="w-full bg-white dark:bg-white/5 p-5 rounded-[1.5rem] dark:text-white outline-none font-bold text-xl shadow-sm focus:ring-2 focus:ring-amber-500 transition-all border border-brand-obsidian/5 dark:border-white/5"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ej: Ministerio de Alabanza"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Categoría</label>
                                        <select
                                            className="w-full bg-white dark:bg-white/5 p-4 rounded-2xl dark:text-white outline-none shadow-sm font-bold border border-brand-obsidian/5 dark:border-white/5"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option>Alabanza</option>
                                            <option>Enseñanza</option>
                                            <option>Servicio</option>
                                            <option>Misiones</option>
                                            <option>Jóvenes</option>
                                            <option>Niños</option>
                                            <option>Multimedia</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Color de Marca</label>
                                        <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-3 rounded-2xl shadow-sm border border-brand-obsidian/5 dark:border-white/5">
                                            <input type="color" className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent" value={formData.color || '#EAB308'} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                                            <span className="text-xs font-mono font-bold opacity-60 uppercase">{formData.color}</span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Visión y Misión</label>
                                        <textarea
                                            className="w-full bg-white dark:bg-white/5 p-5 rounded-[1.5rem] dark:text-white outline-none resize-none h-28 text-sm font-medium leading-relaxed shadow-sm border border-brand-obsidian/5 dark:border-white/5"
                                            value={formData.vision}
                                            onChange={e => setFormData({ ...formData, vision: e.target.value })}
                                            placeholder="Describe el foco principal del ministerio..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Propósito Central</label>
                                        <textarea
                                            className="w-full bg-white dark:bg-white/5 p-5 rounded-[1.5rem] dark:text-white outline-none resize-none h-28 text-sm font-medium leading-relaxed shadow-sm border border-brand-obsidian/5 dark:border-white/5"
                                            value={formData.purpose}
                                            onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                            placeholder="¿Por qué existe este ministerio?"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Actividades Clave</label>
                                        <textarea
                                            className="w-full bg-white dark:bg-white/5 p-5 rounded-[1.5rem] dark:text-white outline-none resize-none h-28 text-sm font-medium leading-relaxed shadow-sm border border-brand-obsidian/5 dark:border-white/5"
                                            value={formData.activities}
                                            onChange={e => setFormData({ ...formData, activities: e.target.value })}
                                            placeholder="Ej: Ensayos, reuniones, capacitaciones..."
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Horarios y Ubicación</label>
                                        <input
                                            className="w-full bg-white dark:bg-white/5 p-5 rounded-2xl dark:text-white outline-none font-bold text-sm shadow-sm border border-brand-obsidian/5 dark:border-white/5"
                                            value={formData.schedule}
                                            onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                                            placeholder="Ej: Sábados 19:00hs - Salón Principal"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview Panel */}
                            <div className={`lg:flex flex-col w-full lg:w-[450px] bg-brand-silk dark:bg-black/40 p-8 md:p-12 overflow-y-auto ${activeTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
                                <div className="sticky top-0">
                                    <h4 className="hidden lg:block text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-8 text-center">Vista Previa en Vivo</h4>

                                    <div className="bg-white dark:bg-brand-surface rounded-[3rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-white dark:border-white/5 relative group">
                                        <div className="h-44 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: formData.color || '#EAB308' }}>
                                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                                            {formData.leader_image_url ? (
                                                <img src={formData.leader_image_url} alt="Leader" className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-all duration-700" />
                                            ) : (
                                                <span className="material-symbols-outlined text-8xl font-light text-white/50">
                                                    {formData.category === 'Alabanza' ? 'music_note' : formData.category === 'Enseñanza' ? 'school' : 'diversity_3'}
                                                </span>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-brand-surface to-transparent" />
                                        </div>

                                        <div className="p-10 -mt-10 relative z-10">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: formData.color }} />
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">{formData.category}</span>
                                            </div>
                                            <h4 className="text-3xl font-serif font-bold dark:text-white mb-6 leading-tight">{formData.name || 'Nombre del Ministerio'}</h4>
                                            <div className="space-y-4">
                                                <div className="flex gap-3">
                                                    <span className="material-symbols-outlined text-amber-500 text-sm">visibility</span>
                                                    <p className="text-xs text-brand-obsidian/60 dark:text-white/60 leading-relaxed font-medium line-clamp-2">
                                                        {formData.vision || 'Nuestra misión es...'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <span className="material-symbols-outlined text-amber-500 text-sm">schedule</span>
                                                    <p className="text-xs text-brand-obsidian/60 dark:text-white/60 font-bold">
                                                        {formData.schedule || 'Horario a confirmar'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-brand-obsidian/5 dark:border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                                                        {potentialLeaders.find(p => p.id === formData.leader_id)?.avatar_url ? (
                                                            <img src={potentialLeaders.find(p => p.id === formData.leader_id)?.avatar_url!} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-xs opacity-30">person</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                                        {potentialLeaders.find(p => p.id === formData.leader_id)?.name || 'Líder no asignado'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 space-y-4">
                                        <button onClick={handleSubmit} className="w-full bg-brand-obsidian dark:bg-amber-500 text-white dark:text-brand-obsidian rounded-[2rem] py-6 font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-[1.03] active:scale-95 transition-all">
                                            {editingId ? 'Guardar Cambios' : 'Publicar Ahora'}
                                        </button>
                                        <p className="text-center text-[9px] font-black uppercase tracking-widest opacity-30 italic">Los cambios se verán reflejados instantáneamente en la App</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMinistry;
