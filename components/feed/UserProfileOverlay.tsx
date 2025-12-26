import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { Post, User } from '../../types';
import { usePosts } from '../../src/hooks/usePosts';
import { SmartImage } from '../ui/SmartImage';
import { PostItem } from './PostItem';

interface Props {
    userId: string;
    currentUserId: string;
    onClose: () => void;
}

export const UserProfileOverlay: React.FC<Props> = ({ userId, currentUserId, onClose }) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // Fetch posts
    const { data: allPosts = [] } = usePosts(currentUserId);
    // Filter posts for this user, sort newest first
    const userPosts = allPosts.filter(p => p.user_id === userId);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) setProfile(data);
            setLoading(false);
        };
        fetchProfile();
    }, [userId]);

    // Body scroll lock
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Derived Stats
    const daysOfFaith = profile?.joined_date
        ? Math.floor((new Date().getTime() - new Date(profile.joined_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // Mock Impact Points logic: 10 points per post + 1 per like received (simple gamification)
    const impactPoints = userPosts.reduce((acc, p) => acc + 10 + (p.likes || 0), 0);

    if (!userId) return null;

    return createPortal(
        <div className="fixed inset-0 z-[5000] flex flex-col isolate font-sans text-brand-obsidian dark:text-white">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full h-full md:max-w-md md:h-[90vh] md:mx-auto md:mt-auto md:rounded-t-[2.5rem] bg-brand-silk dark:bg-[#121212] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">

                {/* Header / Nav */}
                <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-transparent pointer-events-none">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all pointer-events-auto"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    {/* Share/Menu could go here */}
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : profile ? (
                    <div className="flex-1 overflow-y-auto overflow-x-hidden pb-safe">
                        {/* Profile Header */}
                        <div className="relative">
                            {/* Cover Gradient */}
                            <div className="h-44 bg-gradient-to-br from-brand-primary/80 to-purple-600/80 via-pink-500/50"></div>

                            <div className="px-6 -mt-20 relative z-10 flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="w-36 h-36 rounded-full p-1.5 bg-brand-silk dark:bg-[#121212] shadow-xl">
                                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-brand-obsidian/5 dark:border-white/10 relative bg-gray-100 dark:bg-white/5">
                                        <SmartImage src={profile.avatar_url} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-black mt-4 mb-1 tracking-tight">{profile.name}</h2>
                                {profile.role && (
                                    <div className="flex gap-2 mb-3">
                                        <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest border border-brand-primary/20">
                                            {profile.role}
                                        </span>
                                    </div>
                                )}

                                {profile.bio && (
                                    <p className="text-sm opacity-70 max-w-xs leading-relaxed mb-6 font-medium">{profile.bio}</p>
                                )}

                                {/* High-Level Stats Cards */}
                                <div className="grid grid-cols-3 gap-3 w-full mb-8">
                                    {/* Days of Faith */}
                                    <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                                        <span className="text-xl font-black text-brand-obsidian dark:text-white">{daysOfFaith}</span>
                                        <span className="text-[9px] uppercase tracking-widest opacity-50 font-bold mt-1 leading-tight">Días de Fe</span>
                                    </div>

                                    {/* Posts Count */}
                                    <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                                        <span className="text-xl font-black text-brand-obsidian dark:text-white">{userPosts.length}</span>
                                        <span className="text-[9px] uppercase tracking-widest opacity-50 font-bold mt-1 leading-tight">Posts</span>
                                    </div>

                                    {/* Impact Points */}
                                    <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                                        <span className="text-xl font-black text-brand-primary">{impactPoints}</span>
                                        <span className="text-[9px] uppercase tracking-widest opacity-50 font-bold mt-1 leading-tight">Impacto</span>
                                    </div>
                                </div>

                                {/* Tabs / Divider */}
                                <div className="w-full border-b border-brand-obsidian/10 dark:border-white/10 flex justify-center gap-12 text-sm font-bold uppercase tracking-widest pb-3 mb-1">
                                    <button className="text-brand-obsidian dark:text-white relative pb-3">
                                        Publicaciones
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-obsidian dark:bg-white rounded-full translate-y-3.5"></div>
                                    </button>
                                    <button className="text-brand-obsidian/30 dark:text-white/30">
                                        Ministerios
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* GALLERY GRID */}
                        <div className="grid grid-cols-3 gap-0.5 min-h-[300px] mb-20 px-0.5">
                            {userPosts.length > 0 ? (
                                userPosts.map(post => (
                                    <div
                                        key={post.id}
                                        className="relative aspect-square bg-gray-100 dark:bg-white/5 cursor-pointer group overflow-hidden"
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        {(post.mediaUrls && post.mediaUrls.length > 0) || post.mediaUrl ? (
                                            <>
                                                <SmartImage
                                                    src={post.mediaUrls?.[0] || post.mediaUrl!}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                {(post.mediaType === 'video' || (post.mediaUrls?.length || 0) > 1) && (
                                                    <div className="absolute top-1 right-1 text-white drop-shadow-md">
                                                        <span className="material-symbols-outlined text-lg">
                                                            {post.mediaType === 'video' ? 'play_arrow' : 'filter_none'}
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] font-bold opacity-30 select-none">
                                                {post.content.substring(0, 30)}...
                                            </div>
                                        )}
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white font-bold">
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-base">favorite</span>
                                                {post.likes}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-base">chat</span>
                                                {post.comments?.length || 0}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 py-20 text-center opacity-40 flex flex-col items-center">
                                    <span className="material-symbols-outlined text-4xl mb-2">photo_camera</span>
                                    <p className="font-bold text-sm">Aún no hay publicaciones</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                        <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                        <p>Usuario no encontrado</p>
                    </div>
                )}

                {/* SINGLE POST OVERLAY (Detailed View) */}
                {selectedPost && (
                    <div className="absolute inset-0 z-[5050] bg-brand-silk dark:bg-[#121212] animate-in fade-in slide-in-from-bottom duration-300 overflow-y-auto">
                        <div className="sticky top-0 z-50 flex items-center p-4 bg-brand-silk/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-brand-obsidian/5 dark:border-white/5">
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="mr-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <span className="font-bold text-sm uppercase tracking-widest opacity-60">Publicación</span>
                        </div>
                        <div className="pb-32">
                            <PostItem
                                post={selectedPost}
                                currentUserId={currentUserId}
                                onLike={() => { }} // Consider passing real handlers via props or refactor UserProfileOverlay to accept them
                                onComment={() => { }}
                                onSave={() => { }}
                                onUserClick={() => { }} // Disable diving deeper into same profile
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
