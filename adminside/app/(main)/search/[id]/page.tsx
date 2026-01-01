"use client";

import { useParams, useRouter } from "next/navigation";
import SearchDetailHeader from "@/components/search/detail/detail-header";
import DetailsCards from "@/components/search/detail/details-cards";
import Services from "@/components/search/detail/services";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  // Mock company data - replace with actual data fetch
  const companyData = {
    id: companyId,
    company: "Tech Solutions Ltd.",
    registrationNumber: companyId,
    incorporationDate: new Date("2020-01-15"),
    confimationdate: new Date("2024-05-15"),
    accountduedate: new Date("2024-06-15"),
    status: "Active",
    address: "123 Business Street, London, UK",
    director: "John Smith",
    sicCode: "62011 - Ready-made interactive leisure and entertainment software development",
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


  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex-shrink-0">
        <SearchDetailHeader title={companyData.company} />
      </div>

      <div className="flex-shrink-0">
        <DetailsCards
          data={{
            incorporateddate: companyData.incorporationDate,
            address: companyData.address,
            confirmationdate: companyData.confimationdate,
            accountduedate: companyData.accountduedate,
          }}
        />
      </div>

      <div className="flex-1 min-h-0">
        <Services services={services} />
      </div>
    </div>
  );
}
