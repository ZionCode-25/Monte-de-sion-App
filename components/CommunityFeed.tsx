
import React, { useState, useEffect } from 'react';
import { User, Post } from '../types';
import { usePosts, useCreatePost, useToggleLike, useAddComment } from '../src/hooks/usePosts';

// Components
import { FeedFilter } from './feed/FeedFilter';
import { PostItem } from './feed/PostItem';
import { CreatePostModal } from './feed/CreatePostModal';
import { CommentsModal } from './feed/CommentsModal';

interface Props {
  user: User;
  theme: 'light' | 'dark';
}

const CommunityFeed: React.FC<Props> = ({ user }) => {
  // --- STATE ---
  const [viewOnlyMine, setViewOnlyMine] = useState(false);

  // Modals State
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [viewingCommentsFor, setViewingCommentsFor] = useState<Post | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  // --- HOOKS ---
  const { data: posts = [] } = usePosts(user.id);

  const createPostMutation = useCreatePost();
  const toggleLikeMutation = useToggleLike(user.id);
  const addCommentMutation = useAddComment();

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

  const handleAddComment = (text: string) => {
    if (!viewingCommentsFor) return;
    addCommentMutation.mutate(
      { userId: user.id, postId: viewingCommentsFor.id, content: text },
      {
        onSuccess: () => triggerToast("Comentario agregado"),
        onError: () => triggerToast("Error al comentar")
      }
    );
  };

  const filteredPosts = viewOnlyMine ? posts.filter(p => p.user_id === user.id) : posts;

  return (
    <div className="relative min-h-screen bg-brand-silk dark:bg-brand-obsidian transition-colors overflow-x-hidden">

      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1100] bg-brand-obsidian text-brand-primary px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-3xl animate-in fade-in slide-in-from-top-4">
          {showToast}
        </div>
      )}

      {/* No StoryRail anymore */}

      <FeedFilter
        viewOnlyMine={viewOnlyMine}
        onToggle={setViewOnlyMine}
        onCreatePost={() => setIsCreatingPost(true)}
      />

      <main className="flex flex-col w-full max-w-xl mx-auto md:py-8 pb-32">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              currentUserId={user.id}
              onLike={handleLike}
              onComment={setViewingCommentsFor}
            />
          ))
        ) : (
          <div className="py-40 text-center opacity-20 flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-6xl">photo_library</span>
            <p className="text-xs uppercase tracking-widest font-bold">Sin publicaciones aún</p>
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

      {/* No Story Modals anymore */}

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
