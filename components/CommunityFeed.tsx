
import React, { useState, useEffect } from 'react';
import { User, Post } from '../types';
import { usePosts, useCreatePost, useToggleLike, useAddComment } from '../src/hooks/usePosts';
import { useStories, useCreateStory, useDeleteStory } from '../src/hooks/useStories';

// Components
import { StoryRail } from './feed/StoryRail';
import { FeedFilter } from './feed/FeedFilter';
import { PostItem } from './feed/PostItem';
import { CreatePostModal } from './feed/CreatePostModal';
import { CreateStoryModal } from './feed/CreateStoryModal';
import { StoryViewer } from './feed/StoryViewer';
import { CommentsModal } from './feed/CommentsModal';

interface Props {
  user: User;
  theme: 'light' | 'dark';
}

const CommunityFeed: React.FC<Props> = ({ user }) => {
  // --- STATE ---
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [viewOnlyMine, setViewOnlyMine] = useState(false);

  // Modals State
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [viewingCommentsFor, setViewingCommentsFor] = useState<Post | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  // --- HOOKS ---
  const { data: posts = [] } = usePosts(user.id);
  const { data: stories = [] } = useStories();

  const createPostMutation = useCreatePost();
  const createStoryMutation = useCreateStory();
  const deleteStoryMutation = useDeleteStory();
  const toggleLikeMutation = useToggleLike(user.id);
  const addCommentMutation = useAddComment();

  // --- EFFECTS ---
  useEffect(() => {
    if (isCreatingPost || isCreatingStory || activeStoryIndex !== null || viewingCommentsFor) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCreatingPost, isCreatingStory, activeStoryIndex, viewingCommentsFor]);

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

  const handleCreateStory = (data: { text: string; mediaFile?: File }) => {
    createStoryMutation.mutate(
      { userId: user.id, text: data.text, mediaFile: data.mediaFile || null },
      {
        onSuccess: () => {
          setIsCreatingStory(false);
          triggerToast("Historia publicada");
        },
        onError: () => triggerToast("Error al publicar historia")
      }
    );
  };

  const handleDeleteStory = (storyId: string) => {
    deleteStoryMutation.mutate(storyId, {
      onSuccess: () => {
        triggerToast("Historia eliminada");
        // Navigation handled in StoryViewer or implicitly by data refresh
      },
      onError: () => triggerToast("Error al eliminar historia")
    });
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

      <StoryRail
        stories={stories}
        user={user}
        onStoryClick={setActiveStoryIndex}
        onCreateClick={() => setIsCreatingStory(true)}
        viewOnlyMine={viewOnlyMine}
      />

      <FeedFilter
        viewOnlyMine={viewOnlyMine}
        onToggle={setViewOnlyMine}
        onCreatePost={() => setIsCreatingPost(true)}
      />

      <main className="flex flex-col w-full max-w-lg mx-auto md:py-8">
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
          <div className="py-40 text-center opacity-20"><span className="material-symbols-outlined text-6xl">photo_library</span></div>
        )}
      </main>

      {isCreatingPost && (
        <CreatePostModal
          user={user}
          onClose={() => setIsCreatingPost(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {isCreatingStory && (
        <CreateStoryModal
          user={user}
          onClose={() => setIsCreatingStory(false)}
          onSubmit={handleCreateStory}
        />
      )}

      {activeStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeStoryIndex}
          user={user}
          onClose={() => setActiveStoryIndex(null)}
          onDelete={handleDeleteStory}
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
