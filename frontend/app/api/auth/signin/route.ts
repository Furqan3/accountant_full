import { createServerSupabaseClient } from '@/lib/supabase-server'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    // Fetch profile data from database
    let profile = null
    if (data.user) {
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      profile = profileData
    }

    return NextResponse.json(
      {
        message: 'Signed in successfully',
        user: data.user,
        session: data.session,
        profile: profile, // Include profile data
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
