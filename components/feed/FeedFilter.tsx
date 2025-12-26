import React from 'react';

type FeedMode = 'explore' | 'mine' | 'saved';

interface Props {
    activeTab: FeedMode;
    onTabChange: (tab: FeedMode) => void;
    onCreatePost: () => void;
}

export const FeedFilter: React.FC<Props> = ({ activeTab, onTabChange, onCreatePost }) => {
    const tabs: { id: FeedMode; label: string; icon: string }[] = [
        { id: 'explore', label: 'Explorar', icon: 'public' },
        { id: 'mine', label: 'Mis Posts', icon: 'person' },
        { id: 'saved', label: 'Guardados', icon: 'bookmark' }, // New tab
    ];

    return (
        <div className="sticky top-0 z-[100] md:pt-4 pb-2 px-4 backdrop-blur-xl bg-brand-silk/80 dark:bg-brand-obsidian/80 border-b border-black/5 dark:border-white/5 md:border-none">
            <div className="flex items-center justify-between max-w-xl mx-auto gap-4">

                {/* Navigation Tabs */}
                <nav className="flex p-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                ${activeTab === tab.id
                                    ? 'bg-white dark:bg-brand-obsidian shadow-md text-brand-obsidian dark:text-white scale-100'
                                    : 'text-brand-obsidian/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'
                                }
              `}
                        >
                            <span className={`material-symbols-outlined text-lg ${activeTab === tab.id ? 'fill-1' : ''}`}>{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Create Action */}
                <button
                    onClick={onCreatePost}
                    className="bg-brand-primary text-brand-obsidian w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined font-bold">add</span>
                </button>
            </div>
        </div>
    );
};
