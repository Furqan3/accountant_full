"use client";

import { X, ChevronRight, Trash2 } from "lucide-react";
import { useBulkSelection } from "@/contexts/bulk-selection-context";
import { useRouter } from "next/navigation";

export default function BulkSelectionSidebar() {
  const { selectedCompanies, removeCompany, clearSelection } = useBulkSelection();
  const router = useRouter();

  if (selectedCompanies.length === 0) {
    return null;
  }

  const handleProceed = () => {
    router.push('/search/bulk-process');
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div className="fixed inset-0 bg-black/20 z-40 xl:hidden" onClick={clearSelection} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-primary/20 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-primary">
              Selected Companies
            </h3>
            <button
              onClick={clearSelection}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
              title="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {selectedCompanies.length} {selectedCompanies.length === 1 ? 'company' : 'companies'} selected
          </p>
        </div>

        {/* Company List - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {selectedCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-primary/40 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {company.company_name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    #{company.company_number}
                  </p>
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
                <button
                  onClick={() => removeCompany(company.id)}
                  className="p-1 hover:bg-red-50 rounded transition text-gray-500 hover:text-red-600 flex-shrink-0"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={handleProceed}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-medium px-4 py-3 rounded-lg hover:opacity-90 transition"
          >
            Proceed to Services
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={clearSelection}
            className="w-full bg-white text-gray-700 font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Clear All
          </button>
        </div>
      </div>
    </>
  );
}
