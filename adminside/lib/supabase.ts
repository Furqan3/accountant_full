import { createBrowserClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Regular client for client-side operations (respects RLS)
// Using createBrowserClient from @supabase/ssr to properly handle cookies in Next.js
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

// Service role client for admin operations (bypasses RLS)
// ⚠️ WARNING: Only use this in server-side API routes!
// This is created as a function to avoid errors on client-side
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. This function can only be used server-side.")
  }

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
