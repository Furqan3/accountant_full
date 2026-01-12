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
      className={`bg-white m-5 border-2 rounded-xl p-6 shadow-sm hover:shadow-md transition-all ${
        selected ? "border-teal-600 bg-teal-50" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          {dueIn && (
            <p className="text-sm font-semibold text-teal-700 mb-3 bg-teal-50 inline-block px-3 py-1 rounded-full">
              {dueIn}
            </p>
          )}
          {description && (
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              {description}
            </p>
          )}
          {bulletPoints && bulletPoints.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">Includes:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                {bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 mt-0.5">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              £{price.toFixed(2)}
            </p>
            {price > 0 && (
              <p className="text-xs text-gray-500 mt-1">inclusive VAT</p>
            )}
          </div>

          {selected ? (
            <button
              onClick={onRemove}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
              aria-label="Remove service"
            >
              Remove
            </button>
          ) : (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition font-medium text-sm"
              aria-label="Add service"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


export default ServiceCard
