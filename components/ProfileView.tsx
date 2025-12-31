import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './context/AuthContext';
import { EditProfileModal } from './profile/EditProfileModal';
import { ChangePasswordModal } from './profile/ChangePasswordModal';
import { SmartImage } from './ui/SmartImage';

// Hooks
import { usePosts } from '../src/hooks/usePosts';
import { useDevotionals } from '../src/hooks/useDevotionals';
import { usePrayerRequests } from '../src/hooks/usePrayerRequests';

interface Props {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const COVER_STYLES = [
  { id: 'sunset', name: 'Atardecer', classes: 'bg-gradient-to-r from-orange-400 to-rose-400' },
  { id: 'ocean', name: 'Océano', classes: 'bg-gradient-to-br from-cyan-400 to-blue-600' },
  { id: 'midnight', name: 'Medianoche', classes: 'bg-gradient-to-b from-slate-900 to-purple-900' },
  { id: 'royal', name: 'Realeza', classes: 'bg-gradient-to-tr from-amber-200 to-yellow-500' },
  { id: 'nature', name: 'Bosque', classes: 'bg-gradient-to-bl from-emerald-400 to-teal-600' },
  { id: 'berry', name: 'Frutos', classes: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { id: 'obsidian', name: 'Obsidiana', classes: 'bg-brand-obsidian' },
];

const ProfileView: React.FC<Props> = ({ theme, onToggleTheme }) => {
  const { userId } = useParams<{ userId: string }>();
  const { user: authUser, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Determine Target User
  // If NO userId param, we are viewing OWN profile.
  // If userId param matches authUser.id, we are viewing OWN profile.
  const isOwnProfile = !userId || (authUser && userId === authUser.id);
  const targetUserId = isOwnProfile ? authUser?.id : userId;

  // State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'devotionals' | 'prayers'>('posts');
  const [coverStyle, setCoverStyle] = useState(COVER_STYLES[1]);
  const [isChoosingCover, setIsChoosingCover] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- FETCH VISITOR PROFILE ---
  const { data: visitorProfile, isLoading: isLoadingVisitor } = useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isOwnProfile && !!targetUserId
  });

  // Construct Display User
  const displayUser = isOwnProfile ? authUser : visitorProfile;

  // Load Persisted Cover (Only for own profile)
  useEffect(() => {
    if (isOwnProfile && authUser?.id) {
      const saved = localStorage.getItem(`cover_${authUser.id}`);
      if (saved) {
        const found = COVER_STYLES.find(s => s.id === saved);
        if (found) setCoverStyle(found);
      }
    }
  }, [isOwnProfile, authUser]);

  const handleSetCover = (style: typeof COVER_STYLES[0]) => {
    setCoverStyle(style);
    if (authUser?.id) localStorage.setItem(`cover_${authUser.id}`, style.id);
    setIsChoosingCover(false);
  };

  // --- DATA FETCHING (CONTENT) ---
  // 1. Ministries (Target User)
  const { data: activeMinistries = [] } = useQuery({
    queryKey: ['my-ministries', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const { data } = await supabase
        .from('inscriptions')
        .select('*, ministry:ministries(name)')
        .eq('user_id', targetUserId)
        .eq('status', 'approved');

      if (!data) return [];
      return data.map((item: any) => item.ministry?.name || 'Ministerio');
    },
    enabled: !!targetUserId
  });

  // 2. Content (Filtered by targetUserId)
  // Note: Hooks fetch ALL. We filter client side. 
  // Optimization: Ideally hooks should accept userId to filter server side, but for now we follow existing pattern.
  const { data: allPosts } = usePosts(authUser?.id || ''); // Need auth ID for "liked by me" logic, but we want POSTS of targetUser.
  const { devotionals: allDevotionals } = useDevotionals('all');
  const { requests: allPrayers } = usePrayerRequests('all');

  const userPosts = useMemo(() => allPosts?.filter(p => p.user_id === targetUserId) || [], [allPosts, targetUserId]);
  const userDevotionals = useMemo(() => allDevotionals?.filter(d => d.user_id === targetUserId) || [], [allDevotionals, targetUserId]);
  const userPrayers = useMemo(() => allPrayers?.filter(p => p.user_id === targetUserId) || [], [allPrayers, targetUserId]);

  // 3. Stats Calculation
  const stats = useMemo(() => {
    if (!displayUser) return [];

    // Safe date parsing
    const joinedDate = displayUser.created_at || displayUser.joined_date || displayUser.joinedDate;
    const joined = joinedDate ? new Date(joinedDate) : new Date();

    const diffDays = Math.ceil(Math.abs(new Date().getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));

    // Impact Score (use DB field or calc)
    const impactScore = displayUser.impact_points
      ? displayUser.impact_points
      : (diffDays * 5) + (activeMinistries.length * 100);

    return [
      { label: 'Días de Fe', value: diffDays.toString(), icon: 'calendar_month', color: 'text-brand-primary' },
      { label: 'Ministerios', value: activeMinistries.length.toString(), icon: 'volunteer_activism', color: 'text-rose-500' },
      { label: 'Puntos', value: impactScore.toLocaleString(), icon: 'star', color: 'text-amber-500' },
    ];
  }, [displayUser, activeMinistries]);

  // --- RENDER ---
  if (!targetUserId) return null; // Should not happen
  if (!isOwnProfile && isLoadingVisitor) {
    return (
      <div className="min-h-screen bg-brand-silk dark:bg-brand-obsidian flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }
  if (!isOwnProfile && !displayUser) {
    return (
      <div className="min-h-screen bg-brand-silk dark:bg-brand-obsidian flex flex-col items-center justify-center text-center p-8">
        <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">person_off</span>
        <h2 className="text-xl font-bold dark:text-white">Usuario no encontrado</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-brand-primary font-bold">Volver</button>
      </div>
    );
  }

  // Display Vars
  const avatarUrl = displayUser?.avatar || displayUser?.avatar_url || 'https://via.placeholder.com/150';
  const displayName = displayUser?.name || 'Usuario';
  const displayBio = displayUser?.bio || (isOwnProfile ? "Sin presentación" : "Sin biografía");

  return (
    <div className="min-h-screen bg-brand-silk dark:bg-brand-obsidian pb-32 animate-reveal">

      {/* Modals (Only for Owner) */}
      {isOwnProfile && isEditingProfile && authUser && <EditProfileModal user={authUser} onClose={() => setIsEditingProfile(false)} />}
      {isOwnProfile && isChangingPassword && <ChangePasswordModal onClose={() => setIsChangingPassword(false)} />}

      {/* Hidden File Input */}
      {isOwnProfile && (
        <input type="file" ref={fileInputRef} onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => updateProfile({ avatar: reader.result as string });
            reader.readAsDataURL(file);
          }
        }} accept="image/*" className="hidden" />
      )}

      {/* HERO SECTION */}
      <section className={`relative h-[22rem] transition-all duration-700 ease-in-out ${isOwnProfile ? coverStyle.classes : 'bg-brand-obsidian'}`}>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-brand-silk dark:to-brand-obsidian"></div>

        {/* --- ACTIONS (Top Right) --- */}
        {isOwnProfile ? (
          <>
            <button
              onClick={() => setIsChoosingCover(!isChoosingCover)}
              className="absolute top-6 right-6 z-40 bg-black/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white hover:text-black transition-all"
            >
              <span className="material-symbols-outlined text-xl">palette</span>
            </button>
            {/* Cover Selector Drawer */}
            <div className={`absolute top-0 left-0 w-full bg-black/80 backdrop-blur-xl z-30 transition-all duration-300 overflow-hidden ${isChoosingCover ? 'h-32 opacity-100' : 'h-0 opacity-0'}`}>
              <div className="flex items-center gap-4 p-8 overflow-x-auto no-scrollbar">
                {COVER_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => handleSetCover(style)}
                    className={`w-12 h-12 shrink-0 rounded-full border-2 ${style.classes} ${coverStyle.id === style.id ? 'border-white scale-110' : 'border-transparent opacity-70'} transition-all`}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          targetUserId !== authUser?.id && (
            <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-40 bg-black/20 text-white p-2 rounded-full hover:bg-white hover:text-black transition-all">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )
        )}

        {/* Profile Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 text-center">
          <div className="relative group mb-4">
            <div className="w-28 h-28 rounded-full p-1 bg-white/20 backdrop-blur-sm">
              <SmartImage src={avatarUrl} className="w-full h-full rounded-full object-cover border-2 border-white shadow-xl" />
            </div>
            {/* Edit Button (Owner Only) */}
            {isOwnProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary text-brand-obsidian rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            )}
          </div>
          <h2 className="text-3xl font-bold text-white shadow-black/20 drop-shadow-lg">{displayName}</h2>
          <p className="text-white/80 text-sm font-medium mt-1 max-w-xs mx-auto italic">
            {displayBio}
          </p>
        </div>
      </section>

      {/* CONTENT CONTAINER */}
      <div className="relative px-4 pb-20 -mt-6 z-10 flex flex-col gap-6 max-w-2xl mx-auto">

        {/* STATS ROW */}
        <div className="flex justify-between bg-white dark:bg-brand-surface p-4 rounded-3xl shadow-lg border border-black/5 dark:border-white/5">
          {stats.map((stat, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 border-r last:border-0 border-gray-100 dark:border-white/5">
              <span className={`material-symbols-outlined ${stat.color} text-xl`}>{stat.icon}</span>
              <span className="font-bold text-lg text-brand-obsidian dark:text-white leading-none">{stat.value}</span>
              <span className="text-[9px] uppercase tracking-widest text-brand-obsidian/50 dark:text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* IDENTITY CARD (Owner Only - Privacy) */}
        {isOwnProfile && authUser && (
          <div className="w-full aspect-[2/1] bg-black rounded-3xl relative overflow-hidden shadow-2xl group">
            <div className={`absolute inset-0 opacity-40 ${coverStyle.classes}`}></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <img src="/pwa-icon.jpg" className="w-8 h-8 rounded-full border border-white/20" onError={(e) => e.currentTarget.style.display = 'none'} />
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.3em] opacity-70">Monte de Sion</p>
                    <p className="text-xs font-bold">MEMBERSHIP</p>
                  </div>
                </div>
                <div className="text-[10px] font-mono opacity-50">#{authUser.id.slice(0, 6).toUpperCase()}</div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xl font-serif italic">{authUser.name}</p>
                  <span className="px-2 py-0.5 bg-white/20 text-white text-[8px] font-bold uppercase rounded-md mt-2 inline-block">
                    {activeMinistries.length > 0 ? 'Líder Activo' : 'Miembro Fiel'}
                  </span>
                </div>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MDS-${authUser.id}`} className="w-12 h-12 mix-blend-screen opacity-80" alt="QR" />
              </div>
            </div>
          </div>
        )}

        {/* --- TABS --- */}
        <div className="border-b border-gray-200 dark:border-white/10 flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'posts' ? 'border-brand-obsidian dark:border-white text-brand-obsidian dark:text-white' : 'border-transparent text-gray-400'}`}
          >
            <span className="material-symbols-outlined text-lg">grid_on</span>
          </button>
          <button
            onClick={() => setActiveTab('devotionals')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'devotionals' ? 'border-brand-obsidian dark:border-white text-brand-obsidian dark:text-white' : 'border-transparent text-gray-400'}`}
          >
            <span className="material-symbols-outlined text-lg">book_2</span>
          </button>
          <button
            onClick={() => setActiveTab('prayers')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'prayers' ? 'border-brand-obsidian dark:border-white text-brand-obsidian dark:text-white' : 'border-transparent text-gray-400'}`}
          >
            <span className="material-symbols-outlined text-lg">volunteer_activism</span>
          </button>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="min-h-[200px]">
          {activeTab === 'posts' && (
            userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-0.5">
                {userPosts.map(post => (
                  <div key={post.id} className="relative aspect-square bg-gray-100 dark:bg-white/5 cursor-pointer hover:opacity-90 transition-opacity group">
                    {post.mediaUrl || (post.mediaUrls && post.mediaUrls.length > 0) ? (
                      <SmartImage
                        src={post.mediaUrl || post.mediaUrls![0]}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full p-2 flex items-center justify-center text-center bg-brand-primary/5">
                        <p className="text-[9px] text-brand-obsidian dark:text-white line-clamp-4 font-serif italic">
                          "{post.content}"
                        </p>
                      </div>
                    )}
                    {(post.mediaUrls && post.mediaUrls.length > 1) && (
                      <div className="absolute top-1 right-1 text-white drop-shadow-md">
                        <span className="material-symbols-outlined text-xs font-variation-fill">filter_none</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : <EmptyState icon="photo_camera" label="Sin publicaciones" />
          )}

          {activeTab === 'devotionals' && (
            userDevotionals.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {userDevotionals.map(dev => (
                  <div key={dev.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl flex items-center gap-3 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                      <span className="material-symbols-outlined">play_arrow</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-brand-obsidian dark:text-white text-sm truncate">{dev.title}</h4>
                      <p className="text-[10px] text-gray-500 truncate">{dev.bible_verse}</p>
                    </div>
                    {isOwnProfile && (
                      <span className="material-symbols-outlined text-gray-300">more_vert</span>
                    )}
                  </div>
                ))}
              </div>
            ) : <EmptyState icon="mic" label="Sin devocionales" />
          )}

          {activeTab === 'prayers' && (
            userPrayers.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {userPrayers.map(req => (
                  <div key={req.id} className="bg-white dark:bg-white/5 p-3 rounded-2xl border-l-4 border-brand-primary shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">{req.category}</span>
                      {req.is_private && <span className="material-symbols-outlined text-gray-400 text-xs">lock</span>}
                    </div>
                    <p className="text-[11px] text-brand-obsidian dark:text-white line-clamp-3 mb-2 flex-grow">{req.request}</p>
                    <div className="flex items-center gap-1 text-[9px] text-gray-400">
                      <span className="material-symbols-outlined text-xs">volunteer_activism</span>
                      <span>{req.amen_count || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState icon="volunteer_activism" label="Sin oraciones" />
          )}
        </div>

        {/* SETTINGS (Owner Only) */}
        {isOwnProfile && (
          <div className="space-y-2 mt-8 opacity-60 hover:opacity-100 transition-opacity">
            <button onClick={onToggleTheme} className="w-full flex justify-between items-center p-4 rounded-xl bg-gray-50 dark:bg-white/5">
              <span className="text-xs font-bold dark:text-white">Cambiar Tema</span>
              <span className="material-symbols-outlined text-sm dark:text-white">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
            </button>
            <button onClick={signOut} className="w-full flex justify-between items-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-rose-500">
              <span className="text-xs font-bold">Cerrar Sesión</span>
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

const EmptyState = ({ icon, label }: { icon: string, label: string }) => (
  <div className="py-12 flex flex-col items-center justify-center text-gray-300 dark:text-white/20">
    <span className="material-symbols-outlined text-4xl mb-2">{icon}</span>
    <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
  </div>
);

export default ProfileView;
