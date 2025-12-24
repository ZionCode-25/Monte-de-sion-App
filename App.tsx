
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- Static Imports (Core) ---
import LoadingScreen from './components/LoadingScreen';
import LoginScreen from './components/LoginScreen';
import SharedLayout from './components/SharedLayout';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import { RealtimeProvider } from './components/context/RealtimeContext';

// --- Lazy Load Pages ---
const Dashboard = lazy(() => import('./components/Dashboard'));
const NewsFeed = lazy(() => import('./components/NewsFeed'));
const NewsDetail = lazy(() => import('./components/NewsDetail'));
const EventsCalendar = lazy(() => import('./components/EventsCalendar'));
const AboutUs = lazy(() => import('./components/AboutUs'));
const MinistriesList = lazy(() => import('./components/MinistriesList'));
const MinistryDetail = lazy(() => import('./components/MinistryDetail'));
const DevotionalJournal = lazy(() => import('./components/DevotionalJournal'));
const CommunityFeed = lazy(() => import('./components/CommunityFeed'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const ProfileView = lazy(() => import('./components/ProfileView'));
const NotificationsView = lazy(() => import('./components/NotificationsView'));
const PrayerRequests = lazy(() => import('./components/PrayerRequests'));

const queryClient = new QueryClient();

const MainApp: React.FC = () => {
  const { user, loading: authLoading, signOut, updateProfile } = useAuth();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
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
  if (!user) return <LoginScreen theme={theme} />;
  if (!appReady) return <LoadingScreen theme={theme} />;

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen theme={theme} />}>
        <Routes>
          <Route path="/" element={<SharedLayout user={user} theme={theme} toggleTheme={toggleTheme} />}>
            <Route index element={<Dashboard theme={theme} />} />
            <Route path="news" element={<NewsFeed />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="events" element={<EventsCalendar />} />
            <Route path="about" element={<AboutUs theme={theme} />} />
            <Route path="ministries" element={<MinistriesList />} />
            <Route path="ministries/:id" element={<MinistryDetail />} />
            <Route path="devotionals" element={<DevotionalJournal />} />
            <Route path="community" element={<CommunityFeed user={user} theme={theme} />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="profile" element={<ProfileView user={user} onLogout={signOut} updateUser={updateProfile} theme={theme} onToggleTheme={toggleTheme} />} />
            <Route path="notifications" element={<NotificationsView onBack={() => window.history.back()} />} />
            <Route path="prayer-requests" element={<PrayerRequests onBack={() => window.history.back()} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeProvider>
          <MainApp />
        </RealtimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
