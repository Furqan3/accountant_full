import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
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

    console.log('🔧 Creating admin_users record for:', userId, userEmail);

    // Check if record already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        adminUser: existing
      });
    }

    // Create new admin_users record
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        email: userEmail,
        role: 'admin',
        full_name: userEmail?.split('@')[0] || 'Admin User',
        is_active: true,
        permissions: {
          dashboard: true,
          orders: true,
          messages: true,
          search: true
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating admin user:', insertError);
      return NextResponse.json({
        error: 'Failed to create admin user',
        details: insertError.message,
        code: insertError.code
      }, { status: 500 });
    }

    console.log('✅ Admin user created:', newAdmin);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      adminUser: newAdmin
    });

  } catch (error: any) {
    console.error('❌ Create admin error:', error);
    return NextResponse.json({
      error: 'Server error',
      details: error.message
    }, { status: 500 });
  }
}
