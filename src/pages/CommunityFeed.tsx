import React, { useState, useEffect, useMemo } from 'react';
import { User, Post } from '../../types';
import { usePosts, useCreatePost, useToggleLike, useToggleSave, useDeletePost } from '../hooks/usePosts';
import { useAddComment, useRealtimeComments } from '../hooks/useComments';
import { FeedFilter } from '../components/feed/FeedFilter';
import { PostItem } from '../components/feed/PostItem';
import { CreatePostModal } from '../components/feed/CreatePostModal';
import { CommentsModal } from '../components/feed/CommentsModal';
import { UserProfileOverlay } from '../components/feed/UserProfileOverlay';
import { useToast } from '../components/context/ToastContext';

interface Props {
  user: User;
  theme: 'light' | 'dark';
}

type FeedMode = 'explore' | 'mine' | 'saved';

const CommunityFeed: React.FC<Props> = ({ user }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<FeedMode>('explore');

  // Modals State
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [viewingCommentsFor, setViewingCommentsFor] = useState<string | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const { showToast } = useToast();

  // --- DATA FETCHING ---
  const { data: posts, isLoading, isError } = usePosts(user.id);

  // --- MUTATIONS ---
  const createPost = useCreatePost();
  const toggleLike = useToggleLike(user.id);
  const toggleSave = useToggleSave(user.id);
  const deletePost = useDeletePost();
  const addComment = useAddComment(user.id, user.name || 'Usuario', user.avatar || '');
  useRealtimeComments(viewingCommentsFor);

  // --- FILTERS ---
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (activeTab === 'mine') return posts.filter(p => p.user_id === user.id);
    if (activeTab === 'saved') return posts.filter(p => p.isSaved);
    return posts;
  }, [posts, activeTab, user.id]);

  // --- EFFECT: Body Scroll Lock ---
  useEffect(() => {
    if (isCreatingPost || viewingCommentsFor || viewingProfileId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCreatingPost, viewingCommentsFor, viewingProfileId]);

  // --- HANDLERS ---
  const handleLike = (postId: string) => {
    const post = posts?.find(p => p.id === postId);
    if (post) {
      toggleLike.mutate({ postId, isLiked: post.isLiked });
    }
  };

  const handleSave = (postId: string) => {
    const post = posts?.find(p => p.id === postId);
    if (post) {
      toggleSave.mutate({ postId, isSaved: !!post.isSaved });
      if (!post.isSaved) {
        showToast('Guardado en tus favoritos', 'success');
      }
    }
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('¿Seguro que quieres eliminar esta publicación?')) {
      deletePost.mutate({ postId, userId: user.id });
      showToast('Publicación eliminada', 'info');
    }
  };

  const handleCreatePost = (data: { content: string, mediaFiles?: File[] }) => {
    createPost.mutate({
      userId: user.id,
      content: data.content,
      mediaFiles: data.mediaFiles
    }, {
      onSuccess: () => {
        setIsCreatingPost(false);
        showToast('¡Publicación creada con éxito!', 'success');
        setActiveTab('explore'); // Go to feed to see new post
      },
      onError: (err) => {
        console.error(err);
        showToast('Error al publicar. Intenta nuevamente.', 'error');
      }
    });
  };

  const handleAddComment = (postId: string, content: string, parentId?: string) => {
    addComment.mutate({ postId, content, parentId, userId: user.id });
  };

  return (
    <div className="relative min-h-screen bg-brand-silk dark:bg-brand-obsidian transition-colors overflow-x-hidden">

      <FeedFilter
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={() => setIsCreatingPost(true)}
      />

      <main className="flex flex-col w-full max-w-xl mx-auto md:py-8 pb-32 min-h-[50vh]">
        {isLoading ? (
          // Skeleton Loading
          <div className="space-y-8 p-4 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="w-full bg-brand-obsidian/5 dark:bg-white/5 rounded-[2.5rem] h-[500px]" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-20 text-center flex flex-col items-center gap-4 text-rose-500">
            <span className="material-symbols-outlined text-4xl">error</span>
            <p className="text-sm font-bold">Error al cargar publicaciones.</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-rose-500/10 text-rose-500 px-4 py-2 rounded-full hover:bg-rose-500/20"
            >
              Reintentar
            </button>
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              currentUserId={user.id}
              onLike={handleLike}
              onSave={handleSave}
              onComment={(post) => setViewingCommentsFor(post.id)}
              onDelete={handleDeletePost}
              onUserClick={setViewingProfileId}
            />
          ))
        ) : (
          <div className="py-40 text-center opacity-30 flex flex-col items-center gap-6">
            <span className="material-symbols-outlined text-7xl font-thin">
              {activeTab === 'saved' ? 'bookmark_border' : 'photo_library'}
            </span>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-widest font-black">
                {activeTab === 'saved' ? 'No hay guardados' : 'Sin publicaciones'}
              </p>
              <p className="text-xs font-medium">
                {activeTab === 'saved' ? 'Guarda los posts que más te gusten' : 'Sé el primero en compartir algo'}
              </p>
            </div>
          </div>
        )}
      </main>

      {isCreatingPost && (
        <CreatePostModal
          user={user}
          onClose={() => setIsCreatingPost(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {viewingCommentsFor && (
        <CommentsModal
          post={posts?.find(p => p.id === viewingCommentsFor) || null}
          user={user}
          onClose={() => setViewingCommentsFor(null)}
          onAddComment={(content, parentId) => handleAddComment(viewingCommentsFor!, content, parentId)}
        />
      )}

      {viewingProfileId && (
        <UserProfileOverlay
          userId={viewingProfileId}
          currentUserId={user.id}
          onClose={() => setViewingProfileId(null)}
        />
      )}
    </div>
  );
};

export default CommunityFeed;
