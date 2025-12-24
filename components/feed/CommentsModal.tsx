
import React, { useState } from 'react';
import { Post, User } from '../../types';

interface Props {
    post: Post | null;
    onClose: () => void;
    user: User; // Current user
    onAddComment: (text: string) => void;
}

export const CommentsModal: React.FC<Props> = ({ post, onClose, user, onAddComment }) => {
    const [commentText, setCommentText] = useState('');

    if (!post) return null;

    const handleSubmit = () => {
        if (!commentText.trim()) return;
        onAddComment(commentText);
        setCommentText('');
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-end animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-brand-obsidian/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl mx-auto bg-brand-silk dark:bg-brand-surface rounded-t-[3.5rem] h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-500 shadow-3xl">
                <div className="w-14 h-1.5 bg-brand-obsidian/10 dark:bg-white/10 rounded-full mx-auto my-6 shrink-0"></div>
                <header className="px-10 pb-5 border-b border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between">
                    <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white italic">Muro de Bendiciones</h3>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-brand-obsidian/30 active:scale-90 transition-all"><span className="material-symbols-outlined">close</span></button>
                </header>
                <div className="flex-1 overflow-y-auto p-10 space-y-7 no-scrollbar">
                    {post.comments && post.comments.length > 0 ? post.comments.map(c => (
                        <div key={c.id} className="flex gap-5">
                            <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black uppercase shrink-0 border border-brand-primary/10">{c.userName.charAt(0)}</div>
                            <div className="flex-1 bg-white dark:bg-brand-obsidian/30 p-6 rounded-[2.2rem] border border-brand-obsidian/5 dark:border-white/5">
                                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">{c.userName}</p>
                                <p className="text-sm text-brand-obsidian dark:text-white/90 font-light leading-relaxed">{c.content}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <span className="material-symbols-outlined text-7xl mb-4">chat_bubble</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Inicia el hilo de fe</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-brand-obsidian/5 dark:border-white/5 flex gap-4 bg-brand-silk dark:bg-brand-surface pb-10">
                    <input
                        type="text"
                        placeholder="Escribe un comentario de bendición..."
                        className="flex-1 bg-white dark:bg-brand-obsidian/30 border-none rounded-2xl px-6 py-4 text-sm text-brand-obsidian dark:text-white focus:ring-2 focus:ring-brand-primary/50 outline-none placeholder:text-brand-obsidian/30 dark:placeholder:text-white/30"
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!commentText.trim()}
                        className="w-14 h-14 bg-brand-primary text-brand-obsidian rounded-2xl flex items-center justify-center font-black shadow-lg disabled:opacity-50 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
