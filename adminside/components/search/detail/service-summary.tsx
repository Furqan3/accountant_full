"use client";

import { Download, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

type Service = {
  title: string;
  price?: number;
  description?: string;
};

interface ServiceSummaryProps {
  services: Service[];
  company: any;
  onRemove: (serviceTitle: string) => void;
}

export default function ServiceSummary({ services, company, onRemove }: ServiceSummaryProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const totalPrice = services.reduce((sum, service) => sum + (service.price || 0), 0);

  const handleDownloadPDF = async () => {
    if (services.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    setIsDownloading(true);
    try {
      // Import the PDF generator dynamically
      const { generateMultiServicePDF } = await import("@/lib/multi-service-pdf-generator");

      await generateMultiServicePDF(company, services);

      toast.success("PDF downloaded successfully!");
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  if (services.length === 0) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Services</h3>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No services selected</p>
          <p className="text-gray-400 text-xs mt-2">Select up to 3 services to generate PDF</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Selected Services</h3>
        <span className={`text-sm font-medium ${services.length >= 3 ? 'text-red-600' : 'text-teal-700'}`}>
          {services.length}/3
        </span>
      </div>

      {services.length >= 3 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-amber-800">
            Maximum of 3 services selected. Remove a service to add another.
          </p>
        </div>
      )}

      <div className="space-y-3 mb-4 max-h-[400px] ">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{service.title}</p>
              <p className="text-sm text-teal-700 font-semibold mt-1">
                £{(service.price || 0).toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => onRemove(service.title)}
              className="text-red-500 hover:text-red-700 transition ml-2"
              title="Remove service"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-4">
        <span className="text-base font-semibold text-gray-900">Total</span>
        <span className="text-xl font-bold text-teal-700">£{totalPrice.toFixed(2)}</span>
      </div>

      <button
        onClick={handleDownloadPDF}
        disabled={isDownloading || services.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-teal-700 text-white font-medium px-6 py-3 rounded-lg hover:bg-teal-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Download PDF
          </>
        )}
      </button>
    </div>
  );
}
