
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
        text: s.content || s.text, // Assuming column name
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
      const { error } = await supabase.from('stories').insert({
        user_id: user.id,
        media_url: storyMedia, // Can be null for text stories
        content: storyText,
        type: storyMedia ? 'image' : 'text',
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

      {/* --- STORY CREATION MODAL (FULLSCREEN & NO SCROLL) --- */}
      {isCreatingStory && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
          {/* Header Flotante */}
          <div className="absolute top-0 left-0 right-0 p-6 pt-12 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
            <button
              onClick={() => setIsCreatingStory(false)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  // Lógica para enviar historia
                  if (!storyText && !storyMedia) return;
                   // Enviar historia real
                   createStoryMutation.mutate();
                }}
                disabled={!storyText && !storyMedia}
                className="px-6 py-2 bg-brand-primary text-brand-obsidian rounded-full font-bold text-sm tracking-wide shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
              >
                COMPARTIR
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 relative bg-brand-obsidian overflow-hidden flex items-center justify-center">
            {storyMedia ? (
              <div className="relative w-full h-full">
                <img src={storyMedia} className="w-full h-full object-contain bg-black" alt="Preview" />
                <button
                  onClick={() => setStoryMedia(null)}
                  className="absolute top-24 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md z-40"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ) : (
              <textarea
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="Escribe algo..."
                className="w-full h-full bg-gradient-to-tr from-purple-900 via-brand-obsidian to-brand-primary p-8 pt-32 text-center text-3xl font-bold text-white placeholder-white/50 focus:outline-none resize-none flex items-center justify-center"
                style={{ paddingTop: '30%' }}
              />
            )}
          </div>

          {/* Footer Tools */}
          {!storyMedia && (
            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-50">
              <label className="cursor-pointer flex flex-col items-center gap-2 group p-4">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-white text-3xl">image</span>
                </div>
                <span className="text-white/70 text-xs font-medium tracking-widest uppercase">Galería</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setStoryMedia(url);
                    }
                  }}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* --- MASTER POST EDITOR MODAL (FULL SCREEN & FIXED) --- */}
      {/* --- MASTER POST EDITOR MODAL (FULL SCREEN & FIXED) --- */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-[9999] bg-brand-silk dark:bg-brand-obsidian flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header Flotante */}
            <header className="px-6 pt-12 pb-4 flex items-center justify-between bg-white/80 dark:bg-brand-obsidian/90 backdrop-blur-md border-b border-brand-obsidian/5 dark:border-white/5 z-50 sticky top-0">
              <button 
                onClick={() => setIsCreatingPost(false)} 
                className="w-10 h-10 rounded-full bg-brand-obsidian/5 dark:bg-white/10 flex items-center justify-center text-brand-obsidian dark:text-white active:scale-95 transition-all"
              >
                 <span className="material-symbols-outlined">close</span>
              </button>
              
              <h3 className="text-base font-black uppercase tracking-widest text-brand-obsidian dark:text-white">Nuevo Post</h3>
              
              <button 
                onClick={handleCreatePost} 
                disabled={!postText.trim() && !postMedia} 
                className="bg-brand-primary text-brand-obsidian px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:grayscale active:scale-95 transition-all"
              >
                Publicar
              </button>
            </header>

            <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto">
              <div className="p-6 space-y-6">
                
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-brand-primary to-transparent">
                     <img src={user.avatar} className="w-full h-full rounded-full object-cover border-2 border-brand-surface" alt="" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-obsidian dark:text-white">{user.name}</h4>
                    <span className="text-xs text-brand-obsidian/40 dark:text-white/40 font-medium bg-brand-obsidian/5 dark:bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Público</span>
                  </div>
                </div>

                {/* Text Input */}
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  autoFocus
                  placeholder="¿Qué quieres compartir con la comunidad?"
                  className="w-full min-h-[150px] bg-transparent text-lg text-brand-obsidian dark:text-white placeholder-brand-obsidian/30 dark:placeholder-white/20 resize-none focus:outline-none leading-relaxed"
                />

                {/* Media Preview */}
                {postMedia && (
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl group border border-brand-obsidian/5 dark:border-white/5">
                    <img src={postMedia} className="w-full h-auto max-h-[500px] object-cover" alt="Preview" />
                    <button 
                      onClick={() => setPostMedia(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/80 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="p-6 pb-12 bg-white dark:bg-brand-surface border-t border-brand-obsidian/5 dark:border-white/5 sticky bottom-0 z-40">
               <div className="flex gap-4 max-w-2xl mx-auto">
                  <label className="flex items-center gap-3 px-4 py-3 bg-brand-obsidian/5 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-brand-primary/10 transition-colors group flex-1 justify-center">
                    <span className="material-symbols-outlined text-brand-primary group-hover:scale-110 transition-transform">image</span>
                    <span className="text-sm font-bold text-brand-obsidian/60 dark:text-white/60 group-hover:text-brand-primary">Foto/Video</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                       const file = e.target.files?.[0];
                       if(file) setPostMedia(URL.createObjectURL(file));
                    }} />
                  </label>
                  
                  <button className="flex items-center gap-3 px-4 py-3 bg-brand-obsidian/5 dark:bg-white/5 rounded-2xl hover:bg-brand-primary/10 transition-colors group flex-1 justify-center">
                    <span className="material-symbols-outlined text-brand-primary group-hover:scale-110 transition-transform">location_on</span>
                    <span className="text-sm font-bold text-brand-obsidian/60 dark:text-white/60 group-hover:text-brand-primary">Ubicación</span>
                  </button>
               </div>
            </div>
        </div>
      )}

      {/* --- STORY VIEWER (IG Style Navigation) --- */}
      {activeStoryIndex !== null && localStories[activeStoryIndex] && (
         <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-in fade-in duration-200">
            {/* Background blur effect */}
            <div className="absolute inset-0 z-0">
               {localStories[activeStoryIndex].mediaUrl ? (
                  <img src={localStories[activeStoryIndex].mediaUrl} className="w-full h-full object-cover opacity-20 blur-3xl" alt="" />
               ) : (
                  <div className="w-full h-full bg-brand-primary opacity-10 blur-3xl"></div>
               )}
               <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* Main Story Container */}
            <div className="relative w-full h-full md:max-w-md md:h-[90vh] md:rounded-3xl bg-black overflow-hidden shadow-2xl flex flex-col">
              
               {/* Progress Bar */}
               <div className="absolute top-4 left-4 right-4 z-50 flex gap-1.5 h-1">
                  <div className="flex-1 h-full bg-white/30 rounded-full overflow-hidden">
                     <div className="h-full bg-white animate-[loading_5s_linear_forwards]" style={{ animationDuration: '5s' }} onAnimationEnd={() => {
                        if (activeStoryIndex < localStories.length - 1) setActiveStoryIndex(activeStoryIndex + 1);
                        else setActiveStoryIndex(null);
                     }}></div>
                  </div>
               </div>

               {/* Header Info */}
               <div className="absolute top-8 left-4 right-16 z-50 flex items-center gap-3 pointer-events-none">
                  <img src={localStories[activeStoryIndex].userAvatar} className="w-10 h-10 rounded-full border-2 border-brand-primary" alt="" />
                  <div className="flex flex-col text-left">
                     <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{localStories[activeStoryIndex].userName}</span>
                     <span className="text-white/60 text-[10px]">Hace un momento</span>
                  </div>
               </div>

               {/* Close Button */}
               <button 
                 onClick={(e) => { e.stopPropagation(); setActiveStoryIndex(null); }}
                 className="absolute top-8 right-4 z-[60] text-white/80 p-2 hover:bg-white/10 rounded-full active:scale-95 transition-transform"
               >
                 <span className="material-symbols-outlined text-2xl drop-shadow-lg">close</span>
               </button>

               {/* Tap Navigation Zones */}
               <div className="absolute inset-0 z-40 flex">
                  <div 
                    className="w-1/3 h-full" 
                    onClick={() => {
                       if (activeStoryIndex > 0) setActiveStoryIndex(activeStoryIndex - 1);
                    }}
                  ></div>
                  <div 
                    className="w-2/3 h-full" 
                    onClick={() => {
                       if (activeStoryIndex < localStories.length - 1) setActiveStoryIndex(activeStoryIndex + 1);
                       else setActiveStoryIndex(null);
                    }}
                  ></div>
               </div>

               {/* Content */}
               <div className="w-full h-full flex items-center justify-center relative z-10 pointer-events-none">
                  {localStories[activeStoryIndex].mediaUrl ? (
                     <img src={localStories[activeStoryIndex].mediaUrl!} className="w-full h-full object-contain bg-black" alt="" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-tr from-purple-900 via-brand-obsidian to-brand-primary">
                        <p className="text-white text-2xl md:text-3xl font-bold text-center leading-relaxed drop-shadow-xl font-serif">
                           "{localStories[activeStoryIndex].text}"
                        </p>
                     </div>
                  )}
               </div>

               {/* Reply Footer */}
               <div className="absolute bottom-6 left-4 right-4 z-50 flex gap-4 pointer-events-auto">
                  <input type="text" placeholder="Envía un mensaje..." className="flex-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-full py-3 px-6 text-white placeholder-white/50 text-sm focus:outline-none focus:bg-black/60 transition-colors" />
                  <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md active:scale-95 border border-white/20">
                     <span className="material-symbols-outlined">favorite</span>
                  </button>
               </div>
            </div>
         </div>
      )}

{/* --- COMMENTS MODAL --- */ }
{
  viewingCommentsFor && (
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
  )
}
    </div>
  );
};

export default CommunityFeed;
