/**
 * Shared Supabase Configuration
 *
 * This file contains shared configuration and helpers for Supabase
 * that can be used across both frontend and adminside apps.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

/**
 * Get Supabase URL from environment variables
 */
export const getSupabaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  return url
}

/**
 * Get Supabase anon key from environment variables
 */
export const getSupabaseAnonKey = (): string => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }
  return key
}

/**
 * Create a Supabase client for client-side use
 * Note: For Next.js App Router, use @supabase/ssr instead in your apps
 */
export const createSupabaseClient = () => {
  return createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey())
}

/**
 * Table names constant for type safety
 */
export const TABLES = {
  ADMIN_USERS: 'admin_users',
  PROFILES: 'profiles',
  COMPANIES: 'companies',
  SERVICES: 'services',
  SUBSCRIPTION_PLANS: 'subscription_plans',
  SUBSCRIPTIONS: 'subscriptions',
  ORDERS: 'orders',
  MESSAGES: 'messages',
  USER_PREFERENCES: 'user_preferences',
  NOTIFICATIONS: 'notifications',
} as const

/**
 * User types for signup
 */
export const USER_TYPES = {
  CLIENT: 'client',
  ADMIN: 'admin',
} as const

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES]
