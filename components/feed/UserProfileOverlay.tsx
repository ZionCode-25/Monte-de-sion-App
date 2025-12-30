import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Post, User, PrayerRequest, Devotional } from '../../types';
import { usePosts } from '../../src/hooks/usePosts';
import { SmartImage } from '../ui/SmartImage';
import { PostItem } from './PostItem';

interface Props {
    userId: string;
    currentUserId: string;
    onClose: () => void;
}

export const UserProfileOverlay: React.FC<Props> = ({ userId, currentUserId, onClose }) => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // Fetch posts
    const { data: allPosts = [] } = usePosts(currentUserId);
    // Filter posts for this user, sort newest first
    const userPosts = allPosts.filter(p => p.user_id === userId);

    const [activeTab, setActiveTab] = useState<'gallery' | 'posts' | 'prayers' | 'devotionals'>('gallery');
    const [userPrayers, setUserPrayers] = useState<PrayerRequest[]>([]);
    const [userDevotionals, setUserDevotionals] = useState<Devotional[]>([]);

    useEffect(() => {
        const fetchProfileData = async () => {
            // 1. Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // 2. Prayers
            let prayerQuery = supabase
                .from('prayer_requests')
                // Selecting id to count length for simplicity and reliability
                .select('*, user:profiles(name, avatar_url), interactions:prayer_interactions(id)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            // If not owner, filter public
            if (userId !== currentUserId) {
                prayerQuery = prayerQuery.eq('is_private', false);
            }

            const { data: prayersData } = await prayerQuery;

            // 3. Devotionals
            const { data: devotionalsData } = await supabase
                .from('devotionals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (profileData) setProfile(profileData);
            if (prayersData) setUserPrayers(prayersData as any[]);
            if (devotionalsData) setUserDevotionals(devotionalsData as unknown as Devotional[]);
            setLoading(false);
        };
        fetchProfileData();
    }, [userId, currentUserId]);

    // Body scroll lock
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Derived Stats
    const daysOfFaith = profile?.joined_date
        ? Math.floor((new Date().getTime() - new Date(profile.joined_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // Mock Impact Points
    const impactPoints = userPosts.reduce((acc, p) => acc + 10 + (p.likes || 0), 0);

    // Filter posts for gallery
    const galleryPosts = userPosts.filter(p => (p.mediaUrls && p.mediaUrls.length > 0) || p.media_url);

    if (!userId) return null;

    if (typeof document === 'undefined') return null;

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
                                    <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                                        <span className="text-xl font-black text-brand-obsidian dark:text-white">{daysOfFaith}</span>
                                        <span className="text-[9px] uppercase tracking-widest opacity-50 font-bold mt-1 leading-tight">Días de Fe</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                                        <span className="text-xl font-black text-brand-obsidian dark:text-white">{userPosts.length}</span>
                                        <span className="text-[9px] uppercase tracking-widest opacity-50 font-bold mt-1 leading-tight">Publicaciones</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                                        <span className="text-xl font-black text-brand-primary">{impactPoints}</span>
                                        <span className="text-[9px] uppercase tracking-widest opacity-50 font-bold mt-1 leading-tight">Impacto</span>
                                    </div>
                                </div>
                            </div>

                            {/* SCROLLABLE TABS */}
                            <div className="w-full border-b border-brand-obsidian/10 dark:border-white/10 overflow-x-auto">
                                <div className="flex gap-8 text-sm font-bold uppercase tracking-widest pb-3 mb-1 min-w-max px-4">
                                    <button
                                        onClick={() => setActiveTab('gallery')}
                                        className={`${activeTab === 'gallery' ? 'text-brand-obsidian dark:text-white' : 'text-brand-obsidian/30 dark:text-white/30'} relative pb-2 transition-colors flex items-center gap-2`}
                                    >
                                        <span className="material-symbols-outlined text-lg">grid_view</span>
                                        Galería
                                        {activeTab === 'gallery' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-obsidian dark:bg-white rounded-full translate-y-3.5"></div>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('posts')}
                                        className={`${activeTab === 'posts' ? 'text-brand-obsidian dark:text-white' : 'text-brand-obsidian/30 dark:text-white/30'} relative pb-2 transition-colors flex items-center gap-2`}
                                    >
                                        <span className="material-symbols-outlined text-lg">view_agenda</span>
                                        Post
                                        {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-obsidian dark:bg-white rounded-full translate-y-3.5"></div>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('prayers')}
                                        className={`${activeTab === 'prayers' ? 'text-brand-obsidian dark:text-white' : 'text-brand-obsidian/30 dark:text-white/30'} relative pb-2 transition-colors flex items-center gap-2`}
                                    >
                                        <span className="material-symbols-outlined text-lg">favorite</span>
                                        Oraciones
                                        {activeTab === 'prayers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-obsidian dark:bg-white rounded-full translate-y-3.5"></div>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('devotionals')}
                                        className={`${activeTab === 'devotionals' ? 'text-brand-obsidian dark:text-white' : 'text-brand-obsidian/30 dark:text-white/30'} relative pb-2 transition-colors flex items-center gap-2`}
                                    >
                                        <span className="material-symbols-outlined text-lg">book_2</span>
                                        Devocional
                                        {activeTab === 'devotionals' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-obsidian dark:bg-white rounded-full translate-y-3.5"></div>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* CONTENT */}
                        {activeTab === 'gallery' && (
                            <div className="grid grid-cols-3 gap-0.5 min-h-[300px] mb-20 px-0.5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {galleryPosts.length > 0 ? (
                                    galleryPosts.map(post => (
                                        <div
                                            key={post.id}
                                            className="relative aspect-square bg-gray-100 dark:bg-white/5 cursor-pointer group overflow-hidden"
                                            onClick={() => setSelectedPost(post)}
                                        >
                                            <SmartImage
                                                src={post.mediaUrls?.[0] || post.media_url!}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            {(post.media_type === 'video' || (post.mediaUrls?.length || 0) > 1) && (
                                                <div className="absolute top-1 right-1 text-white drop-shadow-md">
                                                    <span className="material-symbols-outlined text-lg">
                                                        {post.media_type === 'video' ? 'play_arrow' : 'filter_none'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 py-20 text-center opacity-40 flex flex-col items-center">
                                        <span className="material-symbols-outlined text-4xl mb-2">perm_media</span>
                                        <p className="font-bold text-sm">Sin contenido multimedia</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'posts' && (
                            <div className="flex flex-col gap-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-brand-silk dark:bg-black">
                                {userPosts.length > 0 ? (
                                    userPosts.map(post => (
                                        <div key={post.id} className="border-b border-brand-obsidian/5 dark:border-white/5 last:border-0">
                                            <PostItem
                                                post={post}
                                                currentUserId={currentUserId}
                                                onLike={() => { }}
                                                onComment={() => { }}
                                                onSave={() => { }}
                                                onUserClick={() => { }}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center opacity-40 flex flex-col items-center">
                                        <span className="material-symbols-outlined text-4xl mb-2">feed</span>
                                        <p className="font-bold text-sm">Aún no hay publicaciones</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'prayers' && (
                            <div className="flex flex-col gap-4 pb-20 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {userPrayers.length > 0 ? (
                                    userPrayers.map(pr => (
                                        <button
                                            key={pr.id}
                                            onClick={() => {
                                                onClose();
                                                navigate(`/prayer-requests?id=${pr.id}`);
                                            }}
                                            className="w-full text-left bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-brand-primary/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                                    {pr.category}
                                                </span>
                                                <span className="text-[10px] opacity-40 uppercase tracking-widest">{new Date(pr.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="font-serif italic text-lg opacity-80 mb-4 group-hover:opacity-100 transition-opacity">"{pr.content}"</p>
                                            <div className="flex items-center justify-between opacity-50 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">favorite</span>
                                                    <span className="font-bold uppercase tracking-widest">{(pr.interactions as any)?.length || 0} Intercesores</span>
                                                </div>
                                                <span className="material-symbols-outlined text-sm -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">arrow_forward</span>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="py-20 text-center opacity-40">
                                        <p>Sin peticiones públicas</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'devotionals' && (
                            <div className="flex flex-col gap-4 pb-20 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {userDevotionals.length > 0 ? (
                                    userDevotionals.map(dev => (
                                        <button
                                            key={dev.id}
                                            onClick={() => {
                                                onClose();
                                                navigate(`/devotionals?id=${dev.id}`);
                                            }}
                                            className="w-full text-left bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-brand-primary/30 transition-all group"
                                        >
                                            <h4 className="font-bold text-lg mb-1 group-hover:text-brand-primary transition-colors">{dev.title}</h4>
                                            {dev.bible_verse && <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-3 opacity-80 group-hover:opacity-100">{dev.bible_verse}</p>}
                                            <p className="text-sm opacity-70 line-clamp-3 mb-4">{dev.content}</p>
                                            <div className="flex items-center justify-between">
                                                {dev.audio_url ? (
                                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl">
                                                        <span className="material-symbols-outlined text-brand-primary">play_circle_filled</span>
                                                        <span className="text-[10px] font-mono opacity-50">AUDIO DISPONIBLE</span>
                                                    </div>
                                                ) : <div></div>}
                                                <span className="material-symbols-outlined text-sm -rotate-45 opacity-50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">arrow_forward</span>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="py-20 text-center opacity-40">
                                        <p>Sin devocionales</p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                        <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                        <p>Usuario no encontrado</p>
                    </div>
                )}

                {/* SINGLE POST OVERLAY */}
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
                                onLike={() => { }}
                                onComment={() => { }}
                                onSave={() => { }}
                                onUserClick={() => { }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
