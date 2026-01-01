"use client"

import { useState } from "react"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { createClient } from "@/lib/supabase"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CheckoutFormProps {
  total: number
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    companyName?: string
    companyNumber?: string
  }>
  onSubmit: (data: any) => void
}

export default function CheckoutForm({ total, items }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)

    // Verify session before making payment request
    try {
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        toast.error("Your session has expired. Please sign in again.")
        setTimeout(() => {
          router.push("/signin?redirect=/checkout")
        }, 1500)
        setLoading(false)
        return
      }
    } catch (err) {
      console.error("Session verification error:", err)
      toast.error("Authentication error. Please try signing in again.")
      setLoading(false)
      return
    }

    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Ensure cookies are sent
      body: JSON.stringify({
        amount: Math.round(total * 100),
        customer: formData,
        metadata: {
          items: JSON.stringify(items), // Store cart items in metadata
        },
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Payment failed" }))
      if (res.status === 401) {
        toast.error("Please sign in to continue with your purchase")
        setTimeout(() => {
          router.push("/signin?redirect=/checkout")
        }, 1500)
      } else {
        toast.error(errorData.error || "Failed to process payment")
      }
      setLoading(false)
      return
    }

    const data = await res.json()
    if (!data.clientSecret) {
      toast.error("Failed to get client secret")
      setLoading(false)
      return
    }

    const card = elements.getElement(CardElement)
    if (!card) return

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      data.clientSecret,
      {
        payment_method: {
          card,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
          },
        },
      }
    )

    if (error) {
      toast.error(error.message || "Payment failed. Please try again.")
      setLoading(false)
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("Payment Successful! Redirecting to orders...")

      // Clear the cart
      clearCart()

      // Redirect to orders page after a short delay
      setTimeout(() => {
        router.push("/orders")
      }, 2000)
    } else {
      toast.error("Payment processing failed. Please try again.")
      setLoading(false)
    }
  }
  return (
    
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-6 space-y-6"
    >
      {/* Your Details */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
      />

      {/* Payment Details */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
      <div className="p-4 border rounded mb-4">
        <CardElement
          options={{
            style: {
              base: { fontSize: "16px", color: "#111", "::placeholder": { color: "#888" } },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-teal-700 text-white py-3 rounded-lg font-semibold hover:bg-teal-800 transition"
      >
        {loading ? "Processing..." : `Pay $${total}`}
      </button>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </form>
     
      
  )
}
