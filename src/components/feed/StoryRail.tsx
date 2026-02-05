
import React from 'react';
import { Story, User } from '../../../types';
import { SmartImage } from '../ui/SmartImage';

interface Props {
    stories: Story[];
    user: User;
    onStoryClick: (index: number) => void;
    onCreateClick: () => void;
    viewOnlyMine: boolean;
}

export const StoryRail: React.FC<Props> = ({ stories, user, onStoryClick, onCreateClick, viewOnlyMine }) => {
    if (viewOnlyMine) return null;

    return (
        <section className="w-full pt-8 pb-8 flex justify-center flex-wrap gap-6 px-6 bg-brand-silk dark:bg-brand-obsidian border-b border-brand-obsidian/5 dark:border-white/5 relative z-10">
            <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={onCreateClick}>
                <div className="relative p-[3px] rounded-full border-2 border-dashed border-brand-primary/40 group-hover:border-brand-primary transition-colors active:scale-95 duration-300">
                    <div className="w-[70px] h-[70px] rounded-full overflow-hidden p-[3px] bg-brand-silk dark:bg-brand-obsidian">
                        <SmartImage src={user.avatar || ''} className="w-full h-full rounded-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all" alt="" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-brand-primary rounded-full border-4 border-brand-silk dark:border-brand-obsidian flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-brand-obsidian text-sm font-black">add</span>
                    </div>
                </div>
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest group-hover:text-brand-primary/80 transition-colors">Tu Historia</span>
            </div>

            {stories.map((story, idx) => (
                <div key={story.id} onClick={() => onStoryClick(idx)} className="flex flex-col items-center gap-3 cursor-pointer group active:scale-95 transition-transform duration-300">
                    <div className="p-[3px] rounded-full bg-gradient-to-tr from-brand-primary via-orange-500 to-rose-500 shadow-md group-hover:shadow-lg group-hover:shadow-brand-primary/20 transition-all">
                        <div className="w-[70px] h-[70px] rounded-full overflow-hidden p-[3px] bg-brand-silk dark:bg-brand-obsidian">
                            <SmartImage src={story.userAvatar} className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-brand-obsidian/60 dark:text-white/40 uppercase tracking-widest truncate w-20 text-center group-hover:text-brand-obsidian dark:group-hover:text-white transition-colors">{story.userName.split(' ')[0]}</span>
                </div>
            ))}
        </section>
    );
};
