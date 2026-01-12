"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, ArrowLeft, Briefcase, Rocket, Download } from "lucide-react";
import { toast } from "react-toastify";
import { generateSingleServicePDF } from "@/lib/single-pdf-generator";

export default function AccountingPlansPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPlan, setDownloadingPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/companies/${companyId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch company details");
        }

        if (data.company) {
          setCompany(data.company);
        }
      } catch (err: any) {
        console.error("Error fetching company details:", err);
        toast.error(err.message || "Failed to load company details");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  const handleDownloadPDF = async (plan: any) => {
    if (!company) {
      toast.error("Company data not available");
      return;
    }

    setDownloadingPlan(plan.name);
    try {
      await generateSingleServicePDF(company, {
        title: plan.name,
        description: plan.description,
        price: plan.priceValue,
      });
      toast.success(`PDF downloaded for ${plan.name}`);
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to generate PDF");
    } finally {
      setDownloadingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Company not found</p>
          <button
            onClick={() => router.push("/search")}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const plans = [
    {
      icon: Briefcase,
      name: "New Project Basic",
      price: "£79.99",
      priceValue: 79.99,
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
        "Email & Phone Support",
      ],
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
        "Email & Phone Support",
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col  overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <button
          onClick={() => router.push(`/search/${companyId}`)}
          className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 mb-4 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Company Details
        </button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" >
            Accounting Packages
          </h1>
          <p className="text-sm text-gray-600">
            Choose the perfect accounting package for {company.company_name}. All prices include VAT.
          </p>
        </div>
      </div>

      {/* Plans Grid - Scrollable */}
      <div className="flex-1 ">
        <div className="grid md:grid-cols-2 gap-6 pb-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isDownloading = downloadingPlan === plan.name;

            return (
              <div
                key={index}
                className={`relative bg-white rounded-2xl border-2 ${
                  plan.popular ? "border-teal-600 shadow-lg" : "border-gray-200"
                } p-6 transition-all`}
                style={plan.popular ? { transform: "scale(1.02)" } : {}}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${
                      plan.popular ? "bg-teal-100" : "bg-gray-100"
                    } mb-3`}
                  >
                    <Icon
                      className={`w-7 h-7 ${
                        plan.popular ? "text-teal-700" : "text-gray-700"
                      }`}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 text-sm">+ VAT</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-6">
                  <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wide mb-3">
                    Includes:
                  </h3>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 mb-2">
                        <Check
                          className={`w-4 h-4 ${
                            plan.popular ? "text-teal-600" : "text-gray-600"
                          } flex-shrink-0 mt-0.5`}
                        />
                        <span
                          className={`text-sm ${
                            feature.includes("Everything in Basic")
                              ? "font-semibold text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadPDF(plan)}
                    disabled={isDownloading}
                    className="flex-1 py-2.5 px-4 text-white rounded-lg font-medium transition bg-primary hover:bg-gray-100 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Download PDF</span>
                      </>
                    )}
                  </button>
                  
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
