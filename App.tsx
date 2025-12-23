import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './components/Dashboard';
import NewsFeed from './components/NewsFeed';
import NewsDetail from './components/NewsDetail';
import EventsCalendar from './components/EventsCalendar';
import AboutUs from './components/AboutUs';
import MinistriesList from './components/MinistriesList';
import MinistryDetail from './components/MinistryDetail';
import DevotionalJournal from './components/DevotionalJournal';
import CommunityFeed from './components/CommunityFeed';
import AdminPanel from './components/AdminPanel';
import ProfileView from './components/ProfileView';
import NotificationsView from './components/NotificationsView';
import PrayerRequests from './components/PrayerRequests';
import LoadingScreen from './components/LoadingScreen';
import LoginScreen from './components/LoginScreen';
import SharedLayout from './components/SharedLayout';
import { AuthProvider, useAuth } from './components/context/AuthContext';

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
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
