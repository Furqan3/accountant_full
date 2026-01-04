"use client";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import StatsCards from "@/components/dashboard/stats-cards";
import OrderCard, { Order } from "@/components/dashboard/order-card";
import { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/contexts/socket-context";

export default function DashboardPage() {
  const [statsData, setData] = useState<any>([]);
  const [ordersData, setOrdersData] = useState<any>([]);
  const [filteredOrders, setFilteredOrders] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("new");
  const { socket } = useSocket();

  // Fetch stats data
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/states");
      const data = await res.json();
      setData(data.statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  // Fetch orders data
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/orders");
      const data = await res.json();
      setOrdersData(data.ordersData);
      setFilteredOrders(data.ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, []);

  // Filter and sort orders based on search query and sort order
  useEffect(() => {
    let filtered = [...ordersData];

    // Apply search filter (search by company name, order number, or status)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order: Order) =>
        order.company.toLowerCase().includes(query) ||
        order.orderNo.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
      );
    }

    // Apply sorting by date
    filtered.sort((a: Order, b: Order) => {
      const dateA = new Date(a.createdAt || a.date).getTime();
      const dateB = new Date(b.createdAt || b.date).getTime();

      if (sortOrder === "new") {
        return dateB - dateA; // Newest first (descending)
      } else {
        return dateA - dateB; // Oldest first (ascending)
      }
    });

    setFilteredOrders(filtered);
  }, [searchQuery, sortOrder, ordersData]);

  // Handle search input
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    setSortOrder(value);
  }, []);

  // Refresh all dashboard data
  const refreshDashboard = useCallback(async () => {
    await Promise.all([fetchStats(), fetchOrders()]);
  }, [fetchStats, fetchOrders]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await refreshDashboard();
      setIsLoading(false);
    };
    loadData();
  }, [refreshDashboard]);

  // Real-time updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleDashboardRefresh = () => {
      console.log("Dashboard refresh event received via socket.");
      refreshDashboard();
    };

    socket.on("dashboard-refresh", handleDashboardRefresh);

    return () => {
      socket.off("dashboard-refresh", handleDashboardRefresh);
    };
  }, [socket, refreshDashboard]);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex-shrink-0">
        <DashboardHeader
          title="Dashboard"
          subtitle="List of all Requested Services"
          searchPlaceholder="Search by company, order number, or status..."
          onSearch={handleSearch}
          onSortChange={handleSortChange}
        />
      </div>

      <div className="flex-shrink-0">
        <StatsCards data={statsData} />
      </div>

      {/* Scrollable container for OrderCards only */}
      <div className="flex-1 min-h-0 bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500">Loading orders...</p>
            </div>
          </div>
        ) : (
          <div className="h-full space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery ? `No orders found matching "${searchQuery}"` : "No orders found"}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-primary hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                {searchQuery && (
                  <div className="text-sm text-gray-600 pb-2">
                    Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} matching "{searchQuery}"
                  </div>
                )}
                {filteredOrders.map((order: Order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={refreshDashboard}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
