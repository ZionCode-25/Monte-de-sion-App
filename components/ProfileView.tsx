
import React, { useRef, useState, useEffect, useMemo } from 'react';
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
  const { user, signOut, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [coverStyle, setCoverStyle] = useState(COVER_STYLES[1]);
  const [isChoosingCover, setIsChoosingCover] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'devotionals' | 'prayers'>('posts');

  // Load Persisted Cover
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`cover_${user.id}`);
      if (saved) {
        const found = COVER_STYLES.find(s => s.id === saved);
        if (found) setCoverStyle(found);
      }
    }
  }, [user]);

  const handleSetCover = (style: typeof COVER_STYLES[0]) => {
    setCoverStyle(style);
    if (user?.id) localStorage.setItem(`cover_${user.id}`, style.id);
    setIsChoosingCover(false);
  };

  // --- DATA FETCHING ---
  // 1. Ministries
  const { data: activeMinistries = [] } = useQuery({
    queryKey: ['my-ministries', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('inscriptions')
        .select('*, ministry:ministries(name)')
        .eq('user_id', user.id)
        .eq('status', 'approved');
      if (!data) return [];
      return data.map((item: any) => item.ministry?.name || 'Ministerio');
    },
    enabled: !!user?.id
  });

  // 2. Content (Filtered Client Side for now)
  const { data: allPosts } = usePosts(user?.id || '');
  const { devotionals: allDevotionals } = useDevotionals('all');
  const { requests: allPrayers } = usePrayerRequests('all');

  const myPosts = useMemo(() => allPosts?.filter(p => p.user_id === user?.id) || [], [allPosts, user?.id]);
  const myDevotionals = useMemo(() => allDevotionals?.filter(d => d.user_id === user?.id) || [], [allDevotionals, user?.id]);
  const myPrayers = useMemo(() => allPrayers?.filter(p => p.user_id === user?.id) || [], [allPrayers, user?.id]);

  // 3. Stats
  const stats = useMemo(() => {
    if (!user) return [];
    const joined = user.joinedDate ? new Date(user.joinedDate) : new Date();
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));
    const impactScore = user.impact_points
      ? user.impact_points
      : (diffDays * 5) + (activeMinistries.length * 100);

    return [
      { label: 'Días de Fe', value: diffDays.toString(), icon: 'calendar_month', color: 'text-brand-primary' },
      { label: 'Ministerios', value: activeMinistries.length.toString(), icon: 'volunteer_activism', color: 'text-rose-500' },
      { label: 'Puntos de Impacto', value: impactScore.toLocaleString(), icon: 'star', color: 'text-amber-500' },
    ];
  }, [user, activeMinistries]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-silk dark:bg-brand-obsidian pb-32 animate-reveal">

      {/* Modals */}
      {isEditingProfile && <EditProfileModal user={user} onClose={() => setIsEditingProfile(false)} />}
      {isChangingPassword && <ChangePasswordModal onClose={() => setIsChangingPassword(false)} />}
      <input type="file" ref={fileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => updateProfile({ avatar: reader.result as string });
          reader.readAsDataURL(file);
        }
      }} accept="image/*" className="hidden" />

      {/* HERO SECTION */}
      <section className={`relative h-[22rem] transition-all duration-700 ease-in-out ${coverStyle.classes}`}>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-brand-silk dark:to-brand-obsidian"></div>

        {/* Cover Edit */}
        <button
          onClick={() => setIsChoosingCover(!isChoosingCover)}
          className="absolute top-6 right-6 z-40 bg-black/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white hover:text-black transition-all"
        >
          <span className="material-symbols-outlined text-xl">palette</span>
        </button>

        {/* Cover Selector Drawer */}
        <div className={`absolute top-0 left-0 w-full bg-black/80 backdrop-blur-xl z-30 transition-all duration-300 overflow-hidden ${isChoosingCover ? 'h-32 opacity-100' : 'h-0 opacity-0'}`}>
          <div className="flex items-center gap-4 p-8 overflow-x-auto no-scrollbar">
            <span className="text-white text-xs font-bold uppercase tracking-widest shrink-0 mr-4">Elige tu estilo:</span>
            {COVER_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => handleSetCover(style)}
                className={`w-12 h-12 shrink-0 rounded-full border-2 ${style.classes} ${coverStyle.id === style.id ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-110'} transition-all`}
                title={style.name}
              />
            ))}
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 text-center">
          {/* Avatar */}
          <div className="relative group mb-4">
            <div className="w-28 h-28 rounded-full p-1 bg-white/20 backdrop-blur-sm">
              <img src={user.avatar || 'https://via.placeholder.com/150'} className="w-full h-full rounded-full object-cover border-2 border-white shadow-xl" alt={user.name} />
            </div>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary text-brand-obsidian rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <h2 className="text-3xl font-bold text-white shadow-black/20 drop-shadow-lg">{user.name}</h2>
          <p className="text-white/80 text-sm font-medium mt-1 max-w-xs mx-auto italic">
            {user.bio || "Miembro de Monte de Sion"}
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

        {/* IDENTITY CARD - COLLAPSIBLE? Or keep as is. Keeping as is but compacted margin. */}
        <div className="w-full aspect-[2/1] bg-black rounded-3xl relative overflow-hidden shadow-2xl group">
          {/* Gradient & Pattern */}
          <div className={`absolute inset-0 opacity-40 ${coverStyle.classes}`}></div>
          <div className="absolute inset-0 p-6 flex flex-col justify-between text-white relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <img src="/pwa-icon.jpg" className="w-8 h-8 rounded-full border border-white/20" onError={(e) => e.currentTarget.style.display = 'none'} />
                <div>
                  <p className="text-[8px] uppercase tracking-[0.3em] opacity-70">Monte de Sion</p>
                  <p className="text-xs font-bold">MEMBERSHIP CARD</p>
                </div>
              </div>
              <div className="text-[10px] font-mono opacity-50">#{user.id.slice(0, 6).toUpperCase()}</div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xl font-serif italic">{user.name}</p>
                <p className="text-[9px] uppercase tracking-widest opacity-60 mt-1">
                  {activeMinistries.length > 0 ? 'Líder Activo' : 'Miembro Fiel'}
                </p>
              </div>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MDS-${user.id}`} className="w-12 h-12 mix-blend-screen opacity-80" />
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="border-b border-gray-200 dark:border-white/10 flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'posts' ? 'border-brand-obsidian dark:border-white text-brand-obsidian dark:text-white' : 'border-transparent text-gray-400'}`}
          >
            <span className="material-symbols-outlined text-lg">grid_on</span>
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('devotionals')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'devotionals' ? 'border-brand-obsidian dark:border-white text-brand-obsidian dark:text-white' : 'border-transparent text-gray-400'}`}
          >
            <span className="material-symbols-outlined text-lg">book_2</span>
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Devocionales</span>
          </button>
          <button
            onClick={() => setActiveTab('prayers')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'prayers' ? 'border-brand-obsidian dark:border-white text-brand-obsidian dark:text-white' : 'border-transparent text-gray-400'}`}
          >
            <span className="material-symbols-outlined text-lg">volunteer_activism</span>
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Oraciones</span>
          </button>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="min-h-[200px]">
          {activeTab === 'posts' && (
            myPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-0.5">
                {myPosts.map(post => (
                  <div key={post.id} className="relative aspect-square bg-gray-100 dark:bg-white/5 cursor-pointer hover:opacity-90 transition-opacity group">
                    {post.mediaUrl || (post.mediaUrls && post.mediaUrls.length > 0) ? (
                      <SmartImage
                        src={post.mediaUrl || post.mediaUrls![0]}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full p-4 flex items-center justify-center text-center">
                        <p className="text-[10px] text-brand-obsidian dark:text-white line-clamp-4 font-serif italic">
                          "{post.content}"
                        </p>
                      </div>
                    )}
                    {(post.mediaUrls && post.mediaUrls.length > 1) && (
                      <div className="absolute top-2 right-2 text-white drop-shadow-md">
                        <span className="material-symbols-outlined text-sm font-variation-fill">filter_none</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="photo_camera" label="Sin publicaciones aún" />
            )
          )}

          {activeTab === 'devotionals' && (
            myDevotionals.length > 0 ? (
              <div className="space-y-4">
                {myDevotionals.map(dev => (
                  <div key={dev.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                      <span className="material-symbols-outlined">play_arrow</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-brand-obsidian dark:text-white text-sm truncate">{dev.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{dev.bible_verse}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(dev.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="mic" label="Sin devocionales" />
            )
          )}

          {activeTab === 'prayers' && (
            myPrayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myPrayers.map(req => (
                  <div key={req.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl border-l-4 border-brand-primary shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">{req.category}</span>
                      {req.is_private && <span className="material-symbols-outlined text-gray-400 text-sm">lock</span>}
                    </div>
                    <p className="text-xs text-brand-obsidian dark:text-white line-clamp-3 mb-2">{req.request}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <span className="material-symbols-outlined text-sm">volunteer_activism</span>
                      <span>{req.amen_count || 0} oraciones</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState icon="volunteer_activism" label="Sin pedidos de oración" />
          )}
        </div>

        {/* SETTINGS TOGGLE (Collapsible at bottom) */}
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

      </div>
    </div>
  );
};

const EmptyState = ({ icon, label }: { icon: string, label: string }) => (
  <div className="py-12 flex flex-col items-center justify-center text-gray-300 dark:text-white/20">
    <span className="material-symbols-outlined text-5xl mb-2">{icon}</span>
    <p className="text-xs font-bold uppercase tracking-widest">{label}</p>
  </div>
);

export default ProfileView;
