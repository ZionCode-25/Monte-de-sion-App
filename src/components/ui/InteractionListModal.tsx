import React from 'react';
import { createPortal } from 'react-dom';
import { PrayerInteraction } from '../types';

interface InteractionListModalProps {
    interactions: PrayerInteraction[];
    onClose: () => void;
    onUserClick: (userId: string) => void;
    title?: string;
}

const InteractionListModal: React.FC<InteractionListModalProps> = ({
    interactions,
    onClose,
    onUserClick,
    title = "Interacciones"
}) => {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-brand-obsidian/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-brand-surface w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-slideUp">

                {/* Header */}
                <div className="px-6 py-4 border-b border-brand-obsidian/5 dark:border-white/5 flex justify-between items-center bg-brand-silk/50 dark:bg-black/20">
                    <h3 className="text-lg font-bold text-brand-obsidian dark:text-white font-serif">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-brand-obsidian/5 dark:bg-white/10 flex items-center justify-center text-brand-obsidian dark:text-white hover:bg-brand-obsidian/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>

                {/* List */}
                <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                    {interactions.length === 0 ? (
                        <div className="text-center py-8 text-brand-obsidian/40 dark:text-white/40 italic">
                            Sin interacciones aún
                        </div>
                    ) : (
                        interactions.map((interaction) => (
                            <div
                                key={interaction.id}
                                onClick={() => onUserClick(interaction.user_id)}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-obsidian/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                                    {interaction.user.avatar_url ? (
                                        <img
                                            src={interaction.user.avatar_url}
                                            alt={interaction.user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-brand-primary font-bold text-sm">
                                            {interaction.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-brand-obsidian dark:text-white text-sm truncate">
                                        {interaction.user.name}
                                    </p>
                                    <p className="text-[10px] text-brand-obsidian/40 dark:text-white/40 font-bold uppercase tracking-wider">
                                        {new Date(interaction.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Type Icon */}
                                <div className="text-brand-primary">
                                    {interaction.interaction_type === 'amen' ? (
                                        <span className="material-symbols-outlined text-[20px]" title="Dijo Amén">favorite</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-[20px]" title="Está Intercediendo">check_circle</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default InteractionListModal;
