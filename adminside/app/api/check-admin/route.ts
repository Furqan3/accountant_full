import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json({
        error: 'Session error',
        details: sessionError.message
      }, { status: 401 });
    }

    if (!session?.user) {
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    console.log('🔍 Checking admin_users for:', userId, userEmail);

    // Try to fetch admin_users record
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      userId,
      userEmail,
      hasAdminRecord: !!adminUser,
      adminUser: adminUser,
      error: adminError ? {
        message: adminError.message,
        details: adminError.details,
        hint: adminError.hint,
        code: adminError.code
      } : null
    });

  } catch (error: any) {
    console.error('❌ Check admin error:', error);
    return NextResponse.json({
      error: 'Server error',
      details: error.message
    }, { status: 500 });
  }
}
