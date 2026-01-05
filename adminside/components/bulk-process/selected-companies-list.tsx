"use client";

import { Building2, Hash } from "lucide-react";
import { Company } from "@/contexts/bulk-selection-context";

interface SelectedCompaniesListProps {
  companies: Company[];
}

export default function SelectedCompaniesList({ companies }: SelectedCompaniesListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Selected Companies</h3>
        <span className="text-sm text-gray-600">
          {companies.length} {companies.length === 1 ? 'company' : 'companies'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((company) => (
          <div
            key={company.id}
            className="bg-white rounded-lg p-4 border border-primary/20"
          >
            <div className="flex items-start gap-2">
              <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {company.company_name}
                </h4>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Hash className="h-3 w-3" />
                  <span>{company.company_number}</span>
                </div>
                {company.company_status && (
                  <span
                    className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                      company.company_status.toLowerCase() === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {company.company_status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
