import type React from "react"
import { Calendar, MapPin, FileText, AlertTriangle } from "lucide-react"

interface CompanyInfo {
  incorporationDate: string
  registeredAddress: string
  confirmationStatementDue: string
  accountsDue: string
}

interface CompanyInfoCardsProps {
  info: CompanyInfo
}

const CompanyInfoCards: React.FC<CompanyInfoCardsProps> = ({ info }) => {
  const cards = [
    { icon: Calendar, label: "Incorporation Date", value: info.incorporationDate || 'N/A' },
    { icon: MapPin, label: "Registered Address", value: info.registeredAddress || 'N/A' },
    { icon: FileText, label: "Confirmation Statement Due", value: info.confirmationStatementDue || 'N/A' },
    { icon: AlertTriangle, label: "Accounts Due", value: info.accountsDue || 'N/A' },
  ]

  return (
    <div className="flex justify-center py-4 px-2">
      <div className="inline-flex gap-4 overflow-x-auto">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg min-w-[250px]"
          >
            <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
              <card.icon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-sm font-medium text-gray-900 break-words">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CompanyInfoCards
