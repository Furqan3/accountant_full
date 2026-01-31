"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Check, ArrowLeft, Briefcase, Rocket } from "lucide-react"
import { useCart } from "@/context/cart-context"

export default function CompanyPlansPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string
  const { addToCart } = useCart()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/companies/${companyId}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || `HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        setCompany(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Fetch error:", err.message)
        setCompany(null)
        setLoading(false)
      })
  }, [companyId])

  const handleSelectPlan = (plan: any) => {
    if (!company) return

    const planId = `${company.company_number}-${plan.name}`
    addToCart({
      id: planId,
      title: plan.name,
      description: plan.description,
      price: plan.priceValue,
      companyName: company.company_name,
      companyNumber: company.company_number,
    })

    router.push("/checkout")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading plans...</p>
      </div>
    )
  }

  const plans = [
    {
      icon: Briefcase,
      name: "New Project Basic",
      price: "£69.99",
      priceValue: 69.99,
      period: "/ month",
      description: "Perfect for start-ups & small businesses",
      color: "teal",
      features: [
        "Annual Statutory Accounts",
        "Corporation Tax Return (CT600)",
        "Companies House Filing",
        "Companies House Confirmation Statement",
        "HMRC Registrations",
        "Pension Submissions & Regulator Declaration",
        "Payroll (5 or less employees)",
        "Monthly CIS Returns",
        "Directors' Self-Assessment Returns",
        "Tax Advice on Salary & Dividends",
        "Email & Phone Support"
      ]
    },
    {
      icon: Rocket,
      name: "New Project Advance",
      price: "£149.99",
      priceValue: 149.99,
      period: "/ month",
      description: "For growing businesses (Software Included)",
      color: "blue",
      popular: true,
      features: [
        "Everything in Basic, plus:",
        "Quarterly VAT Returns",
        "Monthly Management Accounts (Light)",
        "Payroll (up to 7 employees)",
        "QuickBooks or Xero Licence Included",
        "Dext Capture for Invoices/Receipts",
        "Annual Statutory Accounts",
        "Corporation Tax Return (CT600)",
        "Companies House Filing",
        "Companies House Confirmation Statement",
        "HMRC Registrations",
        "Pension Submissions & Regulator Declaration",
        "Payroll",
        "Monthly CIS Returns",
        "Directors' Self-Assessment Returns",
        "Tax Advice on Salary & Dividends",
        "Email & Phone Support"
      ]
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="px-4 pt-4">
        <Header />
      </div>

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Back Button */}
          <Link
            href={`/company/${companyId}`}
            className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Company Details
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Accounting Packages
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the perfect accounting package for your business needs. All prices include VAT.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            {plans.map((plan, index) => {
              const Icon = plan.icon
              return (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl  border-2 ${
                    plan.popular ? "border-teal-600 scale-105" : "border-gray-200"
                  } p-8 hover: transition-all`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                      plan.popular ? "bg-teal-100" : "bg-gray-100"
                    } mb-4`}>
                      <Icon className={`w-8 h-8 ${
                        plan.popular ? "text-teal-700" : "text-gray-700"
                      }`} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h2>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600">+ VAT</span>
                      <span className="text-gray-500">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-4">
                      Includes:
                    </h3>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 ${
                          plan.popular ? "text-teal-600" : "text-gray-600"
                        } flex-shrink-0 mt-0.5`} />
                        <span className={`text-sm ${
                          feature.includes("Everything in Basic")
                            ? "font-semibold text-gray-900"
                            : "text-gray-700"
                        }`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
                      plan.popular
                        ? "bg-teal-700 text-white hover:bg-teal-800"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    Select {plan.name.split(" ")[2]} & Checkout
                  </button>
                </div>
              )
            })}
          </div>

          {/* Additional Info */}
          {/* <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">Need help choosing?</h3>
            <p className="text-gray-700 mb-4">
              Our team is here to help you select the right package for your business needs.
              Contact us for a free consultation.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="tel:020-1234-5678"
                className="text-teal-700 hover:text-teal-800 font-medium"
              >
                📞 020 1234 5678
              </a>
              <a
                href="mailto:info@accountant.com"
                className="text-teal-700 hover:text-teal-800 font-medium"
              >
                ✉️ info@accountant.com
              </a>
            </div>
          </div> */}
        </div>
      </main>

      <Footer />
    </div>
  )
}
