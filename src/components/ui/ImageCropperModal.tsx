import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../lib/imageUtils';

interface ImageCropperModalProps {
    image: string;
    onCropComplete: (croppedImage: string) => void;
    onClose: () => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ image, onCropComplete, onClose }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropCompleteInternal = useCallback((_setCroppedArea: any, setCroppedAreaPixels: any) => {
        setCroppedAreaPixels(setCroppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[7000] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in">
            <div className="relative w-full max-w-lg aspect-square bg-brand-surface rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropCompleteInternal}
                    onZoomChange={setZoom}
                />
            </div>

            <div className="mt-10 w-full max-w-lg space-y-8 px-4">
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-white/40 text-[10px] font-black uppercase tracking-widest">
                        <span>Zoom</span>
                        <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-primary"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-[2] bg-brand-primary text-brand-obsidian py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Aplicar Recorte
                    </button>
                </div>
            </div>

            <p className="mt-8 text-white/20 text-[9px] font-medium uppercase tracking-[0.4em] text-center max-w-xs leading-relaxed">
                Ajusta tu imagen para que quede perfecta en el círculo.
            </p>
        </div>
    );
};

export default ImageCropperModal;
