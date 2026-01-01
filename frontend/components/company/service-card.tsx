"use client"

import type React from "react"
import { Plus, Trash2 } from "lucide-react"

interface ServiceCardProps {
  title: string
  description?: string
  dueIn?: string
  bulletPoints?: string[]
  price: number
  selected: boolean
  onAdd: () => void
  onRemove: () => void
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  dueIn,
  bulletPoints,
  price,
  selected,
  onAdd,
  onRemove,
}) => {
  return (
    <div
      className={`bg-white m-5 shadow-lg border rounded-lg p-6 transition ${
        selected ? "border-teal-600 bg-teal-50" : "border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          {dueIn && <p className="text-sm text-gray-500 mb-2">{dueIn}</p>}
          {description && (
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {description}
            </p>
          )}
          {bulletPoints && bulletPoints.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {bulletPoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <span className="text-2xl font-bold text-gray-900">
            £{price}
          </span>

          {selected ? (
            <button
              onClick={onRemove}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              aria-label="Remove service"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onAdd}
              className="p-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition"
              aria-label="Add service"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


export default ServiceCard
