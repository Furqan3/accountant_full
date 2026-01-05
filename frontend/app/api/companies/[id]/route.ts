import { NextRequest, NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function GET(req: NextRequest, context: { params: Promise<Params> }) {
  const params = await context.params; // unwrap the Promise
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({ error: "Companies House API key not configured" }, { status: 500 });
  }

  const auth = Buffer.from(`${apiKey}:`).toString("base64");
  const url = `https://api.company-information.service.gov.uk/company/${params.id}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText || "Failed to fetch from Companies House" }, { status: response.status });
    }

    const data = await response.json();

    // Transform Companies House data to our format for /pay page
    const company = {
      id: data.company_number || params.id,
      company_number: data.company_number,
      company_name: data.company_name,
      company_status: data.company_status,
      company_type: data.type,
      date_of_creation: data.date_of_creation,
      confirmation_statement_due: data.confirmation_statement?.next_due || null,
      accounts_due: data.accounts?.next_due || null,
      // For company/[id] page compatibility
      confirmation_statement: data.confirmation_statement,
      accounts: data.accounts,
      registered_office_address: data.registered_office_address,
    };

    return NextResponse.json({ company, ...data });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
