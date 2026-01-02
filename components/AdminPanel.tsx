
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './context/AuthContext';
import {
  NewsItem,
  EventItem,
  Profile
} from '../types';

// --- TYPES ---

import MinistryManager from './MinistryManager';
import { AppRole } from '../types';

type AdminModule = 'dashboard' | 'news' | 'events' | 'users' | 'settings' | 'my-ministry';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeModule: AdminModule;
  onModuleChange: (m: AdminModule) => void;
  showHelp: boolean;
  toggleHelp: () => void;
}

interface UserStat {
  label: string;
  value: string;
  icon: string;
  color: string;
  helpText: string;
}

// --- SUB-COMPONENTS ---

const HelpTooltip: React.FC<{ text: string; show: boolean }> = ({ text, show }) => {
  if (!show) return null;
  return (
    <div className="absolute z-50 -top-2 left-full ml-3 w-48 bg-brand-obsidian text-white text-[10px] p-2 rounded-lg shadow-xl border border-white/10 animate-in fade-in slide-in-from-left-2">
      <div className="absolute top-3 -left-1 w-2 h-2 bg-brand-obsidian rotate-45 border-l border-b border-white/10"></div>
      <span className="font-bold text-brand-primary block mb-1">AYUDA</span>
      {text}
    </div>
  );
};

const SidebarItem: React.FC<{
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 group relative
      ${isActive
        ? 'bg-brand-primary text-brand-obsidian'
        : 'text-brand-obsidian/60 dark:text-white/60 hover:bg-brand-obsidian/5 dark:hover:bg-white/5 hover:text-brand-obsidian dark:hover:text-white'
      }`}
  >
    <span className={`material-symbols-outlined text-xl transition-transform group-hover:scale-110 ${isActive ? 'font-bold' : ''}`}>{icon}</span>
    <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'translate-x-1' : ''} transition-transform`}>{label}</span>
    {isActive && (
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-brand-obsidian dark:bg-white"></div>
    )}
  </button>
);

const SectionHeader: React.FC<{
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  showHelp: boolean;
  helpText: string;
}> = ({ title, subtitle, actionLabel, onAction, showHelp, helpText }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
    <div className="relative">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-[2px] bg-brand-primary"></div>
        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Administración</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter leading-none">{title}</h2>
      <p className="text-brand-obsidian/50 dark:text-white/40 text-sm mt-4 font-light max-w-md border-l-2 border-brand-obsidian/10 dark:border-white/10 pl-4">
        {subtitle}
      </p>
      <HelpTooltip text={helpText} show={showHelp} />
    </div>
    {actionLabel && (
      <button
        onClick={onAction}
        className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-8 py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3 hover:bg-opacity-90 group relative"
      >
        <span className="material-symbols-outlined text-base font-black group-hover:rotate-90 transition-transform">add_circle</span>
        {actionLabel}
        <div className="absolute -inset-1 bg-brand-primary/20 rounded-[1.4rem] opacity-0 group-hover:opacity-100 transition-opacity blur-sm -z-10"></div>
      </button>
    )}
  </div>
);

// --- MAIN COMPONENT ---

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [showHelp, setShowHelp] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // --- LOCAL STATE FOR MODALS ---
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Forms
  const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({});
  const [eventForm, setEventForm] = useState<Partial<EventItem>>({});

  // Media
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Filters
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // --- HELPERS ---
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const resetMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `images/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      triggerToast('Error al subir imagen');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // --- QUERIES ---

  const { data: news = [] } = useQuery({
    queryKey: ['admin-news'],
    queryFn: async () => {
      const { data } = await supabase.from('news').select('*, author:profiles(name)').order('created_at', { ascending: false });
      return (data || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        imageUrl: n.image_url || '',
        category: n.category,
        date: new Date(n.created_at).toLocaleDateString(),
        priority: n.priority,
        author: n.author?.name || 'Admin'
      })) as NewsItem[];
    },
    enabled: !!user
  });

  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
      return (data || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        location: e.location,
        imageUrl: e.image_url || '',
        category: e.category,
        isFeatured: e.priority, // Map DB priority to UI isFeatured
        priority: e.priority
      })) as EventItem[];
    },
    enabled: !!user
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').order('joined_date', { ascending: false });
      return (data || []) as Profile[];
    },
    enabled: !!user && activeModule === 'users'
  });

  const { data: userCount = 0 } = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      return count || 0;
    },
    enabled: !!user
  });

  const { data: settings = {} } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data } = await supabase.from('app_settings').select('*');
      const map: Record<string, any> = {};
      data?.forEach((item: any) => map[item.key] = item.value);
      return map;
    },
    enabled: !!user
  });

  // --- MUTATIONS (Optimistic) ---

  const saveNewsMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingNews) return supabase.from('news').update(data).eq('id', editingNews.id);
      return supabase.from('news').insert(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['latestNews'] });
      triggerToast(editingNews ? "Noticia actualizada" : "Noticia creada");
      setIsCreatingNews(false);
      resetMedia();
    },
    onError: () => triggerToast("Error al guardar noticia")
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => supabase.from('news').delete().eq('id', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      triggerToast("Noticia eliminada");
    }
  });

  const saveEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data };
      if ('isFeatured' in payload) {
        payload.priority = payload.isFeatured;
        delete payload.isFeatured;
      }
      if (editingEvent) return supabase.from('events').update(payload).eq('id', editingEvent.id);
      return supabase.from('events').insert(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['nextEvent'] });
      triggerToast(editingEvent ? "Evento actualizado" : "Evento creado");
      setIsCreatingEvent(false);
      resetMedia();
    },
    onError: () => triggerToast("Error al guardar evento")
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => supabase.from('events').delete().eq('id', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      triggerToast("Evento eliminado");
    }
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: string }) => {
      return supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      triggerToast("Rol de usuario actualizado");
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: any }) => {
      return supabase.from('app_settings').upsert({ key, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      triggerToast("Configuración guardada");
    }
  });

  // --- RENDERERS ---

  const Sidebar = () => (
    <div className="w-full md:w-72 bg-white dark:bg-brand-surface border-r border-brand-obsidian/5 dark:border-white/5 flex flex-col h-[100dvh] sticky top-0 md:min-h-screen z-40">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-4 text-brand-obsidian dark:text-white mb-2">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-obsidian">
            <span className="material-symbols-outlined font-black">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg leading-none">Panel Admin</h1>
            <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mt-1">Monte de Sión</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <p className="px-6 text-[10px] font-black text-brand-obsidian/30 dark:text-white/30 uppercase tracking-widest mb-4">Módulos</p>
        <SidebarItem icon="dashboard" label="Dashboard" isActive={activeModule === 'dashboard'} onClick={() => setActiveModule('dashboard')} />
        <SidebarItem icon="newspaper" label="Noticias" isActive={activeModule === 'news'} onClick={() => setActiveModule('news')} />
        <SidebarItem icon="calendar_today" label="Agenda" isActive={activeModule === 'events'} onClick={() => setActiveModule('events')} />
        <SidebarItem icon="diversity_3" label="Mi Ministerio" isActive={activeModule === 'my-ministry'} onClick={() => setActiveModule('my-ministry')} />
        <SidebarItem icon="group" label="Comunidad" isActive={activeModule === 'users'} onClick={() => setActiveModule('users')} />
        <div className="my-4 h-px bg-brand-obsidian/5 dark:bg-white/5 mx-6"></div>
        <SidebarItem icon="settings" label="Ajustes" isActive={activeModule === 'settings'} onClick={() => setActiveModule('settings')} />
      </div>

      <div className="p-6 border-t border-brand-obsidian/5 dark:border-white/5">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-xs font-bold uppercase tracking-widest
            ${showHelp ? 'bg-amber-100 text-amber-600' : 'bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white hover:bg-brand-primary/20'}`}
        >
          <span className="material-symbols-outlined text-sm">{showHelp ? 'lightbulb' : 'help'}</span>
          {showHelp ? 'Ocultar Ayuda' : 'Ver Ayuda'}
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto p-6 md:p-12">
      <SectionHeader title="Dashboard" subtitle="Visión general de la actividad de la iglesia." showHelp={showHelp} helpText="Aquí tienes un resumen rápido. Usa los accesos directos arriba para navegar." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { l: 'Miembros', v: userCount, i: 'group', c: 'bg-brand-primary' },
          { l: 'Eventos', v: events.length, i: 'event', c: 'bg-emerald-400' },
          { l: 'Noticias', v: news.length, i: 'article', c: 'bg-rose-400' },
          { l: 'V. App', v: '1.2.0', i: 'smartphone', c: 'bg-indigo-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-brand-surface p-6 rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:translate-y-[-4px] transition-transform duration-300 relative group overflow-hidden">
            <div className={`w-12 h-12 rounded-2xl ${s.c} flex items-center justify-center text-brand-obsidian mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-xl font-black">{s.i}</span>
            </div>
            <h3 className="text-3xl font-black text-brand-obsidian dark:text-white tracking-tighter">{s.v}</h3>
            <p className="text-[10px] font-bold text-brand-obsidian/40 dark:text-white/40 uppercase tracking-widest">{s.l}</p>
            {/* Gloss effect */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] border border-brand-obsidian/5 dark:border-white/5 relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-brand-obsidian dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500">campaign</span>
              Últimas Noticias
            </h3>
            <button onClick={() => setActiveModule('news')} className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Ver Todo</button>
          </div>
          <div className="space-y-4">
            {news.slice(0, 3).map((n, i) => (
              <div key={i} className="flex gap-4 p-3 bg-brand-silk dark:bg-white/5 rounded-2xl items-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setActiveModule('news')}>
                <img src={n.imageUrl || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-lg object-cover bg-gray-200" alt="" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-brand-obsidian dark:text-white truncate">{n.title}</h4>
                  <p className="text-[10px] opacity-50 truncate">{n.date}</p>
                </div>
              </div>
            ))}
          </div>
          <HelpTooltip text="Tus noticias más recientes. Haz clic en 'Ver Todo' para gestionar." show={showHelp} />
        </div>

        <div className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] border border-brand-obsidian/5 dark:border-white/5 relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-brand-obsidian dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">calendar_month</span>
              Próximos Eventos
            </h3>
            <button onClick={() => setActiveModule('events')} className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Ver Todo</button>
          </div>
          <div className="space-y-4">
            {events.slice(0, 3).map((e, i) => (
              <div key={i} className="flex gap-4 p-3 bg-brand-silk dark:bg-white/5 rounded-2xl items-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setActiveModule('events')}>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <span className="text-[8px] font-black uppercase">{e.date.split('/')[0]}</span>
                  <span className="text-[8px] font-bold">{e.date.split('/')[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-brand-obsidian dark:text-white truncate">{e.title}</h4>
                  <p className="text-[10px] opacity-50 truncate">{e.location}</p>
                </div>
              </div>
            ))}
          </div>
          <HelpTooltip text="Eventos cercanos. Mantén la agenda actualizada para la congregación." show={showHelp} />
        </div>
      </div>
    </div>
  );

  const renderNewsModule = () => (
    <div className="max-w-7xl mx-auto p-6 md:p-12">
      <SectionHeader
        title="Noticias"
        subtitle="Administra anuncios y devocionales."
        actionLabel="Nueva Noticia"
        onAction={() => {
          setEditingNews(null);
          setNewsForm({ priority: false, category: 'General' });
          resetMedia();
          setIsCreatingNews(true);
        }}
        showHelp={showHelp}
        helpText="Crea contenido relevante. Las imágenes de alta calidad generan más interacción."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map(n => (
          <div key={n.id} className="group bg-white dark:bg-brand-surface rounded-[2.5rem] overflow-hidden border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
            <div className="h-48 relative overflow-hidden bg-gray-100">
              <img src={n.imageUrl || 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest text-brand-obsidian shadow-sm">
                {n.category}
              </div>
              {n.priority && (
                <div className="absolute top-4 right-4 bg-rose-500 text-white rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px]">priority_high</span> Prioridad
                </div>
              )}
            </div>
            <div className="p-6">
              <h4 className="font-bold text-brand-obsidian dark:text-white text-lg mb-2 leading-tight line-clamp-2 min-h-[3rem]">{n.title}</h4>
              <p className="text-xs text-brand-obsidian/50 dark:text-white/40 line-clamp-3 mb-4">{n.content}</p>

              <div className="flex gap-2 pt-4 border-t border-brand-obsidian/5 dark:border-white/5">
                <button
                  onClick={() => {
                    setEditingNews(n);
                    setNewsForm(n);
                    setMediaPreview(n.imageUrl || null);
                    setIsCreatingNews(true);
                  }}
                  className="flex-1 py-3 rounded-xl bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-brand-obsidian transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => { if (confirm('¿Eliminar?')) deleteNewsMutation.mutate(n.id) }}
                  className="w-12 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {news.length === 0 && <div className="text-center py-20 opacity-40 italic">No hay noticias. ¡Crea la primera!</div>}
    </div>
  );

  const renderEventsModule = () => (
    <div className="max-w-7xl mx-auto p-6 md:p-12">
      <SectionHeader
        title="Agenda"
        subtitle="Organiza los eventos del Reino."
        actionLabel="Nuevo Evento"
        onAction={() => {
          setEditingEvent(null);
          setEventForm({ isFeatured: false, category: 'Celebración' });
          resetMedia();
          setIsCreatingEvent(true);
        }}
        showHelp={showHelp}
        helpText="Los eventos destacados aparecen primero en la App. Incluye ubicación precisa."
      />

      <div className="space-y-4">
        {events.map(e => (
          <div key={e.id} className="group flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-brand-surface rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-lg transition-all">
            <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 relative bg-gray-100">
              <img src={e.imageUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-brand-primary/20 flex flex-col items-center justify-center text-white backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xl font-black shadow-black drop-shadow-lg">{e.date.split('/')[0]}</span>
                <span className="text-xs font-bold uppercase shadow-black drop-shadow-lg">{new Date(2024, parseInt(e.date.split('/')[1]) - 1).toLocaleString('es-ES', { month: 'short' })}</span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 justify-center md:justify-start">
                {e.isFeatured && <span className="inline-block px-2 py-1 bg-amber-100 text-amber-600 rounded-md text-[9px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">Destacado</span>}
                <span className="text-[10px] text-brand-primary font-black uppercase tracking-widest">{e.category} | {e.time}</span>
              </div>
              <h3 className="text-xl font-bold text-brand-obsidian dark:text-white mb-1">{e.title}</h3>
              <p className="text-sm opacity-60 flex items-center justify-center md:justify-start gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span> {e.location}
              </p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => {
                  setEditingEvent(e);
                  setEventForm(e);
                  setMediaPreview(e.imageUrl || null);
                  setIsCreatingEvent(true);
                }}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-brand-obsidian transition-colors">
                Editar
              </button>
              <button
                onClick={() => { if (confirm('¿Borrar?')) deleteEventMutation.mutate(e.id) }}
                className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      {events.length === 0 && <div className="text-center py-20 opacity-40 italic">Sin eventos programados.</div>}
    </div>
  );

  const renderUsersModule = () => (
    <div className="max-w-7xl mx-auto p-6 md:p-12">
      <SectionHeader title="Comunidad" subtitle="Gestiona roles y usuarios." showHelp={showHelp} helpText="Solo cambia roles si es estrictamente necesario. Los cambios son inmediatos." />

      <div className="bg-white dark:bg-brand-surface rounded-[3rem] p-8 border border-brand-obsidian/5 dark:border-white/5 overflow-hidden">
        <div className="flex items-center gap-4 bg-brand-silk dark:bg-white/5 p-4 rounded-2xl mb-8">
          <span className="material-symbols-outlined opacity-50">search</span>
          <input
            type="text"
            placeholder="Buscar persona..."
            className="bg-transparent border-none text-sm w-full focus:ring-0 text-brand-obsidian dark:text-white placeholder:text-brand-obsidian/30 dark:placeholder:text-white/30"
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-obsidian/5 dark:border-white/5 text-[9px] uppercase tracking-widest font-black opacity-50">
                <th className="p-4 pl-6">Usuario</th>
                <th className="p-4">Email</th>
                <th className="p-4">Rol App</th>
                <th className="p-4">Fecha</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {allUsers.filter(u => u.name?.toLowerCase().includes(userSearchTerm.toLowerCase())).map(u => (
                <tr key={u.id} className="border-b border-brand-obsidian/5 dark:border-white/5 hover:bg-brand-silk dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 pl-6 font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-xs">
                      {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-full object-cover" /> : u.name?.charAt(0)}
                    </div>
                    {u.name}
                  </td>
                  <td className="p-4 opacity-70">{u.email}</td>
                  <td className="p-4">
                    <select
                      value={u.role || 'USER'}
                      onChange={(e) => updateUserRoleMutation.mutate({ userId: u.id, newRole: e.target.value as AppRole })}
                      className="bg-transparent border border-brand-obsidian/10 dark:border-white/10 rounded-lg py-1 px-2 text-xs font-bold focus:ring-brand-primary"
                    >
                      <option value="USER">Usuario</option>
                      <option value="MODERATOR">Moderador</option>
                      <option value="MINISTRY_LEADER">Líder Min.</option>
                      <option value="PASTOR">Pastor</option>
                      <option value="SUPER_ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 opacity-50 text-xs">{new Date(u.joined_date || '').toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettingsModule = () => (
    <div className="max-w-5xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <SectionHeader title="Ajustes" subtitle="Configuración global del sistema." showHelp={showHelp} helpText="Cuidado: los cambios aquí afectan a toda la aplicación." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SYSTEM TOGGLES */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] border border-brand-obsidian/5 dark:border-white/5 relative overflow-hidden group">
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg text-brand-obsidian dark:text-white">Modo Mantenimiento</h4>
                <p className="text-xs opacity-60 mt-1 max-w-[200px]">Cierra la app para todos los usuarios excepto admins.</p>
              </div>
              <button
                onClick={() => updateSettingMutation.mutate({ key: 'maintenance_mode', value: !settings.maintenance_mode })}
                className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${settings.maintenance_mode ? 'bg-rose-500' : 'bg-gray-200 dark:bg-white/10'}`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.maintenance_mode ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 text-9xl text-brand-obsidian/5 dark:text-white/5 group-hover:scale-110 transition-transform pointer-events-none">
              <span className="material-symbols-outlined">build</span>
            </div>
          </div>

          <div className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] border border-brand-obsidian/5 dark:border-white/5 relative overflow-hidden group">
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg text-brand-obsidian dark:text-white">Notificaciones Globales</h4>
                <p className="text-xs opacity-60 mt-1 max-w-[200px]">Envía alertas automáticas a dispositivos.</p>
              </div>
              <button
                onClick={() => updateSettingMutation.mutate({ key: 'global_notifications', value: !settings.global_notifications })}
                className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${settings.global_notifications ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-white/10'}`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.global_notifications ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 text-9xl text-brand-obsidian/5 dark:text-white/5 group-hover:scale-110 transition-transform pointer-events-none">
              <span className="material-symbols-outlined">notifications</span>
            </div>
          </div>
        </div>

        {/* WEEKLY ACTIVITIES EDITOR */}
        <div className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] border border-brand-obsidian/5 dark:border-white/5 md:col-span-2">
          <h4 className="font-bold text-xl text-brand-obsidian dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-brand-primary">calendar_clock</span>
            Actividades Semanales (Sección 'Nosotros')
          </h4>

          <div className="space-y-3">
            {((settings?.weekly_activities as any[]) || []).map((activity: any, idx: number) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 bg-brand-silk dark:bg-white/5 p-3 rounded-xl animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${idx * 50}ms` }}>
                <input
                  className="flex-1 bg-white dark:bg-black/20 p-3 rounded-lg text-xs font-bold border-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="Día (ej. Lunes)"
                  value={activity.d}
                  onChange={(e) => {
                    const n = [...(settings?.weekly_activities || [])];
                    n[idx].d = e.target.value;
                    updateSettingMutation.mutate({ key: 'weekly_activities', value: n });
                  }}
                />
                <input
                  className="w-full md:w-32 bg-white dark:bg-black/20 p-3 rounded-lg text-xs border-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="Hora (20:00)"
                  value={activity.t}
                  onChange={(e) => {
                    const n = [...(settings?.weekly_activities || [])];
                    n[idx].t = e.target.value;
                    updateSettingMutation.mutate({ key: 'weekly_activities', value: n });
                  }}
                />
                <input
                  className="flex-[2] bg-white dark:bg-black/20 p-3 rounded-lg text-xs border-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="Actividad"
                  value={activity.a}
                  onChange={(e) => {
                    const n = [...(settings?.weekly_activities || [])];
                    n[idx].a = e.target.value;
                    updateSettingMutation.mutate({ key: 'weekly_activities', value: n });
                  }}
                />
                <button
                  onClick={() => {
                    const n = [...(settings?.weekly_activities || [])];
                    n.splice(idx, 1);
                    updateSettingMutation.mutate({ key: 'weekly_activities', value: n });
                  }}
                  className="p-3 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              const n = [...(settings?.weekly_activities || [])];
              n.push({ d: '', t: '', a: '' });
              updateSettingMutation.mutate({ key: 'weekly_activities', value: n });
            }}
            className="mt-6 w-full py-4 border-2 border-dashed border-brand-obsidian/10 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-obsidian/40 dark:text-white/40 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">add</span>
            Agregar Actividad
          </button>
        </div>
      </div>
    </div>
  );

  // --- RENDER MODALS ---
  // (Simplified for brevity, but styled professionally)
  const NewsModal = () => isCreatingNews && (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsCreatingNews(false)}>
      <div className="bg-white dark:bg-brand-surface w-full max-w-2xl rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-200 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-brand-obsidian dark:text-white mb-6">Administrar Noticia</h3>
        <div className="space-y-4">
          <input className="w-full bg-brand-silk dark:bg-white/5 p-4 rounded-xl font-bold" placeholder="Título" value={newsForm.title || ''} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} />
          <textarea className="w-full bg-brand-silk dark:bg-white/5 p-4 rounded-xl min-h-[150px]" placeholder="Contenido" value={newsForm.content || ''} onChange={e => setNewsForm({ ...newsForm, content: e.target.value })} />
          <div className="flex gap-4">
            <input type="file" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="text-xs" />
            {mediaPreview && <img src={mediaPreview} className="w-16 h-16 rounded-lg object-cover" />}
          </div>
          <button onClick={handleSaveNews} disabled={isUploading} className="w-full py-4 bg-brand-primary text-brand-obsidian font-black uppercase tracking-widest rounded-xl hover:opacity-90">{isUploading ? 'Subiendo...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );

  // Reusing file select logic
  const handleFileSelect = async (file: File) => {
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }
  const handleSaveNews = async () => {
    let url = newsForm.imageUrl;
    if (mediaFile) {
      const up = await uploadImage(mediaFile);
      if (up) url = up;
    }
    saveNewsMutation.mutate({ ...newsForm, image_url: url });
  }

  // --- MAIN RENDER ---

  return (
    <div className="flex min-h-screen bg-brand-silk dark:bg-brand-obsidian font-sans selection:bg-brand-primary selection:text-brand-obsidian">
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-brand-obsidian text-white px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in flex items-center gap-3">
          <span className="material-symbols-outlined text-brand-primary">check_circle</span>
          <span className="text-sm font-bold">{showToast}</span>
        </div>
      )}

      {/* Side Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen scroll-smooth">
        {activeModule === 'dashboard' && renderDashboard()}
        {activeModule === 'news' && renderNewsModule()}
        {activeModule === 'events' && renderEventsModule()}
        {activeModule === 'my-ministry' && <MinistryManager />}
        {activeModule === 'users' && renderUsersModule()}
        {activeModule === 'settings' && renderSettingsModule()}
      </main>

      {/* Modals */}
      <NewsModal />
      {/* Similar structure for EventModal would go here, omitted for length conservation but logical equivalent exists in real app */}
      {isCreatingEvent && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsCreatingEvent(false)}>
          <div className="bg-white dark:bg-brand-surface w-full max-w-2xl rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-brand-obsidian dark:text-white mb-6">Administrar Evento</h3>
            <div className="space-y-4">
              <input className="w-full bg-brand-silk dark:bg-white/5 p-4 rounded-xl font-bold" placeholder="Título" value={eventForm.title || ''} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="p-4 rounded-xl bg-brand-silk dark:bg-white/5" value={eventForm.date || ''} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                <input type="time" className="p-4 rounded-xl bg-brand-silk dark:bg-white/5" value={eventForm.time || ''} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} />
              </div>
              <input className="w-full bg-brand-silk dark:bg-white/5 p-4 rounded-xl" placeholder="Ubicación" value={eventForm.location || ''} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} />
              <div className="flex gap-4 items-center">
                <input type="file" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="text-xs" />
                {mediaPreview && <img src={mediaPreview} className="w-16 h-16 rounded-lg object-cover" />}
              </div>
              <button onClick={async () => {
                let url = eventForm.imageUrl;
                if (mediaFile) {
                  const up = await uploadImage(mediaFile);
                  if (up) url = up;
                }
                saveEventMutation.mutate({ ...eventForm, image_url: url });
              }} disabled={isUploading} className="w-full py-4 bg-brand-primary text-brand-obsidian font-black uppercase tracking-widest rounded-xl hover:opacity-90">{isUploading ? 'Subiendo...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;