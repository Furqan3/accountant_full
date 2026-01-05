"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import Header from "@/components/header/header";
import { useAuth } from "@/contexts/auth-context";
import { BulkSelectionProvider } from "@/contexts/bulk-selection-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { loading } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  console.log("MainLayout - Auth loading:", loading);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <BulkSelectionProvider>
      <div className="flex h-screen overflow-hidden">
        {isSidebarOpen && <Sidebar />}

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header onMenuClick={toggleSidebar} />

          <main className="flex-1 bg-gray-200 overflow-hidden p-6">
            {children}
          </main>
        </div>
      </div>
    </BulkSelectionProvider>
  );
}
