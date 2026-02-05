import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- Static Imports (Core) ---
import LoadingScreen from './src/components/ui/LoadingScreen';
import LoginScreen from './src/pages/LoginScreen';
import { AuthProvider, useAuth } from './src/components/context/AuthContext';
import { RealtimeProvider } from './src/components/context/RealtimeContext';
import { ToastProvider } from './src/components/context/ToastContext';
import { AppRoutes } from './src/routes';

const queryClient = new QueryClient();

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth(); // signOut y updateProfile no se usan aquí

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

  if (authLoading) return <LoadingScreen theme={theme} />;

  // Render LoginScreen conditionally if not authenticated
  if (!user) return <LoginScreen theme={theme} />;

  if (!appReady) return <LoadingScreen theme={theme} />;

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen theme={theme} />}>
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
