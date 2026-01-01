import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        error: 'Search query is required'
      }, { status: 400 });
    }

    const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

    if (!apiKey) {
      console.error('Companies House API key not configured');
      return NextResponse.json({
        error: 'Companies House API key not configured'
      }, { status: 500 });
    }

    // Search Companies House API
    const companiesHouseUrl = `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(query)}&items_per_page=20`;

    console.log(`🔍 Searching Companies House for: "${query}"`);

    const response = await fetch(companiesHouseUrl, {
      headers: {
        'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
      },
    });

    if (!response.ok) {
      console.error('Companies House API error:', response.status, response.statusText);
      return NextResponse.json({
        error: 'Failed to search Companies House',
        details: response.statusText
      }, { status: response.status });
    }

    const data = await response.json();

    console.log(`✅ Found ${data.items?.length || 0} companies from Companies House`);

    // Fetch detailed information for each company (including due dates)
    // Limit to first 10 companies to avoid too many API calls
    const detailedCompanies = await Promise.all(
      (data.items || []).slice(0, 10).map(async (item: any) => {
        try {
          // Fetch company profile to get confirmation statement and accounts due dates
          const profileUrl = `https://api.company-information.service.gov.uk/company/${item.company_number}`;
          const profileResponse = await fetch(profileUrl, {
            headers: {
              'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
            },
          });

          if (!profileResponse.ok) {
            console.warn(`Failed to fetch profile for ${item.company_number}`);
            return {
              company_number: item.company_number,
              company_name: item.title,
              company_status: item.company_status,
              company_type: item.company_type,
              date_of_creation: item.date_of_creation,
              address: item.address,
            };
          }

          const profile = await profileResponse.json();

          return {
            company_number: item.company_number,
            company_name: item.title,
            company_status: item.company_status,
            company_type: item.company_type,
            date_of_creation: item.date_of_creation,
            confirmation_statement_due: profile.confirmation_statement?.next_due || profile.confirmation_statement?.overdue,
            accounts_due: profile.accounts?.next_due || profile.accounts?.overdue,
            address: item.address,
          };
        } catch (error) {
          console.error(`Error fetching details for ${item.company_number}:`, error);
          return {
            company_number: item.company_number,
            company_name: item.title,
            company_status: item.company_status,
            company_type: item.company_type,
            date_of_creation: item.date_of_creation,
            address: item.address,
          };
        }
      })
    );

    return NextResponse.json({
      companies: detailedCompanies,
      total_results: data.total_results || 0,
      source: 'companies_house'
    });

  } catch (error: any) {
    console.error('Error searching Companies House:', error);
    return NextResponse.json({
      error: 'Failed to search Companies House',
      details: error.message
    }, { status: 500 });
  }
}
