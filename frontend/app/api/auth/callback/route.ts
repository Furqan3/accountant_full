import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const redirect = requestUrl.searchParams.get('redirect')

  if (code) {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // If there's a redirect parameter (from OAuth sign-in), redirect there
  if (redirect) {
    return NextResponse.redirect(`${requestUrl.origin}${redirect}`)
  }

  // If there's a next parameter, redirect there (for password reset)
  if (next) {
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  }

  // Default: redirect to home page after successful sign in
  return NextResponse.redirect(requestUrl.origin)
}
