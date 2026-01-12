"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CompanyInfoSectionProps {
  company: any;
}

// Helper functions
const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
};

const getTimeRemaining = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const targetDate = new Date(dateString);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due in 1 day';
    if (diffDays < 30) return `Due in ${diffDays} days`;

    const months = Math.floor(diffDays / 30);
    if (months === 1) return 'Due in 1 month';
    if (months < 12) return `Due in ${months} months`;

    const years = Math.floor(months / 12);
    return years === 1 ? 'Due in 1 year' : `Due in ${years} years`;
  } catch {
    return '';
  }
};

const calculateCorporationTaxDue = (accountingRefDate: any) => {
  if (!accountingRefDate) return null;
  try {
    const { day, month } = accountingRefDate;
    const year = new Date().getFullYear();
    const yearEnd = new Date(year, parseInt(month) - 1, parseInt(day));
    const taxDue = new Date(yearEnd);
    taxDue.setMonth(taxDue.getMonth() + 9);
    return taxDue.toISOString();
  } catch {
    return null;
  }
};

const getMonthName = (month: string): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[parseInt(month) - 1] || '';
};

const getCompanyType = (type: string) => {
  const types: { [key: string]: string } = {
    'ltd': 'Private limited company',
    'plc': 'Public limited company',
    'llp': 'Limited liability partnership',
    'private-limited-guarant-nsc': 'Private company limited by guarantee',
    'private-unlimited': 'Private unlimited company',
  };
  return types[type] || type;
};

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (['active'].includes(statusLower)) {
    return 'bg-green-100 text-green-700';
  } else if (['dissolved', 'liquidation', 'receivership', 'administration', 'insolvency-proceedings', 'removed', 'closed', 'converted-closed'].includes(statusLower)) {
    return 'bg-red-100 text-red-700';
  } else if (statusLower === 'voluntary-arrangement') {
    return 'bg-yellow-100 text-yellow-700';
  }
  return 'bg-gray-100 text-gray-700';
};

const getSICDescription = (code: string) => {
  const sicCodes: { [key: string]: string } = {
    '99999': 'Dormant Company',
    '56210': 'Event catering activities',
    '56101': 'Licensed restaurants',
    '56302': 'Public houses and bars',
  };
  return sicCodes[code] || `SIC Code: ${code}`;
};

export default function CompanyInfoSection({ company }: CompanyInfoSectionProps) {
  const [showMore, setShowMore] = useState(false);

  // Calculate year end
  const yearEndDate = company.accounts?.accounting_reference_date
    ? `${company.accounts.accounting_reference_date.day} ${getMonthName(company.accounts.accounting_reference_date.month)} ${new Date().getFullYear()}`
    : null;

  // Get corporation tax due date
  const corpTaxDue = company.accounts?.accounting_reference_date
    ? calculateCorporationTaxDue(company.accounts.accounting_reference_date)
    : null;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Key dates - always visible */}
      <div className="space-y-3 text-base mb-4">
        {company.accounts?.accounting_reference_date && company.accounts?.next_accounts?.period_end_on && (
          <div className="flex flex-wrap gap-2">
            <span className="text-gray-700">Company Year End:</span>
            <span className="text-gray-900">
              <strong>{yearEndDate}</strong>
              <span className="font-semibold text-teal-700 ml-2">
                ({getTimeRemaining(company.accounts.next_accounts.period_end_on)})
              </span>
            </span>
          </div>
        )}

        {company.confirmation_statement?.next_due && (
          <div className="flex flex-wrap gap-2">
            <span className="text-gray-700">Next Confirmation Statement Due:</span>
            <span className="text-gray-900">
              <strong>{formatDate(company.confirmation_statement.next_due)}</strong>
              <span className="font-semibold text-teal-700 ml-2">
                ({getTimeRemaining(company.confirmation_statement.next_due)})
              </span>
            </span>
          </div>
        )}

        {company.accounts?.next_due && (
          <div className="flex flex-wrap gap-2">
            <span className="text-gray-700">Accounts Due To Be Filed By:</span>
            <span className="text-gray-900">
              <strong>{formatDate(company.accounts.next_due)}</strong>
              <span className="font-semibold text-teal-700 ml-2">
                ({getTimeRemaining(company.accounts.next_due)})
              </span>
            </span>
          </div>
        )}

        {corpTaxDue && (
          <div className="flex flex-wrap gap-2">
            <span className="text-gray-700">Corporation Tax Due To Be Paid By:</span>
            <span className="text-gray-900">
              <strong>{formatDate(corpTaxDue)}</strong>
              <span className="font-semibold text-teal-700 ml-2">
                ({getTimeRemaining(corpTaxDue)})
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Additional details - collapsible */}
      <div className={`space-y-3 text-base ${showMore ? 'block' : 'hidden'} mt-4 pt-4 border-t border-gray-200`}>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-gray-700">Company Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(company.company_status)}`}>
            {company.company_status.charAt(0).toUpperCase() + company.company_status.slice(1)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-gray-700">Company Type:</span>
          <span className="text-gray-900"><strong>{getCompanyType(company.type || company.company_type)}</strong></span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-gray-700">Company Number:</span>
          <span className="text-gray-900"><strong>{company.company_number}</strong></span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-gray-700">Created On:</span>
          <span className="text-gray-900"><strong>{formatDate(company.date_of_creation)}</strong></span>
        </div>

        {company.sic_codes && company.sic_codes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-gray-700">Activity:</span>
            <span className="text-gray-900"><strong>{getSICDescription(company.sic_codes[0])}</strong></span>
          </div>
        )}

        {company.registered_office_address && (
          <div className="flex flex-wrap gap-2">
            <span className="text-gray-700">Registered address:</span>
            <span className="text-gray-900">
              <strong>
                {[
                  company.registered_office_address.address_line_1,
                  company.registered_office_address.address_line_2,
                  company.registered_office_address.locality,
                  company.registered_office_address.postal_code,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Show more/less button */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="mt-4 text-teal-700 hover:text-teal-800 font-medium text-sm flex items-center gap-1"
      >
        {showMore ? (
          <>
            Show less <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            Show more <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
