"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SearchDetailHeader from "@/components/search/detail/detail-header";
import CompanyInfoSection from "@/components/search/detail/company-info-section";
import Services from "@/components/search/detail/services";

type CompanyData = {
  id: string;
  company_number: string;
  company_name: string;
  company_status?: string;
  company_type?: string;
  date_of_creation?: string;
  confirmation_statement_due?: string;
  accounts_due?: string;
  registered_office_address?: any;
  sic_codes?: string[];
};

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/companies/${companyId}`);
        const data = await res.json();

        console.log('API Response:', { status: res.status, data });

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch company details');
        }

        if (data.company) {
          setCompanyData(data.company);
        } else {
          throw new Error('No company data received');
        }
      } catch (err: any) {
        console.error('Error fetching company details:', err);
        setError(err.message || 'Failed to load company details');
      } finally {
        setIsLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  // Format address from Companies House format
  const formatAddress = (address: any): string => {
    if (!address) return "Not available";

    const parts = [
      address.address_line_1,
      address.address_line_2,
      address.locality,
      address.region,
      address.postal_code,
      address.country,
    ].filter(Boolean);

    return parts.join(", ") || "Not available";
  };
  const getTimeRemaining = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const targetDate = new Date(dateString);
      const now = new Date();
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'Overdue';
      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return 'Due in 1 day';
      if (diffDays < 30) return `Due in ${diffDays} days`;

      const months = Math.floor(diffDays / 30);
      if (months === 1) return 'Due in 1 month';
      if (months < 12) return `Due in ${months} months`;

      const years = Math.floor(months / 12);
      return years === 1 ? 'Due in 1 year' : `Due in ${years} years`;
    } catch {
      return '';
    }
  };

  const services = [
    {
      title: "File Confirmation Statement",
      subtitle: "£65.99 inclusive VAT",
      description: "We will request all information from you required in order to file your confirmation statement. What is a confirmation statement? It's an annual requirement to confirm your company details are up to date with Companies House.",
      dueIn: companyData?.confirmation_statement_due
        ? `Due ${getTimeRemaining(companyData.confirmation_statement_due)}`
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
      subtitle: "£54.99 inclusive VAT",
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
      subtitle: "£39.99 inclusive VAT",
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
      subtitle: "£59.99 inclusive VAT",
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
      subtitle: "£49.99 inclusive VAT",
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
      subtitle: "£149.99 inclusive VAT",
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
      subtitle: "£79.99 inclusive VAT",
      description: "Company accounts for companies that have had no 'significant' transactions in the financial year. Significant transactions don't include filing fees, penalties for late filing, or money paid for shares when incorporated.",
      dueIn: companyData?.accounts_due
        ? `Due ${getTimeRemaining(companyData.accounts_due)}`
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
      subtitle: "£39.99 inclusive VAT",
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
      subtitle: "£39.99 inclusive VAT",
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
      subtitle: "View Plans",
      description: "Accounting services provide essential financial support, offering expertise in managing records, ensuring tax compliance, optimising financial performance, and saving time for individuals and businesses.",
      bulletPoints: [
        "Monthly packages available",
        "Basic & Advance plans",
        "Full accounting support"
      ],
      price: 0,
      isViewPlans: true,
    }
  ];


  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !companyData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || 'Company not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex-shrink-0">
        <SearchDetailHeader title={companyData.company_name} />
      </div>

      <div className="flex-shrink-0">
        <CompanyInfoSection company={companyData} />
      </div>

      <div className="flex-1 min-h-0">
        <Services services={services} company={companyData} companyId={companyId} />
      </div>
    </div>
  );
}
