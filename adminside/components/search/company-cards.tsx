"use client";

import { ChevronRight, Building2, Hash, Square, CheckSquare } from "lucide-react";
import Link from "next/link";
import { useBulkSelection } from "@/contexts/bulk-selection-context";

export type Company = {
  id: string;
  company_number: string;
  company_name: string;
  company_status?: string;
  company_type?: string;
  confirmation_statement_due?: string;
  accounts_due?: string;
  is_favorite?: boolean;
};

export default function CompanyCard({ company }: { company: Company }) {
  const { isSelected, addCompany, removeCompany } = useBulkSelection();
  const selected = isSelected(company.id);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleToggleSelect = () => {
    if (selected) {
      removeCompany(company.id);
    } else {
      addCompany(company);
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-1 border hover:shadow-md transition ${
      selected ? 'border-primary border-2' : 'border-primary/20'
    }`}>
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          {/* Company name and number */}
          <div className="flex items-start gap-2 mb-2">
            <Building2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary">
                {company.company_name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <Hash className="h-3 w-3" />
                <span>{company.company_number}</span>
                {company.company_status && (
                  <>
                    <span className="mx-2">•</span>
                    <span className={`capitalize ${company.company_status.toLowerCase() === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                      {company.company_status}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dates in a single row */}
          <div className="mt-3 flex gap-6">
            <div>
              <p className="text-xs text-gray-500">Confirmation Statement Due</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(company.confirmation_statement_due)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Accounts Due</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(company.accounts_due)}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons - vertically centered */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSelect}
            className={`flex items-center gap-1 text-sm font-medium px-4 py-4 rounded-lg transition ${
              selected
                ? 'bg-primary text-white hover:opacity-80'
                : 'bg-white text-primary border border-primary hover:bg-primary/5'
            }`}
          >
            {selected ? (
              <>
                <CheckSquare className="h-4 w-4" />
                Selected
              </>
            ) : (
              <>
                <Square className="h-4 w-4" />
                Select
              </>
            )}
          </button>
          <Link
            href={`/search/${company.id}`}
            className="flex items-center gap-1 text-sm bg-primary font-medium text-white hover:opacity-80 px-4 py-4 rounded-lg transition-opacity"
          >
            View More
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}