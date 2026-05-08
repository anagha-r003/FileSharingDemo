import { useEffect, useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import SharedLinksTable from "../components/sharedlink/SharedLinksTable";
import { getMySharedFiles } from "../services/shareService";

// const DUMMY_SHARED_DATA = [
//   {
//     id: 1,
//     fileName: "Project_Proposal.pdf",
//     recipientEmail: "client@example.com",
//     expiryDate: "2026-05-15",
//     viewCount: 24,
//     shareUrl: "https://vaultlink.com/s/123",
//   },
//   {
//     id: 2,
//     fileName: "Budget_Q3.xlsx",
//     recipientEmail: "finance@company.com",
//     expiryDate: "2026-04-30",
//     viewCount: 8,
//     shareUrl: "https://vaultlink.com/s/456",
//   },
//   {
//     id: 3,
//     fileName: "Brand_Assets.zip",
//     recipientEmail: "marketing@agency.io",
//     expiryDate: "2026-06-01",
//     viewCount: 142,
//     shareUrl: "https://vaultlink.com/s/789",
//   },
// ];

function SharedLinksPage() {
  const [sharedLinks, setSharedLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchSharedLinks();
  }, []);

  const fetchSharedLinks = async () => {
    try {
      setLoading(true);

      const response = await getMySharedFiles();

      const formattedData = response.data.map((item) => ({
        id: item.id,

        fileName: item.file?.name || "Unknown File",

        recipientEmail: item.recipientEmail,

        expiryDate: item.expiresAt,

        viewCount: item.accessed ? 1 : 0,

        shareUrl: `http://localhost:5173/public/share/${item.token}`,
      }));

      setSharedLinks(formattedData);
    } catch (error) {
      console.error("Failed to fetch shared links", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSharedLinks();
  };

  return (
    <div className="flex h-screen bg-[#0c0e12] text-white overflow-hidden">
      {/* Sidebar matches Dashboard/MyFiles behavior */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopNavbar
          title="Shared Links"
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-[1400px] mx-auto">
            {/* Search bar container has been removed from here.
                Design now flows directly into the content table.
            */}

            {loading ? (
              <div className="p-16 text-center text-slate-500">
                <div className="animate-pulse font-medium">
                  Loading shared links...
                </div>
              </div>
            ) : (
              <SharedLinksTable
                sharedLinks={sharedLinks}
                onRefresh={handleRefresh}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SharedLinksPage;
