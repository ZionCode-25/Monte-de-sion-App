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
      app_settings: {
        Row: {
          key: string
          value: Json
          created_at: string
        }
        Insert: {
          key: string
          value: Json
          created_at?: string
        }
        Update: {
          key?: string
          value?: Json
          created_at?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
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
      content_reports: {
        Row: {
          id: string
          reporter_id: string
          content_type: 'post' | 'devotional' | 'prayer_request'
          content_id: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          content_type: 'post' | 'devotional' | 'prayer_request'
          content_id: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          content_type?: 'post' | 'devotional' | 'prayer_request'
          content_id?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      attendance_sessions: {
        Row: {
          id: string
          event_name: string
          code: string
          points: number
          expires_at: string
          status: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          event_name: string
          code: string
          points: number
          expires_at: string
          status?: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          event_name?: string
          code?: string
          points?: number
          expires_at?: string
          status?: string
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sessions_created_by_fkey"
            columns: ["created_by"]
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
          is_hidden: boolean | null
        }
        Insert: {
          audio_url?: string | null
          bible_verse?: string | null
          content: string
          created_at?: string
          id?: string
          title: string
          user_id?: string | null
          is_hidden?: boolean | null
        }
        Update: {
          audio_url?: string | null
          bible_verse?: string | null
          content?: string
          created_at?: string
          id?: string
          title?: string
          user_id?: string | null
          is_hidden?: boolean | null
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
          category: string | null
          created_at: string
          date: string
          description: string
          id: string
          image_url: string | null
          location: string | null
          priority: boolean | null
          title: string
          color: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          date: string
          description: string
          id?: string
          image_url?: string | null
          location?: string | null
          priority?: boolean | null
          title: string
          color?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          image_url?: string | null
          location?: string | null
          priority?: boolean | null
          title?: string
          color?: string | null
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
          id: string
          name: string
          vision: string | null
          purpose: string | null
          activities: string | null
          schedule: string | null
          hero_image: string | null
          category: string | null
          color: string | null
          leader_id: string | null
          notes: string | null
          leader_image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          vision?: string | null
          purpose?: string | null
          activities?: string | null
          schedule?: string | null
          hero_image?: string | null
          category?: string | null
          color?: string | null
          leader_id?: string | null
          notes?: string | null
          leader_image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          vision?: string | null
          purpose?: string | null
          activities?: string | null
          schedule?: string | null
          hero_image?: string | null
          category?: string | null
          color?: string | null
          leader_id?: string | null
          notes?: string | null
          leader_image_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministries_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ministry_members: {
        Row: {
          id: string
          ministry_id: string | null
          user_id: string | null
          role: string | null
          joined_at: string | null
        }
        Insert: {
          id?: string
          ministry_id?: string | null
          user_id?: string | null
          role?: string | null
          joined_at?: string | null
        }
        Update: {
          id?: string
          ministry_id?: string | null
          user_id?: string | null
          role?: string | null
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ministry_members_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ministry_members_user_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      news: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          priority: boolean | null
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          priority?: boolean | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          priority?: boolean | null
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          related_id: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
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
          is_hidden: boolean | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          user_id: string
          is_hidden?: boolean | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          user_id?: string
          is_hidden?: boolean | null
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
          is_hidden: boolean | null
        }
        Insert: {
          amen_count?: number | null
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          user_id?: string | null
          is_hidden?: boolean | null
        }
        Update: {
          amen_count?: number | null
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          user_id?: string | null
          is_hidden?: boolean | null
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
          email: string
          id: string
          joined_date: string | null
          name: string
          role: Database["public"]["Enums"]["app_role"] | null
          impact_points: number | null
          church_title: string | null
          last_login_date: string | null
          current_streak: number | null
          longest_streak: number | null
          is_banned: boolean | null
          is_deleted: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          email: string
          id: string
          joined_date?: string | null
          name: string
          role?: Database["public"]["Enums"]["app_role"] | null
          impact_points?: number | null
          church_title?: string | null
          last_login_date?: string | null
          current_streak?: number | null
          longest_streak?: number | null
          is_banned?: boolean | null
          is_deleted?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          email?: string
          id?: string
          joined_date?: string | null
          name?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          impact_points?: number | null
          church_title?: string | null
          last_login_date?: string | null
          current_streak?: number | null
          longest_streak?: number | null
          is_banned?: boolean | null
          is_deleted?: boolean | null
        }
        Relationships: []
      }
      saved_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      },
      prayer_interactions: {
        Row: {
          id: string
          prayer_id: string
          user_id: string
          interaction_type: 'amen' | 'intercession'
          created_at: string
        }
        Insert: {
          id?: string
          prayer_id: string
          user_id: string
          interaction_type: 'amen' | 'intercession'
          created_at?: string
        }
        Update: {
          id?: string
          prayer_id?: string
          user_id?: string
          interaction_type?: 'amen' | 'intercession'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_interactions_prayer_id_fkey"
            columns: ["prayer_id"]
            isOneToOne: false
            referencedRelation: "prayer_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },
      devotional_interactions: {
        Row: {
          id: string
          devotional_id: string
          user_id: string
          interaction_type: 'listened' | 'favorite' | 'amen'
          created_at: string
        }
        Insert: {
          id?: string
          devotional_id: string
          user_id: string
          interaction_type: 'listened' | 'favorite' | 'amen'
          created_at?: string
        }
        Update: {
          id?: string
          devotional_id?: string
          user_id?: string
          interaction_type?: 'listened' | 'favorite' | 'amen'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_interactions_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_interactions_user_id_fkey"
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
      notification_type: "comment" | "like" | "system" | "event"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: "public" },
  TableName extends PublicTableNameOrOptions extends { schema: "public" }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: "public" }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: "public" },
  TableName extends PublicTableNameOrOptions extends { schema: "public" }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: "public" }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: "public" },
  TableName extends PublicTableNameOrOptions extends { schema: "public" }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: "public" }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: "public" },
  EnumName extends PublicEnumNameOrOptions extends { schema: "public" }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: "public" }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: "public" },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: "public"
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: "public" }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "USER",
        "MODERATOR",
        "MINISTRY_LEADER",
        "PASTOR",
        "SUPER_ADMIN",
      ],
      notification_type: ["comment", "like", "system", "event"],
    },
  },
} as const
