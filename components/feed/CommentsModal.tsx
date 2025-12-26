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
        const wasLiked = isLikedLocal;
        setIsLikedLocal(!wasLiked);
        setLikesCountLocal(prev => !wasLiked ? prev + 1 : Math.max(0, prev - 1));
        toggleLikeMutation.mutate({ commentId: comment.id, isLiked: wasLiked });
    };

    // Avatar styling fix: Ensure perfect circle without cutting
    // Logic: Depth 0 = Main comment. Depth >= 1 = Reply (Visual Flatness requested)
    const isRoot = depth === 0;

    return (
        <div className={`mb-4 w-full animate-in fade-in duration-500`}>
            <div className="flex gap-3 items-start group">
                {/* Avatar */}
                <div className={`shrink-0 rounded-full p-[1px] ${isRoot ? 'w-9 h-9 bg-brand-obsidian/5 dark:bg-white/10' : 'w-7 h-7 bg-transparent'}`}>
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                        <SmartImage src={comment.userAvatar} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Content Data */}
                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[13px] font-bold text-brand-obsidian dark:text-white truncate max-w-[150px]">
                            {comment.userName}
                        </span>
                        <span className="text-[10px] text-brand-obsidian/40 dark:text-white/40">
                            {new Date(comment.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    <p className={`text-[13px] text-brand-obsidian/90 dark:text-white/90 leading-tight font-normal break-words ${isRoot ? '' : 'text-brand-obsidian/80'}`}>
                        {/* Mention Logic simulation: If depth > 1, we could check parent but API structure is recursive. 
                            For now, relying on User Request "just mentions" -> user types it or we assume direct reply context is clear visually.
                        */}
                        {comment.content}
                    </p>

                    {/* Actions Row */}
                    <div className="flex items-center gap-4 mt-1.5 mb-1">
                        <button
                            onClick={() => onReply(comment)}
                            className="text-[11px] font-bold text-brand-obsidian/40 dark:text-white/40 hover:text-brand-obsidian dark:hover:text-white transition-colors"
                        >
                            Responder
                        </button>
                        {likesCountLocal > 0 && (
                            <span className={`text-[11px] font-semibold transition-all ${isLikedLocal ? 'text-rose-500' : 'text-brand-obsidian/30 dark:text-white/30'}`}>
                                {likesCountLocal} likes
                            </span>
                        )}
                    </div>

                    {/* View Replies Toggle */}
                    {hasReplies && (
                        <div className="mt-1">
                            {!showReplies ? (
                                <button
                                    onClick={() => setShowReplies(true)}
                                    className="flex items-center gap-3 py-2 text-[11px] font-bold text-brand-obsidian/40 dark:text-white/40 hover:text-brand-obsidian dark:hover:text-white transition-colors group w-full"
                                >
                                    <div className="w-6 h-[1px] bg-brand-obsidian/20 dark:bg-white/20 group-hover:bg-brand-obsidian/50 transition-colors"></div>
                                    Ver {comment.replies!.length} respuestas
                                </button>
                            ) : (
                                <div className={`space-y-4 pt-2 ${isRoot ? 'pl-8 border-l-2 border-brand-obsidian/5 dark:border-white/5 ml-1' : ''}`}>
                                    {/* Recursive rendering: If Root, indent children. If Child, render grandchildren FLAT below ensuring visual hierarchy stops at level 1 */}
                                    {comment.replies!.map(reply => (
                                        <CommentItem
                                            key={reply.id}
                                            comment={reply}
                                            currentUserId={currentUserId}
                                            depth={depth + 1}
                                            onReply={onReply}
                                        />
                                    ))}

                                    {/* Ocultar Button only if needed broadly, often clicking 'View replies' toggles it off or a specific hide button */}
                                    {/* In flat list style, usually we don't spam 'Hide'. But let's keep it for UX clarity */}
                                    {/* <button onClick={() => setShowReplies(false)} ...>Ocultar</button>  <-- Removed to clean UI, toggle by clicking header is standard but we replaced header. */}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Like Heart (Right Aligned, Sticky Top) */}
                <button
                    onClick={handleLike}
                    className={`shrink-0 pt-0.5 px-1 transition-transform active:scale-75 ${isLikedLocal ? 'text-rose-500 fill-current' : 'text-brand-obsidian/20 dark:text-white/20 hover:text-rose-500/50'}`}
                >
                    <span className={`material-symbols-outlined text-[14px] ${isLikedLocal ? 'font-[500] fill-1' : ''}`}>favorite</span>
                </button>
            </div>
        </div>
    );
};


// --- MAIN MODAL ---
import { createPortal } from 'react-dom';

export const CommentsModal: React.FC<Props> = ({ post, onClose, user, onAddComment }) => {
    const [commentText, setCommentText] = useState('');
    const [replyTo, setReplyTo] = useState<Comment | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Focus input when reply is triggered
    useEffect(() => {
        if (replyTo && inputRef.current) {
            inputRef.current.focus();
        }
    }, [replyTo]);

    if (!post || !mounted) return null;

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

    // Usamos Portal para saltar fuera de cualquier stacking context y asegurar superposición TOTAL
    return createPortal(
        <div className="fixed inset-0 z-[99999] flex flex-col isolate font-sans">
            {/* Backdrop Blur & Dismiss Area */}
            <div
                className="absolute inset-0 bg-brand-obsidian/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Sheet - Usando 100dvh para móviles y max-h-[92%] */}
            <div className="relative mt-auto w-full max-w-2xl mx-auto h-[95dvh] bg-brand-silk dark:bg-[#121212] rounded-t-[2.5rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden ring-1 ring-white/10">

                {/* Header Fijo - Siempre visible */}
                <div className="shrink-0 w-full flex flex-col items-center bg-brand-silk dark:bg-[#121212] z-40 border-b border-brand-obsidian/5 dark:border-white/5 pb-2">
                    {/* Drag Handle & Close Button Row */}
                    <div className="w-full flex items-center justify-between px-6 pt-5 pb-1">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 active:scale-90 transition-all text-brand-obsidian dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
                        >
                            <span className="material-symbols-outlined font-bold">keyboard_arrow_down</span>
                        </button>

                        <div className="w-12 h-1.5 bg-brand-obsidian/20 dark:bg-white/20 rounded-full" />

                        <div className="w-10"></div> {/* Spacer */}
                    </div>

                    {/* Title */}
                    <div className="text-center pb-2">
                        <h3 className="text-lg font-bold text-brand-obsidian dark:text-white leading-tight">Comentarios</h3>
                        {post.comments && post.comments.length > 0 && (
                            <p className="text-xs font-medium text-brand-obsidian/40 dark:text-white/40">
                                {post.comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)} publicaciones
                            </p>
                        )}
                    </div>
                </div>

                {/* Comments List - Scrollable Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32 overscroll-contain">
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
                        <div className="h-[50vh] flex flex-col items-center justify-center opacity-40 gap-4">
                            <span className="material-symbols-outlined text-6xl font-thin">rate_review</span>
                            <div className="text-center">
                                <p className="text-sm font-bold">Sé el primero</p>
                                <p className="text-xs">Comparte tu bendición</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Input Area - Fixed Bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-brand-silk dark:bg-[#121212]/95 backdrop-blur-xl border-t border-brand-obsidian/5 dark:border-white/5 transition-all z-50 flex flex-col shadow-[0_-5px_30px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)]">

                    {/* Replying To Indicator (Stacked & Animated) */}
                    {replyTo && (
                        <div className="w-full bg-brand-obsidian/5 dark:bg-white/5 px-6 py-2 flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in border-b border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-2 text-xs text-brand-obsidian/60 dark:text-white/60 truncate max-w-[85%]">
                                <span className="material-symbols-outlined text-sm rotate-180 shrink-0">reply</span>
                                <span className="truncate">Respondiendo a <span className="font-bold text-brand-primary">{replyTo.userName}</span></span>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 shrink-0">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    )}

                    <div className="p-4 flex items-end gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-obsidian/10 shrink-0 border border-brand-obsidian/5">
                            <SmartImage src={user.avatar_url} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 relative bg-white dark:bg-white/5 rounded-[1.5rem] border border-brand-obsidian/5 transition-all focus-within:ring-2 focus-within:ring-brand-primary/50 focus-within:scale-[1.01] overflow-hidden flex items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={replyTo ? `Escribe tu respuesta...` : `Agrega un comentario...`}
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
        </div>,
        document.body
    );
};
