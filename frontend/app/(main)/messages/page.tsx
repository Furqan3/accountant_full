"use client"

import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/layout/header"
import MessagePanel from "@/components/messages/message-panel"
import { MessageCircle, Package, Loader2 } from "lucide-react"
import { toast } from "react-toastify"

interface Order {
  id: string
  amount: number
  currency: string
  status: string
  payment_status: string
  service_type: string | null
  metadata: any
  created_at: string
  unread_count: number
}

function MessagesPageContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  useEffect(() => {
    const orderIdFromUrl = searchParams.get("orderId")
    if (orderIdFromUrl) {
      setSelectedOrderId(orderIdFromUrl)
    } else if (orders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orders[0].id)
    }
  }, [searchParams, orders])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/orders")
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders || [])
      } else {
        toast.error(data.error || "Failed to load orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return `$${(amount / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200"
      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="px-4 pt-4">
        <Header />
      </div>

      <main className="flex-1 flex flex-col md:flex-row m-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        style={{ height: 'calc(100vh - 120px)' }}>
        {orders.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No orders yet
              </h2>
              <p className="text-gray-600">
                You don't have any orders to chat about yet.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Orders List - Sidebar */}
            <div className="w-full md:w-80 border-r border-gray-200 flex flex-col h-full">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
                <h2 className="font-semibold text-gray-900">Your Orders</h2>
                <p className="text-sm text-gray-600">
                  Select an order to view messages
                </p>
              </div>
              <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition ${
                      selectedOrderId === order.id
                        ? "bg-teal-50 border-l-4 border-teal-600"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </span>
                      </div>
                      {order.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {order.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>

                      <p className="text-sm font-medium text-gray-900">
                        {formatAmount(order.amount, order.currency)}
                      </p>

                      {order.service_type && (
                        <p className="text-xs text-gray-600">
                          {order.service_type}
                        </p>
                      )}

                      <p className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Panel - Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {selectedOrderId ? (
                <MessagePanel orderId={selectedOrderId} />
              ) : (
                <div className="h-full flex items-center justify-center p-12">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select an order
                    </h3>
                    <p className="text-gray-600">
                      Choose an order from the list to view and send messages
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  )
}
