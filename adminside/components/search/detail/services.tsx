"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CirclePlus, Check, Download } from "lucide-react";
import { toast } from "react-toastify";
import { generateSingleServicePDF } from "@/lib/single-pdf-generator";

type Service = {
  title: string;
  subtitle?: string;
  description?: string;
  dueIn?: string;
  bulletPoints?: string[];
  price?: number;
  isViewPlans?: boolean;
};

interface ServiceListProps {
  services: Service[];
  company: any;
  companyId?: string;
}

export default function ServiceList({ services = [], company, companyId }: ServiceListProps) {
  const router = useRouter();
  const [downloadingService, setDownloadingService] = useState<string | null>(null);

  const handleDownloadPDF = async (service: Service) => {
    if (!company || !service.price || service.price === 0) {
      toast.error("Cannot generate PDF for this service");
      return;
    }

    setDownloadingService(service.title);
    try {
      await generateSingleServicePDF(company, {
        title: service.title,
        description: service.description,
        price: service.price,
      });
      toast.success(`PDF downloaded for ${service.title}`);
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to generate PDF");
    } finally {
      setDownloadingService(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white p-6 rounded-2xl overflow-hidden">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Select your required service:</h1>
      </div>
      <div className="space-y-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-6">
        {services.map((service, index) => {
          // Special handling for View Plans card
          if (service.isViewPlans) {
            return (
              <div
                key={index}
                onClick={() => companyId && router.push(`/search/${companyId}/plans`)}
                className="bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-600 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer"
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
                  <button className="inline-flex items-center gap-2 bg-teal-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-800 transition">
                    View Plans →
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={index}
              className="rounded-xl border-2 border-gray-200 p-6 hover:shadow-md transition bg-white"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                    {service.dueIn && (
                      <span className="bg-teal-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                        {service.dueIn}
                      </span>
                    )}
                  </div>

                  {service.description && (
                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                  )}

                  {service.bulletPoints && service.bulletPoints.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {service.bulletPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                {service.price !== undefined && service.price > 0 && (
                  <div>
                    <p className="text-2xl font-bold text-teal-700">£{service.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">inclusive VAT</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadPDF(service)}
                    disabled={downloadingService === service.title}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingService === service.title ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        PDF
                      </>
                    )}
                  </button>
                  <button className="inline-flex items-center gap-2 px-6 py-2 bg-teal-700 text-white rounded-lg font-medium hover:bg-teal-800 transition">
                    <CirclePlus className="w-5 h-5" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
