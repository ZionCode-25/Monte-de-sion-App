import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Componentes Layout y Contextos (Rutas corregidas)
import SharedLayout from './components/SharedLayout';
import { useAuth } from './components/context/AuthContext';
import { User } from './types';

// Helper para Lazy Loading seguro contra errores de despliegue ("Unexpected token '<'")
const safeLazy = (importFn: () => Promise<any>) =>
  lazy(async () => {
    const isRefreshed = sessionStorage.getItem('chunk_retry_refreshed');
    try {
      const component = await importFn();
      sessionStorage.removeItem('chunk_retry_refreshed');
      return component;
    } catch (error: any) {
      if (!isRefreshed) {
        sessionStorage.setItem('chunk_retry_refreshed', 'true');
        window.location.reload();
      }
      throw error;
    }
  });

// Lazy Imports
const Dashboard = safeLazy(() => import('./pages/Dashboard'));
const NewsFeed = safeLazy(() => import('./pages/NewsFeed'));
const NewsDetail = safeLazy(() => import('./pages/NewsDetail'));
const EventsCalendar = safeLazy(() => import('./pages/EventsCalendar'));
const AboutUs = safeLazy(() => import('./pages/AboutUs'));
const MinistriesList = safeLazy(() => import('./pages/MinistriesList'));
const MinistryDetail = safeLazy(() => import('./pages/MinistryDetail'));
const DevotionalJournal = safeLazy(() => import('./pages/DevotionalJournal'));
const CommunityFeed = safeLazy(() => import('./pages/CommunityFeed'));
const AdminPanel = safeLazy(() => import('./pages/AdminPanel'));
const ProfileView = safeLazy(() => import('./pages/ProfileView'));
const ShopView = safeLazy(() => import('./pages/ShopView'));
// Critical components loaded directly to avoid ChunkLoadError
import NotificationsView from './pages/NotificationsView';
import PrayerRequests from './pages/PrayerRequests';
import Ranking from './pages/Ranking';
import UpdatePasswordScreen from './pages/UpdatePasswordScreen';
const AttendanceScanner = safeLazy(() => import('./components/AttendanceScanner'));
const PrivacyPolicy = safeLazy(() => import('./pages/legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfUse = safeLazy(() => import('./pages/legal/TermsOfUse').then(m => ({ default: m.TermsOfUse })));
const VerifyCredential = safeLazy(() => import('./pages/VerifyCredential'));

interface AppRoutesProps {
  user: User | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ user, theme, toggleTheme }) => {
  return (
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
        <Route path="shop" element={<ShopView />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="profile" element={<ProfileView theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="profile/:userId" element={<ProfileView theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="notifications" element={<NotificationsView onBack={() => window.history.back()} />} />
        <Route path="prayer-requests" element={<PrayerRequests onBack={() => window.history.back()} />} />
        <Route path="ranking" element={<Ranking onBack={() => window.history.back()} />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfUse />} />
        <Route path="update-password" element={<UpdatePasswordScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="/verificar" element={<VerifyCredential />} />
      <Route path="/verificar/:code" element={<VerifyCredential />} />
      <Route path="/verify/:code" element={<VerifyCredential />} />
      <Route path="/scan" element={<AttendanceScanner onBack={() => window.history.back()} />} />
    </Routes>
  );
};

