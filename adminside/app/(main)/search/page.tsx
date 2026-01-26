"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import SearchHeader from "@/components/search/search-header";
import CompanyCard, { Company } from "@/components/search/company-cards";
import { useBulkSelection } from "@/contexts/bulk-selection-context";
import BulkSelectionSidebar from "@/components/search/bulk-selection-sidebar";
import AdvancedSearchFilters, { AdvancedSearchFilters as AdvancedFiltersType } from "@/components/search/advanced-search-filters";
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Loader2 } from "lucide-react";

type SortOption = {
  label: string;
  value: string;
  sortFn: (a: Company, b: Company) => number;
};

const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Name (A-Z)',
    value: 'name_asc',
    sortFn: (a, b) => a.company_name.localeCompare(b.company_name)
  },
  {
    label: 'Name (Z-A)',
    value: 'name_desc',
    sortFn: (a, b) => b.company_name.localeCompare(a.company_name)
  },
  {
    label: 'Company Number (Asc)',
    value: 'number_asc',
    sortFn: (a, b) => a.company_number.localeCompare(b.company_number)
  },
  {
    label: 'Company Number (Desc)',
    value: 'number_desc',
    sortFn: (a, b) => b.company_number.localeCompare(a.company_number)
  },
  {
    label: 'Status (A-Z)',
    value: 'status_asc',
    sortFn: (a, b) => (a.company_status || '').localeCompare(b.company_status || '')
  },
  {
    label: 'Incorporated (Newest)',
    value: 'incorporated_desc',
    sortFn: (a, b) => {
      const dateA = a.date_of_creation ? new Date(a.date_of_creation).getTime() : 0;
      const dateB = b.date_of_creation ? new Date(b.date_of_creation).getTime() : 0;
      return dateB - dateA;
    }
  },
  {
    label: 'Incorporated (Oldest)',
    value: 'incorporated_asc',
    sortFn: (a, b) => {
      const dateA = a.date_of_creation ? new Date(a.date_of_creation).getTime() : Infinity;
      const dateB = b.date_of_creation ? new Date(b.date_of_creation).getTime() : Infinity;
      return dateA - dateB;
    }
  },
  {
    label: 'Confirmation Due (Soonest)',
    value: 'confirmation_asc',
    sortFn: (a, b) => {
      const dateA = a.confirmation_statement_due ? new Date(a.confirmation_statement_due).getTime() : Infinity;
      const dateB = b.confirmation_statement_due ? new Date(b.confirmation_statement_due).getTime() : Infinity;
      return dateA - dateB;
    }
  },
  {
    label: 'Confirmation Due (Latest)',
    value: 'confirmation_desc',
    sortFn: (a, b) => {
      const dateA = a.confirmation_statement_due ? new Date(a.confirmation_statement_due).getTime() : 0;
      const dateB = b.confirmation_statement_due ? new Date(b.confirmation_statement_due).getTime() : 0;
      return dateB - dateA;
    }
  },
  {
    label: 'Accounts Due (Soonest)',
    value: 'accounts_asc',
    sortFn: (a, b) => {
      const dateA = a.accounts_due ? new Date(a.accounts_due).getTime() : Infinity;
      const dateB = b.accounts_due ? new Date(b.accounts_due).getTime() : Infinity;
      return dateA - dateB;
    }
  },
  {
    label: 'Accounts Due (Latest)',
    value: 'accounts_desc',
    sortFn: (a, b) => {
      const dateA = a.accounts_due ? new Date(a.accounts_due).getTime() : 0;
      const dateB = b.accounts_due ? new Date(b.accounts_due).getTime() : 0;
      return dateB - dateA;
    }
  },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const BATCH_SIZE = 500; // Number of results to fetch per batch

export default function SearchPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [externalResults, setExternalResults] = useState<Company[]>([]);
  const [searchMode, setSearchMode] = useState<'local' | 'external' | 'advanced'>('local');
  const [totalResults, setTotalResults] = useState(0);
  const { selectedCompanies } = useBulkSelection();

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('name_asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Load more state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<AdvancedFiltersType | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  
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

  // Reset to first page when results change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCompanies, externalResults, searchMode, sortBy]);

  // Build query params from filters
  const buildQueryParams = useCallback((filters: AdvancedFiltersType, startIndex: number = 0, size: number = BATCH_SIZE) => {
    const params = new URLSearchParams();

    if (filters.company_name_includes) {
      params.append('company_name_includes', filters.company_name_includes);
    }
    if (filters.company_name_excludes) {
      params.append('company_name_excludes', filters.company_name_excludes);
    }
    filters.company_status.forEach(status => {
      params.append('company_status', status);
    });
    filters.company_type.forEach(type => {
      params.append('company_type', type);
    });
    filters.company_subtype.forEach(subtype => {
      params.append('company_subtype', subtype);
    });
    if (filters.location) {
      params.append('location', filters.location);
    }
    if (filters.country) {
      params.append('country', filters.country);
    }
    if (filters.postal_code) {
      params.append('postal_code', filters.postal_code);
    }
    if (filters.sic_codes) {
      filters.sic_codes.split(',').forEach(code => {
        const trimmed = code.trim();
        if (trimmed) params.append('sic_codes', trimmed);
      });
    }
    if (filters.incorporated_from) {
      params.append('incorporated_from', filters.incorporated_from);
    }
    if (filters.incorporated_to) {
      params.append('incorporated_to', filters.incorporated_to);
    }
    if (filters.dissolved_from) {
      params.append('dissolved_from', filters.dissolved_from);
    }
    if (filters.dissolved_to) {
      params.append('dissolved_to', filters.dissolved_to);
    }

    params.append('start_index', startIndex.toString());
    params.append('size', size.toString());

    return params;
  }, []);

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
        setTotalResults(data.total_results || data.companies.length);
        setLoadedCount(data.companies.length);
      } else {
        setExternalResults([]);
        setTotalResults(0);
        setLoadedCount(0);
      }
    } catch (error) {
      console.error("Error searching Companies House:", error);
      setExternalResults([]);
      setTotalResults(0);
      setLoadedCount(0);
    } finally {
      setIsSearchingExternal(false);
    }
  }, []);

  // Handle Advanced Search
  const handleAdvancedSearch = useCallback(async (filters: AdvancedFiltersType) => {
    // Cancel any ongoing load more operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      setIsSearchingExternal(true);
      setSearchMode('advanced');
      setCurrentFilters(filters);
      setExternalResults([]);

      const params = buildQueryParams(filters, 0, BATCH_SIZE);
      const res = await fetch(`/api/companies/advanced-search?${params.toString()}`);
      const data = await res.json();

      if (data.error) {
        console.error("Advanced search error:", data.error);
        setExternalResults([]);
        setTotalResults(0);
        setLoadedCount(0);
      } else if (data.companies) {
        setExternalResults(data.companies);
        setTotalResults(data.total_results || data.companies.length);
        setLoadedCount(data.companies.length);
      } else {
        setExternalResults([]);
        setTotalResults(0);
        setLoadedCount(0);
      }
    } catch (error) {
      console.error("Error in advanced search:", error);
      setExternalResults([]);
      setTotalResults(0);
      setLoadedCount(0);
    } finally {
      setIsSearchingExternal(false);
    }
  }, [buildQueryParams]);

  // Load more results
  const loadMoreResults = useCallback(async (loadAll: boolean = false) => {
    if (!currentFilters || isLoadingMore || loadedCount >= totalResults) return;

    abortControllerRef.current = new AbortController();
    setIsLoadingMore(true);

    try {
      let currentStartIndex = loadedCount;
      let allNewCompanies: Company[] = [];

      // If loadAll, fetch in batches until we have all results
      const maxToLoad = loadAll ? totalResults : loadedCount + BATCH_SIZE;

      while (currentStartIndex < maxToLoad && currentStartIndex < totalResults) {
        // Check if aborted
        if (abortControllerRef.current.signal.aborted) {
          break;
        }

        const batchSize = Math.min(BATCH_SIZE, maxToLoad - currentStartIndex);
        const params = buildQueryParams(currentFilters, currentStartIndex, batchSize);

        const res = await fetch(`/api/companies/advanced-search?${params.toString()}`, {
          signal: abortControllerRef.current.signal
        });

        if (!res.ok) {
          throw new Error('Failed to fetch more results');
        }

        const data = await res.json();

        if (data.companies && data.companies.length > 0) {
          allNewCompanies = [...allNewCompanies, ...data.companies];
          currentStartIndex += data.companies.length;

          // Update results progressively for better UX
          setExternalResults(prev => [...prev, ...data.companies]);
          setLoadedCount(currentStartIndex);
        } else {
          break;
        }

        // Small delay between batches to avoid rate limiting
        if (loadAll && currentStartIndex < maxToLoad) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error loading more results:", error);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentFilters, isLoadingMore, loadedCount, totalResults, buildQueryParams]);

  // Stop loading
  const stopLoading = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoadingMore(false);
  }, []);

  // Clear advanced search results
  const handleClearAdvancedSearch = useCallback(() => {
    stopLoading();
    setSearchMode('local');
    setExternalResults([]);
    setTotalResults(0);
    setLoadedCount(0);
    setCurrentFilters(null);
  }, [stopLoading]);

  // Determine which results to display
  const baseResults = searchMode === 'local' ? filteredCompanies : externalResults;
  const isDisplayLoading = searchMode === 'local' ? isLoading : isSearchingExternal;

  // Sort results
  const sortedResults = useMemo(() => {
    const sortOption = SORT_OPTIONS.find(opt => opt.value === sortBy);
    if (!sortOption) return baseResults;
    return [...baseResults].sort(sortOption.sortFn);
  }, [baseResults, sortBy]);

  // Paginate results
  const totalPages = Math.ceil(sortedResults.length / pageSize);
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedResults.slice(startIndex, startIndex + pageSize);
  }, [sortedResults, currentPage, pageSize]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Check if there are more results to load
  const hasMoreResults = searchMode === 'advanced' && loadedCount < totalResults;
  const remainingResults = totalResults - loadedCount;

  return (
    <div className={`flex flex-col gap-4 transition-all ${selectedCompanies.length > 0 ? 'pr-[320px]' : ''}`}>
      <div className="flex-shrink-0">
        <SearchHeader
          title="Search Companies"
          searchPlaceholder="Search saved companies by name, number, or status..."
          onSearch={handleSearch}
          onExternalSearch={handleExternalSearch}
          isSearching={isSearchingExternal}
        />
      </div>

      {/* Advanced Search Filters */}
      <div className="flex-shrink-0">
        <AdvancedSearchFilters
          onSearch={handleAdvancedSearch}
          onClear={handleClearAdvancedSearch}
          isSearching={isSearchingExternal}
        />
      </div>

      {/* Main Results Container */}
      <div className="bg-white rounded-2xl p-4 space-y-4 pb-6">

        {/* Results Header with Sort */}
        {!isDisplayLoading && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchMode === 'advanced'
                  ? 'Advanced Search Results'
                  : searchMode === 'external'
                    ? 'Companies House Results'
                    : 'Saved Companies'}
              </h2>
              {searchMode === 'external' && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Quick Search
                </span>
              )}
              {searchMode === 'advanced' && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Advanced Search
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              {sortedResults.length > 0 && (
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-black bg-white"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(searchMode === 'external' || searchMode === 'advanced') && externalResults.length > 0 && (
                <button
                  onClick={() => {
                    stopLoading();
                    setSearchMode('local');
                    setExternalResults([]);
                    setTotalResults(0);
                    setLoadedCount(0);
                    setCurrentFilters(null);
                  }}
                  className="text-sm text-primary hover:font-bold transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}

        {isDisplayLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500">
                {searchMode === 'advanced'
                  ? 'Performing advanced search...'
                  : searchMode === 'external'
                    ? 'Searching Companies House...'
                    : 'Loading companies...'}
              </p>
            </div>
          </div>
        ) : sortedResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchMode === 'advanced'
                ? 'No companies found matching your filters'
                : searchMode === 'external'
                  ? 'No companies found in Companies House'
                  : searchQuery
                    ? `No companies found matching "${searchQuery}"`
                    : "No companies found"}
            </p>
            {(searchMode === 'external' || searchMode === 'advanced') ? (
              <button
                onClick={() => {
                  setSearchMode('local');
                  setExternalResults([]);
                  setTotalResults(0);
                  setLoadedCount(0);
                  setCurrentFilters(null);
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
            {/* Results count and page size */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-gray-600">
              <div>
                {searchMode === 'advanced' ? (
                  <>
                    Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, sortedResults.length)} of {sortedResults.length.toLocaleString()} loaded
                    {totalResults > sortedResults.length && (
                      <span className="text-primary ml-1">
                        ({totalResults.toLocaleString()} total available)
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, sortedResults.length)} of {sortedResults.length} compan
                    {sortedResults.length !== 1 ? "ies" : "y"}
                    {searchMode === 'external' && ' from Companies House'}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50 text-black bg-white"
                >
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="text-gray-500">per page</span>
              </div>
            </div>

            {/* Load More Banner */}
            {hasMoreResults && (
              <div className="bg-gradient-to-r from-primary/10 to-green-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="font-medium text-gray-800">
                    {isLoadingMore ? (
                      <>Loading... {loadedCount.toLocaleString()} of {totalResults.toLocaleString()} companies loaded</>
                    ) : (
                      <>{remainingResults.toLocaleString()} more companies available</>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isLoadingMore
                      ? 'Fetching data from Companies House...'
                      : 'Click to load more results from Companies House API'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isLoadingMore ? (
                    <button
                      onClick={stopLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Stop Loading
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => loadMoreResults(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:opacity-90 text-white rounded-lg font-medium transition-opacity"
                      >
                        <Download className="w-4 h-4" />
                        Load {Math.min(BATCH_SIZE, remainingResults).toLocaleString()} More
                      </button>
                      {remainingResults > BATCH_SIZE && (
                        <button
                          onClick={() => loadMoreResults(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Load All ({remainingResults.toLocaleString()})
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Loading More Indicator */}
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-3 py-2 text-primary">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Loading more companies...</span>
                <span className="text-sm text-gray-500">
                  ({loadedCount.toLocaleString()} / {totalResults.toLocaleString()})
                </span>
              </div>
            )}

            {/* Company Cards */}
            <div className="grid grid-cols-1 gap-4">
              {paginatedResults.map((company, index) => (
                <CompanyCard key={company.id || `company-${index}`} company={company} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center gap-1">
                  {/* First Page */}
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="First page"
                  >
                    <ChevronsLeft className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((page, index) => (
                      typeof page === 'number' ? (
                        <button
                          key={index}
                          onClick={() => goToPage(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-primary text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={index} className="px-2 text-gray-400">...</span>
                      )
                    ))}
                  </div>

                  {/* Next Page */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Last page"
                  >
                    <ChevronsRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Quick Jump */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Go to:</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (!isNaN(page)) goToPage(page);
                    }}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary/50 text-black"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Selection Sidebar */}
      <BulkSelectionSidebar />
    </div>
  );
}
