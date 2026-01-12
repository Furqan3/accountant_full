import { Building, MapPin, Calendar, TriangleAlert, Info } from "lucide-react";

type DetailItem = {
  companyStatus?: string;
  companyType?: string;
  companyNumber?: string;
  incorporateddate?: Date;
  address: string;
  confirmationdate?: Date;
  accountduedate?: Date;
};

const ICON_MAP = {
  companyStatus: Info,
  companyType: Building,
  companyNumber: Building,
  incorporateddate: Building,
  address: MapPin,
  confirmationdate: Calendar,
  accountduedate: TriangleAlert,
};

const LABEL_MAP: Record<keyof DetailItem, string> = {
  companyStatus: "Company Status",
  companyType: "Company Type",
  companyNumber: "Company Number",
  incorporateddate: "Incorporated Date",
  address: "Registered Address",
  confirmationdate: "Confirmation Statement Due",
  accountduedate: "Accounts Due Date",
};

// Helper function to format date as dd-MM-yyyy
function formatDate(date: Date | undefined): string {
  if (!date) return "Not set";
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Get status badge color
function getStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'active') return 'bg-green-100 text-green-800';
  if (['dissolved', 'liquidation', 'receivership', 'administration', 'insolvency', 'removed', 'closed'].includes(lowerStatus)) {
    return 'bg-red-100 text-red-800';
  }
  if (lowerStatus.includes('voluntary arrangement')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}

export default function DetailsCards({ data }: { data: DetailItem }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full place-items-center">
        {(Object.keys(data) as Array<keyof DetailItem>).map((key) => {
          const IconComponent = ICON_MAP[key];
          const value = data[key];

          if (!value) return null;

          let displayValue = "";
          let isStatus = false;

          if (value instanceof Date) {
            displayValue = formatDate(value);
          } else {
            displayValue = String(value);
            isStatus = key === 'companyStatus';
          }

          return (
            <div
              key={key}
              className="bg-white rounded-2xl p-5 text-primary flex items-center gap-4  w-full max-w-sm"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              {/* Text */}
              <div>
                <p className="text-sm font-medium text-gray-600">{LABEL_MAP[key]}</p>
                {isStatus ? (
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(displayValue)}`}>
                    {displayValue}
                  </span>
                ) : (
                  <p className="text-sm font-bold text-gray-900 overflow-wrap break-words">{displayValue}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}