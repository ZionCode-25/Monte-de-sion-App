import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

// Define types locally since @types/react-easy-crop might be missing or different
type Point = { x: number; y: number };
type Area = { width: number; height: number; x: number; y: number };

interface Props {
    imageSrc: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
}

export const ImageCropper: React.FC<Props> = ({ imageSrc, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState(4 / 5); // Default to Instagram Portrait
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: Point) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
    ): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[10001] bg-black flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-center p-4 z-50 bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={onCancel}
                    className="text-white p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-white/10"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={() => setAspect(1)}
                        className={`text-white px-3 py-1 rounded-full text-xs font-bold border transition-all ${aspect === 1 ? 'bg-white text-black border-white' : 'border-white/30 hover:border-white'}`}
                    >
                        1:1
                    </button>
                    <button
                        onClick={() => setAspect(4 / 5)}
                        className={`text-white px-3 py-1 rounded-full text-xs font-bold border transition-all ${aspect === 0.8 ? 'bg-white text-black border-white' : 'border-white/30 hover:border-white'}`}
                    >
                        4:5
                    </button>
                    <button
                        onClick={() => setAspect(16 / 9)}
                        className={`text-white px-3 py-1 rounded-full text-xs font-bold border transition-all ${aspect > 1.7 ? 'bg-white text-black border-white' : 'border-white/30 hover:border-white'}`}
                    >
                        16:9
                    </button>
                </div>
                <button
                    onClick={handleSave}
                    className="text-brand-obsidian bg-brand-primary px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                    Listo
                </button>
            </div>

            {/* Cropper Container */}
            <div className="relative flex-1 bg-black">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={onCropChange}
                    onCropComplete={handleCropComplete}
                    onZoomChange={onZoomChange}
                    showGrid={true}
                />
            </div>

            {/* Controls */}
            <div className="p-6 pb-safe bg-gradient-to-t from-black/90 to-transparent z-50">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-white/60 w-8">Zoom</span>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => {
                            setZoom(Number(e.target.value));
                        }}
                        className="w-full accent-white h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};
