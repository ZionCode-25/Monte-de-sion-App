
import { Database } from '../../database.types';

export type AppRole = Database['public']['Enums']['app_role'];

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- EXTENDED TYPES FOR UI ---

export interface Profile extends Tables<'profiles'> {
    church_title?: string;
    // Add any UI-specific properties if derived, otherwise just use the Row type
}

export interface User extends Profile {
    // Alias for backward compatibility if needed, but better to migrate to Profile
    avatar: string | null; // Mapped from avatar_url
    registeredMinistries: string[]; // This might need a separate query or join
    joinedDate: string; // Mapped from joined_date
    impact_points?: number; // Gamification score
}

// --- DOMAIN SPECIFIC INTERFACES ---

export interface Comment extends Tables<'comments'> {
    userName: string;
    userAvatar?: string;
    likes: number; // New: Like count
    isLiked: boolean; // New: User like status
    replies?: Comment[]; // New: Nested replies
}

export interface Post extends Tables<'posts'> {
    userName: string;
    userAvatar: string;
    likes: number;
    comments: Comment[]; // Nested comments for UI
    mediaUrls?: string[]; // Array of media URLs for carousel

    isLiked: boolean; // UI state
    isSaved?: boolean; // UI state for saved posts
}

export interface Devotional extends Tables<'devotionals'> {
    userName: string;
    userAvatar: string;
    bibleVerse?: string; // UI alias
    audioUrl?: string;   // UI alias
    createdAt?: string;  // UI alias
    duration?: string | null;
}

// Keep these if they are not in DB or are strict UI types
export interface AppNotification extends Tables<'notifications'> {
    // Add any UI specific properties if needed, e.g.
    status?: 'new' | 'seen';
    title?: string;
    message?: string;
}

export interface NewsItem extends Tables<'news'> {
    author?: string;
    userAvatar?: string;
    imageUrl?: string; // UI Alias
    date?: string; // UI Alias
}

export interface EventItem extends Tables<'events'> {
    // Extended properties if needed
    imageUrl?: string; // UI Alias
    time?: string; // UI Alias
    isFeatured?: boolean; // UI Alias for priority
    capacity?: number; // Added: expected by UI
}

export interface Ministry extends Tables<'ministries'> {
    leaders: { name: string; role: string; avatar: string }[]; // Fetched separately
    leader_id?: string;
    schedule?: string;
    activities?: string;
    notes?: string;
    vision?: string;
    purpose?: string;
    category?: string;
    hero_image?: string;
    heroImage?: string;
}

export interface MinistryMember {
    id: string;
    ministry_id: string;
    user_id: string;
    role: string;
    joined_at: string;
    user?: {
        name: string;
        avatar_url: string | null;
    };
    ministry?: {
        name: string;
    };
}

export interface Inscription extends Tables<'inscriptions'> {
    userName: string;
    userEmail: string;
    ministryName: string;
}

export type PrayerCategory = 'Salud' | 'Familia' | 'Finanzas' | 'Gratitud' | 'Espiritual' | 'Otro';

export interface PrayerRequest extends Tables<'prayer_requests'> {
    userName: string;
    userAvatar?: string;
    amenCount?: number; // UI alias - now calculated from interactions
    category: PrayerCategory;

    // New interaction fields
    interaction_count: number;
    user_has_interacted: boolean;
    interactions?: PrayerInteraction[];
    audioUrl?: string | null;
    duration?: string | null;
}

export interface PrayerInteraction {
    id: string;
    user_id: string;
    prayer_id: string;
    interaction_type: 'amen' | 'intercession';
    created_at: string;
    user: {
        name: string;
        avatar_url: string | null;
    };
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

export interface AttendanceSession {
    id: string;
    event_name: string;
    code: string;
    points: number;
    expires_at: string;
    status: 'active' | 'expired';
}
