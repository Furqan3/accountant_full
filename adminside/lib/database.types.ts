export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          user_id: string
          role: "admin" | "super_admin" | "support"
          full_name: string | null
          email: string
          avatar_url: string | null
          permissions: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: "admin" | "super_admin" | "support"
          full_name?: string | null
          email: string
          avatar_url?: string | null
          permissions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: "admin" | "super_admin" | "support"
          full_name?: string | null
          email?: string
          avatar_url?: string | null
          permissions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          company_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          company_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          company_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          stripe_payment_intent_id: string | null
          amount: number
          currency: string
          status: "pending" | "processing" | "completed" | "cancelled"
          service_type: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
          payment_status: "pending" | "paid" | "failed" | "refunded"
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_intent_id?: string | null
          amount: number
          currency?: string
          status?: "pending" | "processing" | "completed" | "cancelled"
          service_type?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          payment_status?: "pending" | "paid" | "failed" | "refunded"
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_intent_id?: string | null
          amount?: number
          currency?: string
          status?: "pending" | "processing" | "completed" | "cancelled"
          service_type?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          payment_status?: "pending" | "paid" | "failed" | "refunded"
        }
      }
      messages: {
        Row: {
          id: string
          order_id: string
          sender_id: string
          is_admin: boolean
          message_text: string | null
          attachments: Json
          read_by_user: boolean
          read_by_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          sender_id: string
          is_admin?: boolean
          message_text?: string | null
          attachments?: Json
          read_by_user?: boolean
          read_by_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          sender_id?: string
          is_admin?: boolean
          message_text?: string | null
          attachments?: Json
          read_by_user?: boolean
          read_by_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          search_history: Json
          notification_preferences: Json
          theme: "light" | "dark" | "system"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          search_history?: Json
          notification_preferences?: Json
          theme?: "light" | "dark" | "system"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          search_history?: Json
          notification_preferences?: Json
          theme?: "light" | "dark" | "system"
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
