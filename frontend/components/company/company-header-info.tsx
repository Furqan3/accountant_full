import type React from "react"
import { getTimeRemaining, formatDate, calculateCorporationTaxDue } from "@/lib/date-utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface CompanyHeaderInfoProps {
  company: any
}

const CompanyHeaderInfo: React.FC<CompanyHeaderInfoProps> = ({ company }) => {
  const [showMore, setShowMore] = useState(false)

  // Calculate year end date
  const yearEndDate = company.accounts?.accounting_reference_date
    ? `${company.accounts.accounting_reference_date.day} ${getMonthName(company.accounts.accounting_reference_date.month)} ${new Date().getFullYear()}`
    : 'N/A'

  // Get corporation tax due date
  const corpTaxDue = company.accounts?.accounting_reference_date
    ? calculateCorporationTaxDue(company.accounts.accounting_reference_date)
    : null

  // Status badge color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (['active'].includes(statusLower)) {
      return 'bg-green-100 text-green-700'
    } else if (['dissolved', 'liquidation', 'receivership', 'administration', 'insolvency-proceedings', 'removed', 'closed', 'converted-closed'].includes(statusLower)) {
      return 'bg-red-100 text-red-700'
    } else if (statusLower === 'voluntary-arrangement') {
      return 'bg-yellow-100 text-yellow-700'
    }
    return 'bg-gray-100 text-gray-700'
  }

  // Get company type display name
  const getCompanyType = (type: string) => {
    const types: { [key: string]: string } = {
      'ltd': 'Private limited company',
      'plc': 'Public limited company',
      'llp': 'Limited liability partnership',
      'private-limited-guarant-nsc': 'Private company limited by guarantee',
      'private-unlimited': 'Private unlimited company',
    }
    return types[type] || type
  }

  // Get SIC code description (you might want to maintain a mapping)
  const getSICDescription = (code: string) => {
    // This is a simplified version. You can expand this mapping
    const sicCodes: { [key: string]: string } = {
      '99999': 'Dormant Company',
      '56210': 'Event catering activities',
      '56101': 'Licensed restaurants',
      '56302': 'Public houses and bars',
    }
    return sicCodes[code] || `SIC Code: ${code}`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{company.company_name}</h1>

      {/* Key dates - always visible */}
      <div className="space-y-3 text-base mb-4">
        {company.accounts?.accounting_reference_date && (
          <div className="flex gap-2">
            <span className="text-gray-700">Company Year End:</span>
            <span className="text-gray-900">
              <strong>{yearEndDate}</strong>
              {company.accounts.next_accounts?.period_end_on && (
                <span className="font-semibold text-teal-700 ml-2">
                  ({getTimeRemaining(company.accounts.next_accounts.period_end_on)})
                </span>
              )}
            </span>
          </div>
        )}

        {company.confirmation_statement?.next_due && (
          <div className="flex gap-2">
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
          <div className="flex gap-2">
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
          <div className="flex gap-2">
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
        <div className="flex gap-2 items-center">
          <span className="text-gray-700">Company Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(company.company_status)}`}>
            {company.company_status.charAt(0).toUpperCase() + company.company_status.slice(1)}
          </span>
        </div>

        <div className="flex gap-2">
          <span className="text-gray-700">Company Type:</span>
          <span className="text-gray-900"><strong>{getCompanyType(company.type)}</strong></span>
        </div>

        <div className="flex gap-2">
          <span className="text-gray-700">Company Number:</span>
          <span className="text-gray-900"><strong>{company.company_number}</strong></span>
        </div>

        <div className="flex gap-2">
          <span className="text-gray-700">Created On:</span>
          <span className="text-gray-900"><strong>{formatDate(company.date_of_creation)}</strong></span>
        </div>

        {company.sic_codes && company.sic_codes.length > 0 && (
          <div className="flex gap-2">
            <span className="text-gray-700">Activity:</span>
            <span className="text-gray-900"><strong>{getSICDescription(company.sic_codes[0])}</strong></span>
          </div>
        )}

        {company.registered_office_address && (
          <div className="flex gap-2">
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
  )
}

// Helper function to get month name
function getMonthName(month: string): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[parseInt(month) - 1] || ''
}

export default CompanyHeaderInfo
