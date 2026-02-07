import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Componentes Layout y Contextos (Rutas corregidas)
import SharedLayout from './components/SharedLayout';
import { useAuth } from './components/context/AuthContext';
import { User } from '../types';
// Si routes.tsx está en src/, y types.ts en root. ../types.

// Lazy Imports
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewsFeed = lazy(() => import('./pages/NewsFeed'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const EventsCalendar = lazy(() => import('./pages/EventsCalendar'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const MinistriesList = lazy(() => import('./pages/MinistriesList'));
const MinistryDetail = lazy(() => import('./pages/MinistryDetail'));
const DevotionalJournal = lazy(() => import('./pages/DevotionalJournal'));
const CommunityFeed = lazy(() => import('./pages/CommunityFeed'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const ProfileView = lazy(() => import('./pages/ProfileView'));
const NotificationsView = lazy(() => import('./pages/NotificationsView'));
const PrayerRequests = lazy(() => import('./pages/PrayerRequests'));
const AttendanceScanner = lazy(() => import('./components/AttendanceScanner'));
const Ranking = lazy(() => import('./pages/Ranking'));

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
        <Route path="admin" element={<AdminPanel />} />
        <Route path="profile" element={<ProfileView theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="profile/:userId" element={<ProfileView theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="notifications" element={<NotificationsView onBack={() => window.history.back()} />} />
        <Route path="prayer-requests" element={<PrayerRequests onBack={() => window.history.back()} />} />
        <Route path="ranking" element={<Ranking onBack={() => window.history.back()} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="/scan" element={<AttendanceScanner onBack={() => window.history.back()} />} />
    </Routes>
  );
};
