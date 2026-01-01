"use client"

import type React from "react"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

interface OrderItem {
  name: string
  price: number
}

interface OrderCardProps {
  orderId: string
  fullOrderId: string
  items: OrderItem[]
  status: "Pending" | "Completed"
  isPaid: boolean
  companyName?: string
  companyNumber?: string
  onWithdraw?: () => void
  onReview?: () => void
}

const OrderCard: React.FC<OrderCardProps> = ({ orderId, fullOrderId, items, status, isPaid, companyName, companyNumber, onWithdraw, onReview }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between md:justify-start gap-4 mb-2">
            <h3 className="text-xl font-bold text-gray-900">Order #{orderId}</h3>
            <div className="flex gap-2 md:hidden">
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  status === "Pending"
                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {status}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  isPaid
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-gray-50 text-gray-600 border border-gray-200"
                }`}
              >
                {isPaid ? "Paid" : "Unpaid"}
              </span>
            </div>
          </div>

          {companyName && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">Company:</span> {companyName}
                {companyNumber && <span className="text-gray-500 ml-2">({companyNumber})</span>}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name}</span>
                <span className="text-gray-900 font-medium">${item.price.toFixed(2)}</span>
              </div>
            ))}
            {items.length > 1 && (
              <div className="flex justify-between text-sm pt-2 mt-2 border-t border-gray-200">
                <span className="text-gray-900 font-semibold">Total</span>
                <span className="text-gray-900 font-bold">
                  ${items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className="hidden md:flex gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full ${
                status === "Pending"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {status}
            </span>
            <span
              className={"text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-200"}
              
            >
              {"Paid"}
            </span>
          </div>

          <div className="flex gap-3">
            {status === "Pending" && onWithdraw && (
              <button
                onClick={onWithdraw}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                Withdraw Request
              </button>
            )}
            {status === "Completed" && onReview && (
              <button
                onClick={onReview}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                Write a review
              </button>
            )}
            <Link
              href={`/messages?orderId=${fullOrderId}`}
              className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderCard
