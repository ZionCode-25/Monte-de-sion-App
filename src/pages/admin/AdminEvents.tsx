import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useAdminEvents } from '../../hooks/admin/useAdminEvents';
import { EventItem } from '../../types';
import { SmartImage } from '../../components/ui/SmartImage';
import getCroppedImg from '../../utils/cropImage';

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
    const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Filter & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todos');

    // Crop State
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isCropping, setIsCropping] = useState(false);

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
        setIsCropping(false);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
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
            reader.addEventListener('load', () => {
                setMediaPreview(reader.result as string);
                setIsCropping(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const processCrop = async () => {
        if (!mediaPreview || !croppedAreaPixels) return;
        try {
            const croppedBlob = await getCroppedImg(mediaPreview, croppedAreaPixels);
            if (croppedBlob) {
                const croppedFile = new File([croppedBlob], "cropped.jpg", { type: "image/jpeg" });
                setMediaFile(croppedFile);
                const reader = new FileReader();
                reader.readAsDataURL(croppedBlob);
                reader.onloadend = () => {
                    setEventForm(prev => ({ ...prev, imageUrl: reader.result as string }));
                };
                setIsCropping(false);
            }
        } catch (e) {
            console.error(e);
            triggerToast("Error al recortar imagen");
        }
    };

    const handleSave = async () => {
        try {
            setIsUploading(true);
            let url = eventForm.imageUrl;

            if (mediaFile && !url?.startsWith('http') && mediaFile instanceof File) {
                const up = await uploadImage(mediaFile);
                if (up) url = up;
            } else if (mediaFile && url?.startsWith('data:')) {
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

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'Todos' || e.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const stats = {
        total: events.length,
        featured: events.filter(e => e.isFeatured).length,
        upcomingThisMonth: events.filter(e => {
            const d = new Date(e.date);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length
    };

    const statsArray = [
        { label: 'Total Eventos', value: stats.total, icon: 'calendar_month', color: 'text-blue-500' },
        { label: 'Destacados', value: stats.featured, icon: 'star', color: 'text-amber-500' },
        { label: 'Este Mes', value: stats.upcomingThisMonth, icon: 'event', color: 'text-emerald-500' }
    ];

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const weekLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    const daysInMonth = useCallback(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        const offset = firstDay === 0 ? 6 : firstDay - 1;
        return { offset, totalDays };
    }, [currentDate]);

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    return (
        <div className="flex flex-col h-full bg-[#F8F9FA] dark:bg-black/95">
            {/* Header */}
            <div className="flex-none p-8 md:p-12 pb-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-brand-primary rounded-full"></div>
                            <h2 className="text-4xl md:text-6xl font-serif font-black text-brand-obsidian dark:text-white leading-none tracking-tighter">
                                Gestión de <span className="italic opacity-50 font-medium">Eventos</span>
                            </h2>
                        </div>
                        <p className="text-brand-obsidian/40 dark:text-white/40 font-medium text-lg max-w-xl leading-relaxed">
                            Control total sobre la agenda ministerial y actividades comunitarias.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-white dark:bg-brand-surface p-1 rounded-xl border border-brand-obsidian/5 dark:border-white/5 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian shadow-md' : 'text-brand-obsidian/40 dark:text-white/40 hover:bg-black/5'}`}
                            >
                                <span className="material-symbols-outlined text-sm">grid_view</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Cuadrícula</span>
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'calendar' ? 'bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian shadow-md' : 'text-brand-obsidian/40 dark:text-white/40 hover:bg-black/5'}`}
                            >
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Calendario</span>
                            </button>
                        </div>
                        <button
                            onClick={() => { resetForm(); setIsCreatingEvent(true); }}
                            className="group relative px-10 py-5 rounded-[2rem] bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <div className="relative z-10 flex items-center gap-3">
                                <span className="material-symbols-outlined text-xl">add_circle</span>
                                Nuevo Evento
                            </div>
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {statsArray.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-brand-surface p-6 rounded-3xl border border-brand-obsidian/5 dark:border-white/5 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center ${stat.color}`}>
                                <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{stat.label}</p>
                                <p className="text-3xl font-serif font-black dark:text-white leading-none mt-1">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter & Search Bar */}
            {viewMode === 'grid' && (
                <div className="px-8 md:px-12 py-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-brand-obsidian/20 dark:text-white/20 group-focus-within:text-brand-primary transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por título o ubicación..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-brand-surface pl-14 pr-6 py-4 rounded-2xl border border-brand-obsidian/5 dark:border-white/5 focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {['Todos', 'Celebración', 'Taller', 'Misiones', 'General'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${filterCategory === cat
                                    ? 'bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian border-transparent shadow-lg'
                                    : 'bg-white dark:bg-brand-surface border-brand-obsidian/5 dark:border-white/5 text-brand-obsidian/40 dark:text-white/40'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 font-black text-[10px] uppercase tracking-widest">Sincronizando Agenda...</p>
                    </div>
                ) : viewMode === 'calendar' ? (
                    <div className="bg-white dark:bg-brand-surface rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl border border-brand-obsidian/5 dark:border-white/5 animate-in fade-in slide-in-from-bottom-4 mb-20 overflow-hidden">
                        <div className="flex items-center justify-between mb-8 md:mb-12">
                            <button onClick={() => changeMonth(-1)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-silk dark:bg-white/5 flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <h3 className="text-xl md:text-3xl font-serif font-black dark:text-white flex items-center gap-2 md:gap-4 text-center">
                                {monthNames[currentDate.getMonth()]}
                                <span className="text-brand-primary opacity-50">{currentDate.getFullYear()}</span>
                            </h3>
                            <button onClick={() => changeMonth(1)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-silk dark:bg-white/5 flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                            <div className="min-w-[600px] md:min-w-0">
                                <div className="grid grid-cols-7 mb-4 md:mb-8">
                                    {weekLabels.map(l => (
                                        <span key={l} className="text-center text-[10px] font-black text-brand-obsidian/20 dark:text-white/20 uppercase tracking-[0.3em]">{l}</span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-2 md:gap-4">
                                    {Array.from({ length: daysInMonth().offset }).map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square opacity-0" />
                                    ))}
                                    {Array.from({ length: daysInMonth().totalDays }).map((_, i) => {
                                        const day = i + 1;
                                        const eventsToday = events.filter(e => {
                                            const ed = new Date(e.date + 'T00:00:00');
                                            return ed.getDate() === day && ed.getMonth() === currentDate.getMonth() && ed.getFullYear() === currentDate.getFullYear();
                                        });
                                        const today = isToday(day);

                                        return (
                                            <div
                                                key={day}
                                                className={`group relative aspect-square rounded-xl md:rounded-[2rem] border transition-all p-1.5 md:p-3 flex flex-col justify-between overflow-hidden shadow-sm ${today ? 'bg-brand-primary/5 border-brand-primary/20 ring-1 ring-brand-primary/20' : 'bg-brand-silk/30 dark:bg-white/[0.02] border-brand-obsidian/5 dark:border-white/5 hover:border-brand-primary/30'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className={`text-xs md:text-lg font-black ${today ? 'text-brand-primary' : 'text-brand-obsidian/40 dark:text-white/30'}`}>{day}</span>
                                                    {eventsToday.length > 0 && (
                                                        <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-brand-primary shadow-[0_0_12px_#ffb700] ring-1 md:ring-2 ring-white"></div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-1 z-10 hidden md:flex">
                                                    {eventsToday.slice(0, 2).map(ev => (
                                                        <div
                                                            key={ev.id}
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(ev); }}
                                                            className="px-2 py-1 rounded-md bg-white dark:bg-white/10 text-[8px] font-bold text-brand-obsidian dark:text-white truncate cursor-pointer hover:bg-brand-primary hover:text-brand-obsidian transition-colors shadow-sm"
                                                        >
                                                            {ev.title}
                                                        </div>
                                                    ))}
                                                    {eventsToday.length > 2 && (
                                                        <span className="text-[7px] font-black uppercase opacity-30 pl-1">+{eventsToday.length - 2} más</span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                                        setEventForm({ ...eventForm, date: d.toISOString().split('T')[0] });
                                                        setIsCreatingEvent(true);
                                                    }}
                                                    className="absolute inset-0 flex items-center justify-center bg-brand-obsidian/95 text-brand-primary opacity-0 group-hover:opacity-100 rounded-xl md:rounded-[2rem] transition-all duration-300 font-black text-[8px] md:text-[10px] uppercase tracking-widest scale-110 group-hover:scale-100 z-20"
                                                >
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="material-symbols-outlined text-base md:text-lg">add</span>
                                                        <span className="hidden md:block">Crear</span>
                                                    </div>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-brand-obsidian/5 dark:border-white/5 rounded-[4rem] text-center">
                        <div className="w-24 h-24 bg-brand-obsidian/[0.02] dark:bg-white/[0.02] rounded-full flex items-center justify-center text-brand-obsidian/10 dark:text-white/10 mb-8">
                            <span className="material-symbols-outlined text-6xl">event_busy</span>
                        </div>
                        <h4 className="text-2xl font-serif font-bold dark:text-white opacity-40">No se encontraron eventos</h4>
                        <p className="text-brand-obsidian/30 dark:text-white/30 text-sm mt-2">Prueba ajustando los filtros de búsqueda</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {filteredEvents.map((event) => (
                            <div key={event.id} className="group relative bg-white dark:bg-brand-surface rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-brand-obsidian/5 dark:border-white/5 flex flex-col">
                                <div className="aspect-[16/10] relative overflow-hidden bg-black/10">
                                    <SmartImage src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />

                                    <div className="absolute top-5 right-5 flex flex-col items-end gap-2">
                                        <div className="bg-white/95 dark:bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                            <span className="material-symbols-outlined text-base text-brand-primary">schedule</span>
                                            {event.time}
                                        </div>
                                    </div>

                                    {event.isFeatured && (
                                        <div className="absolute top-5 left-5 bg-brand-primary text-brand-obsidian px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                            <span className="material-symbols-outlined text-base">star</span>
                                            Destacado
                                        </div>
                                    )}

                                    <div className="absolute bottom-5 left-5">
                                        <span className="bg-brand-obsidian/60 dark:bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                                            {event.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-1">
                                    <div className="mb-6 flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                                {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-serif font-black text-brand-obsidian dark:text-white leading-[1.1] mb-4 group-hover:text-brand-primary transition-colors line-clamp-2">
                                            {event.title}
                                        </h3>
                                        <p className="text-sm font-medium text-brand-obsidian/40 dark:text-white/40 flex items-center gap-2 line-clamp-1">
                                            <span className="material-symbols-outlined text-lg opacity-40">location_on</span>
                                            {event.location}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 pt-6 border-t border-brand-obsidian/5 dark:border-white/5">
                                        <button
                                            onClick={() => handleEdit(event)}
                                            className="flex-1 py-4 rounded-2xl bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-obsidian dark:hover:bg-brand-primary hover:text-white dark:hover:text-brand-obsidian transition-all shadow-sm active:scale-95"
                                        >
                                            Editar Ficha
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('¿Eliminar este evento definitivamente?')) deleteEventMutation.mutate(event.id); }}
                                            className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center active:scale-90"
                                            title="Eliminar Evento"
                                        >
                                            <span className="material-symbols-outlined text-xl">delete</span>
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
                <div className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={resetForm}>
                    <div className="bg-white dark:bg-brand-surface w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-brand-obsidian/10 dark:border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white">
                                {editingEventId ? 'Editar Evento' : 'Nuevo Evento'}
                            </h3>
                            <button onClick={resetForm} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="relative aspect-video rounded-2xl bg-brand-silk dark:bg-white/5 overflow-hidden group cursor-pointer border-2 border-dashed border-transparent hover:border-brand-primary/50 transition-all" onClick={() => document.getElementById('event-img-input')?.click()}>
                                {eventForm.imageUrl ? (
                                    <img src={eventForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
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
                                        className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl font-bold border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                        placeholder="Ej: Culto de Jóvenes"
                                        value={eventForm.title}
                                        onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Fecha</label>
                                        <input type="date" className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl border-none font-medium outline-none" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Hora</label>
                                        <input type="time" className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl border-none font-medium outline-none" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Ubicación</label>
                                    <input
                                        className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl border-none outline-none font-medium"
                                        placeholder="Auditorio Principal"
                                        value={eventForm.location}
                                        onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Descripción</label>
                                    <textarea
                                        className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl border-none resize-none min-h-[100px] outline-none font-medium"
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

            {/* CROP MODAL */}
            {isCropping && mediaPreview && (
                <div className="fixed inset-0 z-[6000] bg-black flex flex-col animate-in fade-in duration-300">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-xl z-10">
                        <button onClick={() => setIsCropping(false)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
                        </button>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Ajustar Imagen</h4>
                        <div className="w-20" />
                    </div>

                    <div className="flex-1 relative bg-zinc-950">
                        <Cropper
                            image={mediaPreview}
                            crop={crop}
                            zoom={zoom}
                            aspect={4 / 3}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>

                    <div className="px-6 py-8 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex flex-col items-center gap-6">
                        <div className="w-full max-w-sm flex items-center gap-6">
                            <button onClick={() => setZoom(Math.max(1, zoom - 0.2))} className="text-white/40 hover:text-white">
                                <span className="material-symbols-outlined">zoom_out</span>
                            </button>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full accent-brand-primary h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                            <button onClick={() => setZoom(Math.min(3, zoom + 0.2))} className="text-white/40 hover:text-white">
                                <span className="material-symbols-outlined">zoom_in</span>
                            </button>
                        </div>

                        <div className="flex gap-4 w-full max-w-sm">
                            <button onClick={() => setIsCropping(false)} className="flex-1 py-4 rounded-2xl bg-white/5 text-white/60 font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all">Cancelar</button>
                            <button onClick={processCrop} className="flex-1 py-4 rounded-2xl bg-brand-primary text-brand-obsidian font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
