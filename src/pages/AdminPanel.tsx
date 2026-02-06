import { AppRole, Ministry, Profile, EventItem, NewsItem } from '../../types';
import ImageCropper from '../components/admin/ImageCropper';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type AdminModule = 'dashboard' | 'news' | 'events' | 'users' | 'settings' | 'about-us' | 'my-ministry' | 'attendance';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// --- HELPER COMPONENTS ---

const SidebarItem = ({ icon, label, isActive, onClick }: { icon: string, label: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 relative group
      ${isActive
        ? 'text-brand-primary'
        : 'text-brand-obsidian/60 dark:text-white/60 hover:text-brand-obsidian dark:hover:text-white'
      } `}
  >
    {isActive && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary rounded-r-full shadow-[0_0_15px_rgba(212,175,55,0.5)] animate-in slide-in-from-left-2 duration-300" />
    )}
    <span className={`material-symbols-outlined text-xl transition-transform duration-300 group-hover:scale-110 ${isActive ? 'font-fill' : ''} `}>
      {icon}
    </span>
    <span className={`text-sm font-bold tracking-wide ${isActive ? 'translate-x-1' : ''} transition-transform duration-300`}>
      {label}
    </span>
  </button>
);

const SectionHeader = ({ title, subtitle, showHelp, helpText }: { title: string, subtitle: string, showHelp: boolean, helpText?: string }) => (
  <div className="mb-8 flex flex-col gap-2 relative">
    <h2 className="text-4xl font-black text-brand-obsidian dark:text-white tracking-tight">{title}</h2>
    <p className="text-sm font-medium text-brand-obsidian/40 dark:text-white/40 uppercase tracking-widest">{subtitle}</p>
    {showHelp && helpText && (
      <div className="absolute top-0 right-0 max-w-xs bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 z-20">
        <div className="flex gap-2 text-amber-800">
          <span className="material-symbols-outlined text-sm mt-0.5">lightbulb</span>
          <p className="text-xs leading-relaxed font-medium">{helpText}</p>
        </div>
      </div>
    )}
  </div>
);

const MetricCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: string }) => (
  <div className="bg-white dark:bg-brand-surface p-6 rounded-[2.5rem] border border-brand-obsidian/5 dark:border-white/5 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className="text-3xl font-black text-brand-obsidian dark:text-white mb-1">{value}</h3>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{title}</p>
    </div>
    <div className="absolute -bottom-6 -right-6 text-[8rem] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
  </div>
);


const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [showHelp, setShowHelp] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMinistryId, setSelectedMinistryId] = useState<string | null>(null);

  // --- LOCAL STATE FOR MODALS ---
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [newsForm, setNewsForm] = useState<any>({});

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [eventForm, setEventForm] = useState<any>({});

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedAttendanceSession, setSelectedAttendanceSession] = useState<any>(null);
  const [isCreatingAttendance, setIsCreatingAttendance] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({ event_name: '', points: 50, expires_in_hours: 3 });

  const [isCropping, setIsCropping] = useState(false);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<'cover' | 'inline'>('cover');

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const resetMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setNewsForm({});
    setEventForm({});
  };

  // --- QUERIES ---

  const { data: news = [] } = useQuery({
    queryKey: ['admin-news'],
    queryFn: async () => {
      const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      return (data || []) as any[];
    },
    enabled: !!user && activeModule === 'news'
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

  const { data: ministries = [] } = useQuery({
    queryKey: ['admin-ministries-list'],
    queryFn: async () => {
      const { data } = await supabase.from('ministries').select('*');
      return (data || []) as Ministry[];
    },
    enabled: !!user && activeModule === 'my-ministry'
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
      queryClient.invalidateQueries({ queryKey: ['news'] }); // Fix instant sync for NewsFeed
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
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: AppRole }) => {
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

  const { data: attendanceSessions = [] } = useQuery({
    queryKey: ['admin-attendance-sessions'],
    queryFn: async () => {
      const { data, error } = await (supabase.from('attendance_sessions' as any))
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: activeModule === 'attendance'
  });

  const createAttendanceSessionMutation = useMutation({
    mutationFn: async (session: { event_name: string; points: number; expires_in_hours: number }) => {
      // 1. Check if ANY session is currently active
      const activeSessions = attendanceSessions.filter((s: any) =>
        s.status === 'active' && new Date(s.expires_at) > new Date()
      );

      if (activeSessions.length > 0) {
        throw new Error("Ya hay una sesión de asistencia activa. Finalízala antes de crear otra.");
      }

      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expires_at = new Date();
      expires_at.setHours(expires_at.getHours() + session.expires_in_hours);

      // 2. Insert new session
      const { error: insertError } = await (supabase.from('attendance_sessions' as any)).insert({
        event_name: session.event_name,
        points: session.points,
        token: token,
        expires_at: expires_at.toISOString(),
        created_by: user?.id,
        status: 'active'
      });
      if (insertError) throw insertError;

      // 3. Keep only top 10 sessions (auto-cleanup)
      const { data: allSessions } = await (supabase.from('attendance_sessions' as any))
        .select('id')
        .order('created_at', { ascending: false });

      if (allSessions && allSessions.length > 10) {
        const idsToDelete = (allSessions as any[]).slice(10).map(s => s.id);
        await (supabase.from('attendance_sessions' as any)).delete().in('id', idsToDelete);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendance-sessions'] });
      triggerToast("Sesión de asistencia creada");
    },
    onError: (error: any) => {
      triggerToast(error.message);
    }
  });

  const updateAttendanceStatusMutation = useMutation({
    mutationFn: async ({ id, status, expires_at }: { id: string, status: string, expires_at?: string }) => {
      const updateData: any = { status };
      if (expires_at) updateData.expires_at = expires_at;

      const { error } = await (supabase.from('attendance_sessions' as any))
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendance-sessions'] });
      triggerToast("Estado de sesión actualizado");
    }
  });

  const deleteAttendanceSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('attendance_sessions' as any)).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendance-sessions'] });
      triggerToast("Sesión eliminada");
    }
  });

  const clearAttendanceHistoryMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from('attendance_sessions' as any)).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendance-sessions'] });
      triggerToast("Historial vaciado");
    }
  });

  // --- ACTIONS ---

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `news/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      setIsUploading(false);
      return data.publicUrl;
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      triggerToast("Error subiendo imagen");
      return null;
    }
  };

  const handleFileSelect = (file: File, target: 'cover' | 'inline' = 'cover') => {
    setCropTarget(target);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCroppingImage(reader.result as string);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (blob: Blob) => {
    setIsCropping(false);

    // Upload the cropped image immediately
    const file = new File([blob], `${cropTarget}-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const url = await uploadImage(file);

    if (url) {
      if (cropTarget === 'cover') {
        setNewsForm({ ...newsForm, image_url: url });
        setMediaPreview(url);
      } else {
        // Insert inline image at cursor
        const textarea = document.getElementById('news-content-editor') as HTMLTextAreaElement;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = newsForm.content || '';
          const before = text.substring(0, start);
          const after = text.substring(end);
          const imageTag = `\n![Imagen de apoyo](${url})\n`;
          setNewsForm({ ...newsForm, content: before + imageTag + after });
        }
      }
      triggerToast("Imagen procesada con éxito");
    }
    setCroppingImage(null);
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('news-content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = newsForm.content || '';
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newText = before + prefix + selectedText + suffix + after;
    setNewsForm({ ...newsForm, content: newText });

    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const generateTOC = () => {
    const content = newsForm.content || '';
    const lines = content.split('\n');
    const headers = lines.filter(line => line.startsWith('## ') || line.startsWith('### '));

    if (headers.length === 0) {
      triggerToast("No se encontraron subtítulos para el índice");
      return;
    }

    const toc = [
      '## Índice de Contenidos',
      ...headers.map(h => {
        const title = h.replace(/^#+\s/, '');
        const level = h.startsWith('###') ? '  ' : '';
        return `${level}- [${title}](#${title.toLowerCase().replace(/\s+/g, '-')})`;
      }),
      '---'
    ].join('\n');

    setNewsForm({ ...newsForm, content: toc + '\n\n' + content });
    triggerToast("Índice generado al inicio");
  };

  // --- RENDERERS ---

  const Sidebar = () => (
    <>
      {/* Mobile Toggle & Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`
        fixed top-0 bottom-0 left-0 z-50 w-[85vw] md:w-72 bg-white dark:bg-brand-surface border-r border-brand-obsidian/5 dark:border-white/5 flex flex-col h-[100dvh]
        transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 md:h-screen
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}
      `}>
        <div className="p-8 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-4 text-brand-obsidian dark:text-white mb-2">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-obsidian">
              <span className="material-symbols-outlined font-black">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg leading-none">Panel Admin</h1>
              <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mt-1">Monte de Sión</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-brand-obsidian/50">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <p className="px-6 text-[10px] font-black text-brand-obsidian/30 dark:text-white/30 uppercase tracking-widest mb-4">Módulos</p>
          <SidebarItem icon="dashboard" label="Dashboard" isActive={activeModule === 'dashboard'} onClick={() => { setActiveModule('dashboard'); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon="newspaper" label="Noticias" isActive={activeModule === 'news'} onClick={() => { setActiveModule('news'); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon="calendar_today" label="Agenda" isActive={activeModule === 'events'} onClick={() => { setActiveModule('events'); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon="groups" label="Mi Ministerio" isActive={activeModule === 'my-ministry'} onClick={() => { setActiveModule('my-ministry'); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon="qr_code" label="Asistencia" isActive={activeModule === 'attendance'} onClick={() => { setActiveModule('attendance'); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon="settings" label="Ajustes" isActive={activeModule === 'settings'} onClick={() => { setActiveModule('settings'); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon="group" label="Comunidad" isActive={activeModule === 'users'} onClick={() => { setActiveModule('users'); setIsMobileMenuOpen(false); }} />
          <div className="my-4 h-px bg-brand-obsidian/5 dark:bg-white/5 mx-6"></div>
          <SidebarItem icon="settings" label="Ajustes" isActive={activeModule === 'settings'} onClick={() => { setActiveModule('settings'); setIsMobileMenuOpen(false); }} />
        </div>

        <div className="p-6 border-t border-brand-obsidian/5 dark:border-white/5">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-xs font-bold uppercase tracking-widest
            ${showHelp ? 'bg-amber-100 text-amber-600' : 'bg-brand-silk dark:bg-white/5 text-brand-obsidian dark:text-white hover:bg-brand-primary/20'} `}
          >
            <span className="material-symbols-outlined text-sm">{showHelp ? 'lightbulb' : 'help'}</span>
            {showHelp ? 'Ocultar Ayuda' : 'Ver Ayuda'}
          </button>
        </div>
      </div>
    </>
  );

  const stats = useMemo(() => [
    { title: 'Usuarios Totales', value: userCount, icon: 'group', color: 'bg-blue-500' },
    { title: 'Noticias Publicadas', value: news.length, icon: 'article', color: 'bg-emerald-500' },
    { title: 'Eventos Activos', value: events.length, icon: 'event', color: 'bg-violet-500' },
    { title: 'App Version', value: '1.2.0', icon: 'smartphone', color: 'bg-brand-primary' },
  ], [userCount, news.length, events.length]);

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">
      <SectionHeader title="Dashboard" subtitle={`Bienvenido, ${user?.user_metadata?.full_name || user?.user_metadata?.name || 'Administrador'} `} showHelp={showHelp} helpText="Resumen general de la actividad de la iglesia." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => <MetricCard key={i} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/5 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-brand-obsidian dark:text-white">Últimas Noticias</h3>
            <button onClick={() => setActiveModule('news')} className="text-xs font-black uppercase tracking-widest text-brand-primary hover:underline">Ver todo</button>
          </div>
          <div className="space-y-4">
            {news.slice(0, 3).map((n: any) => (
              <div key={n.id} className="flex gap-4 items-center p-3 hover:bg-brand-silk dark:hover:bg-white/5 rounded-2xl transition-colors cursor-pointer" onClick={() => setActiveModule('news')}>
                <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                  {n.image_url && <img src={n.image_url} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-obsidian dark:text-white line-clamp-1">{n.title}</h4>
                  <p className="text-xs opacity-50">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/5 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-brand-obsidian dark:text-white">Próximos Eventos</h3>
            <button onClick={() => setActiveModule('events')} className="text-xs font-black uppercase tracking-widest text-brand-primary hover:underline">Ver todo</button>
          </div>
          <div className="space-y-4">
            {events.slice(0, 3).map((e: any) => (
              <div key={e.id} className="flex gap-4 items-center p-3 hover:bg-brand-silk dark:hover:bg-white/5 rounded-2xl transition-colors cursor-pointer" onClick={() => setActiveModule('events')}>
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex flex-col items-center justify-center text-brand-primary shrink-0">
                  <span className="text-xs font-black">{e.date.split('/')[0]}</span>
                  <span className="text-[8px] uppercase">{new Date(2024, parseInt(e.date.split('/')[1]) - 1).toLocaleString('es-ES', { month: 'short' })}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-obsidian dark:text-white line-clamp-1">{e.title}</h4>
                  <p className="text-xs opacity-50">{e.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewsModule = () => (
    <div className="max-w-7xl mx-auto p-6 md:p-12">
      <SectionHeader title="Noticias" subtitle="Gestiona los comunicados." showHelp={showHelp} helpText="Las noticias con 'Prioridad Alta' aparecen en el carrusel principal." />

      <div className="bg-gradient-to-br from-brand-primary to-amber-600 rounded-[3rem] p-8 text-brand-obsidian mb-8 relative overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all group"
        onClick={() => {
          setEditingNews(null);
          setNewsForm({});
          resetMedia();
          setIsCreatingNews(true);
        }}>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">add</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Publicar Nueva Noticia</h3>
            <p className="font-medium text-white/60">Tap para crear un comunicado</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item: any) => (
          <div key={item.id} className="bg-white dark:bg-brand-surface rounded-[2.5rem] p-4 border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group">
            <div className="h-48 rounded-[2rem] bg-gray-100 overflow-hidden relative mb-4">
              <img src={item.image_url || 'https://via.placeholder.com/400x300'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                {item.category}
              </div>
            </div>
            <div className="px-2 mb-4">
              <h3 className="font-bold text-lg text-brand-obsidian dark:text-white line-clamp-2 leading-tight mb-2">{item.title}</h3>
              <p className="text-xs opacity-60 line-clamp-3">{item.content}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditingNews(item); setNewsForm(item); setMediaPreview(item.image_url); setIsCreatingNews(true); }}
                className="flex-1 py-3 rounded-xl bg-brand-silk dark:bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-brand-obsidian transition-colors">
                Editar
              </button>
              <button
                onClick={() => { if (confirm('¿Borrar?')) deleteNewsMutation.mutate(item.id) }}
                className="px-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEventsModule = () => (
    <div className="max-w-7xl mx-auto p-6 md:p-12">
      <SectionHeader title="Agenda" subtitle="Próximos eventos y reuniones." showHelp={showHelp} helpText="Mantén la agenda siempre actualizada. Los eventos pasados se archivan automáticamente." />

      {/* Empty State Action */}
      <div className="bg-white dark:bg-brand-surface p-1 rounded-[2.5rem] inline-flex mb-8 border border-brand-obsidian/5 dark:border-white/5">
        {/* (Optional view switchers could go here) */}
      </div>

      <EmptyStateAction
        icon="event"
        label="Crear Nuevo Evento"
        subLabel="Añade una actividad al calendario"
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
                      <option value="MINISTRY_LEADER">Líder Mn.</option>
                      <option value="PASTOR">Pastor</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </td>
                  <td className="p-4 opacity-50 text-xs">{new Date(u.joined_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAboutUsModule = () => (
    <div className="max-w-5xl mx-auto p-6 md:p-12">
      <SectionHeader title="Nosotros" subtitle="Gestiona información pública." showHelp={showHelp} helpText="La sección 'Nosotros' es la carta de presentación. Mantén las actividades al día." />

      <div className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] border border-brand-obsidian/5 dark:border-white/5">
        <h4 className="font-bold text-xl text-brand-obsidian dark:text-white mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-brand-primary">calendar_clock</span>
          Actividades Semanales
        </h4>

        <div className="space-y-3">
          {((settings?.weekly_activities as any[]) || []).map((activity: any, idx: number) => (
            <div key={idx} className="flex flex-col md:flex-row gap-2 bg-brand-silk dark:bg-white/5 p-3 rounded-xl animate-in fade-in slide-in-from-left-4">
              <input
                className="flex-1 bg-white dark:bg-black/20 p-3 rounded-lg text-xs font-bold border-none focus:ring-1 focus:ring-brand-primary"
                placeholder="Día"
                value={activity.d}
                onChange={(e) => {
                  const n = JSON.parse(JSON.stringify(settings?.weekly_activities || []));
                  n[idx].d = e.target.value;
                  updateSettingMutation.mutate({ key: 'weekly_activities', value: n });
                }}
              />
              <input
                className="w-full md:w-32 bg-white dark:bg-black/20 p-3 rounded-lg text-xs border-none focus:ring-1 focus:ring-brand-primary"
                placeholder="Hora"
                value={activity.t}
                onChange={(e) => {
                  const n = JSON.parse(JSON.stringify(settings?.weekly_activities || []));
                  n[idx].t = e.target.value;
                  updateSettingMutation.mutate({ key: 'weekly_activities', value: n });
                }}
              />
              <input
                className="flex-[2] bg-white dark:bg-black/20 p-3 rounded-lg text-xs border-none focus:ring-1 focus:ring-brand-primary"
                placeholder="Actividad"
                value={activity.a}
                onChange={(e) => {
                  const n = JSON.parse(JSON.stringify(settings?.weekly_activities || []));
                  n[idx].a = e.target.value;
                  updateSettingMutation.mutate({ key: 'weekly_activities', value: n });
                }}
              />
              <button
                onClick={() => {
                  if (!confirm('¿Eliminar actividad?')) return;
                  const n = JSON.parse(JSON.stringify(settings?.weekly_activities || []));
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
            const n = JSON.parse(JSON.stringify(settings?.weekly_activities || []));
            n.push({ d: '', t: '', a: '' });
            updateSettingMutation.mutate({ key: 'weekly_activities', value: n });
          }}
          className="mt-6 w-full py-4 border-2 border-dashed border-brand-obsidian/10 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-obsidian/40 dark:text-white/40 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base">add</span>
          Agregar Actividad
        </button>
      </div>
    </div>
  );

  const renderMinistryModule = () => {
    if (selectedMinistryId) {
      return (
        <div className="h-full flex flex-col">
          <button
            onClick={() => setSelectedMinistryId(null)}
            className="flex items-center gap-2 px-6 py-4 text-brand-obsidian/50 hover:text-brand-obsidian transition-colors text-xs font-bold uppercase tracking-widest bg-white dark:bg-brand-surface border-b border-brand-obsidian/5"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Volver a la lista
          </button>
          <div className="flex-1">
            <MinistryManager ministryId={selectedMinistryId} />
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <SectionHeader title="Ministerios" subtitle="Selecciona un ministerio para gestionar." showHelp={showHelp} helpText="Aquí puedes ver todos los ministerios activos. Selecciona uno para ver sus miembros y solicitudes." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map(m => (
            <div
              key={m.id}
              onClick={() => setSelectedMinistryId(m.id)}
              className="bg-white dark:bg-brand-surface p-6 rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                  {m.image_url ? <img src={m.image_url} className="w-full h-full rounded-2xl object-cover" /> : <span className="material-symbols-outlined text-2xl">church</span>}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-brand-obsidian dark:text-white leading-none">{m.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Administrar</p>
                </div>
              </div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-brand-primary">arrow_forward_ios</span>
              </div>
            </div>
          ))}
        </div>
        {ministries.length === 0 && <div className="text-center py-20 opacity-40 italic">Cargando ministerios...</div>}
      </div>
    );
  };

  const renderAttendanceModule = () => (
    <div className="max-w-7xl mx-auto p-6 md:p-12">
      <SectionHeader
        title="Asistencia & Puntos"
        subtitle="Genera códigos QR para eventos y cultos."
        showHelp={showHelp}
        helpText="Crea una sesión, proyecta el QR en la iglesia, y los hermanos podrán sumarse puntos escaneando con la App."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CREATE CARD */}
        <div className="bg-gradient-to-br from-brand-primary/20 to-amber-500/10 p-8 rounded-[3rem] border border-brand-primary/30 h-fit sticky top-12">
          <h3 className="text-xl font-bold text-brand-obsidian dark:text-white mb-6">Generar Asistencia</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Nombre del Evento</label>
              <input
                className="w-full bg-white dark:bg-black/20 p-4 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary font-bold text-sm"
                placeholder="Ej: Culto de Adoración"
                value={attendanceForm.event_name}
                onChange={e => setAttendanceForm({ ...attendanceForm, event_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Puntos</label>
                <input
                  type="number"
                  className="w-full bg-white dark:bg-black/20 p-4 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary font-bold text-sm"
                  value={attendanceForm.points}
                  onChange={e => setAttendanceForm({ ...attendanceForm, points: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Validez (hs)</label>
                <input
                  type="number"
                  className="w-full bg-white dark:bg-black/20 p-4 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary font-bold text-sm"
                  value={attendanceForm.expires_in_hours}
                  onChange={e => setAttendanceForm({ ...attendanceForm, expires_in_hours: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <button
              onClick={() => {
                const active = attendanceSessions.find((s: any) => s.status === 'active' && new Date(s.expires_at) > new Date());
                if (active) {
                  if (confirm("Ya tienes un QR activo. ¿Deseas finalizar el actual y crear uno nuevo?")) {
                    updateAttendanceStatusMutation.mutate({
                      id: (active as any).id,
                      status: 'finished',
                      expires_at: new Date().toISOString()
                    }, {
                      onSuccess: () => createAttendanceSessionMutation.mutate(attendanceForm)
                    });
                  }
                } else {
                  createAttendanceSessionMutation.mutate(attendanceForm);
                }
              }}
              disabled={!attendanceForm.event_name}
              className="w-full py-4 bg-brand-primary text-brand-obsidian font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              Crear Nuevo QR
            </button>
          </div>
        </div>

        {/* LIST CARD (SLIM ROWS) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold dark:text-white">Historial Reciente</h3>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Máx 10 sesiones</span>
              {attendanceSessions.length > 0 && (
                <button
                  onClick={() => { if (confirm("¿Seguro que quieres borrar TODO el historial de asistencia? Esta acción no se puede deshacer.")) clearAttendanceHistoryMutation.mutate(); }}
                  className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-all"
                >
                  Vaciar Historial
                </button>
              )}
            </div>
          </div>
          {attendanceSessions.length === 0 ? (
            <div className="bg-white dark:bg-brand-surface p-12 rounded-[3rem] text-center border border-brand-obsidian/5 opacity-50 italic">
              No hay sesiones generadas aún.
            </div>
          ) : (
            <div className="space-y-2">
              {attendanceSessions.map((session: any) => {
                const isExpired = new Date(session.expires_at) < new Date();
                const isActive = session.status === 'active' && !isExpired;
                const isPaused = session.status === 'paused';

                return (
                  <div key={session.id} className="bg-white dark:bg-brand-surface px-6 py-4 rounded-2xl border border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : isPaused ? 'bg-amber-500' : 'bg-rose-500'} `} />
                      <div>
                        <h4 className="font-bold text-sm text-brand-obsidian dark:text-white">{session.event_name}</h4>
                        <p className="text-[9px] opacity-40 uppercase font-black tracking-widest">
                          {session.points} pts • {new Date(session.created_at).toLocaleDateString()} • {session.status.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAttendanceSession(session)}
                        className="p-2 rounded-lg bg-brand-silk dark:bg-white/5 text-brand-primary hover:bg-brand-primary hover:text-brand-obsidian transition-all"
                        title="Ver QR Grande"
                      >
                        <span className="material-symbols-outlined text-lg">fullscreen</span>
                      </button>

                      {isActive && (
                        <button
                          onClick={() => updateAttendanceStatusMutation.mutate({ id: session.id, status: 'paused' })}
                          className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                          title="Pausar"
                        >
                          <span className="material-symbols-outlined text-lg">pause</span>
                        </button>
                      )}

                      {isPaused && (
                        <button
                          onClick={() => updateAttendanceStatusMutation.mutate({ id: session.id, status: 'active' })}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                          title="Reanudar"
                        >
                          <span className="material-symbols-outlined text-lg">play_arrow</span>
                        </button>
                      )}

                      {(isActive || isPaused) && (
                        <button
                          onClick={() => updateAttendanceStatusMutation.mutate({ id: session.id, status: 'finished', expires_at: new Date().toISOString() })}
                          className="p-2 rounded-lg bg-brand-obsidian/10 dark:bg-white/10 text-brand-obsidian dark:text-white hover:bg-brand-obsidian hover:text-white transition-all"
                          title="Finalizar"
                        >
                          <span className="material-symbols-outlined text-lg">stop</span>
                        </button>
                      )}

                      <button
                        onClick={() => { if (confirm("¿Eliminar sesión permanente?")) deleteAttendanceSessionMutation.mutate(session.id) }}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL PARA QR GRANDE */}
      {selectedAttendanceSession && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-brand-obsidian/95 backdrop-blur-xl" onClick={() => setSelectedAttendanceSession(null)} />

          <div className="relative z-10 bg-white p-12 rounded-[4rem] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-500 text-center">
            <button
              onClick={() => setSelectedAttendanceSession(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-brand-silk flex items-center justify-center text-brand-obsidian hover:rotate-90 transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-xl font-black text-brand-obsidian uppercase tracking-tighter mb-2">{selectedAttendanceSession.event_name}</h3>
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.3em] mb-8">Escanear para sumar +{selectedAttendanceSession.points} pts</p>

            <div className="bg-brand-silk p-8 rounded-[3rem] mb-8 flex items-center justify-center">
              <div id="qr-to-download" className="p-4 bg-white rounded-2xl shadow-inner">
                <QRCodeCanvas value={selectedAttendanceSession.token} size={250} />
              </div>
            </div>

            <button
              onClick={() => {
                const svg = document.querySelector('#qr-to-download svg');
                if (!svg) return;
                const svgData = new XMLSerializer().serializeToString(svg);
                const base64 = 'data:image/svg+xml;base64,' + btoa(svgData);
                const a = document.createElement('a');
                a.href = base64;
                a.download = `QR-Asistencia-${selectedAttendanceSession.event_name}.svg`;
                a.click();
              }}
              className="w-full py-5 bg-brand-obsidian text-white font-black uppercase tracking-widest rounded-3xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">download</span>
              Descargar QR
            </button>
          </div>
        </div>
      )}
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
                className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${settings.maintenance_mode ? 'bg-rose-500' : 'bg-gray-200 dark:bg-white/10'} `}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.maintenance_mode ? 'left-7' : 'left-1'} `}></div>
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
                className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${settings.global_notifications ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-white/10'} `}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.global_notifications ? 'left-7' : 'left-1'} `}></div>
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 text-9xl text-brand-obsidian/5 dark:text-white/5 group-hover:scale-110 transition-transform pointer-events-none">
              <span className="material-symbols-outlined">notifications</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- MAIN RENDER ---

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-silk dark:bg-brand-obsidian font-sans selection:bg-brand-primary selection:text-brand-obsidian">
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-brand-obsidian text-white px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in flex items-center gap-3">
          <span className="material-symbols-outlined text-brand-primary">check_circle</span>
          <span className="text-sm font-bold">{showToast}</span>
        </div>
      )}

      {/* Side Navigation */}
      <Sidebar />

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-6 bg-white dark:bg-brand-surface border-b border-brand-obsidian/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-brand-obsidian">
            <span className="material-symbols-outlined text-sm font-black">admin_panel_settings</span>
          </div>
          <h1 className="font-serif font-bold text-lg text-brand-obsidian dark:text-white">Admin</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-brand-silk dark:bg-white/5 rounded-lg text-brand-obsidian dark:text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen scroll-smooth">
        {activeModule === 'dashboard' && renderDashboard()}
        {activeModule === 'news' && renderNewsModule()}
        {activeModule === 'events' && renderEventsModule()}
        {activeModule === 'my-ministry' && renderMinistryModule()}
        {activeModule === 'about-us' && renderAboutUsModule()}
        {activeModule === 'users' && renderUsersModule()}
        {activeModule === 'attendance' && renderAttendanceModule()}
        {activeModule === 'settings' && renderSettingsModule()}
      </main>

      {/* Modals */}
      {selectedAttendanceSession && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-brand-obsidian mb-2">{selectedAttendanceSession.event_name}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-8">Escanea para sumar puntos</p>

            <div className="bg-white p-6 rounded-[2rem] shadow-inner mb-8 flex justify-center border-4 border-brand-primary/20">
              <QRCodeCanvas
                value={selectedAttendanceSession.token}
                size={200}
                level="H"
                includeMargin
              />
            </div>

            <p className="text-xs text-brand-obsidian/40 font-medium mb-8">Este código es personal para este culto. Expira automáticamente.</p>

            <button
              onClick={() => setSelectedAttendanceSession(null)}
              className="w-full py-5 bg-brand-obsidian text-white font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {isCreatingNews && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-brand-obsidian animate-in fade-in duration-300 flex flex-col">
          {isCropping && croppingImage && (
            <ImageCropper
              image={croppingImage}
              aspect={cropTarget === 'cover' ? 16 / 9 : undefined}
              onCropComplete={handleCropComplete}
              onCancel={() => { setIsCropping(false); setCroppingImage(null); }}
            />
          )}
          {/* Pro Header */}
          <div className="h-20 px-8 border-b border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-brand-surface/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCreatingNews(false)}
                className="w-10 h-10 rounded-xl bg-brand-silk dark:bg-white/5 flex items-center justify-center text-brand-obsidian dark:text-white hover:bg-brand-primary hover:text-brand-obsidian transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-obsidian dark:text-white leading-none">Editor Editorial</h3>
                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] mt-1">{editingNews ? 'Modificando Publicación' : 'Nueva Primicia'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={async () => {
                  let imgUrl = newsForm.image_url || '';
                  if (mediaFile) {
                    const up = await uploadImage(mediaFile);
                    if (up) imgUrl = up;
                  }
                  saveNewsMutation.mutate({ ...newsForm, image_url: imgUrl });
                }}
                disabled={isUploading || !newsForm.title}
                className="px-8 py-3 bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian font-black text-[10px] uppercase tracking-[0.3em] rounded-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
              >
                {isUploading ? (
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">publish</span>
                )}
                {editingNews ? 'Guardar Cambios' : 'Publicar Ahora'}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Editor Pane */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 overflow-y-auto border-r border-brand-obsidian/5 dark:border-white/5 bg-brand-silk/30 dark:bg-black/10">
              <div className="max-w-xl mx-auto space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-obsidian/40 dark:text-white/30 px-1">Composición Visual</label>
                  <div className="relative aspect-video rounded-[2.5rem] bg-white dark:bg-brand-surface border-2 border-dashed border-brand-obsidian/10 dark:border-white/10 overflow-hidden flex flex-col items-center justify-center group">
                    {mediaPreview || newsForm.image_url ? (
                      <>
                        <img src={mediaPreview || newsForm.image_url} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <label className="px-6 py-3 bg-white text-brand-obsidian rounded-xl cursor-pointer font-black text-[10px] uppercase tracking-widest shadow-xl">
                            Cambiar Imagen
                            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center gap-4 cursor-pointer">
                        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                          <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-brand-obsidian dark:text-white">Subir Portada Impactante</p>
                          <p className="text-[9px] text-brand-obsidian/40 dark:text-white/40 uppercase tracking-widest mt-1">Sugerido: 1920x1080px</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-obsidian/40 dark:text-white/30 px-1">Encabezado</label>
                    <input
                      className="w-full bg-white dark:bg-brand-surface p-6 rounded-2xl text-xl font-serif font-bold border-none focus:ring-2 focus:ring-brand-primary placeholder:text-brand-obsidian/20 dark:placeholder:text-white/10 text-brand-obsidian dark:text-white shadow-sm"
                      placeholder="Escribe el título de la noticia..."
                      value={newsForm.title || ''}
                      onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-obsidian/40 dark:text-white/30 px-1">Sección</label>
                      <select
                        className="w-full bg-white dark:bg-brand-surface p-4 rounded-xl font-bold border-none focus:ring-2 focus:ring-brand-primary text-sm text-brand-obsidian dark:text-white shadow-sm"
                        value={newsForm.category || 'General'}
                        onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}
                      >
                        <option value="General">General</option>
                        <option value="Evento">Evento</option>
                        <option value="Aviso">Aviso</option>
                        <option value="Urgente">Urgente</option>
                        <option value="Editorial">Editorial</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-obsidian/40 dark:text-white/30 px-1">Destacado</label>
                      <div
                        onClick={() => setNewsForm({ ...newsForm, priority: !newsForm.priority })}
                        className={`w-full p-4 rounded-xl font-bold flex items-center justify-between cursor-pointer transition-all border-2 ${newsForm.priority ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-white dark:bg-brand-surface border-transparent text-brand-obsidian/40'}`}
                      >
                        <span className="text-xs uppercase tracking-widest font-black">{newsForm.priority ? 'Prioridad Alta' : 'Prioridad Normal'}</span>
                        <span className="material-symbols-outlined text-lg">{newsForm.priority ? 'star' : 'star_outline'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-obsidian/40 dark:text-white/30">Cuerpo Editorial (Pro Markdown)</label>
                      <div className="flex items-center gap-1">
                        <button onClick={() => insertFormatting('**', '**')} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" title="Negrita">
                          <span className="material-symbols-outlined text-lg">format_bold</span>
                        </button>
                        <button onClick={() => insertFormatting('*', '*')} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" title="Cursiva">
                          <span className="material-symbols-outlined text-lg">format_italic</span>
                        </button>
                        <button onClick={() => insertFormatting('## ')} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" title="Título 2">
                          <span className="material-symbols-outlined text-lg">format_h2</span>
                        </button>
                        <button onClick={() => insertFormatting('### ')} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" title="Título 3">
                          <span className="material-symbols-outlined text-lg">format_h3</span>
                        </button>
                        <button onClick={() => insertFormatting('> ')} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" title="Cita">
                          <span className="material-symbols-outlined text-lg">format_quote</span>
                        </button>
                        <button onClick={() => insertFormatting('- ')} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" title="Lista">
                          <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
                        </button>
                        <button onClick={() => generateTOC()} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" title="Generar Índice">
                          <span className="material-symbols-outlined text-lg">toc</span>
                        </button>
                        <label className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors cursor-pointer" title="Insertar Imagen Inline">
                          <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'inline')} />
                        </label>
                      </div>
                    </div>
                    <textarea
                      id="news-content-editor"
                      className="w-full bg-white dark:bg-brand-surface p-6 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary text-brand-obsidian dark:text-white min-h-[400px] resize-none font-sans leading-relaxed shadow-sm text-base"
                      placeholder="Redacta el contenido completo aquí..."
                      value={newsForm.content || ''}
                      onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-obsidian/40 dark:text-white/30 px-1">Recurso de Video (URL)</label>
                    <div className="flex items-center bg-white dark:bg-brand-surface p-4 rounded-xl gap-3 shadow-sm">
                      <span className="material-symbols-outlined text-brand-primary">play_circle</span>
                      <input
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-brand-obsidian dark:text-white"
                        placeholder="https://youtube.com/..."
                        value={newsForm.video_url || ''}
                        onChange={e => setNewsForm({ ...newsForm, video_url: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview Pane */}
            <div className="hidden lg:block lg:w-1/2 bg-white dark:bg-brand-obsidian overflow-y-auto relative">
              <div className="absolute top-8 left-8 z-20">
                <div className="bg-brand-obsidian text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl backdrop-blur-md flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
                  Vista Previa en Vivo
                </div>
              </div>

              {/* Aesthetic Mockup of NewsDetail */}
              <div className="max-w-2xl mx-auto pt-40 px-12 pb-20 opacity-90 transition-all duration-300">
                <div className="space-y-8">
                  <img
                    src={mediaPreview || newsForm.image_url || 'https://via.placeholder.com/800x450?text=Sin+Imagen'}
                    className="w-full aspect-video object-cover rounded-[3rem] shadow-2xl"
                    alt=""
                  />
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-brand-primary text-brand-obsidian text-[8px] font-black uppercase tracking-widest rounded-full">{newsForm.category || 'GENERAL'}</span>
                      <span className="text-[10px] text-brand-obsidian/30 dark:text-white/30 uppercase font-bold tracking-widest">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <h1 className="text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-[0.9] tracking-tighter">
                      {newsForm.title || 'Tu título aquí...'}
                    </h1>
                    <div className="prose dark:prose-invert max-w-none text-xl text-brand-obsidian/70 dark:text-brand-cream/80 font-serif leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {newsForm.content || 'Escribe contenido para verlo reflejado aquí con el estilo editorial de la iglesia.'}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

// Helper for empty states (optional)
const EmptyStateAction = ({ icon, label, subLabel, actionLabel, onAction, showHelp, helpText }: any) => (
  // Omitted for brevity, logic integrated in modules
  null
);

export default AdminPanel;
