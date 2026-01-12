import type React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface CompanyCardProps {
  id: string
  name: string
  confirmationStatementDue: string
  accountsDue: string
  status?: string
}

const CompanyCard: React.FC<CompanyCardProps> = ({ id, name, confirmationStatementDue, accountsDue, status }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition">
      <div className="flex items-center gap-4">
       
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {name}
          </h3>

          <div className="flex items-center gap-3 mt-1 mb-2">
            <span className="text-sm text-gray-600">
              <span className="text-gray-400">Company No:</span> {id}
            </span>
            {status && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                ['active'].includes(status.toLowerCase())
                  ? 'bg-green-100 text-green-700'
                  : ['dissolved', 'liquidation', 'receivership', 'administration', 'insolvency-proceedings', 'removed', 'closed', 'converted-closed','registered', 'open'].includes(status.toLowerCase())
                  ? 'bg-red-100 text-red-700'
                  : status.toLowerCase() === 'voluntary-arrangement'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {status}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
            <div>
              <span className="text-gray-400">Confirmation Statement Due</span>
              <p className="text-gray-700">{confirmationStatementDue}</p>
            </div>
            <div>
              <span className="text-gray-400">Accounts Due</span>
              <p className="text-gray-700">{accountsDue}</p>
            </div>
          </div>
        </div>
      </div>
      <Link
        href={`/company/${id}`}
        className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
      >
        View
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

export default CompanyCard
