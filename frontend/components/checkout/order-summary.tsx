import type React from "react"
import { Trash2 } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface OrderSummaryProps {
  items: OrderItem[]
  total: number
  onRemove: (id: string) => void
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items, total, onRemove }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

  {/* Scrollable area for items if needed */}
  <div className="space-y-3 overflow-y-auto flex-grow">
    {items.map((item) => (
      <div
        key={item.id}
        className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
      >
        <div>
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-500">
            Qty: {item.quantity.toString().padStart(2, "0")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-900">
            £{(item.price * item.quantity).toFixed(2)}
          </span>

          <button
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:text-red-700 transition"
            aria-label="Remove item"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    ))}
  </div>

  {/* Sticky total & checkout area */}
  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
    <span className="text-lg font-semibold text-gray-900">Total</span>
    <span className="text-2xl font-bold text-teal-700">£{total.toFixed(2)}</span>
  </div>
</div>
  )
}

export default OrderSummary
