
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

    // --- EFFECT: Body Scroll Lock ---
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleSubmit = () => {
        if (!postText.trim() && !postFile) return;
        onSubmit({ content: postText, mediaFile: postFile || undefined });
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] bg-brand-obsidian/95 backdrop-blur-md flex flex-col pt-safe animate-in fade-in duration-200">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors"
                >
                    <span className="text-lg font-medium">Cancelar</span>
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={!postText.trim() && !postFile}
                    className="bg-brand-primary text-brand-obsidian px-6 py-2 rounded-full font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                    Publicar
                </button>
            </header>

            <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto">
                <div className="p-6 space-y-6">

                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                            <img src={user.avatar || ''} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{user.name}</h4>
                        </div>
                    </div>

                    {/* Text Input */}
                    <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        autoFocus
                        placeholder="Comparte tu testimonio..."
                        className="w-full min-h-[120px] bg-transparent text-xl text-white placeholder-white/30 resize-none focus:outline-none leading-relaxed font-light"
                    />

                    {/* Media Preview */}
                    {postMediaPreview && (
                        <div className="relative rounded-xl overflow-hidden shadow-2xl group border border-white/10">
                            <img src={postMediaPreview} className="w-full h-auto max-h-[60vh] object-cover" alt="Preview" />
                            <button
                                onClick={() => {
                                    setPostMediaPreview(null);
                                    setPostFile(null);
                                }}
                                className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="p-4 bg-brand-obsidian border-t border-white/10 sticky bottom-0 z-40 pb-safe">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <label className="flex items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-brand-primary">
                        <span className="material-symbols-outlined text-2xl">image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
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
