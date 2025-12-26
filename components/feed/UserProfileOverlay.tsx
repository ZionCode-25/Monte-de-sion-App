import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Post } from '../../types'; // Assuming User type matches Profile roughly
import { supabase } from '../../lib/supabase';
import { PostItem } from './PostItem';
import { usePosts } from '../../src/hooks/usePosts';
import { SmartImage } from '../ui/SmartImage';

interface Props {
    userId: string;
    currentUserId: string;
    onClose: () => void;
}

export const UserProfileOverlay: React.FC<Props> = ({ userId, currentUserId, onClose }) => {
    const [profile, setProfile] = useState<any>(null); // Use specific type if available
    const [loading, setLoading] = useState(true);

    // We reuse usePosts for now. Ideally we should have a specific query for user posts or filter server side.
    // For MVP/Current architecture, we filter the all-posts cache.
    const { data: allPosts = [] } = usePosts(currentUserId);
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

    if (!userId) return null;

    return createPortal(
        <div className="fixed inset-0 z-[5000] flex flex-col isolate font-sans text-brand-obsidian dark:text-white">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content - Full Screen on Mobile, Centered on Desktop */}
            <div className="relative w-full h-full md:max-w-md md:h-[90vh] md:mx-auto md:mt-auto md:rounded-t-[2.5rem] bg-brand-silk dark:bg-[#121212] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">

                {/* Header / Nav */}
                <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    {/* Share Profile logic could go here */}
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : profile ? (
                    <div className="flex-1 overflow-y-auto pb-safe">
                        {/* Profile Header */}
                        <div className="relative">
                            {/* Cover Image Simulation (Gradient or actual cover if exists) */}
                            <div className="h-40 bg-gradient-to-br from-brand-primary/40 to-purple-600/40 via-pink-500/20"></div>

                            <div className="px-6 -mt-16 relative z-10 flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="w-32 h-32 rounded-full p-1 bg-brand-silk dark:bg-[#121212]">
                                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-brand-obsidian/5 dark:border-white/10">
                                        <SmartImage src={profile.avatar_url} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold mt-3 mb-1">{profile.name}</h2>
                                {profile.role && (
                                    <span className="px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider mb-3">
                                        {profile.role}
                                    </span>
                                )}

                                {profile.bio && (
                                    <p className="text-sm opacity-80 max-w-xs">{profile.bio}</p>
                                )}

                                {/* Stats Row */}
                                <div className="flex items-center gap-8 mt-6 pb-6 border-b border-brand-obsidian/5 dark:border-white/5 w-full justify-center">
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-xl">{userPosts.length}</span>
                                        <span className="text-xs uppercase tracking-wider opacity-50">Posts</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-xl">{
                                            // Calculate total likes received? For now mock or sum from loaded posts
                                            userPosts.reduce((acc, p) => acc + p.likes, 0)
                                        }</span>
                                        <span className="text-xs uppercase tracking-wider opacity-50">Likes</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User's Posts Feed */}
                        <div className="p-4 space-y-4 bg-brand-silk dark:bg-[#121212] min-h-[300px]">
                            {userPosts.length > 0 ? (
                                userPosts.map(post => (
                                    <PostItem
                                        key={post.id}
                                        post={post}
                                        currentUserId={currentUserId}
                                        onLike={() => { }} // Pass readonly or handle interactively?
                                        onComment={() => { }}
                                        onSave={() => { }}
                                    // For overlay, maybe we want reduced functionality or full?
                                    // Let's pass dummies for now or proper handlers if passed from parent
                                    />
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-40">
                                    <p className="font-bold">Aún no hay publicaciones</p>
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
            </div>
        </div>,
        document.body
    );
};
