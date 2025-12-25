
import { Database } from './database.types';

export type AppRole = Database['public']['Enums']['app_role'];

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- EXTENDED TYPES FOR UI ---

export interface Profile extends Tables<'profiles'> {
  // Add any UI-specific properties if derived, otherwise just use the Row type
}

export interface User extends Profile {
  // Alias for backward compatibility if needed, but better to migrate to Profile
  avatar: string | null; // Mapped from avatar_url
  registeredMinistries: string[]; // This might need a separate query or join
  joinedDate: string; // Mapped from joined_date
}

// --- DOMAIN SPECIFIC INTERFACES ---

// --- DOMAIN SPECIFIC INTERFACES ---

export interface Comment extends Tables<'comments'> {
  userName: string;
  userAvatar?: string;
}

export interface Post extends Tables<'posts'> {
  userName: string;
  userAvatar: string;
  likes: number;
  comments: Comment[]; // Nested comments for UI
  isLiked: boolean; // UI state
}

export interface Devotional extends Tables<'devotionals'> {
  userName: string;
  userAvatar: string;
}

// Keep these if they are not in DB or are strict UI types
export interface AppNotification extends Tables<'notifications'> {
  // Add any UI specific properties if needed, e.g.
  status?: 'new' | 'seen';
}

export interface NewsItem extends Tables<'news'> {
  author?: string;
  userAvatar?: string;
}

export interface EventItem extends Tables<'events'> {
  // Extended properties if needed
}

export interface Ministry extends Tables<'ministries'> {
  leaders: { name: string; role: string; avatar: string }[]; // Fetched separately
}

export interface Inscription extends Tables<'inscriptions'> {
  userName: string;
  userEmail: string;
  ministryName: string;
}

export type PrayerCategory = 'Salud' | 'Familia' | 'Finanzas' | 'Gratitud' | 'Espiritual' | 'Otro';

export interface PrayerRequest extends Tables<'prayer_requests'> {
  userName: string;
  category: PrayerCategory; // Ensure DB matches this or cast
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
