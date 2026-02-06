import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../components/context/AuthContext';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';
import { SmartImage } from '../components/ui/SmartImage';

// Components
import { PostItem } from '../components/feed/PostItem';
import { UserProfileOverlay } from '../components/feed/UserProfileOverlay';
import { CommentsModal } from '../components/feed/CommentsModal';
import InteractionListModal from '../components/ui/InteractionListModal';

// Hooks
import { usePosts, useToggleLike, useToggleSave, useDeletePost } from '../hooks/usePosts';
import { useDevotionals } from '../hooks/useDevotionals';
import { usePrayerRequests } from '../hooks/usePrayerRequests';
import { useAddComment, useRealtimeComments } from '../hooks/useComments';

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
  const isOwnProfile = !userId || (authUser && userId === authUser.id);
  const targetUserId = isOwnProfile ? authUser?.id : userId;

  // --- STATE ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'devotionals' | 'prayers'>('posts');

  // Customization & Modals state
  const [coverStyle, setCoverStyle] = useState(COVER_STYLES[1]);
  const [isChoosingCover, setIsChoosingCover] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Interaction State
  const [viewingCommentsFor, setViewingCommentsFor] = useState<string | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [interactionsModalRequest, setInteractionsModalRequest] = useState<any | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Audio Player State (Devotionals & Prayers)
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // --- MUTATIONS & HOOKS ---
  const toggleLike = useToggleLike(authUser?.id || '');
  const toggleSave = useToggleSave(authUser?.id || '');
  const deletePost = useDeletePost();
  const addComment = useAddComment(authUser?.id || '', authUser?.name || 'Usuario', authUser?.avatar_url || '');
  const { deleteDevotional, editDevotional, awardListenPoints, devotionals: allDevotionals } = useDevotionals('all');
  const { deleteRequest, toggleInteraction, requests: allPrayers } = usePrayerRequests('all');

  // Realtime comments for modal
  useRealtimeComments(viewingCommentsFor);

  // --- FETCH USER PROFILE ---
  const { data: visitorProfile, isLoading: isLoadingVisitor } = useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
      if (error) throw error;
      return data;
    },
    enabled: !isOwnProfile && !!targetUserId
  });

  const displayUser = isOwnProfile ? authUser : visitorProfile;

  // Load Persisted Cover
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
  const { data: activeMinistries = [] } = useQuery({
    queryKey: ['my-ministries', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const { data } = await supabase
        .from('inscriptions')
        .select('*, ministry:ministries(name)')
        .eq('user_id', targetUserId)
        .eq('status', 'approved');
      return data ? data.map((item: any) => item.ministry?.name || 'Ministerio') : [];
    },
    enabled: !!targetUserId
  });

  // Fetch CONTENT using existing hooks (optimized filters)
  const { data: allPosts } = usePosts(authUser?.id || '');

  const userPosts = useMemo(() => allPosts?.filter(p => p.user_id === targetUserId) || [], [allPosts, targetUserId]);
  const userDevotionals = useMemo(() => allDevotionals?.filter((d: any) => d.user_id === targetUserId) || [], [allDevotionals, targetUserId]);
  const userPrayers = useMemo(() => allPrayers?.filter((p: any) => p.user_id === targetUserId) || [], [allPrayers, targetUserId]);

  const stats = useMemo(() => {
    if (!displayUser) return [];
    const joinedDate = displayUser.created_at || displayUser.joined_date || (displayUser as any).joinedDate;
    const joined = joinedDate ? new Date(joinedDate) : new Date();
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));
    const impactScore = (displayUser as any).impact_points || (diffDays * 5) + (activeMinistries.length * 100);

    return [
      { label: 'Días de Fe', value: diffDays.toString(), icon: 'calendar_month', color: 'text-brand-primary' },
      { label: 'Ministerios', value: activeMinistries.length.toString(), icon: 'volunteer_activism', color: 'text-rose-500' },
      { label: 'Puntos', value: impactScore.toLocaleString(), icon: 'star', color: 'text-amber-500' },
    ];
  }, [displayUser, activeMinistries]);

  // --- CLICK OUTSIDE MENU ---
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // --- AUDIO LOGIC ---
  const togglePlay = (id: string, url: string) => {
    if (playingId === id) {
      if (audioRef.current?.paused) audioRef.current.play();
      else audioRef.current?.pause();
    } else {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
      audioRef.current = new Audio(url);
      setPlayingId(id); setProgress(0);
      audioRef.current.addEventListener('timeupdate', () => { if (audioRef.current) setProgress(audioRef.current.currentTime); });
      audioRef.current.addEventListener('loadedmetadata', () => { if (audioRef.current) setDuration(audioRef.current.duration); });
      audioRef.current.addEventListener('ended', () => { setPlayingId(null); setProgress(0); awardListenPoints(); });
      audioRef.current.play();
    }
  };
  const formatTime = (s: number) => {
    if (!s) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // --- HANDLERS ---
  const handleLike = (postId: string) => {
    const post = userPosts.find(p => p.id === postId);
    if (post) toggleLike.mutate({ postId, isLiked: post.isLiked });
  };
  const handleSave = (postId: string) => {
    const post = userPosts.find(p => p.id === postId);
    if (post) {
      toggleSave.mutate({ postId, isSaved: !!post.isSaved });
      if (!post.isSaved) { setShowToast('Guardado'); setTimeout(() => setShowToast(null), 2000); }
    }
  };
  const handleDeletePost = (postId: string) => {
    if (window.confirm('¿Eliminar publicación?')) deletePost.mutate({ postId, userId: authUser?.id || '' });
  };
  const handleAddComment = (postId: string, content: string, parentId?: string) => {
    if (authUser) addComment.mutate({ postId, content, parentId, userId: authUser.id });
  };

  const handleDeleteDevotional = (id: string) => {
    if (confirm("¿Eliminar reflexión?")) deleteDevotional.mutate(id);
  };
  const handleDeleteRequest = (id: string) => {
    if (confirm("¿Eliminar petición?")) deleteRequest.mutate(id);
  };

  // --- RENDER ---
  if (!targetUserId) return null;
  if (!isOwnProfile && isLoadingVisitor) return <div className="min-h-screen grid place-items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div></div>;
  if (!isOwnProfile && !displayUser) return <div className="min-h-screen grid place-items-center text-center"><span className="material-symbols-outlined text-6xl text-gray-400">person_off</span><p className="font-bold mt-4 dark:text-white">Usuario no encontrado</p><button onClick={() => navigate(-1)} className="text-brand-primary font-bold mt-2">Volver</button></div>;

  const avatarUrl = displayUser?.avatar || displayUser?.avatar_url || 'https://via.placeholder.com/150';
  const displayName = isOwnProfile ? authUser?.name : displayUser?.name || 'Usuario';
  const displayBio = displayUser?.bio || "Bendecido para bendecir.";

  return (
    <div className="min-h-screen bg-brand-silk dark:bg-brand-obsidian pb-32 animate-reveal">

      {/* Modals */}
      {showToast && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[6000] bg-brand-obsidian text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl animate-in fade-in slide-in-from-top-4">{showToast}</div>}
      {isOwnProfile && isEditingProfile && authUser && <EditProfileModal user={authUser} onClose={() => setIsEditingProfile(false)} />}
      {isOwnProfile && isChangingPassword && <ChangePasswordModal onClose={() => setIsChangingPassword(false)} />}

      {viewingCommentsFor && (
        <CommentsModal
          post={allPosts?.find(p => p.id === viewingCommentsFor) || null}
          user={authUser!}
          onClose={() => setViewingCommentsFor(null)}
          onAddComment={handleAddComment}
        />
      )}

      {viewingProfileId && (
        <UserProfileOverlay userId={viewingProfileId} currentUserId={authUser?.id || ''} onClose={() => setViewingProfileId(null)} />
      )}

      {interactionsModalRequest && (
        <InteractionListModal
          interactions={interactionsModalRequest.interactions || []}
          onClose={() => setInteractionsModalRequest(null)}
          title="Orando por ti"
          onUserClick={(uid) => { setInteractionsModalRequest(null); navigate(`/profile/${uid}`); }}
        />
      )}

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

        {isOwnProfile ? (
          <>
            <button
              onClick={() => setIsChoosingCover(!isChoosingCover)}
              className="absolute top-6 right-6 z-40 bg-black/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white hover:text-black transition-all"
            >
              <span className="material-symbols-outlined text-xl">palette</span>
            </button>
            <div className={`absolute top-0 left-0 w-full bg-black/80 backdrop-blur-xl z-30 transition-all duration-300 overflow-hidden ${isChoosingCover ? 'h-32 opacity-100' : 'h-0 opacity-0'}`}>
              <div className="flex items-center gap-4 p-8 overflow-x-auto no-scrollbar">
                {COVER_STYLES.map(style => (
                  <button key={style.id} onClick={() => handleSetCover(style)} className={`w-12 h-12 shrink-0 rounded-full border-2 ${style.classes} ${coverStyle.id === style.id ? 'border-white scale-110' : 'border-transparent opacity-70'} transition-all`} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-40 bg-black/20 text-white p-2 rounded-full hover:bg-white hover:text-black transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 text-center">
          <div className="relative group mb-4">
            <div className="w-28 h-28 rounded-full p-1 bg-white/20 backdrop-blur-sm">
              <SmartImage src={avatarUrl} className="w-full h-full rounded-full object-cover border-2 border-white shadow-xl" />
            </div>
            {isOwnProfile && (
              <button onClick={() => setIsEditingProfile(true)} className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary text-brand-obsidian rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            )}
          </div>
          <h2 className="text-3xl font-bold text-white shadow-black/20 drop-shadow-lg">{displayName}</h2>
          <p className="text-white/80 text-sm font-medium mt-1 max-w-xs mx-auto italic">{displayBio}</p>
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



        {/* TABS */}
        <div className="border-b border-gray-200 dark:border-white/10 flex sticky top-0 bg-brand-silk dark:bg-brand-obsidian z-20 pt-4">
          {[
            { id: 'posts', icon: 'grid_on', label: 'Feed' },
            { id: 'devotionals', icon: 'book_2', label: 'Diarios' },
            { id: 'prayers', icon: 'volunteer_activism', label: 'Peticiones' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === tab.id ? 'border-brand-obsidian dark:border-white text-brand-obsidian dark:text-white' : 'border-transparent text-gray-400'}`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENT GRID */}
        <div className="min-h-[200px] space-y-4">

          {/* POSTS TAB */}
          {activeTab === 'posts' && (
            userPosts.length > 0 ? (
              <div className="flex flex-col gap-6">
                {userPosts.map(post => (
                  <PostItem
                    key={post.id}
                    post={post}
                    currentUserId={authUser?.id || ''}
                    onLike={handleLike}
                    onSave={handleSave}
                    onComment={(p) => setViewingCommentsFor(p.id)}
                    onDelete={handleDeletePost}
                    onUserClick={(uid) => { if (uid !== targetUserId) navigate(`/profile/${uid}`); }}
                  />
                ))}
              </div>
            ) : <EmptyState icon="photo_camera" label="Sin publicaciones" />
          )}

          {/* DEVOTIONALS TAB */}
          {activeTab === 'devotionals' && (
            userDevotionals.length > 0 ? (
              <div className="flex flex-col gap-4">
                {userDevotionals.map((devo: any) => {
                  const isPlaying = playingId === devo.id;
                  return (
                    <div key={devo.id} className="bg-white dark:bg-brand-surface p-6 rounded-3xl shadow-sm border border-brand-obsidian/5 dark:border-white/5 relative">
                      {/* Menu (Only Owner) */}
                      {isOwnProfile && (
                        <div className="absolute top-4 right-4 z-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === devo.id ? null : devo.id); }}
                            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-400"
                          >
                            <span className="material-symbols-outlined">more_horiz</span>
                          </button>
                          {openMenuId === devo.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-20">
                              <button onClick={() => handleDeleteDevotional(devo.id)} className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                          <span className="material-symbols-outlined text-sm">menu_book</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(devo.created_at).toLocaleDateString()}</span>
                      </div>

                      <h3 className="font-serif font-bold text-xl text-brand-obsidian dark:text-white mb-2">{devo.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 mb-4">{devo.content}</p>

                      {devo.audioUrl && (
                        <div className={`rounded-xl p-2 flex items-center gap-3 ${isPlaying ? 'bg-brand-obsidian dark:bg-white text-white dark:text-black' : 'bg-gray-50 dark:bg-white/5'}`}>
                          <button onClick={() => togglePlay(devo.id, devo.audioUrl)} className={`w-8 h-8 rounded-full flex items-center justify-center ${isPlaying ? 'bg-white dark:bg-black text-black dark:text-white' : 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm'}`}>
                            <span className="material-symbols-outlined text-sm">{isPlaying ? 'pause' : 'play_arrow'}</span>
                          </button>
                          <div className="flex-1 h-1 bg-current/10 rounded-full overflow-hidden">
                            <div className="h-full bg-current transition-all duration-100 rounded-full" style={{ width: isPlaying ? `${(progress / duration) * 100}%` : '0%' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : <EmptyState icon="mic" label="Sin devocionales" />
          )}

          {/* PRAYERS TAB */}
          {activeTab === 'prayers' && (
            userPrayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userPrayers.map((req: any) => (
                  <div key={req.id} className="bg-white dark:bg-brand-surface p-5 rounded-3xl shadow-sm border border-brand-obsidian/5 dark:border-white/5 flex flex-col relative h-full">
                    {/* Delete (Owner) */}
                    {isOwnProfile && (
                      <button onClick={() => handleDeleteRequest(req.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">{req.category}</span>
                      {req.is_private && <span className="text-[10px] material-symbols-outlined text-gray-400">lock</span>}
                    </div>

                    <p className="text-base font-serif font-medium text-brand-obsidian dark:text-white mb-4 flex-grow">"{req.request || req.content}"</p>

                    {req.audioUrl && (
                      <div className="mb-4 flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wider bg-gray-50 dark:bg-white/5 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-sm">mic</span>
                        Nota de voz
                        <button onClick={() => togglePlay(req.id, req.audioUrl)} className="ml-auto material-symbols-outlined text-brand-primary">play_circle</button>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-white/5">
                      <button
                        onClick={() => toggleInteraction.mutate({ requestId: req.id, type: 'amen' })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${req.user_has_interacted ? 'bg-brand-obsidian dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      >
                        <span className={`material-symbols-outlined text-base ${req.user_has_interacted ? 'fill-1' : ''}`}>bg_connect</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">Amén</span>
                      </button>

                      {req.interaction_count > 0 && (
                        <button onClick={() => setInteractionsModalRequest(req)} className="flex items-center gap-1">
                          <span className="text-xs font-bold text-brand-dirty-white dark:text-gray-400">+{req.interaction_count}</span>
                        </button>
                      )}
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
