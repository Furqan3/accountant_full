"use client";

import {
  Package,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";

type StatItem = {
  id: string;
  title: string;
  value: string | number;
  icon: "orders" | "completed" | "pending" | "sales";
  bgColor: string;
  iconColor: string;
};

const ICON_MAP = {
  orders: Package,
  completed: Users,
  pending: Clock,
  sales: TrendingUp,
};
export default function StatsCards({
  data,
}: {
  data: readonly StatItem[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((item) => {
        const Icon = ICON_MAP[item.icon];

        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 flex items-center justify-between "
          >
            {/* Left */}
            <div>
              <p className="text-sm text-gray-500">
                {item.title}
              </p>
              <h3 className="text-2xl font-semibold text-gray-900">
                {item.value}
              </h3>
            </div>

            {/* Right Icon */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${item.bgColor}`}
            >
              <Icon className={`w-6 h-6 ${item.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
