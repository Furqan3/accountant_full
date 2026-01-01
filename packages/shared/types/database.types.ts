/**
 * Database Types
 *
 * These types are generated from your Supabase database schema.
 *
 * To regenerate:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > packages/shared/types/database.types.ts
 *
 * Replace YOUR_PROJECT_ID with your actual Supabase project ID
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Placeholder types - will be replaced when you generate from Supabase
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'super_admin' | 'support'
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
          role?: 'admin' | 'super_admin' | 'support'
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
          role?: 'admin' | 'super_admin' | 'support'
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
          phone_number: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          company_name?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          company_name?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          company_id: string | null
          stripe_payment_intent_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'processing' | 'completed' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          service_type: string | null
          items: Json
          metadata: Json | null
          assigned_to: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          company_id?: string | null
          stripe_payment_intent_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          service_type?: string | null
          items?: Json
          metadata?: Json | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string | null
          stripe_payment_intent_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          service_type?: string | null
          items?: Json
          metadata?: Json | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      // Add more tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
  }
}
