
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';

interface Props {
    user: User;
    onClose: () => void;
    onSubmit: (data: { text: string; mediaUrl?: string }) => void;
}

const BACKGROUND_GRADIENTS = [
    'from-purple-900 via-brand-obsidian to-brand-primary',
    'from-pink-500 via-red-500 to-yellow-500',
    'from-blue-400 via-indigo-500 to-purple-500',
    'from-green-400 via-teal-500 to-blue-500',
    'from-gray-900 to-gray-600',
];

export const CreateStoryModal: React.FC<Props> = ({ user, onClose, onSubmit }) => {
    const [storyText, setStoryText] = useState('');
    const [storyMedia, setStoryMedia] = useState<string | null>(null);
    const [bgIndex, setBgIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleBackgroundChange = () => {
        setBgIndex((prev) => (prev + 1) % BACKGROUND_GRADIENTS.length);
    };

    // Auto-resize text
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [storyText]);

    return (
        <div className="fixed inset-0 z-[10000] bg-black flex flex-col md:max-w-md md:left-1/2 md:-translate-x-1/2 md:shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Main Canvas Area - Full Screen */}
            <div className={`relative flex-1 w-full overflow-hidden flex flex-col ${!storyMedia ? `bg-gradient-to-tr ${BACKGROUND_GRADIENTS[bgIndex]}` : 'bg-black'}`}>

                {/* Top Controls Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 pt-8 md:pt-6 z-50 flex items-center justify-between text-white drop-shadow-lg">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>

                    {!storyMedia && (
                        <button
                            onClick={handleBackgroundChange}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur active:scale-95 transition-transform border border-white/20"
                        >
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${BACKGROUND_GRADIENTS[(bgIndex + 1) % BACKGROUND_GRADIENTS.length]}`} />
                        </button>
                    )}
                </div>

                {/* Content Layer */}
                <div className="flex-1 flex items-center justify-center p-6 relative w-full h-full">
                    {storyMedia ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-black">
                            <img src={storyMedia} className="w-full h-full object-contain" alt="Story Preview" />
                            {/* Delete Media Button */}
                            <button
                                onClick={() => setStoryMedia(null)}
                                className="absolute top-20 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md z-40 active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    ) : (
                        <textarea
                            ref={textareaRef}
                            value={storyText}
                            onChange={(e) => setStoryText(e.target.value)}
                            placeholder="Toca para escribir..."
                            className="bg-transparent text-center text-3xl font-bold text-white placeholder-white/50 focus:outline-none resize-none leading-tight drop-shadow-md w-full max-h-[70vh]"
                            rows={1}
                            style={{ overflow: 'hidden' }}
                        />
                    )}
                </div>

            </div>

            {/* Bottom Tools & Send Bar - Sticky at Bottom */}
            <div className="bg-black/90 backdrop-blur-xl border-t border-white/10 p-4 pb-8 md:pb-6 z-50 w-full flex items-center justify-between gap-4">

                {/* Media Picker */}
                {!storyMedia ? (
                    <label className="flex-shrink-0 cursor-pointer active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-lg border-2 border-white/20 bg-white/5 flex items-center justify-center overflow-hidden relative">
                            {/* Mini gallery icon representation */}
                            <span className="material-symbols-outlined text-white/70 text-xl">image</span>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const url = URL.createObjectURL(file);
                                        setStoryMedia(url);
                                    }
                                }}
                            />
                        </div>
                    </label>
                ) : (
                    <div className="w-10" /> /* Spacer to keep "Tu Historia" centered or "Share" right */
                )}

                {/* Contextual Action - "Tu Historia" or just empty if we assume the big button is for "Tu Historia" */}
                <div className="flex items-center gap-2">
                    <span className="text-white/40 text-xs font-medium uppercase tracking-widest">
                        {storyMedia ? 'Editar' : 'Crear'}
                    </span>
                </div>

                {/* Send Button */}
                <button
                    onClick={() => {
                        if (!storyText && !storyMedia) return;
                        onSubmit({ text: storyText, mediaUrl: storyMedia || undefined });
                    }}
                    disabled={!storyText && !storyMedia}
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-obsidian disabled:opacity-50 disabled:grayscale transition-all active:scale-90 shadow-lg shadow-white/10"
                >
                    <span className="material-symbols-outlined text-2xl font-bold">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};
