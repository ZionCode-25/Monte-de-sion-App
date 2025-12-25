
import React, { useState } from 'react';
import { Post } from '../../types';
import { SmartImage } from '../ui/SmartImage';

interface Props {
    post: Post;
    currentUserId: string;
    onLike: (id: string) => void;
    onComment: (post: Post) => void;
}

export const PostItem: React.FC<Props> = ({ post, currentUserId, onLike, onComment }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    return (
        <article className="w-full relative mb-1 bg-brand-obsidian overflow-hidden">
            {/* Main Media Container */}
            <div className="relative w-full aspect-[4/5] md:aspect-square bg-gray-900 overflow-hidden group">
                {post.mediaUrl ? (
                    <SmartImage
                        src={post.mediaUrl}
                        className={`w-full h-full object-cover transition-all duration-700 ${isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                        alt=""
                        onLoad={() => setIsImageLoaded(true)}
                    />
                ) : (
                    // Fallback for text-only posts (styled professionally)
                    <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-brand-obsidian to-gray-900">
                        <p className="text-white/90 text-2xl font-serif text-center font-medium leading-relaxed italic">
                            "{post.content}"
                        </p>
                    </div>
                )}

                {/* Like Animation Overlay */}
                <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity z-10 cursor-pointer"
                    onDoubleClick={() => onLike(post.id)}
                >
                    <span className="material-symbols-outlined text-white text-9xl drop-shadow-2xl scale-0 active:scale-125 transition-transform duration-300 pointer-events-none select-none">favorite</span>
                </div>

                {/* Content Overlay (Gradient) */}
                <div className="absolute inset-x-0 bottom-0 pt-32 pb-6 px-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end">

                    {/* User Info & Time */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 p-0.5">
                            <SmartImage src={post.userAvatar} className="w-full h-full object-cover rounded-full" alt="" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm flex items-center gap-1.5 shadow-black drop-shadow-md">
                                {post.userName}
                                <span className="material-symbols-outlined text-brand-primary text-[14px] fill-1">verified</span>
                            </h4>
                            <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">
                                {new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>

                    {/* Captions */}
                    {post.mediaUrl && post.content && (
                        <p className="text-white/90 text-sm mb-4 line-clamp-2 md:line-clamp-none font-light leading-relaxed drop-shadow-md">
                            {post.content}
                        </p>
                    )}

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => onLike(post.id)}
                                className={`flex items-center gap-2 transition-all active:scale-90 ${post.isLiked ? 'text-rose-500' : 'text-white'}`}
                            >
                                <span className={`material-symbols-outlined text-3xl drop-shadow-md ${post.isLiked ? 'fill-1' : ''}`}>favorite</span>
                                <span className="text-xs font-bold drop-shadow-md">{post.likes}</span>
                            </button>

                            <button
                                onClick={() => onComment(post)}
                                className="flex items-center gap-2 text-white active:scale-90 transition-transform"
                            >
                                <span className="material-symbols-outlined text-3xl drop-shadow-md">chat_bubble</span>
                                <span className="text-xs font-bold drop-shadow-md">{post.comments.length}</span>
                            </button>

                            <button className="text-white active:scale-90 transition-transform -rotate-45 mt-1">
                                <span className="material-symbols-outlined text-3xl drop-shadow-md">send</span>
                            </button>
                        </div>

                        <button className="text-white/80 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-3xl drop-shadow-md">bookmark</span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};
