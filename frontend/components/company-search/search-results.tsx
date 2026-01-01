"use client"

import type React from "react"
import { useState } from "react"
import CompanyCard from "./company-card"
import { Loader2 } from "lucide-react"

interface Company {
  id: string
  name: string
  logo: string
  confirmationStatementDue: string
  accountsDue: string
}

interface SearchResultsProps {
  searchTerm: string
  companies: Company[]
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchTerm, companies }) => {
  const [visibleCount, setVisibleCount] = useState(6)
  const [isLoading, setIsLoading] = useState(false)

  const handleShowMore = () => {
    setIsLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setVisibleCount((prev) => prev + 6)
      setIsLoading(false)
    }, 500)
  }

  const visibleCompanies = companies.slice(0, visibleCount)
  const hasMore = visibleCount < companies.length

  if (companies.length === 0) {
    return null
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Search Results <span className="text-teal-700">"{searchTerm}"</span>
        </h2>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {visibleCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              id={company.id}
              name={company.name}
              confirmationStatementDue={company.confirmationStatementDue}
              accountsDue={company.accountsDue}
            />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleShowMore}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Show More
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default SearchResults
