import React, { useState, useRef, useEffect } from 'react';
import { Post, User, Comment } from '../../types';
import { SmartImage } from '../ui/SmartImage';
import { useToggleCommentLike } from '../../src/hooks/usePosts'; // Import direct hook

interface Props {
    post: Post | null;
    onClose: () => void;
    user: User; // Current user
    onAddComment: (text: string, parentId?: string) => void;
}

// --- SUBCOMPONENT: COMMENT ITEM (Recursive) ---
const CommentItem: React.FC<{
    comment: Comment;
    currentUserId: string;
    depth?: number;
    onReply: (comment: Comment) => void;
}> = ({ comment, currentUserId, depth = 0, onReply }) => {
    const [showReplies, setShowReplies] = useState(false);
    const toggleLikeMutation = useToggleCommentLike(currentUserId);
    const hasReplies = comment.replies && comment.replies.length > 0;

    const handleLike = () => {
        toggleLikeMutation.mutate({ commentId: comment.id, isLiked: comment.isLiked });
    };

    return (
        <div className={`mb-5 ${depth > 0 ? 'ml-0' : ''}`}> {/* Indentation handled by padding/margin in structure */}
            <div className="flex gap-3">
                {/* Avatar */}
                <div className={`shrink-0 rounded-full overflow-hidden border border-white/10 ${depth > 0 ? 'w-8 h-8' : 'w-10 h-10'}`}>
                    <SmartImage src={comment.userAvatar} className="w-full h-full object-cover" />
                </div>

                {/* Content Data */}
                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-brand-obsidian dark:text-white drop-shadow-sm">
                            {comment.userName}
                        </span>
                        <span className="text-[10px] text-brand-obsidian/40 dark:text-white/40 font-medium">
                            {new Date(comment.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    <p className="text-sm text-brand-obsidian/90 dark:text-white/90 leading-relaxed font-normal mt-0.5">
                        {comment.content}
                    </p>

                    {/* Actions Row */}
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => onReply(comment)}
                            className="text-xs font-semibold text-brand-obsidian/40 dark:text-white/40 hover:text-brand-obsidian dark:hover:text-white transition-colors"
                        >
                            Responder
                        </button>
                        {comment.likes > 0 && (
                            <span className="text-xs text-brand-obsidian/30 dark:text-white/30 font-medium">
                                {comment.likes} likes
                            </span>
                        )}
                    </div>

                    {/* View Replies Toggle */}
                    {hasReplies && (
                        <div className="mt-3">
                            {!showReplies ? (
                                <button
                                    onClick={() => setShowReplies(true)}
                                    className="flex items-center gap-2 text-xs font-semibold text-brand-obsidian/40 dark:text-white/40 hover:text-brand-obsidian dark:hover:text-white transition-colors"
                                >
                                    <div className="w-6 h-[1px] bg-current opacity-50"></div>
                                    Ver {comment.replies!.length} respuestas
                                </button>
                            ) : (
                                <div className="pl-0 mt-3 border-l-2 border-brand-obsidian/5 dark:border-white/5 pl-4 ml-1">
                                    {comment.replies!.map(reply => (
                                        <CommentItem
                                            key={reply.id}
                                            comment={reply}
                                            currentUserId={currentUserId}
                                            depth={depth + 1}
                                            onReply={onReply}
                                        />
                                    ))}
                                    <button
                                        onClick={() => setShowReplies(false)}
                                        className="mt-2 text-[10px] font-bold text-brand-obsidian/30 dark:text-white/30 hover:text-brand-obsidian transition-colors uppercase tracking-widest"
                                    >
                                        Ocultar respuestas
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Like Heart (Right Aligned) */}
                <button
                    onClick={handleLike}
                    className={`shrink-0 pt-1 transition-transform active:scale-75 ${comment.isLiked ? 'text-rose-500' : 'text-brand-obsidian/20 dark:text-white/20 hover:text-rose-500/50'}`}
                >
                    <span className={`material-symbols-outlined text-[18px] ${comment.isLiked ? 'fill-1' : ''}`}>favorite</span>
                </button>
            </div>
        </div>
    );
};


// --- MAIN MODAL ---
export const CommentsModal: React.FC<Props> = ({ post, onClose, user, onAddComment }) => {
    const [commentText, setCommentText] = useState('');
    const [replyTo, setReplyTo] = useState<Comment | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when reply is triggered
    useEffect(() => {
        if (replyTo && inputRef.current) {
            inputRef.current.focus();
        }
    }, [replyTo]);

    if (!post) return null;

    const handleSubmit = () => {
        if (!commentText.trim()) return;

        // Find parent ID: if replying to a reply, use its parent (root comment) or itself if it is root?
        // Logic: Our BD simplifies to 1 level depth usually, but recursive structure supports N.
        // Let's assume recursion is supported deep.
        const parentId = replyTo ? replyTo.id : undefined;

        onAddComment(commentText, parentId);
        setCommentText('');
        setReplyTo(null); // Reset reply mode
    };

    const handleReply = (comment: Comment) => {
        setReplyTo(comment);
    };

    return (
        <div className="fixed inset-0 z-[5000] flex flex-col animate-in fade-in duration-300 isolate">
            {/* Backdrop Blur & Dismiss Area */}
            <div className="absolute inset-0 bg-brand-obsidian/60 backdrop-blur-md transition-all" onClick={onClose}></div>

            {/* Modal Sheet */}
            <div className="relative mt-auto w-full max-w-2xl mx-auto h-[85vh] bg-brand-silk dark:bg-[#121212] rounded-t-[2.5rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden ring-1 ring-white/10">

                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-2" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-brand-obsidian/20 dark:bg-white/20 rounded-full"></div>
                </div>

                {/* Header */}
                <header className="px-6 pb-4 border-b border-brand-obsidian/5 dark:border-white/5 flex items-center justify-center relative shrink-0">
                    <h3 className="text-base font-bold text-brand-obsidian dark:text-white">Comentarios</h3>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-medium text-brand-obsidian/40 dark:text-white/40">
                        {post.comments ? post.comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0) : 0}
                    </div>
                </header>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map(c => (
                            <CommentItem
                                key={c.id}
                                comment={c}
                                currentUserId={user.id}
                                onReply={handleReply}
                            />
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 gap-4">
                            <span className="material-symbols-outlined text-6xl font-thin">rate_review</span>
                            <div className="text-center">
                                <p className="text-sm font-bold">Sé el primero</p>
                                <p className="text-xs">Comparte tu bendición</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area (Sticky Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 bg-brand-silk dark:bg-[#121212]/95 backdrop-blur-xl border-t border-brand-obsidian/5 dark:border-white/5 p-4 pb-8 md:pb-4 transition-all z-20">

                    {/* Replying To Indicator */}
                    {replyTo && (
                        <div className="flex items-center justify-between bg-brand-obsidian/5 dark:bg-white/5 px-4 py-2 rounded-t-xl mb-[-10px] mx-2 text-xs text-brand-obsidian/60 dark:text-white/60 font-medium border border-b-0 border-brand-obsidian/5">
                            <span>Respondiendo a <span className="font-bold text-brand-primary">{replyTo.userName}</span></span>
                            <button onClick={() => setReplyTo(null)} className="hover:text-rose-500"><span className="material-symbols-outlined text-sm">close</span></button>
                        </div>
                    )}

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-obsidian/10 shrink-0">
                            <SmartImage src={user.avatar_url} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={`Comentar como ${user.name.split(' ')[0]}...`}
                                className="w-full bg-white dark:bg-white/10 border-none rounded-full pl-5 pr-12 py-3 text-sm text-brand-obsidian dark:text-white focus:ring-1 focus:ring-brand-primary/50 outline-none placeholder:text-brand-obsidian/30 dark:placeholder:text-white/30 shadow-sm"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!commentText.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-primary/10 rounded-full transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined text-xl">arrow_upward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
