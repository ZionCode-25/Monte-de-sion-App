import React, { useState, useEffect } from 'react';
import { Post } from '../../types';
import { SmartImage } from '../ui/SmartImage';

interface Props {
    post: Post;
    currentUserId: string;
    currentUserRole?: string;
    onLike: (postId: string) => void;
    onComment: (post: Post) => void;
    onSave: (postId: string) => void;
    onDelete?: (postId: string) => void;
    onReport?: (postId: string) => void;
    onUserClick?: (userId: string) => void;
}

const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `Hace ${Math.floor(interval)} años`;

    interval = seconds / 2592000;
    if (interval > 1) return `Hace ${Math.floor(interval)} meses`;

    interval = seconds / 86400;
    if (interval > 1) return `Hace ${Math.floor(interval)} días`;

    interval = seconds / 3600;
    if (interval > 1) return `Hace ${Math.floor(interval)} h`;

    interval = seconds / 60;
    if (interval > 1) return `Hace ${Math.floor(interval)} min`;

    return "Hace un momento";
};

export const PostItem: React.FC<Props> = ({ post, currentUserId, currentUserRole, onLike, onComment, onSave, onDelete, onReport, onUserClick }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showMenu, setShowMenu] = useState(false);

    const hasMedia = !!post.mediaUrl || (post.mediaUrls && post.mediaUrls.length > 0);
    const isOwner = post.user_id === currentUserId;
    const canDelete = isOwner || currentUserRole === 'SUPER_ADMIN';

    // Close menu on outside click
    useEffect(() => {
        if (!showMenu) return;
        const handler = () => setShowMenu(false);
        window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, [showMenu]);

    const handleDoubleTap = () => {
        if (!showHeartOverlay) {
            setShowHeartOverlay(true);
            if (!post.isLiked) {
                onLike(post.id);
            }
            setTimeout(() => setShowHeartOverlay(false), 800);
        }
    };

    return (
        <article className="w-full bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-white/5 md:border md:rounded-[1.5rem] md:mb-6 md:shadow-sm overflow-hidden mb-2">

            {/* 1. HEADER: User Info */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    {/* Avatar Container: Ring for Instagram look, ensures perfect circle */}
                    <div
                        onClick={() => onUserClick?.(post.user_id)}
                        className="relative w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600 cursor-pointer active:scale-95 transition-transform"
                    >
                        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-black border-[1.5px] border-white dark:border-black">
                            <SmartImage src={post.userAvatar} className="w-full h-full object-cover" alt={post.userName} />
                        </div>
                    </div>

                    <div
                        onClick={() => onUserClick?.(post.user_id)}
                        className="flex flex-col justify-center leading-none cursor-pointer"
                    >
                        <h4 className="text-sm font-bold text-brand-obsidian dark:text-white flex items-center gap-1 hover:underline">
                            {post.userName}
                            <span className="material-symbols-outlined text-brand-primary text-[14px] fill-1">verified</span>
                        </h4>
                        {post.location && (
                            <span className="text-xs text-brand-obsidian/60 dark:text-white/60">{post.location}</span>
                        )}
                    </div>
                </div>

                {/* Three-dot menu */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        className="text-brand-obsidian/40 dark:text-white/40 hover:text-brand-obsidian dark:hover:text-white transition-colors p-2 -mr-2"
                    >
                        <span className="material-symbols-outlined text-xl">more_horiz</span>
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in zoom-in-95 duration-200 origin-top-right">
                            {!isOwner && onReport && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onReport(post.id); }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">flag</span> Reportar
                                </button>
                            )}
                            {canDelete && onDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(post.id); }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. MEDIA (If exists) or TEXT CONTENT */}
            {hasMedia ? (
                <div className="relative w-full overflow-hidden group">
                    {/* Main Image / Carousel - Removing fixed aspect ratio to prevent empty margins */}
                    <div
                        className="relative z-10 w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
                        onScroll={(e) => {
                            const scrollLeft = e.currentTarget.scrollLeft;
                            const width = e.currentTarget.offsetWidth;
                            const index = Math.round(scrollLeft / width);
                            setCurrentMediaIndex(index);
                        }}
                    >
                        {(post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls : [post.mediaUrl!]).map((url, idx) => (
                            <div
                                key={idx}
                                className="w-full flex-shrink-0 snap-center bg-gray-50 dark:bg-black flex items-center justify-center"
                            >
                                <SmartImage
                                    src={url}
                                    className={`w-full h-auto min-h-[300px] max-h-[75vh] object-cover transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    alt={`Post content ${idx + 1}`}
                                    onLoad={() => setIsImageLoaded(true)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Carousel Indicators */}
                    {(post.mediaUrls?.length || 0) > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 p-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                            {post.mediaUrls!.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${idx === currentMediaIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Double Tap Heart Animation */}
                    <div className={`absolute inset-0 z-40 flex items-center justify-center pointer-events-none transition-all duration-300 ${showHeartOverlay ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                        <span className={`material-symbols-outlined text-white text-9xl drop-shadow-[0_5px_30px_rgba(220,38,38,0.6)] fill-1 ${showHeartOverlay ? 'animate-bounce' : ''}`}>favorite</span>
                    </div>
                </div>
            ) : (
                /* Text Only Post Styling */
                <div className="px-4 py-2 pb-4">
                    <p className={`text-[15px] text-brand-obsidian dark:text-white/90 leading-relaxed whitespace-pre-wrap ${post.content.length > 200 && !isExpanded ? 'line-clamp-6' : ''}`}>
                        {post.content}
                    </p>
                    {post.content.length > 200 && !isExpanded && (
                        <button onClick={() => setIsExpanded(true)} className="text-brand-obsidian/40 dark:text-white/40 text-sm mt-1 hover:text-brand-obsidian dark:hover:text-white">... más</button>
                    )}
                </div>
            )}

            {/* 3. ACTIONS BAR */}
            <div className="px-4 pt-3 pb-2">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-5">
                        <button onClick={() => onLike(post.id)} className="group active:scale-90 transition-transform">
                            <span className={`material-symbols-outlined text-[26px] ${post.isLiked ? 'font-variation-fill text-rose-500' : 'text-brand-obsidian dark:text-white hover:text-brand-obsidian/60'}`}>
                                favorite
                            </span>
                        </button>

                        <button onClick={() => onComment(post)} className="group active:scale-90 transition-transform">
                            <span className="material-symbols-outlined text-[26px] text-brand-obsidian dark:text-white hover:text-brand-obsidian/60 dark:hover:text-white/60 -rotate-90">
                                chat_bubble
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: `Post de ${post.userName}`,
                                        text: post.content,
                                        url: window.location.href
                                    }).catch(console.error);
                                }
                            }}
                            className="group active:scale-90 transition-transform"
                        >
                            <span className="material-symbols-outlined text-[26px] text-brand-obsidian dark:text-white hover:text-brand-obsidian/60 dark:hover:text-white/60 -rotate-45 -mt-1 block">
                                send
                            </span>
                        </button>
                    </div>

                    <button onClick={() => onSave(post.id)} className="active:scale-90 transition-transform">
                        <span className={`material-symbols-outlined text-[26px] ${post.isSaved ? 'font-variation-fill text-brand-primary' : 'text-brand-obsidian dark:text-white hover:text-brand-obsidian/60'}`}>
                            bookmark
                        </span>
                    </button>
                </div>

                {/* 4. LIKES COUNT */}
                {post.likes > 0 && (
                    <p className="text-sm font-bold text-brand-obsidian dark:text-white mb-1 cursor-pointer">
                        {post.likes} Me gusta
                    </p>
                )}

                {/* 5. CAPTION (Inside footer for Media Posts, separate for Text Posts logic differs slightly but unifying is better) 
                   For Text Posts, content is already shown above. Don't repeat it.
                */}
                {hasMedia && post.content && (
                    <div className="text-sm text-brand-obsidian dark:text-white leading-tight mb-1">
                        <span className="font-bold mr-2">{post.userName}</span>
                        <span className="font-normal opacity-90">
                            {isExpanded ? post.content : post.content.slice(0, 90)}
                        </span>
                        {post.content.length > 90 && !isExpanded && (
                            <button onClick={() => setIsExpanded(true)} className="text-brand-obsidian/40 dark:text-white/40 ml-1">... más</button>
                        )}
                    </div>
                )}

                {/* 6. VIEW COMMENTS LINK */}
                {post.comments.length > 0 && (
                    <button onClick={() => onComment(post)} className="text-brand-obsidian/40 dark:text-white/40 text-[13px] mb-1 block">
                        Ver los {post.comments.length} comentarios
                    </button>
                )}

                {/* 7. TIMESTAMP */}
                <p className="text-[10px] text-brand-obsidian/40 dark:text-white/40 uppercase tracking-wide font-medium">
                    {timeAgo(post.createdAt)}
                </p>
            </div>
        </article>
    );
};
