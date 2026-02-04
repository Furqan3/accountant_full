import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Search cached companies with due date filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const companyName = searchParams.get('company_name');
    const companyStatus = searchParams.getAll('company_status');
    const confirmationFrom = searchParams.get('confirmation_statement_from');
    const confirmationTo = searchParams.get('confirmation_statement_to');
    const accountsFrom = searchParams.get('accounts_due_from');
    const accountsTo = searchParams.get('accounts_due_to');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('companies_cache')
      .select('*', { count: 'exact' });

    // Apply filters
    if (companyName) {
      query = query.ilike('company_name', `%${companyName}%`);
    }

    if (companyStatus.length > 0) {
      query = query.in('company_status', companyStatus);
    }

    // Confirmation statement due date filter
    if (confirmationFrom) {
      query = query.gte('confirmation_statement_due', confirmationFrom);
    }
    if (confirmationTo) {
      query = query.lte('confirmation_statement_due', confirmationTo);
    }

    // Accounts due date filter
    if (accountsFrom) {
      query = query.gte('accounts_due', accountsFrom);
    }
    if (accountsTo) {
      query = query.lte('accounts_due', accountsTo);
    }

    // Apply pagination
    query = query
      .order('confirmation_statement_due', { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data: companies, error, count } = await query;

    if (error) {
      console.error('Error fetching cached companies:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map registered_office_address to address for consistency with Company type
    const mappedCompanies = (companies || []).map(company => ({
      ...company,
      address: company.registered_office_address,
    }));

    return NextResponse.json({
      companies: mappedCompanies,
      total_results: count || 0,
      source: 'local_cache'
    });

  } catch (error: any) {
    console.error('Error in cache search:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Save companies to cache (bulk upsert)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companies } = body;

    if (!companies || !Array.isArray(companies)) {
      return NextResponse.json({ error: 'Companies array is required' }, { status: 400 });
    }

    // Prepare all companies for bulk upsert
    const cacheData = companies.map(company => ({
      company_number: company.company_number,
      company_name: company.company_name,
      company_status: company.company_status,
      company_type: company.company_type,
      date_of_creation: company.date_of_creation,
      date_of_cessation: company.date_of_cessation,
      registered_office_address: company.address || company.registered_office_address,
      sic_codes: company.sic_codes,
      confirmation_statement_due: company.confirmation_statement_due || null,
      accounts_due: company.accounts_due || null,
    }));

    // Bulk upsert - insert or update all at once
    const { data, error } = await supabase
      .from('companies_cache')
      .upsert(cacheData, {
        onConflict: 'company_number',
        ignoreDuplicates: false
      })
      .select('company_number');

    if (error) {
      console.error('Failed to bulk cache companies:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      saved: {
        total: companies.length,
        processed: data?.length || companies.length
      }
    });

  } catch (error: any) {
    console.error('Error saving to cache:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
