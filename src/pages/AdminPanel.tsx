import React, { useState } from 'react';
import { useAuth } from '../components/context/AuthContext';
import { supabase } from '../lib/supabase';

// Components
import { AdminSidebar } from '../components/admin/Sidebar';
import { ToastNotifications } from '../components/admin/ToastNotifications';
import AdminDashboard from './admin/AdminDashboard';
import AdminNews from './admin/AdminNews';
import AdminEvents from './admin/AdminEvents';
import AdminUsers from './admin/AdminUsers';
import AdminSettings from './admin/AdminSettings';
import AdminMinistry from './admin/AdminMinistry';
import AdminAttendance from './admin/AdminAttendance';

import { useNavigate, Navigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const isAuthorized = ['SUPER_ADMIN', 'PASTOR', 'MINISTRY_LEADER'].includes(user.role || '');
  if (!isAuthorized) {
    return <Navigate to="/dashboard" replace />;
  }

  const [activeModule, setActiveModule] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const triggerToast = (msg: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Shared Helper: Image Upload
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `admin-uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Using avatars bucket as defined in original code, might want to change to 'media' later
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      triggerToast("Error al subir imagen");
      return null;
    }
  };

  // Module Router
  const renderContent = () => {
    const props = { user, triggerToast, uploadImage };

    switch (activeModule) {
      case 'dashboard':
        return <AdminDashboard user={user} setActiveModule={setActiveModule} />;
      case 'news':
        return <AdminNews {...props} />;
      case 'events':
        return <AdminEvents {...props} />;
      case 'users':
        return <AdminUsers user={user} triggerToast={triggerToast} />;
      case 'settings':
        return <AdminSettings user={user} triggerToast={triggerToast} />;
      case 'attendance':
        return <AdminAttendance user={user} triggerToast={triggerToast} />;
      case 'my-ministry':
        return <AdminMinistry />;
      default:
        return <AdminDashboard user={user} setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-bg dark:bg-black font-sans selection:bg-brand-primary/30">

      <AdminSidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        showHelp={showHelp}
        setShowHelp={setShowHelp}
      />

      <main className="flex-1 flex flex-col max-h-[100dvh] overflow-hidden relative">
        {/* Mobile Header Trigger */}
        <div className="md:hidden p-4 flex items-center justify-between bg-white dark:bg-brand-surface border-b border-brand-obsidian/5 dark:border-white/5 flex-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-brand-obsidian">
              <span className="material-symbols-outlined text-sm font-black">admin_panel_settings</span>
            </div>
            <span className="font-serif font-bold text-brand-obsidian dark:text-white">Panel Admin</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-brand-silk dark:bg-white/10 rounded-lg">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>

        {/* Shared UI Overlays */}
        <ToastNotifications toasts={toasts} />

        {showHelp && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-obsidian/80 backdrop-blur-xl animate-in fade-in" onClick={() => setShowHelp(false)} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-brand-surface rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in-95 overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setShowHelp(false)} className="w-12 h-12 rounded-full bg-brand-silk dark:bg-white/5 flex items-center justify-center text-brand-obsidian dark:text-white hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-brand-primary rounded-3xl flex items-center justify-center text-brand-obsidian shadow-lg shadow-brand-primary/20">
                  <span className="material-symbols-outlined text-3xl font-light">help</span>
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white">Centro de <span className="text-brand-primary">Ayuda</span></h3>
                  <p className="text-xs font-black uppercase tracking-widest opacity-40">Guía rápida de administración</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase tracking-widest text-brand-primary">Noticias</h4>
                  <p className="text-sm opacity-60 leading-relaxed font-medium">Usa el editor Markdown para dar formato a tus historias. Puedes incluir audios, videos y fotos destacadas.</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase tracking-widest text-brand-primary">Ministerios</h4>
                  <p className="text-sm opacity-60 leading-relaxed font-medium">Gestiona solicitudes de ingreso, asigna roles de servicio y coordina a los líderes de cada equipo.</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase tracking-widest text-brand-primary">Agenda</h4>
                  <p className="text-sm opacity-60 leading-relaxed font-medium">Crea eventos únicos o recurrentes. Las personas podrán verlos en su calendario personal dentro de la App.</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase tracking-widest text-brand-primary">Seguridad</h4>
                  <p className="text-sm opacity-60 leading-relaxed font-medium">Solo los Super Admins pueden gestionar roles de usuario y acceder a la configuración global del sistema.</p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Versión del Sistema 1.2.0 (Premium)</p>
                <button onClick={() => setShowHelp(false)} className="px-8 py-3 bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Entendido</button>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};

export default AdminPanel;
