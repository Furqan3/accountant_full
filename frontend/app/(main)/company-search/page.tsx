"use client"

import { useState } from "react"
import Footer from "@/components/layout/footer"
import SearchHero from "@/components/company-search/search-hero"
import SearchResults from "@/components/company-search/search-results"

export default function CompanySearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [companies, setCompanies] = useState<any[]>([])

  const handleSearchResults = (data: any[]) => {
    setCompanies(data)
    setSearchTerm(searchQuery)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">
        <SearchHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchResults={handleSearchResults}
        />

        <SearchResults searchTerm={searchTerm} companies={companies} />
      </main>

      <Footer />
    </div>
  )
}
