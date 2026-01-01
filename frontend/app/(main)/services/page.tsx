"use client"

import Footer from "@/components/layout/footer"
import PageHero from "@/components/shared/page-hero"
import {
  FileText,
  Building2,
  Calculator,
  ClipboardCheck,
  TrendingUp,
  Users,
  Shield,
  Briefcase,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  const services = [
    {
      icon: Building2,
      title: "Company Formation",
      description: "Complete company registration services including business structure advice, documentation, and Companies House filing.",
      price: "From £99",
      features: [
        "Business name registration",
        "Articles of Association",
        "Companies House filing",
        "Registered office address",
        "Certificate of Incorporation"
      ]
    },
    {
      icon: FileText,
      title: "Annual Returns & Confirmation Statements",
      description: "Stay compliant with timely filing of annual returns and confirmation statements to Companies House.",
      price: "From £49",
      features: [
        "Annual return preparation",
        "Confirmation statement filing",
        "Deadline reminders",
        "Online submission",
        "Compliance support"
      ]
    },
    {
      icon: Calculator,
      title: "Tax Filing & Planning",
      description: "Expert tax preparation and strategic planning to minimize liabilities and ensure compliance.",
      price: "From £149",
      features: [
        "Corporation tax returns",
        "VAT returns",
        "PAYE submissions",
        "Tax planning advice",
        "HMRC correspondence"
      ]
    },
    {
      icon: ClipboardCheck,
      title: "Bookkeeping Services",
      description: "Professional bookkeeping to keep your financial records accurate and up-to-date.",
      price: "From £99/month",
      features: [
        "Daily transaction recording",
        "Bank reconciliation",
        "Expense tracking",
        "Financial reporting",
        "Cloud-based access"
      ]
    },
    {
      icon: TrendingUp,
      title: "Financial Reporting",
      description: "Comprehensive financial statements and reports to help you make informed business decisions.",
      price: "From £199",
      features: [
        "Profit & Loss statements",
        "Balance sheets",
        "Cash flow analysis",
        "Management reports",
        "Quarterly reviews"
      ]
    },
    {
      icon: Briefcase,
      title: "Payroll Management",
      description: "Complete payroll services ensuring accurate and timely payment to your employees.",
      price: "From £79/month",
      features: [
        "Salary calculations",
        "Payslip generation",
        "RTI submissions",
        "Pension administration",
        "Year-end processing"
      ]
    },
    {
      icon: Shield,
      title: "Audit & Assurance",
      description: "Independent audit services providing credibility to your financial statements.",
      price: "Custom Quote",
      features: [
        "Statutory audits",
        "Internal audits",
        "Risk assessment",
        "Compliance reviews",
        "Audit reports"
      ]
    },
    {
      icon: Users,
      title: "Business Advisory",
      description: "Strategic advice to help grow your business and improve financial performance.",
      price: "From £149/hour",
      features: [
        "Business planning",
        "Financial forecasting",
        "Growth strategies",
        "Performance analysis",
        "Exit planning"
      ]
    }
  ]

  const whyChooseUs = [
    "Qualified chartered accountants with years of experience",
    "Personalized service tailored to your business needs",
    "Competitive pricing with no hidden fees",
    "Quick turnaround times and reliable delivery",
    "Secure online platform for document sharing",
    "Dedicated account manager for ongoing support"
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHero title="Our Services" />

      <main className="flex-1">
        {/* Introduction */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Accounting Solutions
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We offer a full range of accounting and business services designed to meet
              the needs of businesses at every stage. From startups to established enterprises,
              we're here to support your financial success.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-teal-100 p-3 rounded-lg flex-shrink-0">
                      <Icon className="w-6 h-6 text-teal-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-teal-600 font-semibold text-lg mb-3">
                        {service.price}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Why Choose Our Services?
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We're more than just accountants – we're your financial partners committed
                  to your success. Here's what sets us apart:
                </p>
                <div className="space-y-3">
                  {whyChooseUs.map((reason, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-teal-100 p-1 rounded-full mt-1">
                        <CheckCircle className="w-4 h-4 text-teal-700" />
                      </div>
                      <p className="text-gray-700">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8 border border-teal-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-600 mb-6">
                  Search for your company and select the services you need. We'll take care
                  of the rest.
                </p>
                <Link
                  href="/company-search"
                  className="inline-block bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-800 transition"
                >
                  Search Companies
                </Link>

                <div className="mt-8 pt-8 border-t border-teal-200">
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Need help choosing?</strong><br />
                    Contact our team for a free consultation.
                  </p>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">info@accountant.com</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">020 1234 5678</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting started with our services is simple and straightforward
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Search Company", description: "Find your company using our search tool" },
              { step: "2", title: "Select Services", description: "Choose the services you need" },
              { step: "3", title: "Secure Payment", description: "Complete payment securely online" },
              { step: "4", title: "We Deliver", description: "Sit back while we handle everything" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-teal-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-teal-700 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Let's Transform Your Business Together
            </h2>
            <p className="text-teal-50 mb-8 text-lg">
              Join hundreds of satisfied clients who trust us with their accounting needs.
            </p>
            <Link
              href="/company-search"
              className="inline-block bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Get Started Today
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
