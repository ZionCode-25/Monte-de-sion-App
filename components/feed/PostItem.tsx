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

export const PostItem: React.FC<Props> = ({ post, currentUserId, onLike, onComment, onSave, onDelete, onUserClick }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const hasMedia = !!post.mediaUrl || (post.mediaUrls && post.mediaUrls.length > 0);
    const isOwner = post.user_id === currentUserId;

    const handleDoubleTap = () => {
        if (!showHeartOverlay) {
            setShowHeartOverlay(true);
            onLike(post.id);
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

                {/* Options / Delete */}
                {isOwner && onDelete && (
                    <button
                        onClick={() => onDelete(post.id)}
                        className="text-brand-obsidian/40 dark:text-white/40 hover:text-rose-500 transition-colors p-2 -mr-2"
                    >
                        <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                )}
            </div>

            {/* 2. MEDIA (If exists) or TEXT CONTENT */}
            {hasMedia ? (
                <div className="relative w-full aspect-[4/5] bg-black/5 dark:bg-white/5 overflow-hidden group">
                    {/* Blur Background Filler */}
                    <div className="absolute inset-0 z-0">
                        <SmartImage
                            src={post.mediaUrls?.[currentMediaIndex] || post.mediaUrl!}
                            className="w-full h-full object-cover blur-3xl scale-125 opacity-30 dark:opacity-20 transition-all duration-700"
                            alt=""
                        />
                    </div>

                    {/* Main Image / Carousel */}
                    <div
                        className="relative z-10 w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
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
                                className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center cursor-pointer relative"
                                onDoubleClick={handleDoubleTap}
                            >
                                <SmartImage
                                    src={url}
                                    className={`w-full h-full object-contain transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    alt={`Post content ${idx + 1}`}
                                    onLoad={() => setIsImageLoaded(true)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Carousel Indicators */}
                    {(post.mediaUrls?.length || 0) > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5 p-2">
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
