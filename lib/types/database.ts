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
      club_members: {
        Row: {
          club_id: string
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["club_role"]
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string | null
          role: Database["public"]["Enums"]["club_role"]
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["club_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_messages: {
        Row: {
          id: string
          club_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string | null
          is_edited: boolean
          edited_at: string | null
        }
        Insert: {
          id?: string
          club_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string | null
          is_edited?: boolean
          edited_at?: string | null
        }
        Update: {
          id?: string
          club_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string | null
          is_edited?: boolean
          edited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_messages_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          city: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          owner_id: string
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          owner_id: string
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          owner_id?: string
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          checked_in: boolean
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string
          event_id: string
          id: string
          registration_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checked_in?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          event_id: string
          id?: string
          registration_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checked_in?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          event_id?: string
          id?: string
          registration_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendees: string[] | null
          category: string | null
          city: string | null
          club_id: string | null
          created_at: string | null
          description: string | null
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          landmark: string | null
          main_image_url: string
          owner_id: string
          photos: string[] | null
          rating: number | null
          start_date: string
          title: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          attendees?: string[] | null
          category?: string | null
          city?: string | null
          club_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          landmark?: string | null
          main_image_url: string
          owner_id: string
          photos?: string[] | null
          rating?: number | null
          start_date: string
          title: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          attendees?: string[] | null
          category?: string | null
          city?: string | null
          club_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          landmark?: string | null
          main_image_url?: string
          owner_id?: string
          photos?: string[] | null
          rating?: number | null
          start_date?: string
          title?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
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
      club_role: "Owner" | "Admin" | "Manager"
      event_type: "online" | "offline"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      club_role: ["Owner", "Admin", "Manager"],
      event_type: ["online", "offline"],
    },
  },
} as const
