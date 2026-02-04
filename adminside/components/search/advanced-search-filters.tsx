"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  X,
  MapPin,
  Building2,
  Calendar,
  Hash,
  Filter,
  RotateCcw,
  Globe,
  Briefcase,
  Database
} from "lucide-react";

export type AdvancedSearchFilters = {
  company_name_includes: string;
  company_name_excludes: string;
  company_status: string[];
  company_type: string[];
  company_subtype: string[];
  location: string;
  country: string;
  postal_code: string;
  sic_codes: string;
  incorporated_from: string;
  incorporated_to: string;
  dissolved_from: string;
  dissolved_to: string;
  confirmation_statement_from: string;
  confirmation_statement_to: string;
  accounts_due_from: string;
  accounts_due_to: string;
};

const COMPANY_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'dissolved', label: 'Dissolved' },
  { value: 'liquidation', label: 'Liquidation' },
  { value: 'receivership', label: 'Receivership' },
  { value: 'administration', label: 'Administration' },
  { value: 'voluntary-arrangement', label: 'Voluntary Arrangement' },
  { value: 'converted-closed', label: 'Converted/Closed' },
  { value: 'insolvency-proceedings', label: 'Insolvency Proceedings' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'registered', label: 'Registered' },
  { value: 'removed', label: 'Removed' },
];

const COMPANY_TYPES = [
  { value: 'ltd', label: 'Private Limited (LTD)' },
  { value: 'plc', label: 'Public Limited (PLC)' },
  { value: 'llp', label: 'LLP' },
  { value: 'private-unlimited', label: 'Private Unlimited' },
  { value: 'limited-partnership', label: 'Limited Partnership' },
  { value: 'scottish-partnership', label: 'Scottish Partnership' },
  { value: 'charitable-incorporated-organisation', label: 'CIO' },
  { value: 'scottish-charitable-incorporated-organisation', label: 'Scottish CIO' },
  { value: 'registered-society-non-jurisdictional', label: 'Registered Society' },
  { value: 'industrial-and-provident-society', label: 'Industrial & Provident' },
  { value: 'royal-charter', label: 'Royal Charter' },
  { value: 'oversea-company', label: 'Overseas Company' },
  { value: 'uk-establishment', label: 'UK Establishment' },
  { value: 'unregistered-company', label: 'Unregistered' },
  { value: 'other', label: 'Other' },
];

const COMPANY_SUBTYPES = [
  { value: 'community-interest-company', label: 'Community Interest Company (CIC)' },
  { value: 'private-fund-limited-partnership', label: 'Private Fund Limited Partnership' },
];

const UK_COUNTRIES = [
  { value: '', label: 'All Countries' },
  { value: 'England', label: 'England' },
  { value: 'Wales', label: 'Wales' },
  { value: 'Scotland', label: 'Scotland' },
  { value: 'Northern Ireland', label: 'Northern Ireland' },
];

const UK_CITIES = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool',
  'Bristol', 'Sheffield', 'Edinburgh', 'Cardiff', 'Belfast', 'Newcastle',
  'Nottingham', 'Southampton', 'Leicester', 'Brighton', 'Portsmouth',
  'Plymouth', 'Reading', 'Coventry', 'Derby', 'Hull', 'Stoke-on-Trent',
  'Wolverhampton', 'Swansea', 'Milton Keynes', 'Aberdeen', 'Dundee',
];

const COMMON_SIC_CODES = [
  { code: '62020', label: 'IT Consultancy' },
  { code: '70229', label: 'Management Consultancy' },
  { code: '68100', label: 'Buying/Selling Real Estate' },
  { code: '68209', label: 'Letting Property' },
  { code: '41201', label: 'Construction of Houses' },
  { code: '47910', label: 'Retail via Internet' },
  { code: '56101', label: 'Restaurants' },
  { code: '82990', label: 'Other Business Support' },
  { code: '96090', label: 'Other Personal Services' },
  { code: '64209', label: 'Holding Companies' },
];

type Props = {
  onSearch: (filters: AdvancedSearchFilters) => void;
  onClear: () => void;
  isSearching: boolean;
  onSearchCache?: (filters: AdvancedSearchFilters) => void;
  isSearchingCache?: boolean;
};

export default function AdvancedSearchFilters({ onSearch, onClear, isSearching, onSearchCache, isSearchingCache }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    company_name_includes: '',
    company_name_excludes: '',
    company_status: [],
    company_type: [],
    company_subtype: [],
    location: '',
    country: '',
    postal_code: '',
    sic_codes: '',
    incorporated_from: '',
    incorporated_to: '',
    dissolved_from: '',
    dissolved_to: '',
    confirmation_statement_from: '',
    confirmation_statement_to: '',
    accounts_due_from: '',
    accounts_due_to: '',
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const updateFilters = (key: keyof AdvancedSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Count active filters
    let count = 0;
    if (newFilters.company_name_includes) count++;
    if (newFilters.company_name_excludes) count++;
    if (newFilters.company_status.length > 0) count++;
    if (newFilters.company_type.length > 0) count++;
    if (newFilters.company_subtype.length > 0) count++;
    if (newFilters.location) count++;
    if (newFilters.country) count++;
    if (newFilters.postal_code) count++;
    if (newFilters.sic_codes) count++;
    if (newFilters.incorporated_from || newFilters.incorporated_to) count++;
    if (newFilters.dissolved_from || newFilters.dissolved_to) count++;
    if (newFilters.confirmation_statement_from || newFilters.confirmation_statement_to) count++;
    if (newFilters.accounts_due_from || newFilters.accounts_due_to) count++;
    setActiveFiltersCount(count);
  };

  const toggleArrayFilter = (key: 'company_status' | 'company_type' | 'company_subtype', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    updateFilters(key, newArray);
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      company_name_includes: '',
      company_name_excludes: '',
      company_status: [],
      company_type: [],
      company_subtype: [],
      location: '',
      country: '',
      postal_code: '',
      sic_codes: '',
      incorporated_from: '',
      incorporated_to: '',
      dissolved_from: '',
      dissolved_to: '',
      confirmation_statement_from: '',
      confirmation_statement_to: '',
      accounts_due_from: '',
      accounts_due_to: '',
    });
    setActiveFiltersCount(0);
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const addSicCode = (code: string) => {
    const currentCodes = filters.sic_codes ? filters.sic_codes.split(',').map(c => c.trim()) : [];
    if (!currentCodes.includes(code)) {
      const newCodes = [...currentCodes, code].filter(Boolean).join(', ');
      updateFilters('sic_codes', newCodes);
    }
  };

  const hasAnyFilter = filters.company_name_includes || filters.location ||
    filters.company_status.length > 0 || filters.company_type.length > 0 ||
    filters.country || filters.postal_code || filters.sic_codes;

  // Common input styles with black text
  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-black placeholder-gray-400";
  const dateInputClasses = "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm text-black";
  const selectClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-black bg-white";

  return (
    <div className="bg-white rounded-2xl border border-primary/20 overflow-hidden">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-primary" />
          <span className="font-semibold text-primary">Advanced Search</span>
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Filters Panel */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          {/* Section: Company Name */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company Name
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Contains</label>
                <input
                  type="text"
                  value={filters.company_name_includes}
                  onChange={(e) => updateFilters('company_name_includes', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Tech, Solutions, Digital"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Excludes</label>
                <input
                  type="text"
                  value={filters.company_name_excludes}
                  onChange={(e) => updateFilters('company_name_excludes', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Exclude these words"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">City / Town</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => updateFilters('location', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. London, Manchester"
                  list="uk-cities"
                  className={inputClasses}
                />
                <datalist id="uk-cities">
                  {UK_CITIES.map(city => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => updateFilters('country', e.target.value)}
                  className={selectClasses}
                >
                  {UK_COUNTRIES.map(country => (
                    <option key={country.value} value={country.value}>{country.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Postal Code</label>
                <input
                  type="text"
                  value={filters.postal_code}
                  onChange={(e) => updateFilters('postal_code', e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. SW1A, M1, B1"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Section: Industry */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Industry (SIC Codes)
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={filters.sic_codes}
                onChange={(e) => updateFilters('sic_codes', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter SIC codes (comma-separated) e.g. 62020, 70229"
                className={inputClasses}
              />
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 mr-2">Quick add:</span>
                {COMMON_SIC_CODES.map(sic => (
                  <button
                    key={sic.code}
                    onClick={() => addSicCode(sic.code)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                    title={sic.label}
                  >
                    {sic.code} - {sic.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Dates */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Ranges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Incorporated Between</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={filters.incorporated_from}
                    onChange={(e) => updateFilters('incorporated_from', e.target.value)}
                    className={dateInputClasses}
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={filters.incorporated_to}
                    onChange={(e) => updateFilters('incorporated_to', e.target.value)}
                    className={dateInputClasses}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Dissolved Between</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={filters.dissolved_from}
                    onChange={(e) => updateFilters('dissolved_from', e.target.value)}
                    className={dateInputClasses}
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={filters.dissolved_to}
                    onChange={(e) => updateFilters('dissolved_to', e.target.value)}
                    className={dateInputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Due Dates Section */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-green-800">
                  <strong>Due Date Filters:</strong> These filters work best with cached companies. First, search Companies House and save results to cache, then use "Search Cached" to filter by due dates.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Confirmation Statement Due Between</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={filters.confirmation_statement_from}
                      onChange={(e) => updateFilters('confirmation_statement_from', e.target.value)}
                      className={dateInputClasses}
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="date"
                      value={filters.confirmation_statement_to}
                      onChange={(e) => updateFilters('confirmation_statement_to', e.target.value)}
                      className={dateInputClasses}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Accounts Due Between</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={filters.accounts_due_from}
                      onChange={(e) => updateFilters('accounts_due_from', e.target.value)}
                      className={dateInputClasses}
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="date"
                      value={filters.accounts_due_to}
                      onChange={(e) => updateFilters('accounts_due_to', e.target.value)}
                      className={dateInputClasses}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Status */}
          <div className="mt-6 space-y-3">
            <label className="text-sm font-semibold text-gray-800">Company Status</label>
            <div className="flex flex-wrap gap-2">
              {COMPANY_STATUSES.map(status => (
                <button
                  key={status.value}
                  onClick={() => toggleArrayFilter('company_status', status.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.company_status.includes(status.value)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Company Type */}
          <div className="mt-6 space-y-3">
            <label className="text-sm font-semibold text-gray-800">Company Type</label>
            <div className="flex flex-wrap gap-2">
              {COMPANY_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => toggleArrayFilter('company_type', type.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.company_type.includes(type.value)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Company Subtype */}
          <div className="mt-6 space-y-3">
            <label className="text-sm font-semibold text-gray-800">Company Subtype</label>
            <div className="flex flex-wrap gap-2">
              {COMPANY_SUBTYPES.map(subtype => (
                <button
                  key={subtype.value}
                  onClick={() => toggleArrayFilter('company_subtype', subtype.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.company_subtype.includes(subtype.value)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subtype.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleClear}
              disabled={activeFiltersCount === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Filters
            </button>
            <div className="flex items-center gap-2">
              {/* Search Cache Button - Only for due date filters */}
              {onSearchCache && (filters.confirmation_statement_from || filters.confirmation_statement_to || filters.accounts_due_from || filters.accounts_due_to || filters.company_name_includes || filters.company_status.length > 0) && (
                <button
                  onClick={() => onSearchCache(filters)}
                  disabled={isSearchingCache}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSearchingCache ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching Cache...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      Search Cached
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleSearch}
                disabled={!hasAnyFilter || isSearching}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search Companies House
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
