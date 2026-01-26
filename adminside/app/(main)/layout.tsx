"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import Header from "@/components/header/header";
import { useAuth } from "@/contexts/auth-context";
import { BulkSelectionProvider } from "@/contexts/bulk-selection-context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

          <main
            className="flex-1 bg-gray-200 overflow-y-auto p-6"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#0d9488 #e5e7eb'
            }}
          >
            <style jsx>{`
              main::-webkit-scrollbar {
                width: 12px;
              }
              main::-webkit-scrollbar-track {
                background: #e5e7eb;
                border-radius: 6px;
              }
              main::-webkit-scrollbar-thumb {
                background: #0d9488;
                border-radius: 6px;
                border: 2px solid #e5e7eb;
              }
              main::-webkit-scrollbar-thumb:hover {
                background: #0f766e;
              }
            `}</style>
            {children}
          </main>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BulkSelectionProvider>
  );
}
