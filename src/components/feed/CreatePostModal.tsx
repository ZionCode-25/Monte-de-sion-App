import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../../../types';
import { ImageCropper } from '../ui/ImageCropper';

interface Props {
    user: User;
    onClose: () => void;
    onSubmit: (data: { content: string; mediaFiles?: File[] }) => void;
}

export const CreatePostModal: React.FC<Props> = ({ user, onClose, onSubmit }) => {
    const [postText, setPostText] = useState('');
    const [mediaFiles, setMediaFiles] = useState<{ file: File, preview: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cropper State
    const [fileToCrop, setFileToCrop] = useState<File | null>(null);
    const [cropPreviewUrl, setCropPreviewUrl] = useState<string | null>(null);

    // --- EFFECT: Body Scroll Lock ---
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleSubmit = async () => {
        if ((!postText.trim() && mediaFiles.length === 0) || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                content: postText,
                mediaFiles: mediaFiles.map(m => m.file)
            });
        } catch (e) {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            // Start cropping flow
            setFileToCrop(file);
            setCropPreviewUrl(URL.createObjectURL(file));
        }
        // clear input
        e.target.value = '';
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        if (!fileToCrop) return;

        // Convert Blob to File
        const croppedFile = new File([croppedBlob], fileToCrop.name, { type: fileToCrop.type });
        const preview = URL.createObjectURL(croppedFile);

        setMediaFiles(prev => [...prev, { file: croppedFile, preview }]);

        // Clean up
        setFileToCrop(null);
        setCropPreviewUrl(null);
    };

    const removeImage = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    return createPortal(
        <>
            <div className="fixed inset-0 z-[10000] bg-brand-obsidian/95 backdrop-blur-xl flex flex-col pt-safe animate-in fade-in duration-200">
                {/* Header */}
                <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-brand-obsidian/50 backdrop-blur-md">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-white/60 hover:text-white transition-colors disabled:opacity-30"
                    >
                        <span className="text-lg font-medium">Cancelar</span>
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={(!postText.trim() && mediaFiles.length === 0) || isSubmitting}
                        className={`
                            px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2
                            ${(!postText.trim() && mediaFiles.length === 0) || isSubmitting ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-brand-primary text-brand-obsidian hover:bg-white hover:scale-105 shadow-lg shadow-brand-primary/20'}
                        `}
                    >
                        {isSubmitting && <span className="w-3 h-3 border-2 border-brand-obsidian/30 border-t-brand-obsidian rounded-full animate-spin"></span>}
                        {isSubmitting ? 'Publicando...' : 'Publicar'}
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto flex flex-col">
                    <div className="p-6 space-y-6 flex-1">

                        {/* User Info */}
                        <div className="flex items-center gap-3 animate-slide-in-from-bottom-2">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                                <img src={user.avatar || ''} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{user.name}</h4>
                                <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">En la comunidad</p>
                            </div>
                        </div>

                        {/* Text Input */}
                        <textarea
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            autoFocus
                            disabled={isSubmitting}
                            placeholder="Comparte tu testimonio, petición o versículo..."
                            className="w-full min-h-[120px] bg-transparent text-xl md:text-2xl text-white placeholder-white/20 resize-none focus:outline-none leading-relaxed font-light disabled:opacity-50"
                        />

                        {/* Media Preview Grid */}
                        {mediaFiles.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 animate-scale-in">
                                {mediaFiles.map((item, idx) => (
                                    <div key={idx} className="relative aspect-[4/5] rounded-xl overflow-hidden group shadow-lg ring-1 ring-white/10">
                                        <img src={item.preview} className="w-full h-full object-cover" alt="" />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            disabled={isSubmitting}
                                            className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-rose-500 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-xs">close</span>
                                        </button>
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 rounded-md text-[10px] font-bold text-white/80 backdrop-blur-sm">
                                            {idx + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State / Prompt if no media */}
                        {mediaFiles.length === 0 && (
                            <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/20">
                                <span className="material-symbols-outlined text-4xl mb-2">add_photo_alternate</span>
                                <p className="text-sm font-medium">Agrega fotos a tu publicación</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Toolbar */}
                <div className="p-4 bg-brand-obsidian/80 backdrop-blur-md border-t border-white/5 sticky bottom-0 z-40 pb-safe">
                    <div className="max-w-2xl mx-auto flex items-center gap-4">
                        <label className={`flex items-center gap-3 p-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
                            <span className="material-symbols-outlined text-2xl text-brand-primary group-active:scale-90 transition-transform">add_a_photo</span>
                            <span className="text-sm font-bold text-white/80">Agregar Foto</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isSubmitting}
                                onChange={handleFileSelect}
                            />
                        </label>
                        <span className="text-xs text-white/20">Máximo sugerido: 4 fotos</span>
                    </div>
                </div>
            </div>

            {/* Cropper Modal */}
            {fileToCrop && cropPreviewUrl && (
                <ImageCropper
                    imageSrc={cropPreviewUrl}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setFileToCrop(null);
                        setCropPreviewUrl(null);
                    }}
                />
            )}
        </>,
        document.body
    );
};
