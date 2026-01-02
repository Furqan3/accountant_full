"use client";

import { Search } from "lucide-react";


type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  sortOptions?: { label: string; value: string }[];
  onSearch?: (value: string) => void;
  onSortChange?: (value: string) => void;
};

export default function DashboardHeader({
  title,
  subtitle,
  searchPlaceholder = "Search...",
  sortOptions = [
    { label: "New first", value: "new" },
    { label: "Old first", value: "old" },
  ],
  onSearch,
  onSortChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row bg-white p-5 md:items-center md:justify-between rounded-2xl ">
      
      
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: Search + Sort */}
      <div className="flex items-center text-black gap-3">
        
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Sort */}
        <select
          defaultValue="new"
          onChange={(e) => onSortChange?.(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
