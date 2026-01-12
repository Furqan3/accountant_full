import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // rest of your code stays exactly the same

    if (isUUID) {
      // Fetch from database by UUID
      const { data: company, error } = await supabaseAdmin
  .from('companies')
  .select('*')
  .eq('id', id)
  .single<{
    id: string
    company_number: string
    company_name: string
    company_status: string
    company_type: string
    date_of_creation: string
    confirmation_statement_due: string
    accounts_due: string
    registered_office_address: any
    sic_codes: string[]
    is_favorite: boolean
  }>();

      if (error) {
        console.error('Error fetching company from database:', error);
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }

      // Fetch fresh data from Companies House to get full nested structure
      const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

      if (apiKey) {
        try {
          const profileUrl = `https://api.company-information.service.gov.uk/company/${company.company_number}`;
          const response = await fetch(profileUrl, {
            headers: {
              'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            return NextResponse.json({
              company: {
                id: company.id,
                company_number: company.company_number,
                company_name: data.company_name,
                company_status: data.company_status,
                company_type: data.type,
                date_of_creation: data.date_of_creation,
                confirmation_statement_due: data.confirmation_statement?.next_due,
                accounts_due: data.accounts?.next_due,
                confirmation_statement: data.confirmation_statement,
                accounts: data.accounts,
                registered_office_address: data.registered_office_address,
                sic_codes: data.sic_codes,
                is_favorite: company.is_favorite,
              },
              source: 'database_with_fresh_data'
            });
          }
        } catch (error) {
          console.error('Error fetching fresh data from Companies House:', error);
        }
      }

      // Fallback to database data if Companies House fetch fails
      return NextResponse.json({
        company: {
          id: company.id,
          company_number: company.company_number,
          company_name: company.company_name,
          company_status: company.company_status,
          company_type: company.company_type,
          date_of_creation: company.date_of_creation,
          confirmation_statement_due: company.confirmation_statement_due,
          accounts_due: company.accounts_due,
          confirmation_statement: company.confirmation_statement_due ? {
            next_due: company.confirmation_statement_due
          } : undefined,
          accounts: company.accounts_due ? {
            next_due: company.accounts_due
          } : undefined,
          registered_office_address: company.registered_office_address,
          sic_codes: company.sic_codes,
          is_favorite: company.is_favorite,
        },
        source: 'database'
      });
    } else {
      // Fetch from Companies House by company number
      const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

      if (!apiKey) {
        console.error('Companies House API key not configured');
        return NextResponse.json(
          { error: 'Companies House API key not configured' },
          { status: 500 }
        );
      }

      const profileUrl = `https://api.company-information.service.gov.uk/company/${id}`;

      console.log(`🔍 Fetching company profile from Companies House for: ${id}`);

      const response = await fetch(profileUrl, {
        headers: {
          'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
        },
      });

      if (!response.ok) {
        console.error('Companies House API error:', response.status, response.statusText);
        return NextResponse.json(
          { error: 'Company not found in Companies House' },
          { status: response.status }
        );
      }

      const data = await response.json();

      console.log(`✅ Found company profile from Companies House`);

      return NextResponse.json({
        company: {
          id: data.company_number,
          company_number: data.company_number,
          company_name: data.company_name,
          company_status: data.company_status,
          company_type: data.type,
          date_of_creation: data.date_of_creation,
          confirmation_statement_due: data.confirmation_statement?.next_due,
          accounts_due: data.accounts?.next_due,
          confirmation_statement: data.confirmation_statement,
          accounts: data.accounts,
          registered_office_address: data.registered_office_address,
          sic_codes: data.sic_codes,
        },
        source: 'companies_house'
      });
    }
  } catch (error: any) {
    console.error('Error fetching company details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company details', details: error.message },
      { status: 500 }
    );
  }
}
