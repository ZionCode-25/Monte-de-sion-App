import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { EventItem } from '../../../types';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import getCroppedImg from '../../../utils/cropImage';

// Fix Leaflet Marker Icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Ensure Leaflet icons are fixed only once
if (!(L.Icon.Default.prototype as any)._fixedIcons) {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
    });
    (L.Icon.Default.prototype as any)._fixedIcons = true;
}

const LocationMarker = ({ setLocation }: { setLocation: (lat: number, lng: number) => void }) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            setLocation(e.latlng.lat, e.latlng.lng);
        },
    });
    return position === null ? null : <Marker position={position} />;
};

interface AdminEventFormProps {
    initialData?: Partial<EventItem>;
    onClose: () => void;
    onSave: (data: Partial<EventItem>, file: File | null) => Promise<void>;
    isSaving: boolean;
}

export const AdminEventForm: React.FC<AdminEventFormProps> = ({ initialData, onClose, onSave, isSaving }) => {
    const [formData, setFormData] = useState<Partial<EventItem>>({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        imageUrl: '',
        category: 'Celebración',
        isFeatured: false,
        capacity: 0,
        lat: -34.6037,
        lng: -58.3816,
        ...initialData
    });

    // Image & Crop State
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleFileSelect = (file: File) => {
        if (file) {
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
                    setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
                };
                setIsCropping(false);
            }
        } catch (e) {
            console.error(e);
            alert("Error al recortar imagen");
        }
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.date) {
            alert("Por favor completa los campos obligatorios (Título, Fecha).");
            return;
        }
        onSave(formData, mediaFile);
    };

    // Render Crop Modal over everything if active
    if (isCropping && mediaPreview) {
        return (
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
        );
    }

    return (
        <div className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 border border-white/10 max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Header Actions */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-brand-obsidian/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md sticky top-0 z-20">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white">
                            {initialData?.id ? 'Editar Evento' : 'Nuevo Evento'}
                        </h3>
                        <p className="text-xs text-brand-obsidian/40 dark:text-white/40 font-medium mt-0.5">Completa todos los campos necesarios.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-brand-silk dark:bg-white/5 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN: Main Info */}
                        <div className="lg:col-span-7 space-y-6">

                            {/* Title Group */}
                            <div className="bg-brand-silk/30 dark:bg-white/5 p-6 rounded-3xl space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Título del Evento *</label>
                                    <input
                                        className="w-full bg-white dark:bg-black/20 p-4 rounded-xl font-bold text-lg border border-transparent focus:border-brand-primary/50 outline-none transition-all placeholder:font-normal placeholder:opacity-40"
                                        placeholder="Ej: Conferencia de Jóvenes"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Descripción</label>
                                    <textarea
                                        className="w-full bg-white dark:bg-black/20 p-4 rounded-xl font-medium border border-transparent focus:border-brand-primary/50 outline-none min-h-[120px] resize-none placeholder:font-normal placeholder:opacity-40 leading-relaxed"
                                        placeholder="Describe los detalles importantes del evento como el tema, oradores invitados, etc."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Location Group */}
                            <div className="bg-brand-silk/30 dark:bg-white/5 p-6 rounded-3xl space-y-4">
                                <h4 className="font-bold text-sm opacity-80 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-brand-primary">location_on</span>
                                    Ubicación
                                </h4>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Lugar (Texto) *</label>
                                    <input
                                        className="w-full bg-white dark:bg-black/20 p-4 rounded-xl font-bold border border-transparent focus:border-brand-primary/50 outline-none transition-all"
                                        placeholder="Ej: Auditorio Principal, Calle Falsa 123"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div className="rounded-2xl overflow-hidden h-48 border border-black/10 dark:border-white/10 relative z-0 shadow-inner">
                                    <MapContainer center={[formData.lat || -34.6037, formData.lng || -58.3816]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        />
                                        <LocationMarker setLocation={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))} />
                                        {formData.lat && formData.lng && <Marker position={[formData.lat, formData.lng]} />}
                                    </MapContainer>
                                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold z-[400] pointer-events-none shadow-sm text-black">
                                        Toca para fijar ubicación exacta
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Meta Info & Image */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* Image Preview */}
                            <div
                                className="group relative aspect-video bg-brand-silk dark:bg-black/40 rounded-3xl overflow-hidden border-2 border-dashed border-brand-obsidian/10 dark:border-white/10 hover:border-brand-primary/50 transition-colors cursor-pointer shadow-sm"
                                onClick={() => document.getElementById('form-img-input')?.click()}
                            >
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity p-6 text-center">
                                        <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-3 text-brand-primary">
                                            <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian dark:text-white">Subir Portada</span>
                                        <span className="text-[9px] mt-1 opacity-60">Recomendado: 1920x1080</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                    <span className="text-white text-xs font-bold uppercase tracking-wider border border-white/30 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-colors">Cambiar Imagen</span>
                                </div>
                                <input id="form-img-input" type="file" className="hidden" accept="image/*" onChange={e => handleFileSelect(e.target.files![0])} />
                            </div>

                            {/* Date time & Category */}
                            <div className="bg-brand-silk/30 dark:bg-white/5 p-6 rounded-3xl space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Fecha *</label>
                                        <input
                                            type="date"
                                            className="w-full bg-white dark:bg-black/20 p-3 rounded-xl font-bold text-sm border border-transparent focus:border-brand-primary/50 outline-none"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Hora *</label>
                                        <input
                                            type="time"
                                            className="w-full bg-white dark:bg-black/20 p-3 rounded-xl font-bold text-sm border border-transparent focus:border-brand-primary/50 outline-none"
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Categoría</label>
                                        <select
                                            className="w-full bg-white dark:bg-black/20 p-3 rounded-xl font-bold text-sm border border-transparent focus:border-brand-primary/50 outline-none appearance-none"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option>Celebración</option>
                                            <option>Célula</option>
                                            <option>Taller</option>
                                            <option>Misiones</option>
                                            <option>Jóvenes</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2">Cupos (0 = Ilimitado)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full bg-white dark:bg-black/20 p-3 rounded-xl font-bold text-sm border border-transparent focus:border-brand-primary/50 outline-none"
                                            value={formData.capacity || ''}
                                            placeholder="0"
                                            onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-black/20 rounded-xl mt-2 cursor-pointer" onClick={() => setFormData(p => ({ ...p, isFeatured: !p.isFeatured }))}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isFeatured ? 'bg-amber-500 border-amber-500' : 'border-gray-400 bg-transparent'}`}>
                                            {formData.isFeatured && <span className="material-symbols-outlined text-[16px] text-white">check</span>}
                                        </div>
                                        <label className="text-xs font-bold cursor-pointer select-none">Destacar evento</label>
                                        {formData.isFeatured && <span className="ml-auto text-amber-500 material-symbols-outlined text-sm">star</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Save Actions */}
                <div className="p-6 border-t border-brand-obsidian/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md flex justify-end gap-3 z-20">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-brand-obsidian/60 dark:text-white/60"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand-obsidian/20 dark:shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-base">save</span>
                                Guardar Evento
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};
