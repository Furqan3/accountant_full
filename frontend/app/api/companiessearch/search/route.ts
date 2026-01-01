export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const apiKey = process.env.COMPANIES_HOUSE_API_KEY
  
    if (!apiKey || apiKey === "your-api-key-here") {
      return NextResponse.json(
        { error: "Companies House API key not configured" },
        { status: 500 }
      )
    }

    const auth = Buffer.from(`${apiKey}:`).toString("base64")

    // Step 1: Search companies
    const searchRes = await fetch(
      `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Basic ${auth}` } }
    )

    if (!searchRes.ok) {
      const errorText = await searchRes.text()
      console.error("Companies House API error:", searchRes.status, errorText)

      // Provide more specific error messages
      let errorMessage = "Failed to fetch companies from Companies House API"
      if (searchRes.status === 401) {
        errorMessage = "Invalid API key. Please check your Companies House API credentials."
      } else if (searchRes.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later."
      } else if (searchRes.status === 404) {
        errorMessage = "No companies found matching your search."
      }

      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: searchRes.status }
      )
    }

    const searchData = await searchRes.json()

    // Step 2: Fetch profile for each company to get accounts/confirmation statement due dates
    const companies = await Promise.all(
      (searchData.items || []).map(async (item: any) => {
        let confirmationStatementDue = "N/A"
        let accountsDue = "N/A"

        try {
          const profileRes = await fetch(
            `https://api.company-information.service.gov.uk/company/${item.company_number}`,
            { headers: { Authorization: `Basic ${auth}` } }
          )
          if (profileRes.ok) {
            const profileData = await profileRes.json()
            confirmationStatementDue = profileData.confirmation_statement?.next_due || "N/A"
            accountsDue = profileData.accounts?.next_due || "N/A"
          }
        } catch (err) {
          console.error("Error fetching company profile for", item.company_number, err)
        }

        return {
          id: item.company_number,
          name: item.title,
          companyNumber: item.company_number,
          companyStatus: item.company_status,
          companyType: item.company_type,
          dateOfCreation: item.date_of_creation,
          address: item.address,
          confirmationStatementDue,
          accountsDue,
        }
      })
    )

    return NextResponse.json({
      companies,
      totalResults: searchData.total_results,
      itemsPerPage: searchData.items_per_page,
    })
  } catch (error: any) {
    console.error("Error searching companies:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
