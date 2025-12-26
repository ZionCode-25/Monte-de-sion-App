import React, { useState, useEffect } from 'react';
import { User, Post } from '../types';
import { usePosts, useCreatePost, useToggleLike, useAddComment, useToggleSave, useDeletePost } from '../src/hooks/usePosts';

// Components
import { FeedFilter } from './feed/FeedFilter';
import { PostItem } from './feed/PostItem';
import { CreatePostModal } from './feed/CreatePostModal';
import { CommentsModal } from './feed/CommentsModal';

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
  const [viewingCommentsFor, setViewingCommentsFor] = useState<Post | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  // --- HOOKS ---
  const { data: posts = [], isLoading, isError } = usePosts(user.id);

  const createPostMutation = useCreatePost();
  const toggleLikeMutation = useToggleLike(user.id);
  const toggleSaveMutation = useToggleSave(user.id);
  const addCommentMutation = useAddComment(
    user.id,
    user.user_metadata?.name || 'Usuario',
    user.user_metadata?.avatar_url || 'https://i.pravatar.cc/150'
  );
  const deletePostMutation = useDeletePost();

  // --- EFFECTS ---
  useEffect(() => {
    if (isCreatingPost || viewingCommentsFor) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCreatingPost, viewingCommentsFor]);

  // --- HANDLERS ---
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleCreatePost = (data: { content: string; mediaFile?: File }) => {
    triggerToast("Publicando...");
    createPostMutation.mutate(
      { userId: user.id, content: data.content, mediaFile: data.mediaFile },
      {
        onSuccess: () => {
          setIsCreatingPost(false);
          triggerToast("Testimonio compartido");
        },
        onError: () => triggerToast("Error al publicar")
      }
    );
  };

  const handleLike = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      toggleLikeMutation.mutate({ postId, isLiked: post.isLiked });
    }
  };

  const handleSave = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      toggleSaveMutation.mutate(
        { postId, isSaved: !!post.isSaved },
        {
          onSuccess: () => triggerToast(post.isSaved ? "Eliminado de guardados" : "Post guardado")
        }
      );
    }
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm("¿Seguro que quieres eliminar esta publicación?")) {
      deletePostMutation.mutate(
        { postId, userId: user.id },
        {
          onSuccess: () => triggerToast("Publicación eliminada"),
          onError: () => triggerToast("Error al eliminar")
        }
      );
    }
  };

  const handleAddComment = (text: string, parentId?: string) => {
    if (!viewingCommentsFor) return;
    addCommentMutation.mutate(
      { userId: user.id, postId: viewingCommentsFor.id, content: text, parentId },
      {
        onSuccess: () => triggerToast("Comentario agregado"),
        onError: () => triggerToast("Error al comentar")
      }
    );
  };

  // --- FILTERING ---
  const filteredPosts = posts.filter(p => {
    if (activeTab === 'mine') return p.user_id === user.id;
    if (activeTab === 'saved') return p.isSaved;
    return true; // explore
  });

  return (
    <div className="relative min-h-screen bg-brand-silk dark:bg-brand-obsidian transition-colors overflow-x-hidden">

      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[5001] bg-brand-obsidian text-brand-primary px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-3xl animate-in fade-in slide-in-from-top-4 pointer-events-none">
          {showToast}
        </div>
      )}

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
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              currentUserId={user.id}
              onLike={handleLike}
              onSave={handleSave}
              onDelete={handleDeletePost}
              onComment={setViewingCommentsFor}
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
          post={viewingCommentsFor}
          user={user}
          onClose={() => setViewingCommentsFor(null)}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
};

export default CommunityFeed;
