"use client";

import { useState, useEffect } from "react";
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
  Database,
  Sparkles,
  Info,
  Check,
  AlertCircle
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
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'dissolved', label: 'Dissolved', color: 'gray' },
  { value: 'liquidation', label: 'Liquidation', color: 'red' },
  { value: 'receivership', label: 'Receivership', color: 'orange' },
  { value: 'administration', label: 'Administration', color: 'orange' },
  { value: 'voluntary-arrangement', label: 'Voluntary Arrangement', color: 'yellow' },
  { value: 'converted-closed', label: 'Converted/Closed', color: 'gray' },
  { value: 'insolvency-proceedings', label: 'Insolvency Proceedings', color: 'red' },
  { value: 'open', label: 'Open', color: 'green' },
  { value: 'closed', label: 'Closed', color: 'gray' },
  { value: 'registered', label: 'Registered', color: 'blue' },
  { value: 'removed', label: 'Removed', color: 'gray' },
];

const COMPANY_TYPES = [
  { value: 'ltd', label: 'Private Limited (LTD)', popular: true },
  { value: 'plc', label: 'Public Limited (PLC)', popular: true },
  { value: 'llp', label: 'LLP', popular: true },
  { value: 'private-unlimited', label: 'Private Unlimited', popular: false },
  { value: 'limited-partnership', label: 'Limited Partnership', popular: false },
  { value: 'scottish-partnership', label: 'Scottish Partnership', popular: false },
  { value: 'charitable-incorporated-organisation', label: 'CIO', popular: false },
  { value: 'scottish-charitable-incorporated-organisation', label: 'Scottish CIO', popular: false },
  { value: 'registered-society-non-jurisdictional', label: 'Registered Society', popular: false },
  { value: 'industrial-and-provident-society', label: 'Industrial & Provident', popular: false },
  { value: 'royal-charter', label: 'Royal Charter', popular: false },
  { value: 'oversea-company', label: 'Overseas Company', popular: false },
  { value: 'uk-establishment', label: 'UK Establishment', popular: false },
  { value: 'unregistered-company', label: 'Unregistered', popular: false },
  { value: 'other', label: 'Other', popular: false },
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

// Quick presets for common searches
const QUICK_PRESETS = [
  {
    id: 'active-ltd',
    label: 'Active LTD Companies',
    icon: Building2,
    filters: { company_status: ['active'], company_type: ['ltd'] }
  },
  {
    id: 'new-companies',
    label: 'Last 30 Days',
    icon: Sparkles,
    filters: {
      company_status: ['active'],
      incorporated_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  },
  {
    id: 'london-active',
    label: 'London Companies',
    icon: MapPin,
    filters: { company_status: ['active'], location: 'London' }
  },
  {
    id: 'it-companies',
    label: 'IT & Tech',
    icon: Hash,
    filters: { company_status: ['active'], sic_codes: '62020, 62012, 62090' }
  },
];

type Props = {
  onSearch: (filters: AdvancedSearchFilters) => void;
  onClear: () => void;
  isSearching: boolean;
  onSearchCache?: (filters: AdvancedSearchFilters) => void;
  isSearchingCache?: boolean;
};

// Section component for collapsible sections
function FilterSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          {badge !== undefined && badge !== 0 && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AdvancedSearchFilters({ onSearch, onClear, isSearching, onSearchCache, isSearchingCache }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);
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
  const [activeFiltersList, setActiveFiltersList] = useState<string[]>([]);

  // Calculate active filters
  useEffect(() => {
    const list: string[] = [];
    if (filters.company_name_includes) list.push(`Name: "${filters.company_name_includes}"`);
    if (filters.company_name_excludes) list.push(`Excludes: "${filters.company_name_excludes}"`);
    if (filters.company_status.length > 0) list.push(`Status: ${filters.company_status.length}`);
    if (filters.company_type.length > 0) list.push(`Type: ${filters.company_type.length}`);
    if (filters.company_subtype.length > 0) list.push(`Subtype: ${filters.company_subtype.length}`);
    if (filters.location) list.push(`Location: ${filters.location}`);
    if (filters.country) list.push(`Country: ${filters.country}`);
    if (filters.postal_code) list.push(`Postcode: ${filters.postal_code}`);
    if (filters.sic_codes) list.push(`SIC Codes`);
    if (filters.incorporated_from || filters.incorporated_to) list.push('Incorporated Date');
    if (filters.dissolved_from || filters.dissolved_to) list.push('Dissolved Date');
    if (filters.confirmation_statement_from || filters.confirmation_statement_to) list.push('Confirmation Due');
    if (filters.accounts_due_from || filters.accounts_due_to) list.push('Accounts Due');

    setActiveFiltersList(list);
    setActiveFiltersCount(list.length);
  }, [filters]);

  const updateFilters = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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

  const removeSicCode = (code: string) => {
    const currentCodes = filters.sic_codes ? filters.sic_codes.split(',').map(c => c.trim()) : [];
    const newCodes = currentCodes.filter(c => c !== code).join(', ');
    updateFilters('sic_codes', newCodes);
  };

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setFilters(prev => ({
      ...prev,
      ...preset.filters,
      company_status: preset.filters.company_status || prev.company_status,
      company_type: preset.filters.company_type || prev.company_type,
    }));
    setIsExpanded(true);
  };

  const hasAnyFilter = filters.company_name_includes || filters.location ||
    filters.company_status.length > 0 || filters.company_type.length > 0 ||
    filters.country || filters.postal_code || filters.sic_codes;

  const hasDueDateFilters = filters.confirmation_statement_from || filters.confirmation_statement_to ||
    filters.accounts_due_from || filters.accounts_due_to;

  // Input styles
  const inputClasses = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-black placeholder-gray-400 transition-all";
  const dateInputClasses = "flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm text-black transition-all";
  const selectClasses = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-black bg-white transition-all";

  // Get current SIC codes as array
  const currentSicCodes = filters.sic_codes ? filters.sic_codes.split(',').map(c => c.trim()).filter(Boolean) : [];

  // Display types based on showAllTypes
  const displayedTypes = showAllTypes ? COMPANY_TYPES : COMPANY_TYPES.filter(t => t.popular);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Filter className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-gray-900">Advanced Search</span>
            <p className="text-xs text-gray-500">Search Companies House with multiple filters</p>
          </div>
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-white text-xs px-2.5 py-1 rounded-full font-medium">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && !isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSearch();
              }}
              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Search
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Filters Panel */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-100">

          {/* Quick Presets */}
          <div className="mt-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700">Quick Filters</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-primary/5 hover:to-primary/10 border border-gray-200 hover:border-primary/30 rounded-lg text-sm text-gray-700 hover:text-primary transition-all"
                >
                  <preset.icon className="w-4 h-4" />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="mb-6 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">Active Filters</span>
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFiltersList.map((filter, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-primary/30 rounded-full text-xs text-primary font-medium"
                  >
                    <Check className="w-3 h-3" />
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Filter Sections */}
          <div className="space-y-4">

            {/* Company Name Section */}
            <FilterSection title="Company Name" icon={Building2} defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Name Contains</label>
                  <input
                    type="text"
                    value={filters.company_name_includes}
                    onChange={(e) => updateFilters('company_name_includes', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Tech, Solutions, Digital"
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Name Excludes</label>
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
            </FilterSection>

            {/* Location Section */}
            <FilterSection
              title="Location"
              icon={MapPin}
              defaultOpen={!!filters.location || !!filters.country || !!filters.postal_code}
              badge={[filters.location, filters.country, filters.postal_code].filter(Boolean).length || undefined}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
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
            </FilterSection>

            {/* Industry Section */}
            <FilterSection
              title="Industry (SIC Codes)"
              icon={Briefcase}
              defaultOpen={!!filters.sic_codes}
              badge={currentSicCodes.length || undefined}
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">SIC Codes (comma-separated)</label>
                  <input
                    type="text"
                    value={filters.sic_codes}
                    onChange={(e) => updateFilters('sic_codes', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. 62020, 70229"
                    className={inputClasses}
                  />
                </div>

                {/* Selected SIC codes */}
                {currentSicCodes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentSicCodes.map(code => {
                      const sicInfo = COMMON_SIC_CODES.find(s => s.code === code);
                      return (
                        <span
                          key={code}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {code}{sicInfo && ` - ${sicInfo.label}`}
                          <button
                            onClick={() => removeSicCode(code)}
                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Quick add buttons */}
                <div>
                  <span className="text-xs text-gray-500 mb-2 block">Popular industries:</span>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SIC_CODES.map(sic => (
                      <button
                        key={sic.code}
                        onClick={() => addSicCode(sic.code)}
                        disabled={currentSicCodes.includes(sic.code)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                          currentSicCodes.includes(sic.code)
                            ? 'bg-primary/10 text-primary cursor-default'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {currentSicCodes.includes(sic.code) && <Check className="w-3 h-3 inline mr-1" />}
                        {sic.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FilterSection>

            {/* Company Status Section */}
            <FilterSection
              title="Company Status"
              icon={Globe}
              defaultOpen={filters.company_status.length > 0}
              badge={filters.company_status.length || undefined}
            >
              <div className="flex flex-wrap gap-2">
                {COMPANY_STATUSES.map(status => {
                  const isSelected = filters.company_status.includes(status.value);
                  const colorClasses = {
                    green: isSelected ? 'bg-green-500 text-white border-green-500' : 'border-green-200 text-green-700 hover:bg-green-50',
                    gray: isSelected ? 'bg-gray-500 text-white border-gray-500' : 'border-gray-200 text-gray-700 hover:bg-gray-50',
                    red: isSelected ? 'bg-red-500 text-white border-red-500' : 'border-red-200 text-red-700 hover:bg-red-50',
                    orange: isSelected ? 'bg-orange-500 text-white border-orange-500' : 'border-orange-200 text-orange-700 hover:bg-orange-50',
                    yellow: isSelected ? 'bg-yellow-500 text-white border-yellow-500' : 'border-yellow-200 text-yellow-700 hover:bg-yellow-50',
                    blue: isSelected ? 'bg-blue-500 text-white border-blue-500' : 'border-blue-200 text-blue-700 hover:bg-blue-50',
                  };
                  return (
                    <button
                      key={status.value}
                      onClick={() => toggleArrayFilter('company_status', status.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${colorClasses[status.color as keyof typeof colorClasses]}`}
                    >
                      {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            {/* Company Type Section */}
            <FilterSection
              title="Company Type"
              icon={Building2}
              defaultOpen={filters.company_type.length > 0}
              badge={filters.company_type.length || undefined}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {displayedTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => toggleArrayFilter('company_type', type.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                        filters.company_type.includes(type.value)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {filters.company_type.includes(type.value) && <Check className="w-3 h-3 inline mr-1" />}
                      {type.label}
                    </button>
                  ))}
                </div>
                {!showAllTypes && (
                  <button
                    onClick={() => setShowAllTypes(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Show {COMPANY_TYPES.length - displayedTypes.length} more types...
                  </button>
                )}
                {showAllTypes && (
                  <button
                    onClick={() => setShowAllTypes(false)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Show less
                  </button>
                )}
              </div>
            </FilterSection>

            {/* Company Subtype Section */}
            <FilterSection
              title="Company Subtype"
              icon={Hash}
              defaultOpen={filters.company_subtype.length > 0}
              badge={filters.company_subtype.length || undefined}
            >
              <div className="flex flex-wrap gap-2">
                {COMPANY_SUBTYPES.map(subtype => (
                  <button
                    key={subtype.value}
                    onClick={() => toggleArrayFilter('company_subtype', subtype.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      filters.company_subtype.includes(subtype.value)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {filters.company_subtype.includes(subtype.value) && <Check className="w-3 h-3 inline mr-1" />}
                    {subtype.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Date Ranges Section */}
            <FilterSection
              title="Date Ranges"
              icon={Calendar}
              defaultOpen={!!(filters.incorporated_from || filters.incorporated_to || filters.dissolved_from || filters.dissolved_to)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Incorporated Between</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={filters.incorporated_from}
                      onChange={(e) => updateFilters('incorporated_from', e.target.value)}
                      className={dateInputClasses}
                    />
                    <span className="text-gray-400 text-sm">to</span>
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
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="date"
                      value={filters.dissolved_to}
                      onChange={(e) => updateFilters('dissolved_to', e.target.value)}
                      className={dateInputClasses}
                    />
                  </div>
                </div>
              </div>
            </FilterSection>

            {/* Due Dates Section - Special styling */}
            <div className="border border-green-200 rounded-xl overflow-hidden bg-green-50/50">
              <div className="px-4 py-3 bg-green-100/50 border-b border-green-200">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Due Date Filters</span>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Cache Only</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  These filters work with cached companies only. Search Companies House first, save to cache, then filter by due dates.
                </p>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600">Confirmation Statement Due</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={filters.confirmation_statement_from}
                        onChange={(e) => updateFilters('confirmation_statement_from', e.target.value)}
                        className={dateInputClasses}
                      />
                      <span className="text-gray-400 text-sm">to</span>
                      <input
                        type="date"
                        value={filters.confirmation_statement_to}
                        onChange={(e) => updateFilters('confirmation_statement_to', e.target.value)}
                        className={dateInputClasses}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600">Accounts Due</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={filters.accounts_due_from}
                        onChange={(e) => updateFilters('accounts_due_from', e.target.value)}
                        className={dateInputClasses}
                      />
                      <span className="text-gray-400 text-sm">to</span>
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
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-gray-200">
            <button
              onClick={handleClear}
              disabled={activeFiltersCount === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear All Filters
            </button>

            <div className="flex items-center gap-3">
              {/* Search Cache Button */}
              {onSearchCache && (hasDueDateFilters || filters.company_name_includes || filters.company_status.length > 0) && (
                <button
                  onClick={() => onSearchCache(filters)}
                  disabled={isSearchingCache}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
                >
                  {isSearchingCache ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      Search Cached
                    </>
                  )}
                </button>
              )}

              {/* Main Search Button */}
              <button
                onClick={handleSearch}
                disabled={!hasAnyFilter || isSearching}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm shadow-primary/25"
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

          {/* Help text */}
          {!hasAnyFilter && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Add at least one filter (company name, location, status, type, or SIC code) to search Companies House.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
