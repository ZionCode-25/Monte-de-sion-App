import React from 'react';

interface Toast {
    id: number;
    msg: string;
}

interface ToastNotificationsProps {
    toasts: Toast[];
}

export const ToastNotifications: React.FC<ToastNotificationsProps> = ({ toasts }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className="bg-brand-obsidian text-white px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3">
                    <span className="material-symbols-outlined text-brand-primary">check_circle</span>
                    <span className="font-bold text-xs uppercase tracking-widest">{t.msg}</span>
                </div>
            ))}
        </div>
    );
};
