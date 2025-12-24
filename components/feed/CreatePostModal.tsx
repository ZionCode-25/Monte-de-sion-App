
import React, { useState } from 'react';
import { User } from '../../types';

interface Props {
    user: User;
    onClose: () => void;
    onSubmit: (data: { content: string; mediaUrl?: string }) => void;
}

export const CreatePostModal: React.FC<Props> = ({ user, onClose, onSubmit }) => {
    const [postText, setPostText] = useState('');
    const [postMedia, setPostMedia] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!postText.trim() && !postMedia) return;
        onSubmit({ content: postText, mediaUrl: postMedia || undefined });
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-brand-silk dark:bg-brand-obsidian flex flex-col animate-in slide-in-from-bottom duration-300 pt-safe">
            {/* Header Flotante */}
            <header className="px-6 pt-12 pb-4 flex items-center justify-between bg-white/80 dark:bg-brand-obsidian/90 backdrop-blur-md border-b border-brand-obsidian/5 dark:border-white/5 z-50 sticky top-0">
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-brand-obsidian/5 dark:bg-white/10 flex items-center justify-center text-brand-obsidian dark:text-white active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h3 className="text-base font-black uppercase tracking-widest text-brand-obsidian dark:text-white">Nuevo Post</h3>

                <button
                    onClick={handleSubmit}
                    disabled={!postText.trim() && !postMedia}
                    className="bg-brand-primary text-brand-obsidian px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:grayscale active:scale-95 transition-all"
                >
                    Publicar
                </button>
            </header>

            <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto">
                <div className="p-6 space-y-6">

                    {/* User Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-brand-primary to-transparent">
                            <img src={user.avatar || ''} className="w-full h-full rounded-full object-cover border-2 border-brand-surface" alt="" />
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-obsidian dark:text-white">{user.name}</h4>
                            <span className="text-xs text-brand-obsidian/40 dark:text-white/40 font-medium bg-brand-obsidian/5 dark:bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Público</span>
                        </div>
                    </div>

                    {/* Text Input */}
                    <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        autoFocus
                        placeholder="¿Qué quieres compartir con la comunidad?"
                        className="w-full min-h-[150px] bg-transparent text-lg text-brand-obsidian dark:text-white placeholder-brand-obsidian/30 dark:placeholder-white/20 resize-none focus:outline-none leading-relaxed"
                    />

                    {/* Media Preview */}
                    {postMedia && (
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl group border border-brand-obsidian/5 dark:border-white/5">
                            <img src={postMedia} className="w-full h-auto max-h-[500px] object-cover" alt="Preview" />
                            <button
                                onClick={() => setPostMedia(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/80 transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="p-6 pb-12 bg-white dark:bg-brand-surface border-t border-brand-obsidian/5 dark:border-white/5 sticky bottom-0 z-40">
                <div className="flex gap-4 max-w-2xl mx-auto">
                    <label className="flex items-center gap-3 px-4 py-3 bg-brand-obsidian/5 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-brand-primary/10 transition-colors group flex-1 justify-center">
                        <span className="material-symbols-outlined text-brand-primary group-hover:scale-110 transition-transform">image</span>
                        <span className="text-sm font-bold text-brand-obsidian/60 dark:text-white/60 group-hover:text-brand-primary">Foto/Video</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setPostMedia(URL.createObjectURL(file));
                        }} />
                    </label>

                    <button className="flex items-center gap-3 px-4 py-3 bg-brand-obsidian/5 dark:bg-white/5 rounded-2xl hover:bg-brand-primary/10 transition-colors group flex-1 justify-center">
                        <span className="material-symbols-outlined text-brand-primary group-hover:scale-110 transition-transform">location_on</span>
                        <span className="text-sm font-bold text-brand-obsidian/60 dark:text-white/60 group-hover:text-brand-primary">Ubicación</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
