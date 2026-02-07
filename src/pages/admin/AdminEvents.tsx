import React, { useState } from 'react';
import { useAdminEvents } from '../../hooks/admin/useAdminEvents';
import { EventItem } from '../../types';
import { SmartImage } from '../../components/ui/SmartImage';

interface AdminEventsProps {
    user: any;
    uploadImage: (file: File) => Promise<string | null>;
    triggerToast: (msg: string) => void;
}

const AdminEvents: React.FC<AdminEventsProps> = ({ user, uploadImage, triggerToast }) => {
    const { events, isLoading, saveEventMutation, deleteEventMutation } = useAdminEvents(user);

    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [eventForm, setEventForm] = useState<Partial<EventItem>>({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        imageUrl: '',
        category: 'General',
        isFeatured: false
    });

    const resetForm = () => {
        setEventForm({ title: '', description: '', date: '', time: '', location: '', imageUrl: '', category: 'General', isFeatured: false });
        setEditingEventId(null);
        setMediaFile(null);
        setMediaPreview(null);
        setIsCreatingEvent(false);
    };

    const handleEdit = (event: EventItem) => {
        setEventForm(event);
        setEditingEventId(event.id);
        setIsCreatingEvent(true);
    };

    const handleFileSelect = (file: File) => {
        if (file) {
            setMediaFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setMediaPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setIsUploading(true);
            let url = eventForm.imageUrl;
            if (mediaFile) {
                const up = await uploadImage(mediaFile);
                if (up) url = up;
            }

            await saveEventMutation.mutateAsync({ ...eventForm, image_url: url, id: editingEventId || undefined });
            triggerToast(editingEventId ? "Evento actualizado" : "Evento creado");
            resetForm();
        } catch (error) {
            console.error(error);
            triggerToast("Error al guardar evento");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-brand-bg dark:bg-black/90">

            {/* Header */}
            <div className="flex-none p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-obsidian/5 dark:border-white/5">
                <div>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight">
                        Agenda de Eventos
                    </h2>
                    <p className="mt-2 text-brand-obsidian/40 dark:text-white/40 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                        Planifica y organiza las próximas actividades de la iglesia.
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsCreatingEvent(true); }}
                    className="px-6 py-3 rounded-xl bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Nuevo Evento
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {isLoading ? (
                    <div className="text-center p-10 opacity-50">Cargando eventos...</div>
                ) : events.length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed border-brand-obsidian/10 rounded-3xl opacity-50">
                        No hay eventos programados.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <div key={event.id} className="group relative bg-white dark:bg-brand-surface rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-brand-obsidian/5 dark:border-white/5">
                                <div className="aspect-[4/3] relative overflow-hidden bg-black/10">
                                    <SmartImage src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        {new Date(event.date).toLocaleDateString()} • {event.time}
                                    </div>
                                    {event.isFeatured && (
                                        <div className="absolute top-4 left-4 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">star</span> Destacado
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-serif font-bold text-brand-obsidian dark:text-white leading-tight mb-2 line-clamp-2">{event.title}</h3>
                                        <p className="text-xs font-medium text-brand-obsidian/50 dark:text-white/50 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {event.location}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-brand-obsidian/5 dark:border-white/5">
                                        <button
                                            onClick={() => handleEdit(event)}
                                            className="flex-1 py-2 rounded-xl bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-obsidian/5 dark:hover:bg-white/10 transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('¿Eliminar evento?')) deleteEventMutation.mutate(event.id); }}
                                            className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Editor */}
            {isCreatingEvent && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={resetForm}>
                    <div className="bg-white dark:bg-brand-surface w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-brand-obsidian/10 dark:border-white/10" onClick={e => e.stopPropagation()}>

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white">
                                {editingEventId ? 'Editar Evento' : 'Nuevo Evento'}
                            </h3>
                            <button onClick={resetForm} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                            {/* Image Upload */}
                            <div className="relative aspect-video rounded-2xl bg-brand-silk dark:bg-white/5 overflow-hidden group cursor-pointer border-2 border-dashed border-transparent hover:border-brand-primary/50 transition-all" onClick={() => document.getElementById('event-img-input')?.click()}>
                                {mediaPreview || eventForm.imageUrl ? (
                                    <img src={mediaPreview || eventForm.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 group-hover:opacity-100">
                                        <span className="material-symbols-outlined text-4xl mb-2">add_photo_alternate</span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Añadir Imagen</span>
                                    </div>
                                )}
                                <input id="event-img-input" type="file" className="hidden" accept="image/*" onChange={e => handleFileSelect(e.target.files![0])} />
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Título</label>
                                    <input
                                        className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl font-bold border-none focus:ring-2 focus:ring-brand-primary"
                                        placeholder="Ej: Culto de Jóvenes"
                                        value={eventForm.title}
                                        onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Fecha</label>
                                        <input type="date" className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl border-none font-medium" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Hora</label>
                                        <input type="time" className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl border-none font-medium" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Ubicación</label>
                                    <input
                                        className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl border-none"
                                        placeholder="Auditorio Principal"
                                        value={eventForm.location}
                                        onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Descripción</label>
                                    <textarea
                                        className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl border-none resize-none min-h-[100px]"
                                        placeholder="Detalles adicionales..."
                                        value={eventForm.description}
                                        onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <label className="flex items-center gap-3 p-4 rounded-xl bg-brand-silk/50 dark:bg-white/5 w-full cursor-pointer hover:bg-brand-silk dark:hover:bg-white/10 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded-md border-gray-300 text-brand-primary focus:ring-brand-primary"
                                            checked={eventForm.isFeatured}
                                            onChange={e => setEventForm({ ...eventForm, isFeatured: e.target.checked })}
                                        />
                                        <span className="text-sm font-bold">Destacar Evento</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-brand-obsidian/5 dark:border-white/5 flex gap-4">
                            <button onClick={resetForm} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                            <button
                                onClick={handleSave}
                                disabled={isUploading || !eventForm.title}
                                className="flex-1 bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian font-black uppercase tracking-[0.2em] text-xs rounded-xl py-3 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isUploading ? 'Guardando...' : (editingEventId ? 'Guardar Cambios' : 'Crear Evento')}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminEvents;
