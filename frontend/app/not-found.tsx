import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Home, Search, FileText, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-6">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <h1 className="text-9xl md:text-[12rem] font-bold text-gray-200 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-teal-100 rounded-full p-8">
                <FileText className="w-16 h-16 text-teal-700" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. The page may have been moved or doesn't exist.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
            <Link
              href="/company-search"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg border border-gray-300 transition"
            >
              <Search className="w-5 h-5" />
              Search Companies
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-500 mb-4">You might be looking for:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/"
                className="text-sm text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/company-search" className="text-sm text-teal-700 hover:text-teal-800">
                Company Search
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/orders" className="text-sm text-teal-700 hover:text-teal-800">
                My Orders
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/messages" className="text-sm text-teal-700 hover:text-teal-800">
                Messages
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
