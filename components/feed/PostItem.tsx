import React, { useState } from 'react';
import { Post } from '../../types';
import { SmartImage } from '../ui/SmartImage';

interface Props {
    post: Post;
    currentUserId: string;
    onLike: (postId: string) => void;
    onComment: (post: Post) => void;
    onSave: (postId: string) => void;
    onDelete?: (postId: string) => void;
}

export const PostItem: React.FC<Props> = ({ post, currentUserId, onLike, onComment, onSave, onDelete }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const hasMedia = !!post.mediaUrl;
    const isOwner = post.user_id === currentUserId;

    const [showHeartOverlay, setShowHeartOverlay] = useState(false);

    const handleDoubleTap = () => {
        if (!showHeartOverlay) {
            setShowHeartOverlay(true);
            onLike(post.id);
            setTimeout(() => setShowHeartOverlay(false), 800);
        }
    };

    // --- LAYOUT 1: IMMERSIVE (MEDIA) ---
    if (hasMedia) {
        return (
            <article className="relative w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl mb-8 group isolate">

                {/* Background Blur for Mood */}
                <div className="absolute inset-0 z-0 opacity-30 blur-3xl scale-110">
                    <SmartImage src={post.mediaUrl!} className="w-full h-full object-cover" alt="" />
                </div>

                {/* Main Image - Fixed Aspect Ratio 4:5 (Instagram Standard) */}
                <div
                    className="relative w-full aspect-[4/5] flex items-center justify-center bg-black/50 z-10 overflow-hidden cursor-pointer"
                    onDoubleClick={handleDoubleTap}
                >
                    {/* Background filler for non-fitting images */}
                    <div className="absolute inset-0 blur-xl opacity-50">
                        <SmartImage src={post.mediaUrl!} className="w-full h-full object-cover" alt="" />
                    </div>

                    {/* The Image Itself */}
                    <SmartImage
                        src={post.mediaUrl!}
                        className={`w-full h-full object-contain relative z-20 transition-opacity duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        alt="Post content"
                        onLoad={() => setIsImageLoaded(true)}
                    />
                    {!isImageLoaded && <div className="absolute inset-0 bg-gray-800 animate-pulse z-30" />}

                    {/* Delete Button (Top Right) */}
                    {isOwner && onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                            className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-rose-500 hover:bg-black/60 transition-all active:scale-90"
                        >
                            <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                    )}

                    {/* Heart Animation Overlay (Explicit State) */}
                    <div className={`absolute inset-0 z-40 flex items-center justify-center pointer-events-none transition-all duration-300 ${showHeartOverlay ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                        <span className="material-symbols-outlined text-white text-9xl drop-shadow-2xl animate-out fade-out zoom-out duration-700 fill-1">favorite</span>
                    </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 pt-40 pb-6 px-6 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end z-30 pointer-events-none">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 p-0.5 shadow-lg bg-black">
                            <SmartImage src={post.userAvatar} className="w-full h-full object-cover rounded-full" alt="" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm flex items-center gap-1.5 drop-shadow-lg">
                                {post.userName}
                                <span className="material-symbols-outlined text-brand-primary text-[14px] fill-1 drop-shadow-md">verified</span>
                            </h4>
                            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest drop-shadow-md">
                                {new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>

                    {/* Caption */}
                    {post.content && (
                        <p className="text-white/95 text-[15px] mb-5 font-light leading-relaxed drop-shadow-md line-clamp-3 md:line-clamp-none pointer-events-auto">
                            {post.content}
                        </p>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pointer-events-auto">
                        <div className="flex items-center gap-6">
                            <button onClick={() => onLike(post.id)} className={`flex items-center gap-2 transition-transform active:scale-90 ${post.isLiked ? 'text-rose-500' : 'text-white'}`}>
                                <span className={`material-symbols-outlined text-3xl drop-shadow-md ${post.isLiked ? 'fill-1' : ''}`}>favorite</span>
                                <span className="text-xs font-black drop-shadow-md">{post.likes}</span>
                            </button>
                            <button onClick={() => onComment(post)} className="flex items-center gap-2 text-white active:scale-90 transition-transform hover:text-brand-primary">
                                <span className="material-symbols-outlined text-3xl drop-shadow-md">chat_bubble</span>
                                <span className="text-xs font-black drop-shadow-md">{post.comments.length}</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: `Post de ${post.userName}`,
                                            text: post.content,
                                            url: window.location.href
                                        }).catch(console.error);
                                    } else {
                                        navigator.clipboard.writeText(`${post.content} - por ${post.userName}`);
                                        alert("Enlace copiado al portapapeles");
                                    }
                                }}
                                className="text-white active:scale-90 transition-transform -rotate-45 mt-1 hover:text-brand-primary"
                            >
                                <span className="material-symbols-outlined text-3xl drop-shadow-md">send</span>
                            </button>
                        </div>
                        <button onClick={() => onSave(post.id)} className={`transition-colors active:scale-90 ${post.isSaved ? 'text-brand-primary' : 'text-white/80 hover:text-white'}`}>
                            <span className={`material-symbols-outlined text-3xl drop-shadow-md ${post.isSaved ? 'fill-1' : ''}`}>bookmark</span>
                        </button>
                    </div>
                </div>
            </article>
        );
    }

    // --- LAYOUT 2: TWITTER / CARD STYLE (TEXT ONLY) ---
    return (
        <article className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2rem] p-6 mb-8 shadow-sm hover:shadow-md transition-shadow relative">
            {/* Delete Button (Text Post) */}
            {isOwner && onDelete && (
                <div className="absolute top-4 right-4">
                    <button
                        onClick={() => onDelete(post.id)}
                        className="w-8 h-8 flex items-center justify-center text-brand-obsidian/20 dark:text-white/20 hover:text-rose-500 dark:hover:text-rose-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-obsidian/10">
                    <SmartImage src={post.userAvatar} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                    <h4 className="text-brand-obsidian dark:text-white font-bold text-base flex items-center gap-1.5">
                        {post.userName}
                        <span className="material-symbols-outlined text-brand-primary text-[16px] fill-1">verified</span>
                    </h4>
                    <p className="text-xs text-brand-obsidian/40 dark:text-white/40 font-medium">
                        @{post.userName.toLowerCase().replace(/\s/g, '')} • {new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>

            {/* Content Body */}
            <div className="mb-5 pl-[3.75rem]">
                <p className="text-brand-obsidian dark:text-white text-lg md:text-xl font-normal leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4">
                <div className="flex items-center gap-8">
                    <button onClick={() => onLike(post.id)} className={`flex items-center gap-2 group transition-colors ${post.isLiked ? 'text-rose-500' : 'text-brand-obsidian/40 dark:text-white/40 hover:text-rose-500'}`}>
                        <div className="p-2 -m-2 rounded-full group-hover:bg-rose-500/10 transition-colors">
                            <span className={`material-symbols-outlined text-2xl ${post.isLiked ? 'fill-1' : ''}`}>favorite</span>
                        </div>
                        <span className="text-sm font-medium">{post.likes > 0 && post.likes}</span>
                    </button>

                    <button onClick={() => onComment(post)} className="flex items-center gap-2 group text-brand-obsidian/40 dark:text-white/40 hover:text-blue-500 transition-colors">
                        <div className="p-2 -m-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                            <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                        </div>
                        <span className="text-sm font-medium">{post.comments.length > 0 && post.comments.length}</span>
                    </button>

                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: `Post de ${post.userName}`,
                                    text: post.content,
                                    url: window.location.href
                                }).catch(console.error);
                            } else {
                                navigator.clipboard.writeText(post.content);
                                alert("Copiado");
                            }
                        }}
                        className="group text-brand-obsidian/40 dark:text-white/40 hover:text-green-500 transition-colors"
                    >
                        <div className="p-2 -m-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                            <span className="material-symbols-outlined text-2xl">ios_share</span>
                        </div>
                    </button>
                </div>

                <button onClick={() => onSave(post.id)} className={`group transition-colors ${post.isSaved ? 'text-brand-primary' : 'text-brand-obsidian/40 dark:text-white/40 hover:text-brand-primary'}`}>
                    <div className="p-2 -m-2 rounded-full group-hover:bg-brand-primary/10 transition-colors">
                        <span className={`material-symbols-outlined text-2xl ${post.isSaved ? 'fill-1' : ''}`}>bookmark</span>
                    </div>
                </button>
            </div>
        </article>
    );
};
