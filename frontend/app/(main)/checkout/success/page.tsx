"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import Footer from "@/components/layout/footer"

export default function CheckoutSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to orders after 5 seconds
    const timer = setTimeout(() => {
      router.push("/orders")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>

            <p className="text-gray-600 mb-8">
              Thank you for your order. Your payment has been processed successfully.
            </p>

            <div className="space-y-3">
              <Link
                href="/orders"
                className="block w-full bg-teal-700 text-white py-3 rounded-lg font-semibold hover:bg-teal-800 transition"
              >
                View My Orders
              </Link>

              <Link
                href="/"
                className="block w-full bg-white text-teal-700 py-3 rounded-lg font-semibold border-2 border-teal-700 hover:bg-teal-50 transition"
              >
                Back to Home
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Redirecting to orders in 5 seconds...
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
