"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

type LineItem = {
  id: string;
  title: string;
  qty?: number;
  price: number;
};

type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";
type PaymentStatus = "Paid" | "Unpaid";

export type Order = {
  id: string;
  orderNo: string;
  date: string;
  createdAt?: string; // Raw timestamp for sorting
  company: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: readonly LineItem[];
  total: number;
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-slate-200 text-slate-700",
  Processing: "bg-blue-100 text-blue-600",
  Completed: "bg-green-100 text-green-600",
  Cancelled: "bg-red-100 text-red-600",
};

const STATUS_OPTIONS: OrderStatus[] = ["Pending", "Processing", "Completed", "Cancelled"];

interface OrderCardProps {
  order: Order;
  onStatusUpdate?: () => void;
}

export default function OrderCard({ order, onStatusUpdate }: OrderCardProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/orders/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          status: newStatus.toLowerCase(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setCurrentStatus(newStatus);
      setIsDropdownOpen(false);

      // Refresh dashboard data (stats and orders)
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <div className="bg-white rounded-2xl p-1  space-y-4">
      
      <div className=" p-4 border border-primary/20 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg text-black font-semibold">
            Order {order.orderNo}
          </h3>
          <p className=" text-primary-light">
            {order.date} • <span className="text-primary-dark text-bold">{order.company}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isUpdating}
              className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium ${STATUS_STYLES[currentStatus]} hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isUpdating ? 'Updating...' : currentStatus}
              <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg  z-10 min-w-[140px] overflow-hidden">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={isUpdating}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                      status === currentStatus ? 'bg-gray-50 font-medium' : ''
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className={STATUS_STYLES[status].split(' ')[1]}>{status}</span>
                    {status === currentStatus && <Check size={16} className="text-green-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Status - Simple text on the side */}
          <span className={`text-sm text-green-600 font-semibold border border-green-600/60 px-3 py-1 rounded-full p-4`}>
            {'paid'}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between text-sm text-gray-700"
          >
            <span>
              {item.title}
              {item.qty ? ` (x${item.qty})` : ""}
            </span>
            <span className="font-medium">
              ${item.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <hr />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-lg text-black font-semibold">Total</span>
        <span className="text-xl font-semibold text-primary">
          ${order.total.toFixed(2)}
        </span>
      </div>
      </div>
    </div>
  );
}
