import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../components/context/AuthContext';
import { AppNotification } from '../../types';

interface Props {
  onBack: () => void;
}

const NotificationsView: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((n) => ({
        ...n, // Spread all DB fields including user_id, is_read, etc.
        date: new Date(n.created_at).toLocaleDateString(), // Add formatting helper if needed, but AppNotification should ideally not enforce it if it's purely DB + UI extras.
        // Actually, if AppNotification extends Tables<'notifications'>, it has 'created_at'.
        // We'll add 'date' as an extra UI prop by casting.
      })) as (AppNotification & { date: string })[];
    },
    enabled: !!user?.id
  });

  // Mark as Read Mutation
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark All as Read
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="bg-brand-silk dark:bg-brand-obsidian min-h-screen animate-in slide-in-from-bottom duration-500 pb-40">

      {/* Header Estético */}
      <header className="px-8 pt-12 pb-8 flex items-end justify-between sticky top-0 bg-brand-silk/80 dark:bg-brand-obsidian/80 backdrop-blur-xl z-[120] border-b border-brand-obsidian/5 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.4em]">Actividad</span>
            <div className="w-8 h-[1px] bg-brand-primary/30"></div>
          </div>
          <h2 className="text-4xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter leading-none">
            Tu Centro <br />de <span className="gold-text-gradient italic">Mensajes</span>
          </h2>
        </div>

        <button
          onClick={onBack}
          className="w-12 h-12 bg-brand-obsidian/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-brand-obsidian dark:text-white active:scale-90 transition-all border border-brand-obsidian/5 dark:border-white/5"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <div className="px-6 py-8 flex flex-col gap-5">

        {/* Quick Filter / Summary */}
        <div className="flex items-center justify-between px-2 mb-2">
          <p className="text-[10px] font-black text-brand-obsidian/40 dark:text-white/30 uppercase tracking-[0.2em]">
            {unreadCount > 0 ? `Tienes ${unreadCount} avisos nuevos` : 'Todo al día'}
          </p>
          {unreadCount > 0 && (
            <button
              onClick={() => clearAllMutation.mutate()}
              className="text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
            >
              Marcar todo leído
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary/20 mb-6 border-2 border-brand-primary/10 animate-pulse">
              <span className="material-symbols-outlined text-5xl">notifications_off</span>
            </div>
            <h4 className="text-xl font-serif font-bold text-brand-obsidian dark:text-white/60">Silencio y Paz</h4>
            <p className="text-brand-obsidian/30 dark:text-white/20 text-sm mt-2 max-w-[200px] font-light">No hay nuevas notificaciones por el momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {notifications.map((notif, idx) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markReadMutation.mutate(notif.id)}
                className={`group p-6 rounded-[2.5rem] border transition-all duration-500 flex gap-5 items-start animate-reveal cursor-pointer ${notif.is_read
                  ? 'bg-white/40 dark:bg-white/[0.02] border-brand-obsidian/5 dark:border-white/5 opacity-60'
                  : 'bg-white dark:bg-brand-surface border-brand-primary/20 shadow-xl shadow-brand-primary/5 dark:shadow-none'
                  }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Icon Circle */}
                <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center shadow-inner ${notif.type === 'system' ? 'bg-indigo-500/10 text-indigo-500' :
                    notif.type === 'event' ? 'bg-emerald-500/10 text-emerald-500' :
                      notif.type === 'like' ? 'bg-rose-500/10 text-rose-500' :
                        'bg-brand-primary/10 text-brand-primary' // Default/Comment
                  }`}>
                  <span className="material-symbols-outlined text-2xl fill-1">
                    {notif.type === 'system' ? 'notifications' :
                      notif.type === 'event' ? 'event_available' :
                        notif.type === 'like' ? 'favorite' :
                          'chat_bubble'}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className={`text-base leading-tight tracking-tight ${notif.is_read ? 'font-medium text-brand-obsidian/70 dark:text-white/60' : 'font-bold text-brand-obsidian dark:text-white'}`}>
                      {notif.title}
                    </h4>
                    {!notif.is_read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shadow-[0_0_12px_#ffb700] shrink-0 mt-1 animate-pulse"></div>
                    )}
                  </div>
                  <p className="text-sm text-brand-obsidian/50 dark:text-white/40 leading-relaxed font-light line-clamp-2">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[9px] font-black text-brand-obsidian/30 dark:text-white/20 uppercase tracking-[0.2em]">{notif.date}</span>
                    {!notif.is_read && (
                      <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/5 px-3 py-1 rounded-full border border-brand-primary/10">Nuevo</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Center Footer */}
        <div className="mt-12 space-y-4">
          <div className="bg-brand-obsidian dark:bg-brand-surface rounded-[3rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/10 blur-3xl rounded-full transition-all group-hover:scale-150"></div>
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-brand-obsidian">
                <span className="material-symbols-outlined">settings_suggest</span>
              </div>
              <div>
                <h5 className="text-white font-bold text-sm tracking-tight">Preferencias de Avisos</h5>
                <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mt-1">Personalizar mi Feed</p>
              </div>
              <button className="ml-auto text-brand-primary">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsView;
