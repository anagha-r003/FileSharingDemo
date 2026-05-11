function DashboardLayout({
  title,
  children,
  sidebarOpen,
  onMenuClick,
  setSidebarOpen,
}) {
  return (
    <div className="flex h-screen bg-[#0c0e12] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Top Navigation */}
        <TopNavbar title={title} onMenuClick={onMenuClick} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
