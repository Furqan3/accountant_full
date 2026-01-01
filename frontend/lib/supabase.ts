import { createBrowserClient } from '@supabase/ssr'
import { type Database } from '@/types/supabase'

// ============================================
// CLIENT-SIDE SUPABASE CLIENT
// Use this in React components and client-side code
// ============================================

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file. ' +
      'Get these from your Supabase project settings at https://supabase.com/dashboard/project/_/settings/api'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// ============================================
// SERVICE ROLE CLIENT
// Use this ONLY in secure server-side contexts (API routes)
// Has elevated permissions - be very careful!
// ============================================

export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables for service role client. ' +
      'Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file. ' +
      'IMPORTANT: Service role key should only be used in server-side code!'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, serviceRoleKey)
}
