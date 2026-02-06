import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- Static Imports (Core) ---
import SplashScreen from './src/components/ui/SplashScreen';
import LoadingScreen from './src/components/ui/LoadingScreen';
import LoginScreen from './src/pages/LoginScreen';
import { AuthProvider, useAuth } from './src/components/context/AuthContext';
import { RealtimeProvider } from './src/components/context/RealtimeContext';
import { ToastProvider } from './src/components/context/ToastContext';
import { AppRoutes } from './src/routes';
import { useDailyStreak } from './src/hooks/useDailyStreak';

const queryClient = new QueryClient();

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  useDailyStreak();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      // Inicializar OneSignal y vincular al usuario
      import('./lib/onesignal').then(({ initOneSignal }) => {
        initOneSignal(user.id);
      });

      const timer = setTimeout(() => {
        setAppReady(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [authLoading, user]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Si se está cargando el estado inicial o si el usuario está logueado pero la app aún no está lista
  if (authLoading || (user && !appReady)) {
    return <SplashScreen />;
  }

  // Si no hay usuario, mostrar pantalla de login
  if (!user) return <LoginScreen theme={theme} />;

  return (
    <BrowserRouter>
      <Suspense fallback={<SplashScreen />}>
        <AppRoutes user={user} theme={theme} toggleTheme={toggleTheme} />
      </Suspense>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <RealtimeProvider>
            <MainApp />
          </RealtimeProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
