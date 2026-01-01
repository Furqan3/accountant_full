"use client"

import { useEffect, useState } from "react"
import * as React from "react"
import Header from "@/components/layout/header"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import Footer from "@/components/layout/footer"
import CompanyInfoCards from "@/components/company/company-info-cards"
import ServiceCard from "@/components/company/service-card"
import OrderSummary from "@/components/checkout/order-summary"
import { useCart } from "@/context/cart-context"


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
      description: "Ensure your confirmation statement is filed on time with Companies House.",
      dueIn: company.confirmation_statement?.last_made_up_to
        ? `Due by ${company.confirmation_statement.last_made_up_to}`
        : undefined,
      bulletPoints: [
        "Full preparation & submission",
        "Compliance check included",
        "Confirmation email on acceptance",
      ],
      price: 69.99, // Typical range £65–£100 inc. CH £34 fee
    },
    {
      title: "File Annual Accounts",
      description: "Prepare and file your annual accounts (including dormant if applicable).",
      dueIn: company.accounts?.last_accounts?.made_up_to
        ? `Due by ${company.accounts.last_accounts.made_up_to}`
        : undefined,
      bulletPoints: [
        "Micro-entity / full accounts support",
        "Review by qualified team",
        "Companies House & HMRC filing",
      ],
      price: 149.99,
    },
    {
      title: "Change Your Directors",
      description: "Update or appoint new directors and register changes with Companies House.",
      bulletPoints: [
        "TM01/TM02 forms preparation",
        "ID verification assistance",
        "Fast processing",
      ],
      price: 49.99,
    },
    {
      title: "Change Company Name",
      description: "Legally update your company name and file NM01 with Companies House.",
      bulletPoints: [
        "Name availability check",
        "Resolution & filing support",
        "CH fee (£20–£30) extra if required",
      ],
      price: 59.99,
    },
    {
      title: "Change Registered Address",
      description: "Update your official registered office address securely.",
      bulletPoints: [
        "AD01 form preparation",
        "Proof of address assistance",
        "Instant compliance update",
      ],
      price: 49.99,
    },
    {
      title: "Company Dissolution",
      description: "Manage the full process of closing your company compliantly.",
      bulletPoints: [
        "DS01 preparation & submission",
        "HMRC clearance assistance",
        "Guidance throughout",
      ],
      price: 149.99, // Higher due to complexity
    },
    {
      title: "Register Company for VAT",
      description: "Complete VAT registration efficiently and receive your VAT number.",
      bulletPoints: [
        "Full application to HMRC",
        "VAT scheme advice",
        "Quick turnaround",
      ],
      price: 59.99,
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
      title: "File Dormant Accounts",
      description: "Prepare and submit dormant company accounts quickly.",
      bulletPoints: [
        "AA02 form for dormant status",
        "No trading declaration",
        "Annual compliance made easy",
      ],
      price: 79.99,
    },
    {
      title: "UTR Registration Assistance",
      description: "Help obtain your personal Unique Taxpayer Reference from HMRC.",
      bulletPoints: [
        "Guidance & form submission",
        "Follow-up with HMRC",
        "Ideal for new directors",
      ],
      price: 39.99,
    },
    {
      title: "ID Verification",
      description: "Identity verification for company officers/shareholders as required.",
      bulletPoints: [
        "Secure third-party process",
        "Companies House compliant",
        "Fast digital verification",
      ],
      price: 24.99, // Often per person
    },
    {
      title: "Chartered Accountant-led Full Compliance Package",
      description: "Fixed-fee packages including VAT, Payroll, Bookkeeping, Corporation Tax & Self-Assessment.",
      bulletPoints: [
        "Led by qualified chartered accountant",
        "Full HMRC compliance",
        "Save time & reduce penalties",
      ],
      price: 599.99,
      priceNote: "From £599.99/year",
    },
    {
      title: "Accounting services",
      description: "	Accounting services provide essential financial support, offering expertise in managing records, ensuring tax compliance, optimising financial performance, and saving time for individuals and businesses.",
      bulletPoints: [
        
      ],
      price: 0,
      isViewPlans: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-screen">
      <Header />

      <main className="flex-1 w-full">
        {/* Full-width container */}
        <div className="w-full px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8">
            {company.company_name}
          </h1>

          <CompanyInfoCards
            info={{
              incorporationDate: company.date_of_creation,
              registeredAddress: [
                company.registered_office_address?.address_line_1,
                company.registered_office_address?.address_line_2,
                company.registered_office_address?.locality,
                company.registered_office_address?.postal_code,
                company.registered_office_address?.country,
              ]
                .filter(Boolean)
                .join(", "),
              confirmationStatementDue: company.confirmation_statement?.last_made_up_to,
              accountsDue: company.accounts?.last_accounts?.made_up_to,
            }}
          />

          <section className="max-w-full mx-auto px-40 ">
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-6">
              {/* Left 3 columns: Services */}
              <div className="lg:col-span-5 space-y-6">
                {services.map((service, idx) => {
                  const serviceId = `${company.company_number}-${service.title}`
                  const isSelected = items.some(item => item.id === serviceId)

                  // Special handling for View Plans card
                  if (service.isViewPlans) {
                    return (
                      <Link
                        key={idx}
                        href={`/company/${id}/plans`}
                        className="block bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-600 rounded-xl p-6 hover:shadow-xl transition-all hover:scale-[1.02]"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                            </div>
                            <p className="text-gray-700 mb-4">{service.description}</p>
                            <ul className="space-y-2">
                              {service.bulletPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-teal-600 mt-1">✓</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-teal-200">
                          <span className="text-teal-700 font-semibold">Click to view detailed packages</span>
                          <span className="inline-flex items-center gap-2 bg-teal-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-800 transition">
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
              <div className="lg:col-span-2 flex flex-col">
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
