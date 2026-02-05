import React from 'react';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info' }) => {
    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
        warning: 'warning'
    };

    const bgColors = {
        success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
        error: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
        info: 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary',
        warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500'
    };

    return (
        <div className={`flex items-center gap-3 px-6 py-3 rounded-full border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-md ${bgColors[type]}`}>
            <span className="material-symbols-outlined text-xl">{icons[type]}</span>
            <p className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {message}
            </p>
        </div>
    );
};
