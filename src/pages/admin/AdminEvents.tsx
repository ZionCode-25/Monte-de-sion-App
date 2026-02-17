import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useAdminEvents } from '../../hooks/admin/useAdminEvents';
import { EventItem } from '../../types';
import { SmartImage } from '../../components/ui/SmartImage';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import getCroppedImg from '../../utils/cropImage';
import { formatDateForDisplay, formatTimeForDisplay, getDayNumber, getMonthName } from '../../utils/dateUtils';

// Fix Leaflet Marker Icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Component to handle map clicks
const LocationMarker = ({ setLocation }: { setLocation: (lat: number, lng: number) => void }) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            setLocation(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

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
        category: 'Celebración',
        isFeatured: false,
        capacity: 0,
        lat: -34.6037, // Default Buenos Aires
        lng: -58.3816
    });

    const resetForm = () => {
        setEventForm({ title: '', description: '', date: '', time: '', location: '', imageUrl: '', category: 'Celebración', isFeatured: false, capacity: 0 });
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
        { label: 'Eventos Activos', value: stats.total, icon: 'calendar_month', color: 'text-brand-primary' },
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
            <div className="flex-none p-6 md:p-12 pb-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight mb-2">
                            Agenda y <span className="text-brand-primary">Eventos</span>
                        </h2>
                        <p className="text-brand-obsidian/40 dark:text-white/40 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                            Gestiona las actividades del ministerio y controla los eventos públicos.
                        </p>
                    </div>

                    <button
                        onClick={() => { resetForm(); setIsCreatingEvent(true); }}
                        className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                    >
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        Nuevo Evento
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
                    {statsArray.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-brand-surface p-5 rounded-3xl border border-brand-obsidian/5 dark:border-white/5 flex items-center gap-5 shadow-sm">
                            <div className={`w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center ${stat.color}`}>
                                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                                <p className="text-2xl font-black dark:text-white leading-none mt-0.5">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-brand-obsidian/20 dark:text-white/20">search</span>
                        <input
                            type="text"
                            placeholder="Buscar evento..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-brand-surface pl-12 pr-4 py-3.5 rounded-2xl border border-brand-obsidian/5 dark:border-white/5 text-sm font-medium focus:ring-2 focus:ring-brand-primary outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {['Todos', 'Celebración', 'Célula', 'Taller', 'Misiones'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filterCategory === cat
                                        ? 'bg-brand-primary text-brand-obsidian border-brand-primary'
                                        : 'bg-white dark:bg-brand-surface text-brand-obsidian/40 dark:text-white/40 border-brand-obsidian/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List / Grid */}
            <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-32">
                {isLoading ? (
                    <div className="py-20 text-center opacity-40">
                        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">Cargando eventos...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="py-32 text-center border-2 border-dashed border-brand-obsidian/5 dark:border-white/5 rounded-[3rem]">
                        <span className="material-symbols-outlined text-6xl opacity-20 mb-4">event_busy</span>
                        <p className="text-brand-obsidian/40 dark:text-white/40 font-bold">No se encontraron eventos</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEvents.map(event => (
                            <div key={event.id} className="group bg-white dark:bg-brand-surface rounded-[2rem] overflow-hidden border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="aspect-[16/9] bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                                    <SmartImage src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-xs text-brand-primary">schedule</span>
                                        <span className="text-[10px] font-bold tracking-wider">{formatTimeForDisplay(event.time)}</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            {getMonthName(event.date)} {getDayNumber(event.date)}
                                        </div>
                                        <span className="text-[10px] font-bold text-brand-obsidian/30 dark:text-white/30 uppercase tracking-widest truncate">{event.category}</span>
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight text-brand-obsidian dark:text-white mb-2 line-clamp-1">{event.title}</h3>
                                    <p className="text-xs text-brand-obsidian/50 dark:text-white/50 mb-4 line-clamp-2 min-h-[2.5em]">{event.description}</p>

                                    <div className="flex items-center gap-2 pt-4 border-t border-brand-obsidian/5 dark:border-white/5">
                                        <button
                                            onClick={() => handleEdit(event)}
                                            className="flex-1 py-2.5 rounded-xl bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-obsidian dark:hover:bg-brand-primary hover:text-white dark:hover:text-brand-obsidian transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('¿Eliminar evento?')) deleteEventMutation.mutate(event.id); }}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CREATE / EDIT MODAL */}
            {isCreatingEvent && (
                <div className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={resetForm}>
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 border border-white/10 max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white">
                                    {editingEventId ? 'Editar Evento' : 'Nuevo Evento'}
                                </h3>
                                <p className="text-xs text-brand-obsidian/40 dark:text-white/40 font-medium">Completa la información del evento.</p>
                            </div>
                            <button onClick={resetForm} className="w-10 h-10 rounded-full bg-brand-silk dark:bg-white/5 flex items-center justify-center hover:rotate-90 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5">
                            {/* Image Upload */}
                            <div
                                className="group relative aspect-video bg-brand-silk dark:bg-black/20 rounded-2xl overflow-hidden border-2 border-dashed border-brand-obsidian/10 dark:border-white/10 hover:border-brand-primary/50 transition-colors cursor-pointer"
                                onClick={() => document.getElementById('event-img-input')?.click()}
                            >
                                {eventForm.imageUrl ? (
                                    <img src={eventForm.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-4xl mb-2">add_a_photo</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Subir Portada</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white text-xs font-bold">Cambiar Imagen</span>
                                </div>
                                <input id="event-img-input" type="file" className="hidden" accept="image/*" onChange={e => handleFileSelect(e.target.files![0])} />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Título del Evento</label>
                                    <input
                                        className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                                        placeholder="Ej: Culto de Adoración"
                                        value={eventForm.title}
                                        onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Fecha</label>
                                        <input
                                            type="date"
                                            className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl font-bold border-none outline-none"
                                            value={eventForm.date}
                                            onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Hora</label>
                                        <input
                                            type="time"
                                            className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl font-bold border-none outline-none"
                                            value={eventForm.time}
                                            onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Categoría</label>
                                        <select
                                            className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl font-bold border-none outline-none appearance-none"
                                            value={eventForm.category}
                                            onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
                                        >
                                            <option>Celebración</option>
                                            <option>Célula</option>
                                            <option>Taller</option>
                                            <option>Misiones</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Cupos (0=Libre)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl font-bold border-none outline-none"
                                            value={eventForm.capacity || ''}
                                            onChange={e => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) || 0 })}
                                            placeholder="Ilimitado"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Descripción</label>
                                    <textarea
                                        className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl font-medium border-none outline-none min-h-[100px] resize-none"
                                        placeholder="Detalles del evento..."
                                        value={eventForm.description}
                                        onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Ubicación (Texto)</label>
                                    <input
                                        className="w-full bg-brand-silk/50 dark:bg-white/5 p-4 rounded-xl font-bold border-none outline-none"
                                        placeholder="Ej: Auditorio Principal"
                                        value={eventForm.location}
                                        onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                                    />
                                </div>

                                {/* MAP */}
                                <div className="rounded-xl overflow-hidden h-40 border border-brand-obsidian/10 dark:border-white/10 relative z-0">
                                    <MapContainer center={[eventForm.lat || -34.6037, eventForm.lng || -58.3816]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <LocationMarker setLocation={(lat, lng) => setEventForm(prev => ({ ...prev, lat, lng }))} />
                                        {eventForm.lat && eventForm.lng && <Marker position={[eventForm.lat, eventForm.lng]} />}
                                    </MapContainer>
                                    <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-[9px] font-bold z-[400] pointer-events-none">
                                        Toca para fijar ubicación
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-brand-silk/30 dark:bg-white/5 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="featuredCheck"
                                        className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                        checked={eventForm.isFeatured}
                                        onChange={e => setEventForm({ ...eventForm, isFeatured: e.target.checked })}
                                    />
                                    <label htmlFor="featuredCheck" className="text-sm font-bold cursor-pointer select-none">Destacar este evento en el inicio</label>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 mt-2 border-t border-brand-obsidian/5 dark:border-white/5 flex gap-4 shrink-0">
                            <button onClick={resetForm} className="px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                            <button
                                onClick={handleSave}
                                disabled={isUploading || !eventForm.title}
                                className="flex-1 bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian rounded-xl py-4 font-black uppercase tracking-[0.2em] text-xs hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isUploading ? 'Guardando...' : 'Guardar Evento'}
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
                            aspect={16 / 9}
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
