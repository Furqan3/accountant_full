"use client";

import { useEffect, useState, useCallback } from "react";
import SearchHeader from "@/components/search/search-header";
import CompanyCard, { Company } from "@/components/search/company-cards";
import { useBulkSelection } from "@/contexts/bulk-selection-context";
import BulkSelectionSidebar from "@/components/search/bulk-selection-sidebar";

export default function SearchPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [externalResults, setExternalResults] = useState<Company[]>([]);
  const [searchMode, setSearchMode] = useState<'local' | 'external'>('local');
  const { selectedCompanies } = useBulkSelection();

  // Fetch companies from API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/companies");
        const data = await res.json();

        if (data.companies) {
          setCompanies(data.companies);
          setFilteredCompanies(data.companies);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filter companies based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = companies.filter((company) =>
      company.company_name.toLowerCase().includes(query) ||
      company.company_number.toLowerCase().includes(query) ||
      company.company_status?.toLowerCase().includes(query)
    );

    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);

  // Handle search input
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setSearchMode('local');
  }, []);

  // Handle Companies House search
  const handleExternalSearch = useCallback(async (query: string) => {
    try {
      setIsSearchingExternal(true);
      setSearchMode('external');

      const res = await fetch(`/api/companies/search-external?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.companies) {
        setExternalResults(data.companies);
      } else {
        setExternalResults([]);
      }
    } catch (error) {
      console.error("Error searching Companies House:", error);
      setExternalResults([]);
    } finally {
      setIsSearchingExternal(false);
    }
  }, []);

  // Determine which results to display
  const displayResults = searchMode === 'external' ? externalResults : filteredCompanies;
  const isDisplayLoading = searchMode === 'external' ? isSearchingExternal : isLoading;

  return (
    <div className={`h-full flex flex-col gap-4 transition-all ${selectedCompanies.length > 0 ? 'pr-[320px]' : ''}`}>
      <div className="flex-shrink-0">
        <SearchHeader
          title="Search Companies"
          searchPlaceholder="Search saved companies by name, number, or status..."
          onSearch={handleSearch}
          onExternalSearch={handleExternalSearch}
          isSearching={isSearchingExternal}
        />
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-2xl p-4 space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-6">
        {/* Results Header */}
        {!isDisplayLoading && (
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchMode === 'external' ? 'Companies House Results' : 'Saved Companies'}
              </h2>
              {searchMode === 'external' && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Live Search
                </span>
              )}
            </div>
            {searchMode === 'external' && externalResults.length > 0 && (
              <button
  onClick={() => {
    setSearchMode('local');
    setExternalResults([]);
  }}
  className="text-sm text-primary hover:font-bold transition-colors cursor-pointer"
>
  Clear Search
</button>

            )}
          </div>
        )}

        {isDisplayLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500">
                {searchMode === 'external' ? 'Searching Companies House...' : 'Loading companies...'}
              </p>
            </div>
          </div>
        ) : displayResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchMode === 'external'
                ? 'No companies found in Companies House'
                : searchQuery
                ? `No companies found matching "${searchQuery}"`
                : "No companies found"}
            </p>
            {searchMode === 'external' ? (
              <button
                onClick={() => {
                  setSearchMode('local');
                  setExternalResults([]);
                }}
                className="mt-3 text-primary hover:underline"
              >
                Back to saved companies
              </button>
            ) : searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 pb-2">
              Found {displayResults.length} compan
              {displayResults.length !== 1 ? "ies" : "y"}
              {searchMode === 'external' && ' from Companies House'}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {displayResults.map((company, index) => (
                <CompanyCard key={company.id || `company-${index}`} company={company} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bulk Selection Sidebar */}
      <BulkSelectionSidebar />
    </div>
  );
}
