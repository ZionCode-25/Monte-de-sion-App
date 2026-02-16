import React, { useState, useEffect } from 'react';

const OfflineNotice: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed bottom-24 left-6 right-6 z-[2000] animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 dark:border-black/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-red-500">wifi_off</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm leading-tight">Sin Conexión</h4>
                        <p className="text-[10px] opacity-70 uppercase tracking-wider font-medium">Revisa tu internet</p>
                    </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            </div>
        </div>
    );
};

export default OfflineNotice;
