import { CirclePlus } from "lucide-react";
type Service = {
  title: string;
  subtitle?: string;
  description?: string;
};

export default function ServiceList({ services = [] }: { services: Service[] }) {
  return (
    <div className="h-full flex flex-col  bg-white p-6 rounded-2xl  overflow-hidden">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Services</h1>
      </div>
      <div className="space-y-4 flex-1 min-h-0  overflow-y-auto custom-scrollbar pr-2 pb-6">
      {services.map((service, index) => (
        <div
          key={index}
          className="rounded-2xl border border-primary/20 p-4 flex items-center justify-between gap-4 hover:shadow-md transition"
        >
          <div className="space-y-1 ">
            <h3 className="font-semibold text-base text-primary">{service.title}</h3>

            {service.subtitle && (
              <p className="text-sm text-black">{service.subtitle}</p>
            )}

            {service.description && (
              <p className="text-xs sm text-black">
                {service.description}
              </p>
            )}
          </div>

          <button
  className="w-9 h-9 flex items-center justify-center rounded-full 
             text-primary hover:bg-primary hover:text-white transition "
>
  <CirclePlus className="w-5 h-5" />
</button>

        </div>
      ))}
      </div>
    </div>
  );
}
