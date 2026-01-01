"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import Footer from "@/components/layout/footer"
import PageHero from "@/components/shared/page-hero"
import CheckoutForm from "@/components/checkout/checkout-form"
import OrderSummary from "@/components/checkout/order-summary"
import { useCart } from "@/context/cart-context"


export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { items, totalPrice, removeFromCart } = useCart()

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.push("/signin?redirect=/checkout")
    }
  }, [user, loading, router])

  const handleSubmit = (data: any) => {
    console.log("Payment submitted:", data)
  }
  const orderItems = items.map(item => ({
    id: item.id,
    name: item.title,
    quantity: item.quantity,
    price: item.price,
    companyName: item.companyName,
    companyNumber: item.companyNumber,
  }))

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render checkout if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHero title="Checkout" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CheckoutForm total={totalPrice} items={orderItems} onSubmit={handleSubmit} />
          <OrderSummary
            items={orderItems}
            total={totalPrice}
            onRemove={removeFromCart}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}