"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SearchDetailHeader from "@/components/search/detail/detail-header";
import DetailsCards from "@/components/search/detail/details-cards";
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
  const services = [
  {
    title: "Express Service",
    subtitle: "£24 Skip the line",
    description:
      "Get your Confirmation Statement submitted to, and reviewed by, Companies House today.",
  },
  {
    title: "Confirmation Statement",
    subtitle: "Due in 7 months",
    description:
      "We will request all information from you required in order to file your preparation statement",
  },
  {
    title: "Express Service",
    subtitle: "£24 Skip the line",
    description:
      "Get your Confirmation Statement submitted to, and reviewed by, Companies House today.",
  },
  {
    title: "Confirmation Statement",
    subtitle: "Due in 7 months",
    description:
      "We will request all information from you required in order to file your preparation statement",
  },
  {
    title: "Express Service",
    subtitle: "£24 Skip the line",
    description:
      "Get your Confirmation Statement submitted to, and reviewed by, Companies House today.",
  },
  {
    title: "Confirmation Statement",
    subtitle: "Due in 7 months",
    description:
      "We will request all information from you required in order to file your preparation statement",
  },
  {
    title: "Express Service",
    subtitle: "£24 Skip the line",
    description:
      "Get your Confirmation Statement submitted to, and reviewed by, Companies House today.",
  },
  {
    title: "Confirmation Statement",
    subtitle: "Due in 7 months",
    description:
      "We will request all information from you required in order to file your preparation statement",
  },
  {
    title: "Express Service",
    subtitle: "£24 Skip the line",
    description:
      "Get your Confirmation Statement submitted to, and reviewed by, Companies House today.",
  },
  {
    title: "Confirmation Statement",
    subtitle: "Due in 7 months",
    description:
      "We will request all information from you required in order to file your preparation statement",
  },
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
        <DetailsCards
          data={{
            incorporateddate: companyData.date_of_creation ? new Date(companyData.date_of_creation) : undefined,
            address: formatAddress(companyData.registered_office_address),
            confirmationdate: companyData.confirmation_statement_due ? new Date(companyData.confirmation_statement_due) : undefined,
            accountduedate: companyData.accounts_due ? new Date(companyData.accounts_due) : undefined,
          }}
        />
      </div>

      <div className="flex-1 min-h-0">
        <Services services={services} />
      </div>
    </div>
  );
}
