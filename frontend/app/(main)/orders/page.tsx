"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import Footer from "@/components/layout/footer"
import PageHero from "@/components/shared/page-hero"
import OrderCard from "@/components/orders/order-card"

interface Order {
  id: string
  user_id: string
  stripe_payment_intent_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  service_type: string | null
  company_id: string | null
  metadata: any
  created_at: string
  updated_at: string
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      try {
        setLoadingOrders(true)
        const supabase = createClient()

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching orders:', error)
        } else {
          setOrders(data || [])
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoadingOrders(false)
      }
    }

    fetchOrders()
  }, [user])

  const handleWithdraw = async (orderId: string) => {
    // TODO: Implement order cancellation
    console.log("Withdrawing order:", orderId)
  }

  const handleReview = (orderId: string) => {
    // TODO: Implement review functionality
    console.log("Writing review for order:", orderId)
  }

  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHero title="My Orders" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">You have no orders yet.</p>
            <p className="text-gray-400 mt-2">Orders will appear here after you make a purchase.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              // Parse items from metadata
              let items: Array<{ name: string; price: number }> = []
              let companyInfo: { name?: string; number?: string } = {}

              try {
                if (order.metadata && order.metadata.items) {
                  const parsedItems = JSON.parse(order.metadata.items)

                  // Get company info from first item (all items in an order should be for same company)
                  if (parsedItems.length > 0) {
                    companyInfo = {
                      name: parsedItems[0].companyName,
                      number: parsedItems[0].companyNumber,
                    }
                  }

                  items = parsedItems.map((item: any) => ({
                    name: `${item.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}`,
                    price: item.price * item.quantity,
                  }))
                }
              } catch (error) {
                console.error('Error parsing order items:', error)
              }

              // Fallback if no items in metadata
              if (items.length === 0) {
                items = [
                  {
                    name: order.service_type || 'Service',
                    price: order.amount / 100,
                  },
                ]
              }

              // Map status to expected format
              const statusMap = {
                pending: 'Pending' as const,
                completed: 'Completed' as const,
                failed: 'Pending' as const, // Show failed as pending with different indicator
                refunded: 'Completed' as const,
              }

              const status = statusMap[order.status] || 'Pending' as const
              const isPaid = order.status === 'completed'

              return (
                <OrderCard
                  key={order.id}
                  orderId={order.id.slice(0, 8).toUpperCase()}
                  fullOrderId={order.id}
                  items={items}
                  status={status}
                  isPaid={isPaid}
                  companyName={companyInfo.name}
                  companyNumber={companyInfo.number}
                  onWithdraw={order.status === "pending" ? () => handleWithdraw(order.id) : undefined}
                  onReview={order.status === "completed" ? () => handleReview(order.id) : undefined}
                />
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
