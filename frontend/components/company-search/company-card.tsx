import type React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface CompanyCardProps {
  id: string
  name: string
  confirmationStatementDue: string
  accountsDue: string
}

const CompanyCard: React.FC<CompanyCardProps> = ({ id, name, confirmationStatementDue, accountsDue }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition">
      <div className="flex items-center gap-4">
       
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 mt-1">
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
