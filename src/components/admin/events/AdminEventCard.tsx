import React from 'react';
import { EventItem } from '../../../types';
import { SmartImage } from '../../ui/SmartImage';
import { formatDateForDisplay, formatTimeForDisplay, getMonthName, getDayNumber } from '../../../utils/dateUtils';

interface AdminEventCardProps {
    event: EventItem;
    onEdit: (event: EventItem) => void;
    onDelete: (id: string) => void;
}

export const AdminEventCard: React.FC<AdminEventCardProps> = ({ event, onEdit, onDelete }) => {
    return (
        <div
            className="group bg-white dark:bg-brand-surface rounded-[2rem] overflow-hidden border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full relative"
            style={{ borderTop: `4px solid ${event.color || '#ffb700'}` }}
        >
            {/* Image Header */}
            <div className="aspect-[16/9] bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                <SmartImage
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                <div className="absolute top-3 right-3 flex gap-2">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-xs text-brand-primary">schedule</span>
                        <span className="text-[10px] font-bold tracking-wider">{formatTimeForDisplay(event.time)}</span>
                    </div>
                    {event.isFeatured && (
                        <div className="bg-amber-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm" title="Destacado">
                            <span className="material-symbols-outlined text-[14px]">star</span>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-3 left-3 flex items-end">
                    <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl p-2 text-center min-w-[3.5rem] shadow-lg">
                        <span className="block text-xl font-black text-brand-obsidian dark:text-white leading-none">
                            {getDayNumber(event.date)}
                        </span>
                        <span className="block text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: event.color || '#ffb700' }}>
                            {getMonthName(event.date)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-1">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest">
                        {event.category}
                    </span>
                </div>

                <h3 className="font-bold text-lg leading-tight text-brand-obsidian dark:text-white mb-2 line-clamp-2">
                    {event.title}
                </h3>

                <div className="flex items-start gap-1.5 mb-3 opacity-60">
                    <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">location_on</span>
                    <p className="text-xs font-medium leading-snug line-clamp-1">{event.location}</p>
                </div>

                <p className="text-xs text-brand-obsidian/50 dark:text-white/50 mb-4 line-clamp-2 leading-relaxed">
                    {event.description}
                </p>

                {/* Footer Actions */}
                <div className="mt-auto pt-4 border-t border-brand-obsidian/5 dark:border-white/5 flex gap-2">
                    <button
                        onClick={() => onEdit(event)}
                        className="flex-1 py-2.5 rounded-xl bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-obsidian dark:hover:bg-brand-primary hover:text-white dark:hover:text-brand-obsidian transition-all border border-transparent hover:border-brand-obsidian/10"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => { if (confirm('¿Seguro que deseas eliminar este evento?')) onDelete(event.id); }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all hover:rotate-12 hover:scale-110"
                        title="Eliminar"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
