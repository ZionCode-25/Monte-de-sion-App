
import { Database } from '../database.types';

export type AppRole = Database['public']['Enums']['app_role'];

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- EXTENDED TYPES FOR UI ---

export interface Profile extends Tables<'profiles'> {
    is_banned?: boolean;
    is_deleted?: boolean;
}

export interface User extends Profile {
    avatar: string | null;
    registeredMinistries: string[];
    joinedDate: string;
    is_banned: boolean; // Explicitly adding for clarity in context
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
    mediaUrl?: string | null; // UI alias
    location?: string | null; // UI alias
    createdAt?: string; // UI alias
}

export interface Devotional extends Tables<'devotionals'> {
    userName: string;
    userAvatar: string;
    bibleVerse?: string; // UI alias
    audioUrl?: string;   // UI alias
    createdAt?: string;  // UI alias
    duration?: string | null;
}

export interface Story {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    mediaUrl?: string;
    text?: string;
    type: 'image' | 'video';
    timestamp: string;
    created_at?: string;
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
    video_url?: string; // Optional embedded video link
    subtitle?: string; // Structural subtitle
    epigraph?: string; // Background image caption
}

export interface EventItem extends Tables<'events'> {
    // Extended properties if needed
    imageUrl?: string; // UI Alias
    time?: string; // UI Alias
    isFeatured?: boolean; // UI Alias for priority
    capacity?: number; // Added: expected by UI
    lat?: number;
    lng?: number;
    color?: string;
}

export interface Ministry extends Tables<'ministries'> {
    description?: string; // Optional, might not exist in DB
    leaders?: { name: string; role: string; avatar: string }[]; // Optional for UI display
    heroImage?: string; // UI alias for hero_image
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
    | 'prayer-requests'
    | 'shop';

export interface AttendanceSession {
    id: string;
    event_name: string;
    code: string;
    points: number;
    expires_at: string;
    status: 'active' | 'expired';
}

export interface Venture {
    id: string;
    owner_id: string;
    name: string;
    description: string;
    category: string;
    logo_url: string;
    banner_url?: string | null;
    whatsapp_number: string;
    bank_alias?: string | null;
    bank_cbu?: string | null;
    instagram_handle?: string | null;
    status: 'pending' | 'approved' | 'rejected';
    is_official?: boolean;
    theme_color?: string;
    carousel_images?: string[];
    created_at?: string;
    owner_profile?: {
        name: string;
        avatar_url: string | null;
    };
}

export interface Product {
    id: string;
    venture_id: string;
    title: string;
    description?: string | null;
    price: number;
    currency?: string;
    images: string[];
    category?: string | null;
    in_stock?: boolean;
    is_featured?: boolean;
    is_sion_offer?: boolean;
    created_at?: string;
    venture?: Venture;
    avg_rating?: number;
    reviews_count?: number;
}

export interface ProductReview {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_profile?: {
        name: string;
        avatar_url: string | null;
    };
}
