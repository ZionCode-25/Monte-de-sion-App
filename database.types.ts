export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devotionals: {
        Row: {
          audio_url: string | null
          bible_verse: string | null
          content: string
          created_at: string
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          audio_url?: string | null
          bible_verse?: string | null
          content: string
          created_at?: string
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          audio_url?: string | null
          bible_verse?: string | null
          content?: string
          created_at?: string
          id?: string
          title: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devotionals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          category: string | null
          created_at: string
          date: string
          description: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string | null
          time: string | null
          title: string
        }
        Insert: {
          capacity?: number | null
          category?: string | null
          created_at?: string
          date: string
          description: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          time?: string | null
          title: string
        }
        Update: {
          capacity?: number | null
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          time?: string | null
          title?: string
        }
        Relationships: []
      }
      inscriptions: {
        Row: {
          created_at: string
          id: string
          ministry_id: string
          note: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ministry_id: string
          note?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ministry_id?: string
          note?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscriptions_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ministries: {
        Row: {
          activities: string | null
          category: string | null
          color: string | null
          created_at: string
          hero_image: string | null
          id: string
          name: string
          purpose: string | null
          schedule: string | null
          vision: string | null
        }
        Insert: {
          activities?: string | null
          category?: string | null
          color?: string | null
          created_at?: string
          hero_image?: string | null
          id?: string
          name: string
          purpose?: string | null
          schedule?: string | null
          vision?: string | null
        }
        Update: {
          activities?: string | null
          category?: string | null
          color?: string | null
          created_at?: string
          hero_image?: string | null
          id?: string
          name?: string
          purpose?: string | null
          schedule?: string | null
          vision?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          priority: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          priority?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          priority?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          media_type: string | null
          media_url: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          amen_count: number | null
          category: string | null
          content: string
          created_at: string
          id: string
          is_private: boolean | null
          user_id: string | null
        }
        Insert: {
          amen_count?: number | null
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          user_id?: string | null
        }
        Update: {
          amen_count?: number | null
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prayer_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          email: string | null
          id: string
          joined_date: string
          name: string | null
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          email?: string | null
          id: string
          joined_date?: string
          name?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          email?: string | null
          id?: string
          joined_date?: string
          name?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          media_url: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          media_url: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          media_url?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'comment' | 'like' | 'system' | 'event'
          title: string
          message: string
          created_at: string
          is_read: boolean
          metadata: { [key: string]: any } | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'comment' | 'like' | 'system' | 'event'
          title: string
          message: string
          created_at?: string
          is_read?: boolean
          metadata?: { [key: string]: any } | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'comment' | 'like' | 'system' | 'event'
          title?: string
          message?: string
          created_at?: string
          is_read?: boolean
          metadata?: { [key: string]: any } | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role:
      | "USER"
      | "MODERATOR"
      | "MINISTRY_LEADER"
      | "PASTOR"
      | "SUPER_ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
    Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
    Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof Database["public"]["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
