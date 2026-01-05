"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBulkSelection } from "@/contexts/bulk-selection-context";
import SelectedCompaniesList from "@/components/bulk-process/selected-companies-list";
import ServiceSelector, { Service } from "@/components/bulk-process/service-selector";
import ActionBar from "@/components/bulk-process/action-bar";
import { toast } from "react-toastify";

export default function BulkProcessPage() {
  const router = useRouter();
  const { selectedCompanies, clearSelection } = useBulkSelection();
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Redirect if no companies selected
  useEffect(() => {
    if (selectedCompanies.length === 0) {
      toast.warning("Please select at least one company");
      router.push("/search");
    }
  }, [selectedCompanies, router]);

  const handleServiceSelectionChange = (services: Service[]) => {
    setSelectedServices(services);
  };

  const handleDownload = async () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    setIsDownloading(true);
    try {
      // Import the ZIP generator dynamically
      const { generateBulkPDFZip } = await import("@/lib/zip-generator");

      await generateBulkPDFZip(selectedCompanies, selectedServices);

      toast.success("PDFs downloaded successfully!");

      // Clear selection and redirect
      setTimeout(() => {
        clearSelection();
        router.push("/search");
      }, 1000);
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to generate PDFs");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = () => {
    // Placeholder for future email functionality
    toast.info("Email functionality coming soon!");
  };

  // Don't render until we verify there are companies
  if (selectedCompanies.length === 0) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bulk Service Processing
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Select services to generate PDFs with QR codes for {selectedCompanies.length} {selectedCompanies.length === 1 ? 'company' : 'companies'}
        </p>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-6 space-y-6">
        {/* Selected Companies */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <SelectedCompaniesList companies={selectedCompanies} />
        </div>

        {/* Service Selection */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <ServiceSelector onSelectionChange={handleServiceSelectionChange} />
        </div>
      </div>

      {/* Action Bar - Sticky Bottom */}
      <ActionBar
        onDownload={handleDownload}
        onSendEmail={handleSendEmail}
        isDownloading={isDownloading}
        isSendingEmail={false}
        servicesSelected={selectedServices.length > 0}
      />
    </div>
  );
}
