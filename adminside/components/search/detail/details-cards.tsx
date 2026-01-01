import { Building, MapPin, Calendar, TriangleAlert } from "lucide-react";

type DetailItem = {
  incorporateddate: Date;
  address: string;
  confirmationdate: Date;
  accountduedate: Date;
};

const ICON_MAP = {
  incorporateddate: Building,
  address: MapPin,
  confirmationdate: Calendar,
  accountduedate: TriangleAlert,
};

const LABEL_MAP: Record<keyof DetailItem, string> = {
  incorporateddate: "Incorporated Date",
  address: "Address",
  confirmationdate: "Confirmation Date",
  accountduedate: "Account Due Date",
};

// Helper function to format date as dd-MM-yyyy
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function DetailsCards({ data }: { data: DetailItem }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full place-items-center">
        {(Object.keys(data) as Array<keyof DetailItem>).map((key) => {
          const IconComponent = ICON_MAP[key];
          const value = data[key];

          let displayValue = "";
          if (value instanceof Date) {
            displayValue = formatDate(value);
          } else {
            displayValue = String(value);
          }

          return (
            <div
              key={key}
              className="bg-white rounded-2xl p-5 text-primary flex items-center gap-4 shadow-sm w-full max-w-sm"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              {/* Text */}
              <div>
                <p className="text-l font-medium">{LABEL_MAP[key]}</p>
                <p className="text-l font-bold overflow-wrap">{displayValue}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}