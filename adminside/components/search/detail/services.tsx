"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";

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
  selectedServices: Service[];
  onServiceToggle: (service: Service) => void;
}

export default function ServiceList({
  services = [],
  company,
  companyId,
  selectedServices = [],
  onServiceToggle
}: ServiceListProps) {
  const router = useRouter();
  const MAX_SERVICES = 3;
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const isSelected = (serviceTitle: string) => {
    return selectedServices.some(s => s.title === serviceTitle);
  };

  const canAddMore = () => {
    return selectedServices.length < MAX_SERVICES;
  };

  const handleToggleService = (service: Service) => {
    if (!isSelected(service.title) && !canAddMore()) {
      toast.error(`You can only add a maximum of ${MAX_SERVICES} services`);
      return;
    }
    onServiceToggle(service);
  };

  const toggleExpanded = (serviceTitle: string) => {
    setExpandedService(prev => prev === serviceTitle ? null : serviceTitle);
  };

  return (
    <div className="bg-white p-6 rounded-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Select your required service:</h1>
      <div className="space-y-4">
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

          const selected = isSelected(service.title);
          const isExpanded = expandedService === service.title;

          return (
            <div
              key={index}
              className={`rounded-xl border-2 hover:shadow-md transition ${
                selected ? 'border-teal-600 bg-teal-50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Header - Always Visible */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                      {service.dueIn && (
                        <span className="bg-teal-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                          {service.dueIn}
                        </span>
                      )}
                    </div>

                    {service.price !== undefined && service.price > 0 && (
                      <div className="mb-2">
                        <p className="text-2xl font-bold text-teal-700">£{service.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">inclusive VAT</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 items-start">
                    {selected ? (
                      <button
                        onClick={() => handleToggleService(service)}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleService(service)}
                        className="px-6 py-2 bg-teal-700 text-white rounded-lg font-medium hover:bg-teal-800 transition"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>

                {/* Toggle Details Button */}
                <button
                  onClick={() => toggleExpanded(service.title)}
                  className="mt-3 flex items-center gap-2 text-teal-700 hover:text-teal-800 font-medium text-sm transition"
                >
                  {isExpanded ? (
                    <>
                      <span>Hide Details</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Show Details</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-200 space-y-4">
                  {service.description && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {service.description}
                    </p>
                  )}

                  {service.bulletPoints && service.bulletPoints.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Includes:</p>
                      <ul className="space-y-2">
                        {service.bulletPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
