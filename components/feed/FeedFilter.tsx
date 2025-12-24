
import React from 'react';

interface Props {
    viewOnlyMine: boolean;
    onToggle: (showMine: boolean) => void;
    onCreatePost: () => void;
}

export const FeedFilter: React.FC<Props> = ({ viewOnlyMine, onToggle, onCreatePost }) => {
    return (
        <nav className="sticky top-20 z-40 bg-brand-silk/90 dark:bg-brand-obsidian/90 backdrop-blur-3xl border-b border-brand-obsidian/5 dark:border-white/5 px-6 h-16 flex items-center justify-between">
            <div className="flex bg-brand-obsidian/5 dark:bg-white/5 p-1 rounded-2xl">
                <button
                    onClick={() => onToggle(false)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!viewOnlyMine ? 'bg-white dark:bg-brand-surface text-brand-primary shadow-sm' : 'text-brand-obsidian/40 dark:text-white/30'}`}
                >
                    Explorar
                </button>
                <button
                    onClick={() => onToggle(true)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewOnlyMine ? 'bg-white dark:bg-brand-surface text-brand-primary shadow-sm' : 'text-brand-obsidian/40 dark:text-white/30'}`}
                >
                    Mis Posts
                </button>
            </div>

            <button
                onClick={onCreatePost}
                className="w-11 h-11 rounded-2xl bg-brand-primary text-brand-obsidian flex items-center justify-center shadow-lg active:scale-90 transition-all"
            >
                <span className="material-symbols-outlined font-black text-2xl">add</span>
            </button>
        </nav>
    );
};
