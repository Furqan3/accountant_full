import { Building2, MapPin, Calendar, FileText, Hash, Clock, Briefcase } from "lucide-react";

type DetailItem = {
  companyStatus?: string;
  companyType?: string;
  companyNumber?: string;
  incorporatedDate?: string;
  address?: string;
  confirmationDate?: string;
  accountDueDate?: string;
  sicCode?: string;
};

// Helper function to format date as dd MMM yyyy
function formatDisplayDate(dateStr: string | undefined): string {
  if (!dateStr) return "Not set";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// Get status badge color
function getStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'active') return 'bg-green-100 text-green-700 border-green-300';
  if (['dissolved', 'liquidation', 'receivership', 'administration', 'insolvency', 'removed', 'closed'].includes(lowerStatus)) {
    return 'bg-red-100 text-red-700 border-red-300';
  }
  if (lowerStatus.includes('voluntary')) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  return 'bg-gray-100 text-gray-700 border-gray-300';
}

// Get time remaining
function getTimeRemaining(dateStr: string | undefined): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      if (absDays < 30) return `${absDays} days overdue`;
      if (absDays < 365) return `${Math.floor(absDays / 30)} months overdue`;
      return `${Math.floor(absDays / 365)} years overdue`;
    }

    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays < 30) return `in ${diffDays} days`;
    if (diffDays < 365) return `in ${Math.floor(diffDays / 30)} months`;
    return `in ${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
  } catch {
    return "";
  }
}

export default function DetailsCards({ data }: { data: DetailItem }) {
  return (
    <div className="w-full">
      {/* 2 Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Confirmation Statement Due */}
        {data.confirmationDate && (
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Confirmation Statement Due</p>
              <p className="text-2xl font-bold text-gray-900">{formatDisplayDate(data.confirmationDate)}</p>
              <p className="text-blue-700 font-semibold text-base mt-1">
                {getTimeRemaining(data.confirmationDate)}
              </p>
            </div>
          </div>
        )}

        {/* Accounts Due Date */}
        {data.accountDueDate && (
          <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-7 h-7 text-purple-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Accounts Due Date</p>
              <p className="text-2xl font-bold text-gray-900">{formatDisplayDate(data.accountDueDate)}</p>
              <p className="text-purple-700 font-semibold text-base mt-1">
                {getTimeRemaining(data.accountDueDate)}
              </p>
            </div>
          </div>
        )}

        {/* Company Status */}
        {data.companyStatus && (
          <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-green-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-2">Company Status</p>
              <span className={`inline-block px-4 py-2 rounded-lg text-xl font-bold border ${getStatusColor(data.companyStatus)}`}>
                {data.companyStatus}
              </span>
            </div>
          </div>
        )}

        {/* Company Type */}
        {data.companyType && (
          <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-indigo-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Company Type</p>
              <p className="text-xl font-bold text-gray-900">{data.companyType}</p>
            </div>
          </div>
        )}

        {/* Company Number */}
        {data.companyNumber && (
          <div className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
              <Hash className="w-7 h-7 text-cyan-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Company Number</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">{data.companyNumber}</p>
            </div>
          </div>
        )}

        {/* Incorporated Date */}
        {data.incorporatedDate && (
          <div className="bg-gradient-to-br from-pink-50 to-white border border-pink-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-7 h-7 text-pink-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Incorporated Date</p>
              <p className="text-2xl font-bold text-gray-900">{formatDisplayDate(data.incorporatedDate)}</p>
            </div>
          </div>
        )}

        {/* SIC Code / Activity */}
        {data.sicCode && (
          <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-7 h-7 text-amber-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Activity</p>
              <p className="text-xl font-bold text-gray-900">{data.sicCode}</p>
            </div>
          </div>
        )}

        {/* Registered Address */}
        {data.address && (
          <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-7 h-7 text-rose-700" />
            </div>
            <div>
              <p className="text-gray-600 text-base font-medium mb-1">Registered Address</p>
              <p className="text-lg font-bold text-gray-900">{data.address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
