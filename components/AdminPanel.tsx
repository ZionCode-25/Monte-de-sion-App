import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './context/AuthContext';
import {
  NewsItem,
  EventItem,
  Inscription,
} from '../types';

type AdminModule = 'dashboard' | 'content' | 'events' | 'ministries' | 'inscriptions' | 'settings';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');

  const [showToast, setShowToast] = useState<string | null>(null);
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Forms
  const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({});
  const [eventForm, setEventForm] = useState<Partial<EventItem>>({});
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  // --- QUERIES ---

  const { data: news = [] } = useQuery({
    queryKey: ['admin-news'],
    queryFn: async () => {
      const { data } = await supabase.from('news').select('*, author:profiles(name, avatar_url)').order('created_at', { ascending: false });
      if (!data) return [];
      return data.map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        imageUrl: n.image_url || '',
        date: new Date(n.created_at).toLocaleDateString(),
        priority: n.priority as any,
        category: n.category,
        videoUrl: n.video_url,
        author: n.author?.name || 'Admin', // Fixed: expects string
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
        userEmail: 'No disponible', // Fixed: added required field
        note: i.note || '', // Fixed: added field
        ministryId: i.ministry_id,
        ministryName: i.ministry?.name || 'Ministerio',
        status: i.status as any,
        date: i.created_at
      })) as Inscription[];
    },
    enabled: !!user
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
      return null;
    }
  };

  const saveNewsMutation = useMutation({
    mutationFn: async (newsData: any) => {
      if (editingNews) {
        await supabase.from('news').update(newsData).eq('id', editingNews.id);
      } else {
        await supabase.from('news').insert(newsData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['latestNews'] }); // Invalidate dashboard query too
      queryClient.invalidateQueries({ queryKey: ['news'] }); // Invalidate news feed
      triggerToast(editingNews ? "Noticia actualizada" : "Noticia publicada");
      setIsCreatingNews(false);
      setMediaFile(null);
    },
    onError: () => triggerToast("Error al guardar")
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('news').delete().eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      triggerToast("Noticia eliminada");
    }
  });

  const saveEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      if (editingEvent) {
        await supabase.from('events').update(eventData).eq('id', editingEvent.id);
      } else {
        await supabase.from('events').insert(eventData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['nextEvent'] });
      triggerToast(editingEvent ? "Evento actualizado" : "Evento agendado");
      setIsCreatingEvent(false);
      setMediaFile(null);
    },
    onError: () => triggerToast("Error al guardar")
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('events').delete().eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      triggerToast("Evento eliminado");
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

  // --- HANDLERS ---

  const handleSaveNews = async () => {
    if (!newsForm.title || !newsForm.content) return;
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
    if (!eventForm.title || !eventForm.date) return;
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

  const handleUpdateInscription = (id: string, newStatus: 'approved' | 'rejected') => {
    updateInscriptionMutation.mutate({ id, status: newStatus });
  };

  const openNewsModal = (item?: NewsItem) => {
    setMediaFile(null);
    if (item) { setEditingNews(item); setNewsForm(item); }
    else { setEditingNews(null); setNewsForm({ title: '', content: '', imageUrl: 'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?q=80&w=2000&auto=format&fit=crop', priority: 'low', category: 'Actualidad' }); }
    setIsCreatingNews(true);
  };

  const openEventModal = (item?: EventItem) => {
    setMediaFile(null);
    if (item) { setEditingEvent(item); setEventForm(item); }
    else { setEditingEvent(null); setEventForm({ title: '', description: '', date: '', time: '', location: '', imageUrl: 'https://images.unsplash.com/photo-1475721027187-402ad2989a38?q=80&w=2000&auto=format&fit=crop', category: 'Celebración', isFeatured: false }); }
    setIsCreatingEvent(true);
  };

  const stats = useMemo(() => [
    { label: 'Miembros', value: userCount.toString(), icon: 'group', color: 'text-brand-primary' },
    { label: 'Eventos', value: events.length.toString(), icon: 'calendar_today', color: 'text-emerald-500' },
    { label: 'Solicitudes', value: inscriptions.filter(i => i.status === 'pending').length.toString(), icon: 'pending_actions', color: 'text-amber-500' },
    { label: 'Noticias', value: news.length.toString(), icon: 'newspaper', color: 'text-rose-500' },
  ], [userCount, events, inscriptions, news]);

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
        <button onClick={action} className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-8 py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3">
          <span className="material-symbols-outlined text-base font-black">add_circle</span>
          {actionLabel}
        </button>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="flex flex-col gap-10 animate-reveal">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] shadow-sm border border-brand-obsidian/5 flex flex-col gap-6">
            <div className={`w-14 h-14 rounded-2xl bg-brand-silk dark:bg-brand-obsidian flex items-center justify-center ${s.color} border border-brand-obsidian/5`}>
              <span className="material-symbols-outlined text-3xl font-black">{s.icon}</span>
            </div>
            <div>
              <span className="text-4xl font-outfit font-extrabold text-brand-obsidian dark:text-white tracking-tighter">{s.value}</span>
              <p className="text-[10px] font-black text-brand-obsidian/40 dark:text-white/30 uppercase tracking-[0.2em] mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNews = () => (
    <div className="flex flex-col gap-8 animate-reveal">
      {renderModuleHeader("Noticias", "Administra las primicias de la iglesia.", "Nueva Noticia", () => openNewsModal())}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {news.map(n => (
          <div key={n.id} className="bg-white dark:bg-brand-surface rounded-[3rem] overflow-hidden border border-brand-obsidian/5 group shadow-sm hover:shadow-xl transition-all">
            <div className="h-48 relative overflow-hidden">
              <img src={n.imageUrl} className="w-full h-full object-cover" alt="" />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openNewsModal(n)} className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center text-brand-obsidian"><span className="material-symbols-outlined">edit</span></button>
                <button onClick={() => handleDeleteNews(n.id)} className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center"><span className="material-symbols-outlined">delete</span></button>
              </div>
            </div>
            <div className="p-8">
              <h4 className="font-bold text-brand-obsidian dark:text-white text-xl mb-2">{n.title}</h4>
              <p className="text-sm text-brand-obsidian/50 dark:text-white/40 line-clamp-2">{n.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="flex flex-col gap-8 animate-reveal">
      {renderModuleHeader("Agenda", "Gestiona los eventos del Reino.", "Nuevo Evento", () => openEventModal())}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(e => (
          <div key={e.id} className="bg-white dark:bg-brand-surface rounded-[2.5rem] p-6 border border-brand-obsidian/5 group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary"><span className="material-symbols-outlined">calendar_today</span></div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEventModal(e)} className="w-8 h-8 rounded-lg bg-brand-obsidian/5 dark:bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-sm">edit</span></button>
                <button onClick={() => handleDeleteEvent(e.id)} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center"><span className="material-symbols-outlined text-sm">delete</span></button>
              </div>
            </div>
            <h4 className="font-bold text-brand-obsidian dark:text-white text-lg mb-1 leading-tight">{e.title}</h4>
            <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">{e.date} • {e.time}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row bg-brand-silk dark:bg-brand-carbon">
      {showToast && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] bg-brand-obsidian text-brand-primary px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-3xl">{showToast}</div>}

      <aside className="w-full lg:w-72 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] bg-white dark:bg-brand-obsidian border-r border-brand-obsidian/5 flex flex-col z-[100]">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-obsidian shadow-lg"><span className="material-symbols-outlined font-black">admin_panel_settings</span></div>
          <h1 className="text-lg font-serif font-bold text-brand-obsidian dark:text-white leading-none">Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Inicio', icon: 'grid_view' },
            { id: 'content', label: 'Noticias', icon: 'newspaper' },
            { id: 'events', label: 'Agenda', icon: 'calendar_today' },
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

      <main className="flex-1 p-6 md:p-12 lg:p-16">
        {activeModule === 'dashboard' && renderDashboard()}
        {activeModule === 'content' && renderNews()}
        {activeModule === 'events' && renderEvents()}

        {activeModule === 'inscriptions' && (
          <div className="animate-reveal">
            {renderModuleHeader("Solicitudes", "Revisa postulaciones a ministerios.", undefined)}
            <div className="space-y-4">
              {inscriptions.map(ins => (
                <div key={ins.id} className="bg-white dark:bg-brand-surface p-6 rounded-[2.5rem] border border-brand-obsidian/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary font-black uppercase">{ins.userName.charAt(0)}</div>
                    <div><h4 className="text-lg font-bold text-brand-obsidian dark:text-white mb-1">{ins.userName}</h4><p className="text-[9px] text-brand-primary font-black uppercase tracking-widest">{ins.ministryName}</p></div>
                  </div>
                  <div className="flex gap-2">
                    {ins.status === 'pending' ? (
                      <>
                        <button onClick={() => handleUpdateInscription(ins.id, 'approved')} className="px-5 py-2.5 bg-brand-primary text-brand-obsidian rounded-xl text-[8px] font-black uppercase tracking-widest">Aprobar</button>
                        <button onClick={() => handleUpdateInscription(ins.id, 'rejected')} className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl text-[8px] font-black uppercase tracking-widest">Rechazar</button>
                      </>
                    ) : (
                      <span className={`px-5 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${ins.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{ins.status.toUpperCase()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {['settings'].includes(activeModule) && (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
            <span className="material-symbols-outlined text-6xl mb-4 animate-pulse">construction</span>
            <h3 className="text-3xl font-serif font-bold italic">Configuración</h3>
            <p className="text-sm mt-2">Módulo en desarrollo avanzado.</p>
          </div>
        )}
      </main>

      {/* MODAL NEWS */}
      {isCreatingNews && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-brand-obsidian/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-brand-surface rounded-[3.5rem] p-10 shadow-3xl">
            <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-6 text-center">{editingNews ? 'Editar Noticia' : 'Nueva Noticia'}</h3>
            <div className="space-y-4">
              <input placeholder="Título" className="w-full bg-brand-silk dark:bg-brand-obsidian p-4 rounded-xl text-sm border-none focus:ring-1 focus:ring-brand-primary" value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} />
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-brand-obsidian/40">Imagen de Portada</label>
                <input type="file" accept="image/*" onChange={e => setMediaFile(e.target.files?.[0] || null)} className="text-sm" />
              </div>
              <textarea placeholder="Contenido..." className="w-full bg-brand-silk dark:bg-brand-obsidian p-4 rounded-xl text-sm border-none min-h-[120px] focus:ring-1 focus:ring-brand-primary" value={newsForm.content} onChange={e => setNewsForm({ ...newsForm, content: e.target.value })} />
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsCreatingNews(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl font-black text-[10px] uppercase">Cancelar</button>
                <button onClick={handleSaveNews} className="flex-2 px-10 py-4 bg-brand-primary text-brand-obsidian rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Publicar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGENDA */}
      {isCreatingEvent && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-brand-obsidian/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-brand-surface rounded-[3.5rem] p-10 shadow-3xl">
            <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-6 text-center">{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input placeholder="Título" className="md:col-span-2 bg-brand-silk dark:bg-brand-obsidian p-4 rounded-xl text-sm border-none focus:ring-1 focus:ring-brand-primary" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-brand-obsidian/40">Imagen del Evento</label>
                <input type="file" accept="image/*" onChange={e => setMediaFile(e.target.files?.[0] || null)} className="text-sm" />
              </div>
              <input type="date" className="bg-brand-silk dark:bg-brand-obsidian p-4 rounded-xl text-sm border-none focus:ring-1 focus:ring-brand-primary text-brand-obsidian dark:text-white" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
              <input type="time" className="bg-brand-silk dark:bg-brand-obsidian p-4 rounded-xl text-sm border-none focus:ring-1 focus:ring-brand-primary text-brand-obsidian dark:text-white" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsCreatingEvent(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl font-black text-[10px] uppercase">Cancelar</button>
              <button onClick={handleSaveEvent} className="flex-2 px-10 py-4 bg-brand-primary text-brand-obsidian rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;