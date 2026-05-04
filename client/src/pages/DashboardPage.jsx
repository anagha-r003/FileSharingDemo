import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import SummaryCards from "../components/dashboard/SummaryCards";
import QuickUploadCard from "../components/dashboard/QuickUploadCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import StorageHealth from "../components/dashboard/StorageHealth";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  // Default closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0e12] text-slate-200">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopNavbar
          title="Dashboard"
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
          <header>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
              Welcome back, {user?.firstName || user?.name || "User"}
            </h2>
            <p className="text-slate-500 text-sm md:text-base mt-1">
              Your enterprise environment is currently operating within optimal
              parameters.
            </p>
          </header>

          <SummaryCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <QuickUploadCard />
              <RecentActivity />
            </div>
            <div className="lg:col-span-1">
              <StorageHealth />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
