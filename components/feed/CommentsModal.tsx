import React, { useState, useRef, useEffect } from 'react';
import { Post, User, Comment } from '../../types';
import { SmartImage } from '../ui/SmartImage';
import { useToggleCommentLike } from '../../src/hooks/usePosts';

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

    // Local state for INSTANT feedback (0ms latency logic)
    const [isLikedLocal, setIsLikedLocal] = useState(comment.isLiked);
    const [likesCountLocal, setLikesCountLocal] = useState(comment.likes);

    // Sync with server state if it changes externally
    useEffect(() => {
        setIsLikedLocal(comment.isLiked);
        setLikesCountLocal(comment.likes);
    }, [comment.isLiked, comment.likes]);

    const handleLike = () => {
        // 1. Capture current state
        const wasLiked = isLikedLocal;

        // 2. Instant UI Update
        setIsLikedLocal(!wasLiked);
        setLikesCountLocal(prev => !wasLiked ? prev + 1 : Math.max(0, prev - 1));

        // 3. Trigger Server Mutation (optimistic revert handles error)
        toggleLikeMutation.mutate({ commentId: comment.id, isLiked: wasLiked });
    };

    return (
        <div className={`mb-6 ${depth > 0 ? 'ml-0' : ''} animate-in fade-in duration-500`}>
            <div className="flex gap-3 items-start">
                {/* Avatar */}
                <div className={`shrink-0 rounded-full overflow-hidden border border-brand-obsidian/10 dark:border-white/10 ${depth > 0 ? 'w-8 h-8' : 'w-10 h-10'}`}>
                    <SmartImage src={comment.userAvatar} className="w-full h-full object-cover" />
                </div>

                {/* Content Data */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm font-bold text-brand-obsidian dark:text-white drop-shadow-sm truncate max-w-[150px]">
                            {comment.userName}
                        </span>
                        <span className="text-[10px] text-brand-obsidian/40 dark:text-white/40 font-medium">
                            {new Date(comment.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    <p className="text-sm text-brand-obsidian/90 dark:text-white/90 leading-relaxed font-normal mt-0.5 break-words">
                        {comment.content}
                    </p>

                    {/* Actions Row */}
                    <div className="flex items-center gap-4 mt-2 mb-1">
                        <button
                            onClick={() => onReply(comment)}
                            className="text-xs font-bold text-brand-obsidian/40 dark:text-white/40 hover:text-brand-obsidian dark:hover:text-white transition-colors p-1 -ml-1 rounded-md active:bg-black/5"
                        >
                            Responder
                        </button>
                        {likesCountLocal > 0 && (
                            <span className={`text-xs font-bold transition-all ${isLikedLocal ? 'text-rose-500' : 'text-brand-obsidian/30 dark:text-white/30'}`}>
                                {likesCountLocal} likes
                            </span>
                        )}
                    </div>

                    {/* View Replies Toggle */}
                    {hasReplies && (
                        <div className="mt-2">
                            {!showReplies ? (
                                <button
                                    onClick={() => setShowReplies(true)}
                                    className="flex items-center gap-3 text-xs font-semibold text-brand-obsidian/40 dark:text-white/40 hover:text-brand-obsidian dark:hover:text-white transition-colors group"
                                >
                                    <div className="w-8 h-[1px] bg-brand-obsidian/20 dark:bg-white/20 group-hover:bg-brand-obsidian/50 transition-colors"></div>
                                    Ver {comment.replies!.length} respuestas
                                </button>
                            ) : (
                                <div className="mt-4 pl-3 border-l-2 border-brand-obsidian/5 dark:border-white/5 ml-1.5 space-y-4">
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
                                        className="text-[10px] font-bold text-brand-obsidian/30 dark:text-white/30 hover:text-brand-obsidian transition-colors uppercase tracking-widest pl-2"
                                    >
                                        Ocultar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Like Heart (Right Aligned, Sticky Top) */}
                <button
                    onClick={handleLike}
                    className={`shrink-0 pt-1 px-1 transition-transform active:scale-75 ${isLikedLocal ? 'text-rose-500' : 'text-brand-obsidian/20 dark:text-white/20 hover:text-rose-500/50'}`}
                >
                    <span className={`material-symbols-outlined text-[18px] ${isLikedLocal ? 'fill-1' : ''}`}>favorite</span>
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
        const parentId = replyTo ? replyTo.id : undefined;
        onAddComment(commentText, parentId);
        setCommentText('');
        setReplyTo(null);
    };

    const handleReply = (comment: Comment) => {
        setReplyTo(comment);
    };

    // Z-INDEX BOOST TO 99999 to cover BottomNav (usually z-50 or z-100)
    return (
        <div className="fixed inset-0 z-[99999] flex flex-col animate-in fade-in duration-300 isolate">
            {/* Backdrop Blur & Dismiss Area */}
            <div className="absolute inset-0 bg-brand-obsidian/60 backdrop-blur-md transition-all" onClick={onClose}></div>

            {/* Modal Sheet */}
            <div className="relative mt-auto w-full max-w-2xl mx-auto h-[92vh] bg-brand-silk dark:bg-[#121212] rounded-t-[2.5rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden ring-1 ring-white/10">

                {/* Drag Handle & Close Button */}
                <div className="w-full flex items-center justify-between px-6 pt-5 pb-2 shrink-0 relative z-20">
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 active:scale-90 transition-all text-brand-obsidian dark:text-white hover:bg-black/10 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined font-bold">keyboard_arrow_down</span>
                    </button>
                    <div className="w-12 h-1.5 bg-brand-obsidian/20 dark:bg-white/20 rounded-full absolute left-1/2 -translate-x-1/2 top-7"></div>
                    <div className="w-10"></div> {/* Spacer for balance */}
                </div>

                {/* Header */}
                <header className="px-6 pb-4 border-b border-brand-obsidian/5 dark:border-white/5 flex flex-col items-center justify-center shrink-0">
                    <h3 className="text-lg font-bold text-brand-obsidian dark:text-white">Comentarios</h3>
                    {post.comments && post.comments.length > 0 && (
                        <p className="text-xs font-medium text-brand-obsidian/40 dark:text-white/40 mt-1">
                            {post.comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)} publicaciones
                        </p>
                    )}
                </header>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-40">
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
                        <div className="h-full flex flex-col items-center justify-center opacity-40 gap-4 pb-20">
                            <span className="material-symbols-outlined text-6xl font-thin">rate_review</span>
                            <div className="text-center">
                                <p className="text-sm font-bold">Sé el primero</p>
                                <p className="text-xs">Comparte tu bendición</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Input Area (Sticky layout fix) */}
                <div className="absolute bottom-0 left-0 right-0 bg-brand-silk dark:bg-[#121212]/95 backdrop-blur-xl border-t border-brand-obsidian/5 dark:border-white/5 transition-all z-30 flex flex-col shadow-[0_-5px_30px_rgba(0,0,0,0.1)]">

                    {/* Replying To Indicator (Stacked Layout) */}
                    {replyTo && (
                        <div className="w-full bg-brand-obsidian/5 dark:bg-white/5 px-6 py-2 flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in">
                            <div className="flex items-center gap-2 text-xs text-brand-obsidian/60 dark:text-white/60">
                                <span className="material-symbols-outlined text-sm rotate-180">reply</span>
                                <span>Respondiendo a <span className="font-bold text-brand-primary">{replyTo.userName}</span></span>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    )}

                    <div className="p-4 pb-8 md:pb-6 flex items-end gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-obsidian/10 shrink-0 border border-brand-obsidian/5">
                            <SmartImage src={user.avatar_url} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 relative bg-white dark:bg-white/5 rounded-[1.5rem] border border-brand-obsidian/5 transition-all focus-within:ring-2 focus-within:ring-brand-primary/50 focus-within:scale-[1.01] overflow-hidden flex items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={replyTo ? `Responde a ${replyTo.userName}...` : `Agrega un comentario...`}
                                className="w-full bg-transparent border-none pl-5 pr-14 py-3.5 text-[15px] text-brand-obsidian dark:text-white outline-none placeholder:text-brand-obsidian/30 dark:placeholder:text-white/30"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            />

                            <button
                                onClick={handleSubmit}
                                disabled={!commentText.trim()}
                                className={`absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-full transition-all ${commentText.trim() ? 'bg-brand-primary text-brand-obsidian shadow-md active:scale-90' : 'bg-transparent text-brand-obsidian/10 dark:text-white/10 cursor-not-allowed'}`}
                            >
                                <span className="material-symbols-outlined text-xl font-bold">arrow_upward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
