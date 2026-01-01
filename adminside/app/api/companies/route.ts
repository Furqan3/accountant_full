import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch all companies from the database
    const { data: companies, error } = await supabaseAdmin
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json({
        companies: [],
        error: error.message
      }, { status: 500 });
    }

    console.log(`✅ Fetched ${companies?.length || 0} companies from database`);

    // Transform companies data
    const companiesData = companies?.map((company: any) => ({
      id: company.id,
      company_number: company.company_number,
      company_name: company.company_name,
      company_status: company.company_status,
      company_type: company.company_type,
      date_of_creation: company.date_of_creation,
      confirmation_statement_due: company.confirmation_statement_due,
      accounts_due: company.accounts_due,
      is_favorite: company.is_favorite,
      created_at: company.created_at,
    })) || [];

    return NextResponse.json({
      companies: companiesData
    });
  } catch (error: any) {
    console.error('Unexpected error fetching companies:', error);
    return NextResponse.json({
      companies: [],
      error: error.message
    }, { status: 500 });
  }
}
