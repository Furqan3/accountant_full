"use client";

import { CheckSquare, Square } from "lucide-react";
import { useState, useEffect } from "react";

export type Service = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  base_price: number;
  is_active: boolean;
  features?: any;
  metadata?: any;
};

interface ServiceSelectorProps {
  onSelectionChange: (services: Service[]) => void;
}

export default function ServiceSelector({ onSelectionChange }: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MAX_SERVICES = 3;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/services");
        const data = await res.json();

        if (data.services) {
          setServices(data.services);
        } else if (data.error) {
          setError(data.error);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load services");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const toggleService = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);

      if (isSelected) {
        // Remove service
        return prev.filter(s => s.id !== service.id);
      } else {
        // Add service if under limit
        if (prev.length >= MAX_SERVICES) {
          return prev; // Don't add if at max
        }
        return [...prev, service];
      }
    });
  };

  // Notify parent when selection changes
  useEffect(() => {
    onSelectionChange(selectedServices);
  }, [selectedServices, onSelectionChange]);

  const isSelected = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const isDisabled = (serviceId: string) => {
    return selectedServices.length >= MAX_SERVICES && !isSelected(serviceId);
  };

  const formatPrice = (price: number) => {
    return `£${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading services: {error}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600">No active services available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Counter */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Select Services</h3>
        <div className="text-sm">
          <span className={`font-medium ${selectedServices.length >= MAX_SERVICES ? 'text-red-600' : 'text-primary'}`}>
            Selected: {selectedServices.length}/{MAX_SERVICES}
          </span>
        </div>
      </div>

      {selectedServices.length >= MAX_SERVICES && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            Maximum of {MAX_SERVICES} services selected. Deselect a service to choose another.
          </p>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const selected = isSelected(service.id);
          const disabled = isDisabled(service.id);

          return (
            <button
              key={service.id}
              onClick={() => !disabled && toggleService(service)}
              disabled={disabled}
              className={`text-left p-4 rounded-lg border-2 transition ${
                selected
                  ? 'bg-primary text-white border-primary'
                  : disabled
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                  : 'bg-white border-gray-200 hover:border-primary/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${selected ? 'text-white' : 'text-gray-900'}`}>
                    {service.title}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  {selected ? (
                    <CheckSquare className="h-5 w-5" />
                  ) : (
                    <Square className={`h-5 w-5 ${disabled ? 'text-gray-400' : 'text-primary'}`} />
                  )}
                </div>
              </div>

              {service.description && (
                <p className={`text-xs mb-2 line-clamp-2 ${selected ? 'text-white/90' : 'text-gray-600'}`}>
                  {service.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${selected ? 'text-white' : 'text-primary'}`}>
                  {formatPrice(service.base_price)}
                </span>
                {service.category && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {service.category}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
