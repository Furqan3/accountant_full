"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { StarsBackground } from "../ui/stars"
import Header from "../layout/header"

interface SearchHeroProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearchResults?: (companies: any[]) => void
}

const SearchHero: React.FC<SearchHeroProps> = ({
  searchQuery,
  onSearchChange,
  onSearchResults
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedTerm = localStorage.getItem("searchTerm")
    if (storedTerm && storedTerm.trim() !== "") {
      onSearchChange(storedTerm)
      const timer = setTimeout(() => {
        performSearch(storedTerm)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [])

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/companiessearch/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()

      if (!res.ok) {
        const errorMessage = data.error || "Failed to fetch companies"
        console.error(errorMessage)
        setError(errorMessage)
        return
      }

      if (onSearchResults) {
        onSearchResults(data.companies || [])
      }

      localStorage.setItem("searchTerm", query.trim())

    } catch (err: any) {
      console.error("Search error:", err)
      setError("Network error: Unable to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    await performSearch(searchQuery)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSearch()
  }

  return (
    <>
      <div className="relative z-50 bg-header-gradient px-6 pt-6">
        <Header />
      </div>

      <section className="relative bg-custom-gradient pb-6 px-6 overflow-hidden">
        <StarsBackground />
        <div className="max-w-2xl mx-auto text-center p-16 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Find Your Company
          </h1>

          <p className="text-gray-300 mb-8 leading-relaxed">
            Search for your company to view filing deadlines, compliance status, and available services — all in one place.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <input
              type="text"
              placeholder="Search Company..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
              disabled={isLoading} 
            />

            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-lg disabled:opacity-50 transition-opacity"
            >
              <Search className="w-4 h-4" />
              {isLoading ? "Searching..." : "Search"}
            </button>
          </form>

          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-white">
              <svg
                className="w-5 h-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span className="text-sm">Searching companies...</span>
            </div>
          )}

          {error && (
            <div className="mt-4 max-w-xl mx-auto p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default SearchHero