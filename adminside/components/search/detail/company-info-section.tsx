"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, FileText, Receipt, Building2, Hash, Clock, MapPin, Briefcase } from "lucide-react";

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

    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      if (absDays < 30) return `${absDays} days overdue`;
      if (absDays < 365) return `${Math.floor(absDays / 30)} months overdue`;
      return 'Overdue';
    }
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'in 1 day';
    if (diffDays < 30) return `in ${diffDays} days`;

    const months = Math.floor(diffDays / 30);
    if (months === 1) return 'in 1 month';
    if (months < 12) return `in ${months} months`;

    const years = Math.floor(months / 12);
    return years === 1 ? 'in 1 year' : `in ${years} years`;
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
    return 'bg-green-100 text-green-700 border-green-300';
  } else if (['dissolved', 'liquidation', 'receivership', 'administration', 'insolvency-proceedings', 'removed', 'closed', 'converted-closed'].includes(statusLower)) {
    return 'bg-red-100 text-red-700 border-red-300';
  } else if (statusLower === 'voluntary-arrangement') {
    return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  }
  return 'bg-gray-100 text-gray-700 border-gray-300';
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
    <div className="bg-white border-2 border-teal-200 rounded-2xl p-8 shadow-lg">
      {/* Key dates - 2 column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {company.accounts?.accounting_reference_date && company.accounts?.next_accounts?.period_end_on && (
          <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-100 rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Company Year End</p>
              <p className="text-xl font-bold text-gray-900">{yearEndDate}</p>
              <p className="text-teal-700 font-semibold text-base mt-1">
                {getTimeRemaining(company.accounts.next_accounts.period_end_on)}
              </p>
            </div>
          </div>
        )}

        {company.confirmation_statement?.next_due && (
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Next Confirmation Statement Due</p>
              <p className="text-xl font-bold text-gray-900">{formatDate(company.confirmation_statement.next_due)}</p>
              <p className="text-blue-700 font-semibold text-base mt-1">
                {getTimeRemaining(company.confirmation_statement.next_due)}
              </p>
            </div>
          </div>
        )}

        {company.accounts?.next_due && (
          <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Accounts Due To Be Filed By</p>
              <p className="text-xl font-bold text-gray-900">{formatDate(company.accounts.next_due)}</p>
              <p className="text-purple-700 font-semibold text-base mt-1">
                {getTimeRemaining(company.accounts.next_due)}
              </p>
            </div>
          </div>
        )}

        {corpTaxDue && (
          <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Receipt className="w-6 h-6 text-orange-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Corporation Tax Due To Be Paid By</p>
              <p className="text-xl font-bold text-gray-900">{formatDate(corpTaxDue)}</p>
              <p className="text-orange-700 font-semibold text-base mt-1">
                {getTimeRemaining(corpTaxDue)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Additional details - collapsible, 2 column grid */}
      <div className={`${showMore ? 'block' : 'hidden'} mt-6 pt-6 border-t-2 border-gray-100`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Company Status</p>
              <span className={`inline-block px-4 py-2 rounded-lg text-lg font-bold border ${getStatusColor(company.company_status)}`}>
                {company.company_status.charAt(0).toUpperCase() + company.company_status.slice(1)}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Company Type</p>
              <p className="text-xl font-bold text-gray-900">{getCompanyType(company.type || company.company_type)}</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
              <Hash className="w-6 h-6 text-cyan-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Company Number</p>
              <p className="text-xl font-bold text-gray-900">{company.company_number}</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-pink-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Created On</p>
              <p className="text-xl font-bold text-gray-900">{formatDate(company.date_of_creation)}</p>
            </div>
          </div>

          {company.sic_codes && company.sic_codes.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <p className="text-gray-600 text-base font-medium mb-1">Activity</p>
                <p className="text-xl font-bold text-gray-900">{getSICDescription(company.sic_codes[0])}</p>
              </div>
            </div>
          )}

          {company.registered_office_address && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-rose-700" />
              </div>
              <div>
                <p className="text-gray-600 text-base font-medium mb-1">Registered Address</p>
                <p className="text-lg font-bold text-gray-900">
                  {[
                    company.registered_office_address.address_line_1,
                    company.registered_office_address.address_line_2,
                    company.registered_office_address.locality,
                    company.registered_office_address.postal_code,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show more/less button */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="mt-6 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-base px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
      >
        {showMore ? (
          <>
            Show less <ChevronUp className="w-5 h-5" />
          </>
        ) : (
          <>
            Show more details <ChevronDown className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
