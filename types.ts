
export enum AppRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  MINISTRY_LEADER = 'MINISTRY_LEADER',
  PASTOR = 'PASTOR',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  avatar: string;
  registeredMinistries: string[];
  bio?: string;
  joinedDate: string;
}

export interface Devotional {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  bibleVerse: string;
  content: string;
  audioUrl?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'community' | 'system' | 'pastoral';
  isRead: boolean;
  date: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  videoUrl?: string;
  date: string;
  priority: 'low' | 'high';
  author?: string;
  category?: string;
  userAvatar?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  isFeatured: boolean;
  category: 'Celebración' | 'Célula' | 'Misiones' | 'Taller';
  capacity?: string;
}

export interface Ministry {
  id: string;
  name: string;
  vision: string;
  purpose: string;
  activities: string;
  schedule: string;
  leaders: { name: string; role: string; avatar: string }[];
  heroImage: string;
  category: string;
  color: string;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  type: 'image' | 'video';
  timestamp: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: number;
  shares: number;
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Inscription {
  id: string;
  userName: string;
  userEmail: string;
  ministryName: string;
  status: 'pending' | 'approved' | 'rejected';
  note: string;
}

export type PrayerCategory = 'Salud' | 'Familia' | 'Finanzas' | 'Gratitud' | 'Espiritual' | 'Otro';

export interface PrayerRequest {
  id: string;
  userId?: string;
  userName: string;
  content: string;
  category: PrayerCategory;
  isPrivate: boolean;
  amenCount: number;
  createdAt: string;
}

export type AppScreen = 
  | 'dashboard' 
  | 'news' 
  | 'events' 
  | 'about' 
  | 'ministries' 
  | 'devotionals' 
  | 'community' 
  | 'admin' 
  | 'ministry-detail' 
  | 'news-detail' 
  | 'profile' 
  | 'notifications'
  | 'prayer-requests';
