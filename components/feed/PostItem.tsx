
import React from 'react';
import { Post } from '../../types';
import { SmartImage } from '../ui/SmartImage';

interface Props {
    post: Post;
    currentUserId: string;
    onLike: (id: string) => void;
    onComment: (post: Post) => void;
}

export const PostItem: React.FC<Props> = ({ post, currentUserId, onLike, onComment }) => {
    return (
        <article className="w-full bg-white dark:bg-brand-surface mb-6 md:mb-12 border-b md:border md:rounded-[2.5rem] overflow-hidden shadow-sm border-brand-obsidian/5 dark:border-white/5 animate-reveal">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4 px-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden border border-brand-primary/20">
                        <SmartImage src={post.userAvatar} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-brand-obsidian dark:text-white flex items-center gap-1.5 leading-none">
                            {post.userName}
                            <span className="material-symbols-outlined text-brand-primary text-[14px] fill-1">verified</span>
                        </h4>
                        <p className="text-[9px] text-brand-obsidian/40 dark:text-white/20 font-black uppercase tracking-widest mt-1.5">Membresía Sión</p>
                    </div>
                </div>
                <button className="text-brand-obsidian/20 dark:text-white/20 active:text-brand-primary transition-colors"><span className="material-symbols-outlined">more_horiz</span></button>
            </div>

            {/* Media (Full Width) */}
            {post.mediaUrl && (
                <div className="w-full aspect-square bg-brand-silk dark:bg-brand-obsidian relative overflow-hidden group cursor-pointer" onDoubleClick={() => onLike(post.id)}>
                    <SmartImage src={post.mediaUrl} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-9xl fill-1 drop-shadow-2xl scale-125 transition-transform">favorite</span>
                    </div>
                </div>
            )}

            {/* Post Content & Actions */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex gap-7">
                        <button onClick={() => onLike(post.id)} className={`flex items-center gap-2 group transition-all active:scale-125 ${post.isLiked ? 'text-rose-500' : 'text-brand-obsidian dark:text-white/70'}`}>
                            <span className={`material-symbols-outlined text-3xl ${post.isLiked ? 'fill-1' : ''}`}>favorite</span>
                            <span className="text-xs font-black">{post.likes}</span>
                        </button>
                        <button onClick={() => onComment(post)} className="flex items-center gap-2 text-brand-obsidian dark:text-white/70 active:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">chat_bubble</span>
                            <span className="text-xs font-black">{post.comments.length}</span>
                        </button>
                        <button className="flex items-center text-brand-obsidian/40 dark:text-white/30 active:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">send</span>
                        </button>
                    </div>
                    <span className="material-symbols-outlined text-3xl text-brand-obsidian/20 hover:text-brand-primary transition-colors">bookmark</span>
                </div>
                <p className="text-sm text-brand-obsidian dark:text-white/90 leading-relaxed">
                    <span className="font-bold mr-2 text-brand-obsidian dark:text-brand-primary">{post.userName}</span>
                    {post.content}
                </p>
                <p className="text-[10px] text-brand-obsidian/30 dark:text-white/20 font-black uppercase tracking-[0.2em] mt-4">
                    {new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} • Santuario Sión
                </p>
            </div>
        </article>
    );
};
