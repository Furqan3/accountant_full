"use client";

import { Search } from "lucide-react";
import { useState } from "react";

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onExternalSearch?: (query: string) => void;
  isSearching?: boolean;
};

export default function SearchHeader({
  title,
  onExternalSearch,
  isSearching,
}: DashboardHeaderProps) {
  const [externalQuery, setExternalQuery] = useState("");

  const handleExternalSearch = () => {
    if (externalQuery.trim() && onExternalSearch) {
      onExternalSearch(externalQuery.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleExternalSearch();
    }
  };

  return (
   <div className="flex items-center gap-4 bg-white p-5 rounded-2xl ">
  {/* Title on the left */}
  <h1 className="text-2xl font-semibold text-primary whitespace-nowrap">
    {title}
  </h1>

  {/* Input + Button wrapper pushed to the right */}
  <div className="flex items-center text-primary gap-3 ml-auto">
    {/* Search input */}
    <div className="relative">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
      />
      <input
        type="text"
        placeholder="Search Companies..."
        value={externalQuery}
        onChange={(e) => setExternalQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSearching}
        className="pl-10 pr-4 py-2 rounded-lg border border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
    </div>

    {/* Search button */}
    <button
      onClick={handleExternalSearch}
      disabled={!externalQuery.trim() || isSearching}
      className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {isSearching ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Searching...
        </span>
      ) : (
        'Search'
      )}
    </button>
  </div>
</div>


  );
}
