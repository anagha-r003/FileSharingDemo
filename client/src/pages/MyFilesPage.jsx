import { useEffect, useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import FileTable from "../components/myfiles/FileTable";
import { getFiles } from "../services/fileService";
import { getFolders } from "../services/folderService";
import { useLocation } from "react-router-dom";

function MyFilesPage() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [filesRes, foldersRes] = await Promise.all([
        // 👈 fetch both
        getFiles(),
        getFolders(),
      ]);
      console.log("Files response:", filesRes);
      console.log("Folders response:", foldersRes);
      setFiles(Array.isArray(filesRes) ? filesRes : filesRes.data || []);
      setFolders(
        Array.isArray(foldersRes) ? foldersRes : foldersRes.data || [],
      );
    } catch (err) {
      console.error("Failed to fetch data:", err);
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
    fetchData();
  }, [location.pathname]);

  return (
    <div className="flex h-screen  bg-[#0c0e12] text-white">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNavbar title="My Files" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="p-16 text-center text-slate-500">
              Loading files...
            </div>
          ) : (
            <FileTable files={files} folders={folders} onRefresh={fetchData} />
          )}
        </main>
      </div>
    </div>
  );
}

export default MyFilesPage;
