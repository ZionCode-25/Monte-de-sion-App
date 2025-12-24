
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { User, Post, Story, Comment } from '../types';

interface Props {
  user: User;
  theme: 'light' | 'dark';
}

const FONTS = [
  { name: 'Modern', class: 'font-outfit uppercase tracking-[0.2em]' },
  { name: 'Classic', class: 'font-serif italic' },
  { name: 'Neon', class: 'font-mono font-bold tracking-tighter' },
  { name: 'Strong', class: 'font-black uppercase tracking-tighter' }
];

const FILTERS = [
  { name: 'Normal', filter: 'none' },
  { name: 'Sepia', filter: 'sepia(0.6)' },
  { name: 'B&N', filter: 'grayscale(1)' },
  { name: 'Cálido', filter: 'saturate(1.4) contrast(1.1)' },
  { name: 'Frío', filter: 'brightness(1.1) hue-rotate(180deg)' }
];

const STORY_BGS = [
  'linear-gradient(135deg, #0f0d08 0%, #1c180f 100%)',
  'linear-gradient(135deg, #ffb700 0%, #ff8f00 100%)',
  'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
  'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  '#0f0d08'
];

const MOCK_LOCATIONS = ['Santuario Principal Sión', 'Monte de Oración', 'Auditorio Central', 'Célula Norte'];
const MOCK_USERS = ['María Rodríguez', 'Pr. Juan Montecinos', 'Carlos Ruiz', 'Sara Evans', 'Ruth Mendoza'];

const CommunityFeed: React.FC<Props> = ({ user, theme }) => {
  const queryClient = useQueryClient();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [viewOnlyMine, setViewOnlyMine] = useState(false);

  // Modals
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [viewingCommentsFor, setViewingCommentsFor] = useState<Post | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Post Creator State
  const [postText, setPostText] = useState('');
  const [postMedia, setPostMedia] = useState<string | null>(null);
  const [postLocation, setPostLocation] = useState('');
  const [postMentions, setPostMentions] = useState<string[]>([]);
  const [showLocationList, setShowLocationList] = useState(false);
  const [showMentionList, setShowMentionList] = useState(false);

  // Story Creator State
  const [storyMedia, setStoryMedia] = useState<string | null>(null);
  const [storyText, setStoryText] = useState('');
  const [storyBg, setStoryBg] = useState(STORY_BGS[0]);
  const [storyFont, setStoryFont] = useState(FONTS[0]);
  const [storyFilter, setStoryFilter] = useState(FILTERS[0]);
  const [commentText, setCommentText] = useState('');

  // --- QUERIES ---

  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, user:profiles(name, avatar_url), comments(*, user:profiles(name)), likes(user_id)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        userName: p.user?.name || 'Usuario',
        userAvatar: p.user?.avatar_url || '',
        content: p.content,
        mediaUrl: p.media_url,
        mediaType: (p.media_type as 'image' | 'video') || undefined,
        likes: p.likes ? p.likes.length : 0,
        shares: 0,
        comments: p.comments.map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          userName: c.user?.name || 'Usuario',
          content: c.content,
          createdAt: c.created_at
        })),
        createdAt: p.created_at,
        isLiked: p.likes?.some((l: any) => l.user_id === user.id)
      })) as (Post & { isLiked: boolean })[];
    }
  });

  const { data: localStories = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*, user:profiles(name, avatar_url)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        userName: s.user?.name || 'Usuario',
        userAvatar: s.user?.avatar_url || '',
        mediaUrl: s.media_url,
        type: (s.type as 'image' | 'video') || 'image',
        timestamp: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })) as Story[];
    }
  });

  // --- MUTATIONS ---

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const fullContent = `${postText}${postLocation ? ` — en ${postLocation}` : ''}${postMentions.length > 0 ? ` con @${postMentions.join(', @')}` : ''}`;
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: fullContent,
        media_url: postMedia,
        media_type: postMedia ? 'image' : null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setIsCreatingPost(false);
      resetPostState();
      triggerToast("Testimonio compartido");
    },
    onError: () => triggerToast("Error al publicar")
  });

  const createStoryMutation = useMutation({
    mutationFn: async () => {
      const mediaToUpload = storyMedia || 'https://images.unsplash.com/photo-1548120231-1d6f891ad49a?q=80&w=1200';
      const { error } = await supabase.from('stories').insert({
        user_id: user.id,
        media_url: mediaToUpload,
        type: 'image',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      setIsCreatingStory(false);
      resetStoryState();
      triggerToast("Historia publicada");
    },
    onError: () => triggerToast("Error al publicar historia")
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string, isLiked: boolean }) => {
      if (isLiked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
      }
    },
    onMutate: async ({ postId, isLiked }) => {
      // Cancel outstanding refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      const previousPosts = queryClient.getQueryData(['posts']);

      queryClient.setQueryData(['posts'], (old: any[]) => {
        return old.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              likes: isLiked ? p.likes - 1 : p.likes + 1,
              isLiked: !isLiked
            };
          }
          return p;
        });
      });

      return { previousPosts };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['posts'], context?.previousPosts);
      triggerToast("Error de conexión");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!viewingCommentsFor) return;
      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        post_id: viewingCommentsFor.id,
        content: commentText
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setCommentText('');
      // Note: we might want to keep the modal open and refresh comments. 
      // Simplified: we rely on invalidation. For better UX in modal we might need to query comments separately or use optimistic update.
      triggerToast("Comentario agregado");
    },
    onError: () => triggerToast("Error al comentar")
  });

  // --- HANDLERS ---

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleCreatePost = () => {
    if (!postText.trim() && !postMedia) return;
    triggerToast("Publicando...");
    createPostMutation.mutate();
  };

  const resetPostState = () => {
    setPostText('');
    setPostMedia(null);
    setPostLocation('');
    setPostMentions([]);
  };

  const handleCreateStory = () => {
    createStoryMutation.mutate();
  };

  const resetStoryState = () => {
    setStoryMedia(null);
    setStoryText('');
    setStoryBg(STORY_BGS[0]);
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !viewingCommentsFor) return;
    addCommentMutation.mutate();
  };

  const toggleLike = (postId: string) => {
    const post = posts.find((p: any) => p.id === postId);
    if (post) {
      toggleLikeMutation.mutate({ postId, isLiked: post.isLiked });
    }
  };

  useEffect(() => {
    let timer: number;
    if (activeStoryIndex !== null) {
      setStoryProgress(0);
      timer = window.setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            handleNextStory();
            return 0;
          }
          return prev + 1.2;
        });
      }, 40);
    }
    return () => clearInterval(timer);
  }, [activeStoryIndex]);

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < localStories.length - 1) setActiveStoryIndex(activeStoryIndex + 1);
    else setActiveStoryIndex(null);
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) setActiveStoryIndex(activeStoryIndex - 1);
    else setActiveStoryIndex(null);
  };

  const filteredPosts = viewOnlyMine ? posts.filter(p => p.userId === user.id) : posts;

  return (
    <div className="relative min-h-screen bg-brand-silk dark:bg-brand-obsidian transition-colors overflow-x-hidden">

      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1100] bg-brand-obsidian text-brand-primary px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-3xl animate-in fade-in slide-in-from-top-4">
          {showToast}
        </div>
      )}

      {/* --- STORIES RAIL (Centrado y sin scroll) --- */}
      {!viewOnlyMine && (
        <section className="w-full pt-8 pb-8 flex justify-center flex-wrap gap-6 px-6 bg-brand-silk dark:bg-brand-obsidian border-b border-brand-obsidian/5 dark:border-white/5 relative z-10">
          <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setIsCreatingStory(true)}>
            <div className="relative p-[3px] rounded-full border-2 border-dashed border-brand-primary/40 group-hover:border-brand-primary transition-colors active:scale-95 duration-300">
              <div className="w-[70px] h-[70px] rounded-full overflow-hidden p-[3px] bg-brand-silk dark:bg-brand-obsidian">
                <img src={user.avatar} className="w-full h-full rounded-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all" alt="" />
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-brand-primary rounded-full border-4 border-brand-silk dark:border-brand-obsidian flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-brand-obsidian text-sm font-black">add</span>
              </div>
            </div>
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest group-hover:text-brand-primary/80 transition-colors">Tu Historia</span>
          </div>

          {localStories.map((story, idx) => (
            <div key={story.id} onClick={() => setActiveStoryIndex(idx)} className="flex flex-col items-center gap-3 cursor-pointer group active:scale-95 transition-transform duration-300">
              <div className="p-[3px] rounded-full bg-gradient-to-tr from-brand-primary via-orange-500 to-rose-500 shadow-md group-hover:shadow-lg group-hover:shadow-brand-primary/20 transition-all">
                <div className="w-[70px] h-[70px] rounded-full overflow-hidden p-[3px] bg-brand-silk dark:bg-brand-obsidian">
                  <img src={story.userAvatar} className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-brand-obsidian/60 dark:text-white/40 uppercase tracking-widest truncate w-20 text-center group-hover:text-brand-obsidian dark:group-hover:text-white transition-colors">{story.userName.split(' ')[0]}</span>
            </div>
          ))}
        </section>
      )}

      {/* --- FILTER BAR (Sticky debajo del Header Principal) --- */}
      <nav className="sticky top-20 z-40 bg-brand-silk/90 dark:bg-brand-obsidian/90 backdrop-blur-3xl border-b border-brand-obsidian/5 dark:border-white/5 px-6 h-16 flex items-center justify-between">
        <div className="flex bg-brand-obsidian/5 dark:bg-white/5 p-1 rounded-2xl">
          <button
            onClick={() => setViewOnlyMine(false)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!viewOnlyMine ? 'bg-white dark:bg-brand-surface text-brand-primary shadow-sm' : 'text-brand-obsidian/40 dark:text-white/30'}`}
          >
            Explorar
          </button>
          <button
            onClick={() => setViewOnlyMine(true)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewOnlyMine ? 'bg-white dark:bg-brand-surface text-brand-primary shadow-sm' : 'text-brand-obsidian/40 dark:text-white/30'}`}
          >
            Mis Posts
          </button>
        </div>

        <button
          onClick={() => setIsCreatingPost(true)}
          className="w-11 h-11 rounded-2xl bg-brand-primary text-brand-obsidian flex items-center justify-center shadow-lg active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined font-black text-2xl">add</span>
        </button>
      </nav>

      {/* --- COMMUNITY FEED (Instagram Style Full-Width) --- */}
      <main className="flex flex-col w-full max-w-lg mx-auto md:py-8">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <article key={post.id} className="w-full bg-white dark:bg-brand-surface mb-6 md:mb-12 border-b md:border md:rounded-[2.5rem] overflow-hidden shadow-sm border-brand-obsidian/5 dark:border-white/5 animate-reveal">
              {/* Post Header */}
              <div className="flex items-center justify-between p-4 px-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden border border-brand-primary/20">
                    <img src={post.userAvatar} className="w-full h-full object-cover" alt="" />
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
                <div className="w-full aspect-square bg-brand-silk dark:bg-brand-obsidian relative overflow-hidden group cursor-pointer" onDoubleClick={() => toggleLike(post.id)}>
                  <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-9xl fill-1 drop-shadow-2xl scale-125 transition-transform">favorite</span>
                  </div>
                </div>
              )}

              {/* Post Content & Actions */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-7">
                    <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-2 group transition-all active:scale-125 ${post.isLiked ? 'text-rose-500' : 'text-brand-obsidian dark:text-white/70'}`}>
                      <span className={`material-symbols-outlined text-3xl ${post.isLiked ? 'fill-1' : ''}`}>favorite</span>
                      <span className="text-xs font-black">{post.likes}</span>
                    </button>
                    <button onClick={() => setViewingCommentsFor(post)} className="flex items-center gap-2 text-brand-obsidian dark:text-white/70 active:scale-110 transition-transform">
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
          ))
        ) : (
          <div className="py-40 text-center opacity-20"><span className="material-symbols-outlined text-6xl">photo_library</span></div>
        )}
      </main>

      {/* --- CREATIVE STORY STUDIO MODAL --- */}
      {isCreatingStory && (
        <div className="fixed inset-0 z-[1200] flex flex-col bg-brand-obsidian animate-in slide-in-from-bottom duration-500">
          <div
            className="flex-1 relative flex items-center justify-center overflow-hidden transition-all duration-700"
            style={{ background: storyBg, filter: storyFilter.filter }}
          >
            {storyMedia && <img src={storyMedia} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="" />}

            <div className="relative z-10 w-full px-12 text-center pointer-events-none">
              <input
                autoFocus
                type="text"
                placeholder="Escribe tu mensaje..."
                className={`w-full bg-transparent border-none focus:ring-0 text-white text-center text-4xl drop-shadow-[0_2px_15px_rgba(0,0,0,0.6)] placeholder:text-white/20 pointer-events-auto ${storyFont.class}`}
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
              />
            </div>

            {/* Ajuste de controles (Más bajos para safe-area) */}
            <div className="absolute top-16 left-6 right-6 flex items-center justify-between z-20">
              <button onClick={() => setIsCreatingStory(false)} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"><span className="material-symbols-outlined">close</span></button>
              <div className="flex gap-4">
                <button onClick={() => setStoryBg(STORY_BGS[(STORY_BGS.indexOf(storyBg) + 1) % STORY_BGS.length])} className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border-2 border-white flex items-center justify-center text-white"><span className="material-symbols-outlined text-sm">palette</span></button>
                <button onClick={() => setStoryFont(FONTS[(FONTS.indexOf(storyFont) + 1) % FONTS.length])} className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border-2 border-white flex items-center justify-center text-white text-[9px] font-black uppercase tracking-tight">{storyFont.name}</button>
              </div>
            </div>
          </div>

          <div className="bg-brand-surface p-8 pb-14 flex flex-col gap-6">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
              <button onClick={() => setStoryMedia('https://images.unsplash.com/photo-1548120231-1d6f891ad49a?q=80&w=1200')} className="flex flex-col items-center gap-2 min-w-[75px] active:scale-95 transition-transform">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary"><span className="material-symbols-outlined text-3xl">add_a_photo</span></div>
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Cámara</span>
              </button>

              <div className="flex-1 flex gap-3 overflow-x-auto no-scrollbar">
                {FILTERS.map(f => (
                  <button key={f.name} onClick={() => setStoryFilter(f)} className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all ${storyFilter.name === f.name ? 'bg-brand-primary text-brand-obsidian shadow-lg' : 'bg-white/5 text-white/40 border border-white/5'}`}>{f.name}</button>
                ))}
              </div>
            </div>
            <button onClick={handleCreateStory} className="w-full py-6 bg-brand-primary text-brand-obsidian rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all">Compartir en Sión</button>
          </div>
        </div>
      )}

      {/* --- MASTER POST EDITOR MODAL (Funcional y Pro) --- */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 md:p-6 bg-brand-obsidian/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="relative w-full h-full md:h-auto md:max-w-xl bg-brand-silk dark:bg-brand-surface md:rounded-[3.5rem] shadow-3xl flex flex-col overflow-hidden">

            <header className="px-8 py-6 flex items-center justify-between border-b border-brand-obsidian/5 dark:border-white/5 bg-white/30 dark:bg-brand-obsidian/20 backdrop-blur-xl">
              <button onClick={() => setIsCreatingPost(false)} className="text-[10px] font-black uppercase text-brand-obsidian/40 dark:text-white/40 tracking-[0.3em] hover:text-brand-primary transition-colors">Cancelar</button>
              <h3 className="text-sm font-bold text-brand-obsidian dark:text-white">Nuevo Posteo</h3>
              <button onClick={handleCreatePost} disabled={!postText.trim() && !postMedia} className="bg-brand-primary text-brand-obsidian px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-10 active:scale-95 transition-all">Publicar</button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-brand-primary/20">
                  <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <p className="font-bold text-brand-obsidian dark:text-brand-silk leading-none">{user.name}</p>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {postLocation && <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-lg text-[8px] font-black uppercase">📍 {postLocation}</span>}
                    {postMentions.map(u => <span key={u} className="bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-lg text-[8px] font-black uppercase">@ {u}</span>)}
                  </div>
                </div>
              </div>

              <textarea
                autoFocus
                placeholder="¿Qué ha hecho Dios por ti hoy?"
                className="w-full min-h-[160px] bg-transparent border-none focus:ring-0 text-3xl font-serif text-brand-obsidian dark:text-brand-cream placeholder:text-brand-obsidian/10 dark:placeholder:text-white/10 italic resize-none leading-snug"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />

              {postMedia && (
                <div className="relative rounded-[2.5rem] overflow-hidden aspect-video shadow-2xl group border border-brand-obsidian/5 dark:border-white/5">
                  <img src={postMedia} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => setPostMedia(null)} className="absolute top-4 right-4 w-10 h-10 bg-brand-obsidian/80 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-90 transition-all"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-brand-obsidian/5 dark:border-white/5 bg-white/40 dark:bg-brand-obsidian/10 relative">
              {/* Overlays funcionales */}
              {showLocationList && (
                <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-brand-surface p-6 border-t border-brand-obsidian/5 animate-in slide-in-from-bottom shadow-3xl z-50">
                  <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4">Sugerencias Cercanas</p>
                  <div className="flex flex-col gap-1">
                    {MOCK_LOCATIONS.map(loc => (
                      <button key={loc} onClick={() => { setPostLocation(loc); setShowLocationList(false); }} className="w-full text-left p-4 hover:bg-brand-silk dark:hover:bg-white/5 rounded-2xl text-xs font-bold text-brand-obsidian/70 dark:text-white/70 transition-colors">{loc}</button>
                    ))}
                  </div>
                </div>
              )}
              {showMentionList && (
                <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-brand-surface p-6 border-t border-brand-obsidian/5 animate-in slide-in-from-bottom shadow-3xl z-50">
                  <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4">Etiquetar Hermano</p>
                  <div className="flex flex-col gap-1">
                    {MOCK_USERS.map(u => (
                      <button key={u} onClick={() => { setPostMentions(prev => Array.from(new Set([...prev, u]))); setShowMentionList(false); }} className="w-full text-left p-4 hover:bg-brand-silk dark:hover:bg-white/5 rounded-2xl text-xs font-bold text-brand-obsidian/70 dark:text-white/70 transition-colors">{u}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <button onClick={() => setPostMedia('https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=1200')} className="flex items-center gap-3 bg-brand-primary/10 dark:bg-brand-primary/20 px-8 py-4.5 rounded-[1.5rem] text-brand-primary transition-all active:scale-95 border border-brand-primary/10">
                  <span className="material-symbols-outlined">image</span>
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Añadir Foto</span>
                </button>
                <button onClick={() => { setShowLocationList(!showLocationList); setShowMentionList(false); }} className={`w-15 h-15 flex items-center justify-center rounded-[1.5rem] transition-all ${postLocation ? 'bg-brand-primary text-brand-obsidian' : 'bg-brand-obsidian/[0.03] dark:bg-white/5 text-brand-obsidian/30 dark:text-white/30'}`}><span className="material-symbols-outlined text-3xl">location_on</span></button>
                <button onClick={() => { setShowMentionList(!showMentionList); setShowLocationList(false); }} className={`w-15 h-15 flex items-center justify-center rounded-[1.5rem] transition-all ${postMentions.length > 0 ? 'bg-brand-primary text-brand-obsidian' : 'bg-brand-obsidian/[0.03] dark:bg-white/5 text-brand-obsidian/30 dark:text-white/30'}`}><span className="material-symbols-outlined text-3xl">person_add</span></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- RE-ENGINEERED STORY VIEWER (Controles ajustados) --- */}
      {activeStoryIndex !== null && (
        <div className="fixed inset-0 z-[2000] bg-black flex flex-col animate-in zoom-in-95 duration-500">
          {/* Progress Bars (Más abajo para evitar notches) */}
          <div className="absolute top-16 left-6 right-6 z-[1010] flex gap-1.5">
            {localStories.map((_, i) => (
              <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary transition-all ease-linear" style={{ width: i === activeStoryIndex ? `${storyProgress}%` : i < activeStoryIndex ? '100%' : '0%' }}></div>
              </div>
            ))}
          </div>

          <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-[1005]"></div>

          <header className="absolute top-24 left-6 right-6 z-[1010] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border-2 border-brand-primary overflow-hidden p-[1px] bg-black/20 backdrop-blur-md">
                <img src={localStories[activeStoryIndex].userAvatar} className="w-full h-full object-cover rounded-full" alt="" />
              </div>
              <div>
                <p className="text-white text-sm font-bold drop-shadow-md">{localStories[activeStoryIndex].userName}</p>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">{localStories[activeStoryIndex].timestamp}</p>
              </div>
            </div>
            <button onClick={() => setActiveStoryIndex(null)} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white/90 active:scale-90 transition-all border border-white/10"><span className="material-symbols-outlined text-3xl">close</span></button>
          </header>

          <div className="relative flex-1 flex items-center justify-center">
            <div onClick={handlePrevStory} className="absolute inset-y-0 left-0 w-1/4 z-[1020]"></div>
            <div onClick={handleNextStory} className="absolute inset-y-0 right-0 w-3/4 z-[1020]"></div>
            <img src={localStories[activeStoryIndex].mediaUrl} className="w-full h-full object-contain" alt="" />
          </div>
        </div>
      )}

      {/* --- COMMENTS MODAL --- */}
      {viewingCommentsFor && (
        <div className="fixed inset-0 z-[1100] flex items-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-brand-obsidian/80 backdrop-blur-sm" onClick={() => setViewingCommentsFor(null)}></div>
          <div className="relative w-full max-w-2xl mx-auto bg-brand-silk dark:bg-brand-surface rounded-t-[3.5rem] h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-500 shadow-3xl">
            <div className="w-14 h-1.5 bg-brand-obsidian/10 dark:bg-white/10 rounded-full mx-auto my-6 shrink-0"></div>
            <header className="px-10 pb-5 border-b border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white italic">Muro de Bendiciones</h3>
              <button onClick={() => setViewingCommentsFor(null)} className="w-10 h-10 flex items-center justify-center text-brand-obsidian/30 active:scale-90 transition-all"><span className="material-symbols-outlined">close</span></button>
            </header>
            <div className="flex-1 overflow-y-auto p-10 space-y-7 no-scrollbar">
              {viewingCommentsFor.comments.length > 0 ? viewingCommentsFor.comments.map(c => (
                <div key={c.id} className="flex gap-5">
                  <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black uppercase shrink-0 border border-brand-primary/10">{c.userName.charAt(0)}</div>
                  <div className="flex-1 bg-white dark:bg-brand-obsidian/30 p-6 rounded-[2.2rem] border border-brand-obsidian/5 dark:border-white/5">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">{c.userName}</p>
                    <p className="text-sm text-brand-obsidian dark:text-white/90 font-light leading-relaxed">{c.content}</p>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <span className="material-symbols-outlined text-7xl mb-4">chat_bubble</span>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Inicia el hilo de fe</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-brand-obsidian/5 dark:border-white/5 flex gap-4 bg-brand-silk dark:bg-brand-surface pb-10">
              <input
                type="text"
                placeholder="Escribe un comentario de bendición..."
                className="flex-1 bg-white dark:bg-brand-obsidian/30 border-none rounded-2xl px-6 py-4 text-sm text-brand-obsidian dark:text-white focus:ring-2 focus:ring-brand-primary/50 outline-none placeholder:text-brand-obsidian/30 dark:placeholder:text-white/30"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="w-14 h-14 bg-brand-primary text-brand-obsidian rounded-2xl flex items-center justify-center font-black shadow-lg disabled:opacity-50 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
