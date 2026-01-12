"use client"

import { useEffect, useState } from "react"
import * as React from "react"
import Header from "@/components/layout/header"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import Footer from "@/components/layout/footer"
import CompanyHeaderInfo from "@/components/company/company-header-info"
import CompanyInfoCards from "@/components/company/company-info-cards"
import ServiceCard from "@/components/company/service-card"
import OrderSummary from "@/components/checkout/order-summary"
import { useCart } from "@/context/cart-context"
import { getTimeRemaining } from "@/lib/date-utils"


export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [company, setCompany] = useState<any>(null)
  const { addToCart, items, removeFromCart, totalPrice } = useCart()
  const router = useRouter()
  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || `HTTP ${res.status}`)
        }
        return res.json()
      })
      .then(setCompany)
      .catch((err) => {
        console.error("Fetch error:", err.message)
        setCompany(null)
      })
  }, [id])
  console.log(company)

  const orderItems = items.map(item => ({
    id: item.id,
    name: item.title,
    quantity: item.quantity,
    price: item.price,
  }))

  const checkout = () => {
    router.push("/checkout")
  }

  if (!company) return <p className="text-center mt-20">Loading...</p>


  const services = [
    {
      title: "File Confirmation Statement",
      description: "We will request all information from you required in order to file your confirmation statement. What is a confirmation statement? It's an annual requirement to confirm your company details are up to date with Companies House.",
      dueIn: company.confirmation_statement?.next_due
        ? `Due ${getTimeRemaining(company.confirmation_statement.next_due)}`
        : undefined,
      bulletPoints: [
        "Preparation & Filing",
        "Companies House Fees Included",
        "Friendly Annual Reminder",
      ],
      price: 65.99,
    },
    {
      title: "Register Company for VAT",
      description: "Complete VAT registration efficiently and receive your VAT number.",
      bulletPoints: [
        "Full application to HMRC",
        "VAT scheme advice",
        "Quick turnaround",
      ],
      price: 54.99,
    },
    {
      title: "Register Company for PAYE",
      description: "Set up PAYE for payroll and employee compliance.",
      bulletPoints: [
        "HMRC PAYE registration",
        "Employer reference obtained",
        "Basic payroll setup advice",
      ],
      price: 39.99,
    },
    {
      title: "Change Company Name",
      description: "Legally update your company name and file NM01 with Companies House.",
      bulletPoints: [
        "Name availability check",
        "Resolution & filing support",
        "Companies House fee included",
      ],
      price: 59.99,
    },
    {
      title: "Change Registered Address",
      description: "A company's registered office address is where all its official letters are sent. If you have moved premises or no longer have access to your current registered office, you must let Companies House know.",
      bulletPoints: [
        "AD01 form preparation & filing",
        "Proof of address assistance",
        "Instant compliance update",
      ],
      price: 49.99,
    },
    {
      title: "Company Dissolution",
      description: "Why close a company? You can close your company if it: has not traded or sold off any stock in the last 3 months, has not changed names in the last 3 months, is not threatened with liquidation, and has no agreements with creditors.",
      bulletPoints: [
        "Complete DS01 form preparation & submission",
        "HMRC clearance assistance",
        "Full guidance throughout the process",
      ],
      price: 149.99,
    },
    {
      title: "File Dormant Accounts",
      description: "Company accounts for companies that have had no 'significant' transactions in the financial year. Significant transactions don't include filing fees, penalties for late filing, or money paid for shares when incorporated.",
      dueIn: company.accounts?.next_due
        ? `Due ${getTimeRemaining(company.accounts.next_due)}`
        : undefined,
      bulletPoints: [
        "All limited companies must deliver accounts to Companies House",
        "Your company is considered dormant by Companies House if it's had no 'significant' transactions",
        "A non trading company is one that although may be inactive for a portion of time may still experience transactions",
      ],
      price: 79.99,
    },
    {
      title: "UTR Registration",
      description: "Help obtain your Unique Taxpayer Reference from HMRC.",
      bulletPoints: [
        "Guidance & form submission",
        "Follow-up with HMRC",
        "Ideal for new directors",
      ],
      price: 39.99,
    },
    {
      title: "Change Your Directors",
      description: "Update or appoint new directors and register changes with Companies House.",
      bulletPoints: [
        "TM01/TM02 forms preparation",
        "ID verification assistance",
        "Fast processing",
      ],
      price: 39.99,
    },
    {
      title: "Accounting services",
      description: "Accounting services provide essential financial support, offering expertise in managing records, ensuring tax compliance, optimising financial performance, and saving time for individuals and businesses.",
     
      price: 0,
      isViewPlans: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-screen">
      <Header />

      <main className="flex-1 w-full">
        {/* Full-width container */}
        <div className="w-full px-4 py-8 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-6">
            {company.company_name}
          </h1>

          <CompanyInfoCards company={company} />

          <section className="max-w-full mx-auto md:px-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select your required service:</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left columns: Services */}
              <div className="lg:col-span-8 space-y-6">
                {services.map((service, idx) => {
                  const serviceId = `${company.company_number}-${service.title}`
                  const isSelected = items.some(item => item.id === serviceId)

                  // Special handling for View Plans card
                  if (service.isViewPlans) {
                    return (
                      <Link
                        key={idx}
                        href={`/company/${id}/plans`}
                        className="block m-5 bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-600 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02]"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                            </div>
                            <p className="text-sm text-gray-700 mb-4 leading-relaxed">{service.description}</p>
                            
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-teal-200">
                          <span className="text-teal-700 font-semibold">Click to view detailed packages</span>
                          <span className="inline-flex items-center gap-2 bg-teal-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-800 transition">
                            View Plans →
                          </span>
                        </div>
                      </Link>
                    )
                  }

                  return (
                    <ServiceCard
                      key={idx}
                      title={service.title}
                      description={service.description}
                      dueIn={service.dueIn}
                      price={service.price}
                      selected={isSelected}
                      onAdd={() =>
                        addToCart({
                          id: serviceId,
                          title: service.title,
                          description: service.description,
                          price: service.price,
                          companyName: company.company_name,
                          companyNumber: company.company_number,
                        })
                      }
                      onRemove={() => removeFromCart(serviceId)}
                    />
                  )
                })}
              </div>

              {/* Right column: Order Summary */}
              <div className="lg:col-span-4 flex flex-col">
                <OrderSummary
                  items={orderItems}
                  total={totalPrice}
                  onRemove={removeFromCart}
                
                  
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={checkout}
                    className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition"
                  >
                    Checkout
                  </button>
                </div>
              </div>

            </div>
          </section>






        </div>
      </main>

      <Footer />
    </div>
  )
}
