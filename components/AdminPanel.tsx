
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './context/AuthContext';
import {
  NewsItem,
  EventItem,
  Inscription,
  Profile
} from '../types';

import MinistryManager from './MinistryManager';

type AdminModule = 'dashboard' | 'content' | 'events' | 'users' | 'inscriptions' | 'settings' | 'my-ministry';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');

  const [showToast, setShowToast] = useState<string | null>(null);

  // Modals Data
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Forms
  const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({});
  const [eventForm, setEventForm] = useState<Partial<EventItem>>({});

  // Image Upload Logic
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Search Filters
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // --- QUERIES ---

  const { data: news = [] } = useQuery({
    queryKey: ['admin-news'],
    queryFn: async () => {
      const { data } = await supabase.from('news').select('*, author:profiles(name, avatar_url)').order('created_at', { ascending: false });
      if (!data) return [];
      return data.map((n: any) => ({
        ...n, // Spread original properties to satisfy Tables<'news'>
        id: n.id,
        title: n.title,
        content: n.content,
        imageUrl: n.image_url || '',
        date: new Date(n.created_at).toLocaleDateString(),
        priority: n.priority as any,
        category: n.category,
        videoUrl: n.video_url,
        author: n.author?.name || 'Admin',
        userAvatar: n.author?.avatar_url
      })) as NewsItem[];
    },
    enabled: !!user
  });

  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
      if (!data) return [];
      return data.map((e: any) => ({
        ...e, // Spread original properties
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        location: e.location,
        imageUrl: e.image_url || '',
        category: e.category,
        isFeatured: e.is_featured,
        capacity: e.capacity
      })) as EventItem[];
    },
    enabled: !!user
  });

  const { data: inscriptions = [] } = useQuery({
    queryKey: ['admin-inscriptions'],
    queryFn: async () => {
      const { data } = await supabase.from('inscriptions')
        .select('*, user:profiles(name), ministry:ministries(name)')
        .order('created_at', { ascending: false });
      if (!data) return [];
      return data.map((i: any) => ({
        id: i.id,
        userId: i.user_id,
        userName: i.user?.name || 'Usuario',
        userEmail: 'No disponible',
        note: i.note || '',
        ministryId: i.ministry_id,
        ministryName: i.ministry?.name || 'Ministerio',
        status: i.status as any,
        date: i.created_at
      })) as Inscription[];
    },
    enabled: !!user
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('joined_date', { ascending: false });
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



  // --- MUTATIONS ---

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
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
      console.error('Error uploading image:', error);
      triggerToast('Error al subir imagen');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const saveNewsMutation = useMutation({
    mutationFn: async (newsData: any) => {
      let result;
      if (editingNews) {
        result = await supabase.from('news').update(newsData).eq('id', editingNews.id);
      } else {
        result = await supabase.from('news').insert(newsData);
      }
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['latestNews'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      triggerToast(editingNews ? "Noticia actualizada" : "Noticia publicada");
      setIsCreatingNews(false);
      resetMedia();
    },
    onError: (error: any) => {
      console.error("News Save Error:", error);
      triggerToast(error.message || "Error al guardar (Revisa consola)");
    }
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      triggerToast("Noticia eliminada");
    },
    onError: (error: any) => {
      console.error(error);
      triggerToast("Error al eliminar");
    }
  });

  const saveEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      let result;
      if (editingEvent) {
        result = await supabase.from('events').update(eventData).eq('id', editingEvent.id);
      } else {
        result = await supabase.from('events').insert(eventData);
      }
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['nextEvent'] });
      triggerToast(editingEvent ? "Evento actualizado" : "Evento agendado");
      setIsCreatingEvent(false);
      resetMedia();
    },
    onError: (error: any) => {
      console.error("Event Save Error:", error);
      triggerToast(error.message || "Error al guardar (Revisa consola)");
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      triggerToast("Evento eliminado");
    },
    onError: (error: any) => {
      console.error(error);
      triggerToast("Error al eliminar");
    }
  });

  const updateInscriptionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => {
      const { error } = await supabase.from('inscriptions').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-inscriptions'] });
      triggerToast(variables.status === 'approved' ? "Siervo aprobado" : "Solicitud declinada");
    },
    onError: () => triggerToast("Error al actualizar")
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: string }) => {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      triggerToast("Rol de usuario actualizado");
    },
    onError: () => triggerToast("Error al cambiar rol (Verifica permisos)")
  });

  const deleteInscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inscriptions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inscriptions'] });
      triggerToast("Solicitud eliminada");
    }
  });

  const clearInscriptionsMutation = useMutation({
    mutationFn: async () => {
      // Delete ALL inscriptions. Warning: Destructive.
      const { error } = await supabase.from('inscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-count'] }); // Might affect pending count
      triggerToast("Historial de solicitudes limpiado");
    },
    onError: (error: any) => {
      console.error(error);
      triggerToast("Error al limpiar historial");
    }
  });

  // --- HANDLERS ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const objectUrl = URL.createObjectURL(file);
      setMediaPreview(objectUrl);
    }
  };

  const resetMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  }

  const handleSaveNews = async () => {
    if (!newsForm.title || !newsForm.content) {
      triggerToast("Faltan campos requeridos");
      return;
    }
    let imageUrl = newsForm.imageUrl;
    if (mediaFile) {
      const url = await uploadImage(mediaFile);
      if (url) imageUrl = url;
    }

    const newsData = {
      title: newsForm.title,
      content: newsForm.content,
      image_url: imageUrl,
      category: newsForm.category,
      priority: newsForm.priority,
      author_id: user?.id
    };
    saveNewsMutation.mutate(newsData);
  };

  const handleDeleteNews = (id: string) => {
    if (confirm("¿Eliminar noticia?")) deleteNewsMutation.mutate(id);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.date) {
      triggerToast("Faltan campos requeridos");
      return;
    }
    let imageUrl = eventForm.imageUrl;
    if (mediaFile) {
      const url = await uploadImage(mediaFile);
      if (url) imageUrl = url;
    }

    const eventData = {
      title: eventForm.title,
      description: eventForm.description || '',
      date: eventForm.date,
      time: eventForm.time,
      location: eventForm.location,
      image_url: imageUrl,
      category: eventForm.category,
      is_featured: eventForm.isFeatured
    };
    saveEventMutation.mutate(eventData);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("¿Eliminar evento?")) deleteEventMutation.mutate(id);
  };

  const handleDeleteInscription = (id: string) => {
    if (confirm("¿Eliminar esta solicitud permanentemente?")) deleteInscriptionMutation.mutate(id);
  };

  const handleClearInscriptions = () => {
    if (confirm("⚠️ ¿ESTÁS SEGURO?\n\nEsto eliminará TODAS las solicitudes (pendientes, aprobadas y rechazadas) de la base de datos permanentemente.\n\nEsta acción no se puede deshacer.")) {
      clearInscriptionsMutation.mutate();
    }
  };

  const openNewsModal = (item?: NewsItem) => {
    resetMedia();
    if (item) {
      setEditingNews(item);
      setNewsForm(item);
      if (item.imageUrl) setMediaPreview(item.imageUrl);
    }
    else {
      setEditingNews(null);
      setNewsForm({ title: '', content: '', imageUrl: '', priority: 'low', category: 'Actualidad' });
    }
    setIsCreatingNews(true);
  };

  const openEventModal = (item?: EventItem) => {
    resetMedia();
    if (item) {
      setEditingEvent(item);
      setEventForm(item);
      if (item.imageUrl) setMediaPreview(item.imageUrl);
    }
    else {
      setEditingEvent(null);
      setEventForm({ title: '', description: '', date: '', time: '', location: '', imageUrl: '', category: 'Celebración', isFeatured: false });
    }
    setIsCreatingEvent(true);
  };

  // --- STATS ---
  const stats = useMemo(() => [
    { label: 'Miembros', value: userCount.toString(), icon: 'group', color: 'bg-brand-primary text-brand-obsidian' },
    { label: 'Eventos', value: events.length.toString(), icon: 'calendar_today', color: 'bg-emerald-500 text-white' },
    { label: 'Solicitudes', value: inscriptions.filter(i => i.status === 'pending').length.toString(), icon: 'pending_actions', color: 'bg-amber-500 text-white' },
    { label: 'Noticias', value: news.length.toString(), icon: 'newspaper', color: 'bg-rose-500 text-white' },
  ], [userCount, events, inscriptions, news]);

  // --- RENDERERS ---

  const renderModuleHeader = (title: string, subtitle: string, actionLabel?: string, action?: () => void) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-reveal">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-[2px] bg-brand-primary"></div>
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Panel Administrativo</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter leading-none">{title}</h2>
        <p className="text-brand-obsidian/50 dark:text-white/40 text-sm mt-4 font-light max-w-md">{subtitle}</p>
      </div>
      {actionLabel && (
        <button onClick={action} className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-8 py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3 hover:bg-opacity-90">
          <span className="material-symbols-outlined text-base font-black">add_circle</span>
          {actionLabel}
        </button>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="flex flex-col gap-12 animate-reveal">
      <div className="bg-gradient-to-r from-brand-primary/20 to-transparent p-10 rounded-[3rem] border border-brand-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <span className="material-symbols-outlined text-9xl">admin_panel_settings</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white mb-2">
          Hola, <span className="text-brand-primary">{user?.user_metadata?.name || 'Admin'}</span>
        </h2>
        <p className="text-brand-obsidian/60 dark:text-white/60 max-w-md">Bienvenido al centro de control. Aquí tienes un resumen de la actividad reciente de la iglesia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] shadow-sm border border-brand-obsidian/5 flex flex-col gap-6 hover:translate-y-[-5px] transition-transform duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.color} shadow-lg`}>
              <span className="material-symbols-outlined text-2xl font-black">{s.icon}</span>
            </div>
            <div>
              <span className="text-4xl font-outfit font-extrabold text-brand-obsidian dark:text-white tracking-tighter">{s.value}</span>
              <p className="text-[10px] font-black text-brand-obsidian/40 dark:text-white/30 uppercase tracking-[0.2em] mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/5">
          <h3 className="text-lg font-bold text-brand-obsidian dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-primary">person_add</span>
            Últimas Solicitudes
          </h3>
          <div className="space-y-4">
            {inscriptions.slice(0, 4).map(ins => (
              <div key={ins.id} className="flex items-center justify-between p-4 bg-brand-silk dark:bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-obsidian/10 flex items-center justify-center text-[10px] font-bold">{ins.userName.charAt(0)}</div>
                  <div>
                    <p className="text-xs font-bold text-brand-obsidian dark:text-white">{ins.userName}</p>
                    <p className="text-[9px] text-brand-primary uppercase tracking-wider">{ins.ministryName}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${ins.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                  ins.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>{ins.status}</span>
              </div>
            ))}
            {inscriptions.length === 0 && <p className="text-xs opacity-40 text-center py-4">Sin actividad reciente</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/5">
          <h3 className="text-lg font-bold text-brand-obsidian dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500">campaign</span>
            Noticias Recientes
          </h3>
          <div className="space-y-4">
            {news.slice(0, 3).map(n => (
              <div key={n.id} className="flex gap-4 p-4 bg-brand-silk dark:bg-white/5 rounded-2xl">
                <img src={n.imageUrl || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-xl object-cover bg-gray-200" alt="" />
                <div>
                  <h4 className="text-xs font-bold text-brand-obsidian dark:text-white line-clamp-1">{n.title}</h4>
                  <p className="text-[10px] opacity-60 line-clamp-2 mt-1">{n.content}</p>
                  <p className="text-[9px] text-rose-500 mt-2 font-bold">{n.date}</p>
                </div>
              </div>
            ))}
            {news.length === 0 && <p className="text-xs opacity-40 text-center py-4">No hay noticias publicadas</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = allUsers.filter(u =>
      u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    return (
      <div className="flex flex-col gap-8 animate-reveal">
        {renderModuleHeader("Usuarios", "Gestiona la comunidad y roles.", undefined)}

        <div className="bg-white dark:bg-brand-surface rounded-[3rem] p-8 border border-brand-obsidian/5">
          <div className="flex items-center gap-4 bg-brand-silk dark:bg-white/5 p-4 rounded-2xl mb-8">
            <span className="material-symbols-outlined opacity-50">search</span>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="bg-transparent border-none text-sm w-full focus:ring-0"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-obsidian/5 dark:border-white/5">
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black opacity-50">Usuario</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black opacity-50">Email</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black opacity-50">Rol</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black opacity-50">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-brand-obsidian/5 dark:border-white/5 hover:bg-brand-silk dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-xs font-bold">{u.name?.charAt(0)}</div>
                        )}
                        <span className="text-sm font-bold text-brand-obsidian dark:text-white">{u.name || 'Sin Nombre'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs opacity-70">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRoleMutation.mutate({ userId: u.id, newRole: e.target.value })}
                        className="bg-brand-silk dark:bg-black/20 border-none rounded-lg text-xs font-bold px-3 py-1 cursor-pointer hover:bg-black/5 focus:ring-1 focus:ring-brand-primary"
                      >
                        <option value="USER">USER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="MINISTRY_LEADER">LEADER</option>
                        <option value="PASTOR">PASTOR</option>
                        <option value="SUPER_ADMIN">SUPER ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4 text-xs opacity-50">{new Date(u.joined_date || '').toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <p className="text-center py-10 opacity-40 text-sm">No se encontraron usuarios.</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderNews = () => (
    <div className="flex flex-col gap-8 animate-reveal">
      {renderModuleHeader("Noticias", "Administra las primicias de la iglesia.", "Nueva Noticia", () => openNewsModal())}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map(n => (
          <div key={n.id} className="bg-white dark:bg-brand-surface rounded-[2.5rem] overflow-hidden border border-brand-obsidian/5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300">
            <div>
              <div className="h-48 relative overflow-hidden bg-brand-silk dark:bg-black/10">
                <img src={n.imageUrl || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" alt="" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest text-brand-obsidian shadow-sm">
                  {n.category}
                </div>
              </div>
              <div className="p-6 pb-0">
                <h4 className="font-bold text-brand-obsidian dark:text-white text-lg mb-2 leading-tight line-clamp-2">{n.title}</h4>
                <p className="text-xs text-brand-obsidian/50 dark:text-white/40 line-clamp-3">{n.content}</p>
                <div className="mt-4 flex items-center gap-2 opacity-50">
                  <span className="material-symbols-outlined text-xs">calendar_today</span>
                  <span className="text-[10px] font-bold">{n.date}</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-6 mt-4 border-t border-brand-obsidian/5 dark:border-white/5 flex gap-3">
              <button
                onClick={() => openNewsModal(n)}
                className="flex-1 py-3 rounded-xl bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-brand-obsidian transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">edit</span> Editar
              </button>
              <button
                onClick={() => handleDeleteNews(n.id)}
                className="flex-1 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">delete</span> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      {news.length === 0 && <p className="text-center opacity-40 py-12 italic">No hay noticias publicadas aún.</p>}
    </div>
  );

  const renderEvents = () => (
    <div className="flex flex-col gap-8 animate-reveal">
      {renderModuleHeader("Agenda", "Gestiona los eventos del Reino.", "Nuevo Evento", () => openEventModal())}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(e => (
          <div key={e.id} className="bg-white dark:bg-brand-surface rounded-[2.5rem] p-6 border border-brand-obsidian/5 shadow-sm hover:shadow-lg transition-all flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                <span className="material-symbols-outlined text-2xl">calendar_today</span>
              </div>
              {e.isFeatured && (
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-500/10">
                  Destacado
                </span>
              )}
            </div>

            <div className="mb-6 flex-1">
              <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mb-2">{e.date} • {e.time}</p>
              <h4 className="font-bold text-brand-obsidian dark:text-white text-xl mb-1 leading-tight">{e.title}</h4>
              <p className="text-[11px] text-brand-obsidian/40 dark:text-white/40 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span> {e.location}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-brand-obsidian/5 dark:border-white/5">
              <button onClick={() => openEventModal(e)} className="py-3 rounded-xl bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-brand-obsidian transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">edit</span> Editar
              </button>
              <button onClick={() => handleDeleteEvent(e.id)} className="py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">delete</span> Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
      {events.length === 0 && <p className="text-center opacity-40 py-12 italic">No hay eventos programados.</p>}
    </div>
  );

  // --- SETTINGS QUERIES & MUTATIONS ---
  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('*');
      if (error) {
        console.error("Error fetching settings:", error);
        return {};
      }
      // Convert array to object key-value
      const settingsMap: Record<string, any> = {};
      data?.forEach((item: any) => {
        settingsMap[item.key] = item.value;
      });
      return settingsMap;
    },
    enabled: !!user && activeModule === 'settings'
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: any }) => {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value })
        .select();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      triggerToast("Ajuste actualizado");
    },
    onError: (error: any) => {
      console.error("Error updating setting:", error);
      triggerToast("Error al guardar ajuste");
    }
  });

  const renderSettings = () => (
    <div className="flex flex-col gap-8 animate-reveal">
      {renderModuleHeader("Ajustes", "Configuración general del sistema.", undefined)}

      <div className="bg-white dark:bg-brand-surface rounded-[3rem] p-10 border border-brand-obsidian/5 max-w-2xl">
        <div className="flex items-center gap-6 mb-8 border-b border-brand-obsidian/5 dark:border-white/5 pb-8">
          <div className="w-16 h-16 bg-brand-obsidian dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-brand-obsidian">
            <span className="material-symbols-outlined text-3xl">smartphone</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-obsidian dark:text-white">Monte de Sión App</h3>
            <p className="opacity-50 text-xs mt-1">Versión 1.2.0 (Build 2405)</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Maintenance Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-brand-silk dark:bg-white/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined opacity-50">build_circle</span>
              <div>
                <p className="text-sm font-bold">Modo Mantenimiento</p>
                <p className="text-[10px] opacity-50">Desactivar temporalmente el acceso a usuarios.</p>
              </div>
            </div>
            <div
              onClick={() => updateSettingMutation.mutate({
                key: 'maintenance_mode',
                value: !settings?.maintenance_mode
              })}
              className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${settings?.maintenance_mode ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-white/10'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${settings?.maintenance_mode ? 'left-6' : 'left-1'}`}></div>
            </div>
          </div>

          {/* Global Notifications Toggle */}
          <div className="flex items-center justify-between p-4 bg-brand-silk dark:bg-white/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined opacity-50">notifications_active</span>
              <div>
                <p className="text-sm font-bold">Notificaciones Globales</p>
                <p className="text-[10px] opacity-50">Habilitar el envío de alertas automáticas.</p>
              </div>
            </div>
            <div
              onClick={() => updateSettingMutation.mutate({
                key: 'global_notifications',
                value: !settings?.global_notifications
              })}
              className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${settings?.global_notifications ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-white/10'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${settings?.global_notifications ? 'left-6' : 'left-1'}`}></div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-obsidian/5 dark:border-white/5 text-center">
          <p className="text-[10px] opacity-30 uppercase tracking-widest font-black">Desarrollado por ZionCode</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row bg-brand-silk dark:bg-brand-carbon min-h-screen">
      {showToast && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] bg-brand-obsidian text-brand-primary px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-3xl animate-in fade-in slide-in-from-top-4">{showToast}</div>}

      <aside className="w-full lg:w-72 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] bg-white dark:bg-brand-obsidian border-r border-brand-obsidian/5 flex flex-col z-[100]">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-obsidian shadow-lg"><span className="material-symbols-outlined font-black">admin_panel_settings</span></div>
          <h1 className="text-lg font-serif font-bold text-brand-obsidian dark:text-white leading-none">Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {leaderMinistry && (
            <button onClick={() => setActiveModule('my-ministry')} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all mb-4 border border-brand-primary/20 ${activeModule === 'my-ministry' ? 'bg-brand-primary text-brand-obsidian shadow-lg' : 'bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10'}`}>
              <span className="material-symbols-outlined text-xl">church</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Mi Ministerio</span>
            </button>
          )}

          {[
            { id: 'dashboard', label: 'Inicio', icon: 'grid_view' },
            { id: 'content', label: 'Noticias', icon: 'newspaper' },
            { id: 'events', label: 'Agenda', icon: 'calendar_today' },
            { id: 'users', label: 'Usuarios', icon: 'group' },
            { id: 'inscriptions', label: 'Solicitudes', icon: 'person_add' },
            { id: 'settings', label: 'Ajustes', icon: 'tune' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveModule(item.id as AdminModule)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all ${activeModule === item.id ? 'bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian shadow-lg' : 'text-brand-obsidian/40 dark:text-white/30 hover:bg-brand-silk dark:hover:bg-white/5'}`}>
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto">
        {activeModule === 'dashboard' && renderDashboard()}
        {activeModule === 'content' && renderNews()}
        {activeModule === 'events' && renderEvents()}
        {activeModule === 'users' && renderUsers()}
        {activeModule === 'settings' && renderSettings()}
        {activeModule === 'my-ministry' && leaderMinistry && <MinistryManager ministryId={leaderMinistry.id} />}

        {activeModule === 'inscriptions' && (
          <div className="animate-reveal">
            {renderModuleHeader("Solicitudes", "Revisa postulaciones a ministerios.", "Limpiar Todo", () => handleClearInscriptions())}
            <div className="space-y-4">
              {inscriptions.map(ins => (
                <div key={ins.id} className="bg-white dark:bg-brand-surface p-6 rounded-[2.5rem] border border-brand-obsidian/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary font-black uppercase shrink-0">{ins.userName.charAt(0)}</div>
                    <div>
                      <h4 className="text-lg font-bold text-brand-obsidian dark:text-white mb-1">{ins.userName}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] text-brand-primary font-black uppercase tracking-widest">{ins.ministryName}</p>
                        <span className="text-[9px] opacity-30">• {new Date(ins.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {ins.status === 'pending' ? (
                      <>
                        <button onClick={() => updateInscriptionMutation.mutate({ id: ins.id, status: 'approved' })} className="px-5 py-2.5 bg-brand-primary text-brand-obsidian rounded-xl text-[8px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-brand-primary/20">Aprobar</button>
                        <button onClick={() => updateInscriptionMutation.mutate({ id: ins.id, status: 'rejected' })} className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-500">Rechazar</button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`px-5 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${ins.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{ins.status === 'approved' ? 'APROBADO' : 'RECHAZADO'}</span>
                        <button onClick={() => handleDeleteInscription(ins.id)} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors" title="Eliminar del historial"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {inscriptions.length === 0 && <div className="text-center opacity-40 py-24 flex flex-col items-center">
                <span className="material-symbols-outlined text-5xl mb-4">inbox</span>
                <p>No hay solicitudes pendientes ni en el historial.</p>
              </div>}
            </div>
          </div>
        )}
      </main>

      {/* MODAL NEWS / CONTENT */}
      {isCreatingNews && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-brand-obsidian/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-brand-surface rounded-[3.5rem] p-10 shadow-3xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-6 text-center">{editingNews ? 'Editar Noticia' : 'Nueva Noticia'}</h3>
            <div className="space-y-6">
              <input placeholder="Título principal" className="w-full bg-brand-silk dark:bg-brand-obsidian p-5 rounded-2xl font-bold text-lg border-none focus:ring-1 focus:ring-brand-primary" value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} />

              {/* Image Upload Area */}
              <div className="relative group cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                <div className={`w-full h-48 rounded-2xl border-2 border-dashed ${mediaPreview ? 'border-transparent' : 'border-brand-obsidian/10 dark:border-white/10'} flex flex-col items-center justify-center bg-brand-silk dark:bg-brand-obsidian relative overflow-hidden transition-all group-hover:border-brand-primary`}>
                  {mediaPreview ? (
                    <img src={mediaPreview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl opacity-20 mb-2">add_photo_alternate</span>
                      <p className="text-xs opacity-40 font-bold uppercase tracking-widest">Toca para subir imagen</p>
                    </>
                  )}
                  {mediaPreview && <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-xs font-bold uppercase">Cambiar Imagen</span></div>}
                </div>
              </div>

              <textarea placeholder="Escribe el contenido de la noticia aquí..." className="w-full bg-brand-silk dark:bg-brand-obsidian p-5 rounded-2xl text-sm border-none min-h-[150px] focus:ring-1 focus:ring-brand-primary resize-none" value={newsForm.content} onChange={e => setNewsForm({ ...newsForm, content: e.target.value })} />

              <div className="flex gap-4">
                <select className="flex-1 bg-brand-silk dark:bg-brand-obsidian p-4 rounded-xl text-xs font-bold border-none" value={newsForm.category} onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}>
                  <option value="Actualidad">Actualidad</option>
                  <option value="Ministerios">Ministerios</option>
                  <option value="Testimonio">Testimonio</option>
                </select>
                <select className="flex-1 bg-brand-silk dark:bg-brand-obsidian p-4 rounded-xl text-xs font-bold border-none" value={newsForm.priority} onChange={e => setNewsForm({ ...newsForm, priority: e.target.value as any })}>
                  <option value="low">Prioridad Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta (Destacado)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsCreatingNews(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl font-black text-[10px] uppercase">Cancelar</button>
                <button disabled={isUploading} onClick={handleSaveNews} className="flex-2 px-10 py-4 bg-brand-primary text-brand-obsidian rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50">
                  {isUploading ? 'Subiendo...' : 'Publicar Noticia'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGENDA / EVENTS REDESIGNED */}
      {isCreatingEvent && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-brand-obsidian/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-brand-surface rounded-[3.5rem] p-10 shadow-3xl max-h-[90vh] overflow-y-auto no-scrollbar border border-brand-obsidian/5">
            <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-8 text-center flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-brand-primary">event_note</span>
              {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
            </h3>

            <div className="space-y-6">
              {/* Image Upload Area - Prominent */}
              <div className="relative group cursor-pointer h-48 w-full">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                <div className={`w-full h-full rounded-[2rem] border-2 border-dashed ${mediaPreview ? 'border-transparent' : 'border-brand-obsidian/10 dark:border-white/10'} flex flex-col items-center justify-center bg-brand-silk dark:bg-brand-obsidian relative overflow-hidden transition-all group-hover:border-brand-primary shadow-inner`}>
                  {mediaPreview ? (
                    <>
                      <img src={mediaPreview} className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-75" alt="Preview" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-black/50 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">Cambiar Portada</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center p-4 text-center">
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-3">
                        <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                      </div>
                      <p className="text-sm font-bold text-brand-obsidian dark:text-white">Subir Portada</p>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Recomendado: Horizontal</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Título del Evento</label>
                <input
                  placeholder="Ej: Culto de Celebración"
                  className="w-full bg-brand-silk dark:bg-brand-obsidian p-5 rounded-2xl text-lg font-bold border-none focus:ring-2 focus:ring-brand-primary placeholder:opacity-30"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                />
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Fecha</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 opacity-30">calendar_today</span>
                    <input
                      type="date"
                      className="w-full bg-brand-silk dark:bg-brand-obsidian pl-12 pr-4 py-4 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-brand-primary"
                      value={eventForm.date}
                      onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Hora</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 opacity-30">schedule</span>
                    <input
                      type="time"
                      className="w-full bg-brand-silk dark:bg-brand-obsidian pl-12 pr-4 py-4 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-brand-primary"
                      value={eventForm.time}
                      onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Location & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Ubicación</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 opacity-30">pin_drop</span>
                    <input
                      placeholder="Ej: Auditorio Principal"
                      className="w-full bg-brand-silk dark:bg-brand-obsidian pl-12 pr-4 py-4 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-brand-primary placeholder:opacity-30"
                      value={eventForm.location}
                      onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Categoría</label>
                  <select
                    className="w-full bg-brand-silk dark:bg-brand-obsidian px-5 py-4 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-brand-primary appearance-none cursor-pointer"
                    value={eventForm.category}
                    onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
                  >
                    <option value="Celebración">Celebración</option>
                    <option value="Taller">Taller</option>
                    <option value="Misiones">Misiones</option>
                    <option value="Jóvenes">Jóvenes</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Descripción (Opcional)</label>
                <textarea
                  placeholder="Detalles adicionales del evento..."
                  className="w-full bg-brand-silk dark:bg-brand-obsidian p-5 rounded-2xl text-sm font-medium border-none min-h-[100px] focus:ring-2 focus:ring-brand-primary resize-none placeholder:opacity-30"
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-brand-obsidian/5 mt-4">
                <button onClick={() => setIsCreatingEvent(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-200 transition-colors">Cancelar</button>
                <button disabled={isUploading} onClick={handleSaveEvent} className="flex-[2] px-8 py-4 bg-brand-primary text-brand-obsidian rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isUploading ? <span className="w-4 h-4 border-2 border-brand-obsidian border-t-transparent rounded-full animate-spin"></span> : <span className="material-symbols-outlined text-lg">check_circle</span>}
                  {isUploading ? 'Subiendo...' : editingEvent ? 'Guardar Cambios' : 'Agendar Evento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;