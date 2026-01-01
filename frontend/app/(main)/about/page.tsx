"use client"

import Footer from "@/components/layout/footer"
import PageHero from "@/components/shared/page-hero"
import { Users, Target, Award, Heart, Shield, TrendingUp } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Trust & Integrity",
      description: "We maintain the highest standards of professional ethics and confidentiality in all our dealings."
    },
    {
      icon: Target,
      title: "Client-Focused",
      description: "Your success is our priority. We tailor our services to meet your unique business needs."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to delivering exceptional quality in every aspect of our accounting services."
    },
    {
      icon: Heart,
      title: "Dedication",
      description: "We're passionate about helping businesses thrive through expert financial management."
    }
  ]

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      description: "20+ years experience in corporate accounting and business advisory.",
    },
    {
      name: "Michael Chen",
      role: "Head of Tax Services",
      description: "Specialist in tax planning and compliance with 15 years of expertise.",
    },
    {
      name: "Emily Roberts",
      role: "Senior Accountant",
      description: "Expert in financial reporting and company formation services.",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHero title="About Us" />

      <main className="flex-1">
        {/* Mission Section */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Your Trusted Accounting Partner
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                For over two decades, we've been helping businesses navigate the complexities
                of financial management and regulatory compliance. Our mission is to provide
                comprehensive accounting solutions that empower businesses to focus on what
                they do best.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                From company formation to annual returns, tax filing to financial reporting,
                we offer a full suite of services designed to meet the needs of businesses at
                every stage of their journey.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We combine traditional accounting expertise with modern technology to deliver
                efficient, accurate, and reliable services that you can count on.
              </p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8 border border-teal-100">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-teal-700 text-white p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">20+ Years</h3>
                    <p className="text-sm text-gray-600">Industry Experience</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-teal-700 text-white p-3 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">1000+</h3>
                    <p className="text-sm text-gray-600">Happy Clients</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-teal-700 text-white p-3 rounded-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Certified</h3>
                    <p className="text-sm text-gray-600">Chartered Accountants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do and define who we are as a company.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-teal-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our experienced professionals are dedicated to providing you with the highest
              level of service and expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-900 rounded-full mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-teal-600 font-medium text-sm mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-teal-700 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Work Together?
            </h2>
            <p className="text-teal-50 mb-8 text-lg">
              Let us handle your accounting needs so you can focus on growing your business.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/company-search"
                className="bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Get Started
              </a>
              <a
                href="/services"
                className="bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-800 transition border-2 border-white"
              >
                View Services
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
