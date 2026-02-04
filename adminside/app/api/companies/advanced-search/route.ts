import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get all filter parameters
    const companyNameIncludes = searchParams.get('company_name_includes');
    const companyNameExcludes = searchParams.get('company_name_excludes');
    const companyStatus = searchParams.getAll('company_status');
    const companyType = searchParams.getAll('company_type');
    const companySubtype = searchParams.getAll('company_subtype');
    const location = searchParams.get('location');
    const country = searchParams.get('country');
    const postalCode = searchParams.get('postal_code');
    const sicCodes = searchParams.getAll('sic_codes');
    const incorporatedFrom = searchParams.get('incorporated_from');
    const incorporatedTo = searchParams.get('incorporated_to');
    const dissolvedFrom = searchParams.get('dissolved_from');
    const dissolvedTo = searchParams.get('dissolved_to');
    
    // Use size 5000 per batch as requested (Maximum allowed by API)
    const size = searchParams.get('size') || '5000';
    const startIndex = searchParams.get('start_index') || '0';
    const skipDetails = searchParams.get('skip_details') === 'true' || parseInt(startIndex) > 0;

    // At least one filter must be provided
    if (!companyNameIncludes && !location && !country && !postalCode &&
        companyStatus.length === 0 && companyType.length === 0 && sicCodes.length === 0) {
      return NextResponse.json({
        error: 'At least one search filter is required (company name, location, status, type, or SIC code)'
      }, { status: 400 });
    }

    const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

    if (!apiKey) {
      console.error('Companies House API key not configured');
      return NextResponse.json({
        error: 'Companies House API key not configured'
      }, { status: 500 });
    }

    // Build query parameters for Companies House Advanced Search API
    const queryParams = new URLSearchParams();

    if (companyNameIncludes) {
      queryParams.append('company_name_includes', companyNameIncludes);
    }
    if (companyNameExcludes) {
      queryParams.append('company_name_excludes', companyNameExcludes);
    }
    if (companyStatus.length > 0) {
      companyStatus.forEach(status => queryParams.append('company_status', status));
    }
    if (companyType.length > 0) {
      companyType.forEach(type => queryParams.append('company_type', type));
    }
    if (companySubtype.length > 0) {
      companySubtype.forEach(subtype => queryParams.append('company_subtype', subtype));
    }
    if (location) {
      queryParams.append('location', location);
    }
    // Combine country and postal code into location if provided
    // The Companies House API uses a generic 'location' parameter for address searches
    if (country) {
      queryParams.append('location', country);
    }
    if (postalCode) {
      queryParams.append('location', postalCode);
    }
    if (sicCodes.length > 0) {
      sicCodes.forEach(code => queryParams.append('sic_codes', code));
    }
    if (incorporatedFrom) {
      queryParams.append('incorporated_from', incorporatedFrom);
    }
    if (incorporatedTo) {
      queryParams.append('incorporated_to', incorporatedTo);
    }
    if (dissolvedFrom) {
      queryParams.append('dissolved_from', dissolvedFrom);
    }
    if (dissolvedTo) {
      queryParams.append('dissolved_to', dissolvedTo);
    }

    queryParams.append('size', size);
    queryParams.append('start_index', startIndex);

    const companiesHouseUrl = `https://api.company-information.service.gov.uk/advanced-search/companies?${queryParams.toString()}`;

    console.log(`🔍 Advanced Search - URL: ${companiesHouseUrl}`);

    const response = await fetch(companiesHouseUrl, {
      headers: {
        'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Companies House Advanced Search API error:', response.status, errorText);

      // Handle specific error codes with user-friendly messages
      let errorMessage = 'Failed to search Companies House';
      let errorDetails = response.statusText;

      switch (response.status) {
        case 429:
          errorMessage = 'Rate limit exceeded';
          errorDetails = 'Companies House API rate limit reached. Please wait a moment and try again.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'Companies House API temporarily unavailable';
          errorDetails = 'The Companies House API is experiencing issues. This may be due to rate limiting or server maintenance. Please try again in a few moments.';
          break;
        case 401:
          errorMessage = 'Authentication failed';
          errorDetails = 'Invalid API key for Companies House.';
          break;
        case 400:
          errorMessage = 'Invalid search parameters';
          errorDetails = 'Please check your search filters and try again.';
          break;
        default:
          errorDetails = `API returned status ${response.status}: ${response.statusText}`;
      }

      return NextResponse.json({
        error: errorMessage,
        details: errorDetails,
        status_code: response.status
      }, { status: response.status });
    }

    const data = await response.json();

    console.log(`✅ Advanced Search found ${data.hits || 0} companies`);

    // Process and format the results
    const companies = (data.items || []).map((item: any) => ({
      id: item.company_number,
      company_number: item.company_number,
      company_name: item.company_name,
      company_status: item.company_status,
      company_type: item.company_type,
      company_subtype: item.company_subtype,
      date_of_creation: item.date_of_creation,
      date_of_cessation: item.date_of_cessation,
      sic_codes: item.sic_codes,
      address: item.registered_office_address ? {
        address_line_1: item.registered_office_address.address_line_1,
        address_line_2: item.registered_office_address.address_line_2,
        locality: item.registered_office_address.locality,
        region: item.registered_office_address.region,
        postal_code: item.registered_office_address.postal_code,
        country: item.registered_office_address.country,
      } : undefined,
    }));

    // Skip fetching detailed info for batch loading (to avoid rate limiting and improve speed)
    let allCompanies: any[];

    if (skipDetails) {
      // For batch loading, just return companies without due dates
      allCompanies = companies.map((c: any) => ({
        ...c,
        confirmation_statement_due: undefined,
        accounts_due: undefined
      }));
      console.log(`⚡ Skipping detail fetch for batch loading (start_index: ${startIndex})`);
    } else {
      // Fetch detailed information (due dates) for first 20 companies to avoid rate limiting
      const detailedCompanies = await Promise.all(
        companies.slice(0, 20).map(async (company: any) => {
          let confirmation_statement_due = undefined;
          let accounts_due = undefined;

          try {
            const profileUrl = `https://api.company-information.service.gov.uk/company/${company.company_number}`;
            const profileResponse = await fetch(profileUrl, {
              headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
              },
            });

            if (profileResponse.ok) {
              const profile = await profileResponse.json();
              confirmation_statement_due = profile.confirmation_statement?.next_due;
              accounts_due = profile.accounts?.next_due;
            }
          } catch (error) {
            console.error(`Error fetching details for ${company.company_number}:`, error);
          }

          return {
            ...company,
            confirmation_statement_due,
            accounts_due,
          };
        })
      );

      // Combine detailed companies with remaining companies (without due dates)
      allCompanies = [
        ...detailedCompanies,
        ...companies.slice(20).map((c: any) => ({ ...c, confirmation_statement_due: undefined, accounts_due: undefined }))
      ];
    }

    return NextResponse.json({
      companies: allCompanies,
      total_results: parseInt(data.hits) || 0,
      source: 'companies_house_advanced'
    });

  } catch (error: any) {
    console.error('Error in advanced search:', error);
    return NextResponse.json({
      error: 'Failed to perform advanced search',
      details: error.message
    }, { status: 500 });
  }
}