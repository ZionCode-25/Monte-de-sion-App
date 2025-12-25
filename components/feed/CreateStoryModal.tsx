import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    'bg-black', // Plain
];

const FONTS = [
    { name: 'Modern', class: 'font-sans' },
    { name: 'Classic', class: 'font-serif' },
    { name: 'Neon', class: 'font-mono' },
    { name: 'Bold', class: 'font-black' },
];

export const CreateStoryModal: React.FC<Props> = ({ user, onClose, onSubmit }) => {
    // Mode State
    const [mode, setMode] = useState<'INITIAL' | 'TEXT' | 'IMAGE'>('INITIAL');

    // Content State
    const [storyText, setStoryText] = useState('');
    const [storyMedia, setStoryMedia] = useState<string | null>(null);
    const [bgIndex, setBgIndex] = useState(0);
    const [fontIndex, setFontIndex] = useState(0);
    const [showTextOverlayOnImage, setShowTextOverlayOnImage] = useState(false);

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- EFFECT: Body Scroll Lock ---
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // --- EFFECT: Text Area Auto-Resize ---
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [storyText]);

    // --- HANDLERS ---

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setStoryMedia(url);
            setMode('IMAGE');
        }
    };

    const handleSubmit = () => {
        if (mode === 'TEXT' && !storyText) return;
        if (mode === 'IMAGE' && !storyMedia) return;

        // If image mode, we send the media URL and potentially text overlay if we implemented that logic in the backend
        // For now, based on User Request, we pass text even in image mode if it exists
        onSubmit({
            text: storyText,
            mediaUrl: storyMedia || undefined
        });
    };

    // --- RENDERERS ---

    const renderControls = () => {
        if (mode === 'INITIAL') return null;

        return (
            <div className="absolute top-0 right-0 p-6 pt-12 flex flex-col gap-4 z-50 animate-in slide-in-from-right duration-300">
                {/* Close/Back is handled separately at top-left or handled here for consistency */}

                {/* TEXT MODE CONTROLS */}
                {mode === 'TEXT' && (
                    <>
                        <button onClick={() => setBgIndex((p) => (p + 1) % BACKGROUND_GRADIENTS.length)} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg">
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${BACKGROUND_GRADIENTS[(bgIndex + 1) % BACKGROUND_GRADIENTS.length]}`} />
                        </button>
                        <button onClick={() => setFontIndex((p) => (p + 1) % FONTS.length)} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg font-bold">
                            Aa
                        </button>
                    </>
                )}

                {/* IMAGE MODE CONTROLS */}
                {mode === 'IMAGE' && (
                    <>
                        <button onClick={() => setShowTextOverlayOnImage(!showTextOverlayOnImage)} className={`w-12 h-12 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center active:scale-95 transition-all shadow-lg ${showTextOverlayOnImage ? 'bg-white text-black' : 'bg-black/40 text-white'}`}>
                            <span className="material-symbols-outlined">title</span>
                        </button>
                    </>
                )}
            </div>
        );
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] bg-black text-white font-sans overflow-hidden">

            {/* TOP BAR (Always Visible) */}
            <div className="absolute top-0 left-0 w-full p-4 pt-4 md:pt-6 z-[60] flex items-center justify-between pointer-events-none">
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur pointer-events-auto active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-2xl drop-shadow-md">close</span>
                </button>

                {mode !== 'INITIAL' && (
                    <button
                        onClick={handleSubmit}
                        disabled={mode === 'TEXT' && !storyText}
                        className="px-6 py-2 rounded-full bg-white text-black font-bold text-sm pointer-events-auto shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                    >
                        Compartir
                    </button>
                )}
            </div>

            {/* MAIN CANVAS */}
            <div className={`relative w-full h-full flex flex-col items-center justify-center transition-all duration-500 ${mode === 'TEXT' ? `bg-gradient-to-tr ${BACKGROUND_GRADIENTS[bgIndex]}` : 'bg-black'}`}>

                {/* RENDER CONTROLS (Right Side) */}
                {renderControls()}

                {/* MODE A: INITIAL SELECTION */}
                {mode === 'INITIAL' && (
                    <div className="flex flex-col gap-6 animate-in zoom-in duration-300">
                        <button onClick={() => setMode('TEXT')} className="group relative w-32 h-32 rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 p-[1px] active:scale-95 transition-transform">
                            <div className="w-full h-full bg-black rounded-3xl flex flex-col items-center justify-center group-hover:bg-opacity-80 transition-all">
                                <span className="material-symbols-outlined text-4xl mb-2">text_fields</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Texto</span>
                            </div>
                        </button>

                        <button onClick={() => fileInputRef.current?.click()} className="group relative w-32 h-32 rounded-3xl bg-gradient-to-tr from-blue-500 to-teal-500 p-[1px] active:scale-95 transition-transform">
                            <div className="w-full h-full bg-black rounded-3xl flex flex-col items-center justify-center group-hover:bg-opacity-80 transition-all">
                                <span className="material-symbols-outlined text-4xl mb-2">image</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Galería</span>
                            </div>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>
                )}

                {/* MODE B: TEXT CREATION */}
                {mode === 'TEXT' && (
                    <div className="w-full max-w-lg px-8 animate-in fade-in zoom-in duration-300">
                        <textarea
                            ref={textareaRef}
                            value={storyText}
                            onChange={(e) => setStoryText(e.target.value)}
                            placeholder="Escribe tu historia..."
                            className={`w-full bg-transparent text-center text-white placeholder-white/50 focus:outline-none resize-none overflow-hidden drop-shadow-lg leading-tight ${FONTS[fontIndex].class}`}
                            style={{ fontSize: storyText.length > 50 ? '1.5rem' : '2.5rem' }}
                            rows={1}
                            autoFocus
                        />
                    </div>
                )}

                {/* MODE C: IMAGE PREVIEW & EDIT */}
                {mode === 'IMAGE' && storyMedia && (
                    <div className="relative w-full h-full flex items-center justify-center bg-black animate-in fade-in duration-300">
                        {/* The Image Itself - Contain to see full, Cover if user wanted (defaulting to contain for integrity) */}
                        <img src={storyMedia} className="w-full h-full object-contain" alt="Story Preview" />

                        {/* Text Overlay Layer */}
                        {showTextOverlayOnImage && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 p-8" onClick={(e) => {
                                if (e.target === e.currentTarget) setShowTextOverlayOnImage(false);
                            }}>
                                <textarea
                                    value={storyText}
                                    onChange={(e) => setStoryText(e.target.value)}
                                    placeholder="Agrega un comentario..."
                                    className="bg-transparent text-center text-2xl font-bold text-white placeholder-white/70 focus:outline-none resize-none w-full max-w-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                                    rows={3}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}

                        {/* Floating Text Preview Tag if overlay is closed but text exists */}
                        {!showTextOverlayOnImage && storyText && (
                            <div className="absolute bottom-24 bg-black/60 backdrop-blur px-6 py-3 rounded-2xl max-w-[80%] text-center cursor-pointer active:scale-95 transition-transform" onClick={() => setShowTextOverlayOnImage(true)}>
                                <p className="text-white font-medium text-sm line-clamp-2">{storyText}</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>,
        document.body
    );
};
