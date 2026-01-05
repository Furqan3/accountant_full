import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch all active services from the database
    const { data: services, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('title');

    if (error) {
      console.error('Error fetching services:', error);
      return NextResponse.json({
        services: [],
        error: error.message
      }, { status: 500 });
    }

    console.log(`✅ Fetched ${services?.length || 0} services from database`);

    return NextResponse.json({
      services: services || []
    });
  } catch (error: any) {
    console.error('Error in services API:', error);
    return NextResponse.json({
      services: [],
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
