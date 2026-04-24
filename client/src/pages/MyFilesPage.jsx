import { useEffect, useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import FileTable from "../components/myfiles/FileTable";
import { getFiles } from "../services/fileService";

function MyFilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchFiles = async () => {
    try {
      const response = await getFiles();
      console.log("Files response:", response);
      // Backend returns { data: [...], message: "...", status: 200 }
      setFiles(Array.isArray(response) ? response : response.data || []);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0e12] text-white">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNavbar title="My Files" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="p-16 text-center text-slate-500">
              Loading files...
            </div>
          ) : (
            <FileTable files={files} onRefresh={fetchFiles} />
          )}
        </main>
      </div>
    </div>
  );
}

export default MyFilesPage;
