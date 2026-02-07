import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
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
      </main>

    </div>
  );
};

export default AdminPanel;
