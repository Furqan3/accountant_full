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
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
