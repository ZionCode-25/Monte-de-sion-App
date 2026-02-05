
import React, { useEffect, useState } from 'react';
import { Story, User } from '../../../types';
import { SmartImage } from '../ui/SmartImage';

interface Props {
    stories: Story[];
    initialIndex: number;
    user: User;
    onClose: () => void;
    onDelete: (id: string) => void;
}

export const StoryViewer: React.FC<Props> = ({ stories, initialIndex, user, onClose, onDelete }) => {
    const [activeStoryIndex, setActiveStoryIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);

    const activeStory = stories[activeStoryIndex];

    useEffect(() => {
        setActiveStoryIndex(initialIndex);
        setProgress(0);
    }, [initialIndex]);

    useEffect(() => {
        if (!activeStory) return;

        // Reset progress when index changes
        setProgress(0);

        const timer = window.setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + 1.2;
            });
        }, 40);

        return () => clearInterval(timer);
    }, [activeStoryIndex]);

    const handleNext = () => {
        if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (activeStoryIndex > 0) {
            setActiveStoryIndex(prev => prev - 1);
        } else {
            onClose();
        }
    };

    if (!activeStory) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center animate-in fade-in duration-200">
            {/* Background blur effect */}
            <div className="absolute inset-0 z-0">
                {activeStory.mediaUrl ? (
                    <img src={activeStory.mediaUrl} className="w-full h-full object-cover opacity-20 blur-3xl" alt="" />
                ) : (
                    <div className="w-full h-full bg-brand-primary opacity-10 blur-3xl"></div>
                )}
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* Main Story Container */}
            <div className="relative w-full h-full md:max-w-md md:h-[90vh] md:rounded-3xl bg-black overflow-hidden shadow-2xl flex flex-col">

                {/* Progress Bar */}
                <div className="absolute top-4 left-4 right-4 z-50 flex gap-1.5 h-1">
                    {stories.map((s, idx) => (
                        <div key={s.id} className="flex-1 h-full bg-white/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-white ${idx === activeStoryIndex ? 'animate-[loading_5s_linear_forwards]' : idx < activeStoryIndex ? 'w-full' : 'w-0'}`}
                                style={{ animationDuration: '5s', width: idx < activeStoryIndex ? '100%' : undefined }}
                            ></div>
                        </div>
                    ))}
                </div>

                {/* Header Info */}
                <div className="absolute top-8 left-4 right-16 z-50 flex items-center gap-3 pointer-events-none">
                    <img src={activeStory.userAvatar} className="w-10 h-10 rounded-full border-2 border-brand-primary" alt="" />
                    <div className="flex flex-col text-left">
                        <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{activeStory.userName}</span>
                        <span className="text-white/60 text-[10px]">{activeStory.timestamp}</span>
                    </div>
                </div>

                {/* Close Button & Actions */}
                <div className="absolute top-8 right-4 z-[60] flex gap-4 items-center">
                    {/* Delete Button (Owner only) */}
                    {activeStory.userId === user.id && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('¿Eliminar esta historia?')) {
                                    onDelete(activeStory.id);
                                    // If we delete the last one or only one, we probably need to handle navigation, but simpler to just close or let parent update
                                    onClose();
                                }
                            }}
                            className="text-white/80 p-2 hover:bg-white/10 rounded-full active:scale-95 transition-transform hover:text-red-500"
                        >
                            <span className="material-symbols-outlined text-2xl drop-shadow-lg">delete</span>
                        </button>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="text-white/80 p-2 hover:bg-white/10 rounded-full active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-2xl drop-shadow-lg">close</span>
                    </button>
                </div>

                {/* Tap Navigation Zones */}
                <div className="absolute inset-0 z-40 flex">
                    <div className="w-1/3 h-full" onClick={handlePrev}></div>
                    <div className="w-2/3 h-full" onClick={handleNext}></div>
                </div>

                {/* Content */}
                <div className="w-full h-full flex items-center justify-center relative z-10 pointer-events-none">
                    {activeStory.mediaUrl && (
                        <SmartImage src={activeStory.mediaUrl!} className="w-full h-full object-contain bg-black" alt="" />
                    )}

                    {activeStory.text && (
                        <div className={`absolute inset-0 flex items-center justify-center p-8 ${!activeStory.mediaUrl ? 'bg-gradient-to-tr from-purple-900 via-brand-obsidian to-brand-primary' : ''}`}>
                            <p className={`text-white text-center leading-relaxed drop-shadow-2xl font-black ${!activeStory.mediaUrl ? 'text-2xl md:text-3xl font-serif italic' : 'text-xl md:text-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]'}`}>
                                {activeStory.text}
                            </p>
                        </div>
                    )}

                    {!activeStory.mediaUrl && !activeStory.text && (
                        <div className="w-full h-full flex items-center justify-center p-8 bg-brand-obsidian">
                            <span className="material-symbols-outlined text-white/20 text-6xl">visibility_off</span>
                        </div>
                    )}
                </div>

                {/* Reply Footer */}
                <div className="absolute bottom-6 left-4 right-4 z-50 flex gap-4 pointer-events-auto">
                    <input type="text" placeholder="Envía un mensaje..." className="flex-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-full py-3 px-6 text-white placeholder-white/50 text-sm focus:outline-none focus:bg-black/60 transition-colors" />
                    <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md active:scale-95 border border-white/20">
                        <span className="material-symbols-outlined">favorite</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
