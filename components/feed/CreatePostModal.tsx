
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../../types';

interface Props {
    user: User;
    onClose: () => void;
    onSubmit: (data: { content: string; mediaFile?: File }) => void;
}

export const CreatePostModal: React.FC<Props> = ({ user, onClose, onSubmit }) => {
    const [postText, setPostText] = useState('');
    const [postMediaPreview, setPostMediaPreview] = useState<string | null>(null);
    const [postFile, setPostFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- EFFECT: Body Scroll Lock ---
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleSubmit = async () => {
        if ((!postText.trim() && !postFile) || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onSubmit({ content: postText, mediaFile: postFile || undefined });
            // Close is handled by parent on success, but we reset here just in case? 
            // Better to rely on parent calling onClose or effect. 
            // For now, we just keep submitting true until unmount or error handled by parent implicitly.
        } catch (e) {
            setIsSubmitting(false);
        }
    };

    return createPortal(
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
                    disabled={(!postText.trim() && !postFile) || isSubmitting}
                    className={`
                        px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2
                        ${(!postText.trim() && !postFile) || isSubmitting ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-brand-primary text-brand-obsidian hover:bg-white hover:scale-105 shadow-lg shadow-brand-primary/20'}
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

                    {/* Media Preview */}
                    {postMediaPreview && (
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl group border border-white/10 animate-scale-in">
                            <img src={postMediaPreview} className="w-full h-auto max-h-[50vh] object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                            <button
                                onClick={() => {
                                    setPostMediaPreview(null);
                                    setPostFile(null);
                                }}
                                disabled={isSubmitting}
                                className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-all cursor-pointer pointer-events-auto"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
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
                        <input type="file" accept="image/*" className="hidden" disabled={isSubmitting} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setPostMediaPreview(URL.createObjectURL(file));
                                setPostFile(file);
                            }
                        }} />
                    </label>
                </div>
            </div>
        </div>,
        document.body
    );
};
