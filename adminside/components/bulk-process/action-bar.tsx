"use client";

import { Download, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionBarProps {
  onDownload: () => void;
  onSendEmail: () => void;
  isDownloading: boolean;
  isSendingEmail: boolean;
  servicesSelected: boolean;
}

export default function ActionBar({
  onDownload,
  onSendEmail,
  isDownloading,
  isSendingEmail,
  servicesSelected,
}: ActionBarProps) {
  const router = useRouter();

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="p-4 flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          disabled={isDownloading || isSendingEmail}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onDownload}
            disabled={!servicesSelected || isDownloading}
            className="flex items-center gap-2 bg-primary text-white font-medium px-6 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDFs...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDFs
              </>
            )}
          </button>

          <div className="relative group">
            <button
              onClick={onSendEmail}
              disabled={true}
              className="flex items-center gap-2 bg-gray-400 text-white font-medium px-6 py-3 rounded-lg cursor-not-allowed"
              title="Coming soon"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </button>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                Coming soon
              </div>
            </div>
          </div>
        </div>
      </div>

      {!servicesSelected && (
        <div className="px-4 pb-3">
          <p className="text-sm text-amber-600">
            Please select at least 1 service to download PDFs
          </p>
        </div>
      )}
    </div>
  );
}
