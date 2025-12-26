import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Post, User, Comment } from '../../types';
import { SmartImage } from '../ui/SmartImage';
import { useToggleCommentLike, useDeleteComment, useEditComment } from '../../src/hooks/usePosts';

// Debug logging to verify module resolution
console.log("CommentsModal Loaded. Hooks available:", { useDeleteComment: !!useDeleteComment });

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

                {/* Like Heart */}
                <button
                    onClick={(e) => { e.stopPropagation(); handleLike(); }}
                    className={`shrink-0 pt-0.5 px-2 transition-transform active:scale-75 pointer-events-auto ${isLikedLocal ? 'text-rose-500 fill-current' : 'text-brand-obsidian/20 dark:text-white/20 hover:text-rose-500/50'}`}
                >
                    <span className={`material-symbols-outlined text-[14px] ${isLikedLocal ? 'font-[500] fill-1' : ''}`}>favorite</span>
                </button>
            </div>
        </div>
    );
};

// Simple time formatter
const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'hace momentos';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    return `${Math.floor(hours / 24)} d`;
};

// --- MAIN MODAL ---
export const CommentsModal: React.FC<Props> = ({ post, onClose, user, onAddComment }) => {
    const [commentText, setCommentText] = useState('');
    const [replyTo, setReplyTo] = useState<{ id: string, userName: string, parentRootId?: string } | null>(null);
    const [mounted, setMounted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Context Menu State
    const [actionComment, setActionComment] = useState<Comment | null>(null);

    // Mutations for Edit/Delete
    const deleteMutation = useDeleteComment(user.id);
    const editMutation = useEditComment(user.id);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (replyTo && inputRef.current) {
            inputRef.current.focus();
            // If replying to a sub-reply, pre-fill mention
            if (replyTo.parentRootId) {
                setCommentText(prev => prev.startsWith('@') ? prev : `@${replyTo.userName} `);
            }
        }
    }, [replyTo]);

    if (!post || !mounted) return null;

    const handleSubmit = () => {
        if (!commentText.trim()) return;
        // Logic: If replying to a sub-reply (parentRootId exists), use That as DB parentId.
        // Otherwise use replyTo.id as parentId.
        const parentId = replyTo ? (replyTo.parentRootId || replyTo.id) : undefined;
        onAddComment(commentText, parentId);
        setCommentText('');
        setReplyTo(null);
    };

    const handleReply = (comment: Comment) => {
        // Flattening Logic:
        // If comment has a parent_id, it IS a reply. So we reply to ITS parent (the root).
        if (comment.parent_id) {
            setReplyTo({
                id: comment.id,
                userName: comment.userName,
                parentRootId: comment.parent_id
            });
        } else {
            // Root comment
            setReplyTo({
                id: comment.id,
                userName: comment.userName
            });
        }
    };

    const handleDelete = () => {
        if (actionComment && window.confirm("¿Eliminar este comentario?")) {
            deleteMutation.mutate({ commentId: actionComment.id });
            setActionComment(null);
        }
    };

    const handleEdit = () => {
        if (actionComment) {
            const newContent = prompt("Editar comentario:", actionComment.content);
            if (newContent && newContent !== actionComment.content) {
                editMutation.mutate({ commentId: actionComment.id, content: newContent });
            }
            setActionComment(null);
        }
    };

    // Z-INDEX set to very high to ensure it sits on top of everything including other modals if needed
    return createPortal(
        <div className="fixed inset-0 z-[6000] flex flex-col isolate font-sans text-brand-obsidian dark:text-white">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative mt-auto w-full max-w-2xl mx-auto h-[85vh] bg-white dark:bg-[#121212] rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden z-50">

                {/* Header */}
                <div className="shrink-0 w-full flex flex-col items-center bg-white dark:bg-[#121212] z-40 border-b border-gray-100 dark:border-white/5 pb-2">
                    <div className="w-full flex items-center justify-between px-6 pt-5 pb-1">
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 active:scale-95 transition-all text-brand-obsidian dark:text-white">
                            <span className="material-symbols-outlined font-bold">keyboard_arrow_down</span>
                        </button>
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-white/20 rounded-full" />
                        <div className="w-10"></div>
                    </div>
                    <div className="text-center pb-2">
                        <h3 className="text-lg font-bold leading-tight">Comentarios</h3>
                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">
                            Mantén presionado para opciones
                        </p>
                    </div>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32">
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
                        <div className="h-full flex flex-col items-center justify-center opacity-40 gap-4 min-h-[200px]">
                            <span className="material-symbols-outlined text-6xl font-thin">rate_review</span>
                            <div className="text-center">
                                <p className="text-sm font-bold">Sé el primero</p>
                                <p className="text-xs">Comparte tu bendición</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACTIONS SHEET (Simple Overlay) */}
                {actionComment && (
                    <div className="absolute inset-0 z-[6010] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setActionComment(null)}>
                        <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom scale-100" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-gray-100 dark:border-white/5 text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Opciones</p>
                            </div>
                            <button onClick={handleEdit} className="w-full p-4 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 font-medium">
                                <span className="material-symbols-outlined">edit</span> Editar comentario
                            </button>
                            <button onClick={handleDelete} className="w-full p-4 hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center gap-3 text-rose-500 font-medium">
                                <span className="material-symbols-outlined">delete</span> Eliminar
                            </button>
                            <div className="p-2 bg-gray-50 dark:bg-black/20">
                                <button onClick={() => setActionComment(null)} className="w-full py-3 bg-white dark:bg-white/5 rounded-xl text-sm font-bold shadow-sm">Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Input */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-gray-100 dark:border-white/5 z-50 flex flex-col shadow-[0_-5px_30px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)]">
                    {replyTo && (
                        <div className="w-full bg-gray-50 dark:bg-white/5 px-6 py-2 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-2 text-xs opacity-60 truncate max-w-[85%]">
                                <span className="material-symbols-outlined text-sm rotate-180 shrink-0">reply</span>
                                <span className="truncate">Respondiendo a <span className="font-bold">{replyTo.userName}</span></span>
                            </div>
                            <button onClick={() => { setReplyTo(null); setCommentText(''); }} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 shrink-0">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    )}

                    <div className="p-4 flex items-end gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100 dark:border-white/10">
                            <SmartImage src={user.avatar_url} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 relative bg-gray-50 dark:bg-white/5 rounded-[1.5rem] border border-gray-100 dark:border-white/5 transition-all focus-within:ring-2 focus-within:ring-brand-primary/50 overflow-hidden flex items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={replyTo ? `Escribe tu respuesta...` : `Agrega un comentario...`}
                                className="w-full bg-transparent border-none pl-5 pr-14 py-3.5 text-[15px] outline-none placeholder:opacity-50"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!commentText.trim()}
                                className={`absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-full transition-all ${commentText.trim() ? 'bg-brand-primary text-brand-obsidian shadow-md active:scale-90' : 'bg-transparent opacity-20 cursor-not-allowed'}`}
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
