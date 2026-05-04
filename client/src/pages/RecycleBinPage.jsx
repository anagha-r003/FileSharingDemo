import { useState, useEffect } from "react";
import {
  RotateCcw,
  Trash2,
  AlertTriangle,
  Clock,
  HardDrive,
  Calendar,
  Search,
} from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import DaysBar from "../components/recyclebin/DaysBar";
import ConfirmModal from "../components/recyclebin/ConfirmModal";
import {
  getDeletedFiles,
  restoreFile,
  permanentlyDeleteFile,
  emptyRecycleBin,
  restoreAllFiles,
} from "../services/fileService";

function RecycleBin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // { type: "delete"|"emptyBin"|"restoreAll", id? }

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  const expiringSoon = files.filter((f) => f.daysLeft <= 7).length;

  const restore = async (id) => {
    try {
      await restoreFile(id);
      fetchDeletedFiles();
    } catch (err) {
      console.error("Restore failed", err);
    }
  };

  const permDelete = async (id) => {
    try {
      await permanentlyDeleteFile(id);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const getFileEmoji = (type) => {
    const map = {
      PDF: "📄",
      IMAGE: "🖼️",
      VIDEO: "🎬",
      XLSX: "📊",
      ZIP: "🗜️",
      FIG: "📝",
    };
    return map[type?.toUpperCase()] || "📄";
  };

  const getFileColor = (type) => {
    const map = {
      PDF: "bg-red-500/10 text-red-400",
      IMAGE: "bg-green-500/10 text-green-400",
      VIDEO: "bg-orange-500/10 text-orange-400",
      XLSX: "bg-emerald-500/10 text-emerald-400",
      ZIP: "bg-violet-500/10 text-violet-400",
      FIG: "bg-blue-500/10 text-blue-400",
    };
    return map[type?.toUpperCase()] || "bg-slate-500/10 text-slate-400";
  };

  const formatFiles = (data) => {
    console.log("fileeeeee", data);
    return data.map((file) => {
      console.log("file", file);

      const deletedAt = new Date(file.deletedAt);
      const now = new Date();
      const daysSince = Math.floor((now - deletedAt) / (1000 * 60 * 60 * 24));
      const daysLeft = Math.max(0, 30 - daysSince);
      const fileType = file.type?.toUpperCase() || "FILE";

      return {
        id: file.id,
        name: file.name,
        size:
          file.size < 1024 * 1024
            ? (file.size / 1024).toFixed(1) + " KB"
            : (file.size / (1024 * 1024)).toFixed(2) + " MB",
        type: fileType,
        deletedAgo:
          daysSince === 0
            ? "Today"
            : `${daysSince} day${daysSince > 1 ? "s" : ""} ago`,
        daysLeft,
        emoji: getFileEmoji(fileType),
        color: getFileColor(fileType),
      };
    });
  };

  const fetchDeletedFiles = async () => {
    try {
      const res = await getDeletedFiles();
      console.log("res.data.data", res.data);

      setFiles(formatFiles(res.data));
    } catch (err) {
      console.error("Error fetching files", err);
    }
  };

  useEffect(() => {
    fetchDeletedFiles();
  }, []);

  const handleConfirm = async () => {
    if (!modal) return;
    try {
      if (modal.type === "delete") await permDelete(modal.id);
      if (modal.type === "emptyBin") await emptyRecycleBin();
      if (modal.type === "restoreAll") await restoreAllFiles();
      await fetchDeletedFiles(); // one fetch after any action
    } catch (err) {
      console.error("Action failed", err);
    } finally {
      setModal(null); // always close modal, even on error
    }
  };

  const stats = [
    {
      label: "Total Deleted",
      value: files.length,
      sub: "Files in bin",
      Icon: Trash2,
      ring: "bg-red-500/10",
      ic: "text-red-400",
    },
    {
      label: "Expiring Soon",
      value: expiringSoon,
      sub: "Within 7 days",
      Icon: Clock,
      ring: "bg-orange-500/10",
      ic: "text-orange-400",
    },
    {
      label: "Space Used",
      value: "342 MB",
      sub: "Recoverable space",
      Icon: HardDrive,
      ring: "bg-blue-500/10",
      ic: "text-blue-400",
    },
    {
      label: "Retention",
      value: "30 days",
      sub: "Auto-delete period",
      Icon: Calendar,
      ring: "bg-violet-500/10",
      ic: "text-violet-400",
    },
  ];

  return (
    <div className="flex h-screen bg-[#0c0e12] text-gray-200 overflow-hidden">
      {/* ── Reused Sidebar ── */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Reused TopNavbar ── */}
        <TopNavbar
          title="Recycle Bin"
          onMenuClick={() => setIsSidebarOpen((o) => !o)}
        />

        {/* ── Scrollable content ── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5">
          {/* WARNING BANNER */}
          <div className="flex items-start sm:items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
            <AlertTriangle
              size={16}
              className="text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0"
            />
            <p className="text-sm leading-relaxed">
              <span className="font-semibold text-amber-400">
                Files are auto-deleted after 30 days.{" "}
              </span>
              <span className="text-slate-400">
                Restore items before they expire to keep them in your vault.
              </span>
            </p>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {stats.map(({ label, value, sub, Icon, ring, ic }) => (
              <div
                key={label}
                className="bg-[#13151a] border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase leading-tight">
                    {label}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg ${ring} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={15} className={ic} />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white leading-none font-['Space_Grotesk']">
                  {value}
                </div>
                <div className="text-xs text-slate-600">{sub}</div>
              </div>
            ))}
          </div>

          {/* SEARCH + BULK ACTIONS */}
          <div className="bg-[#13151a] border border-white/5 rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search deleted files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0c0e12] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-violet-500 transition-colors font-['Space_Grotesk']"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setModal({ type: "restoreAll" })}
                disabled={files.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-400/50 rounded-xl text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw size={13} />
                <span>Restore All</span>
              </button>
              <button
                onClick={() => setModal({ type: "emptyBin" })}
                disabled={files.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-400/50 rounded-xl text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} />
                <span>Empty Bin</span>
              </button>
            </div>
          </div>

          {/* FILE LIST */}
          <div className="bg-[#13151a] border border-white/5 rounded-2xl overflow-hidden">
            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-[2fr_0.7fr_0.7fr_0.8fr_1fr_96px] px-5 py-3 bg-[#0f1013] border-b border-white/5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
              <div>Name</div>
              <div>Size</div>
              <div>Type</div>
              <div>Deleted</div>
              <div>Days Left</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-600">
                <Trash2 size={40} className="opacity-20" />
                <p className="text-sm">
                  {search
                    ? "No files match your search."
                    : "Your recycle bin is empty."}
                </p>
              </div>
            )}

            {/* File rows */}
            {filtered.map((file, idx) => (
              <div
                key={file.id}
                className={`group transition-colors hover:bg-white/[0.02] ${idx !== filtered.length - 1 ? "border-b border-white/[0.04]" : ""}`}
              >
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-[2fr_0.7fr_0.7fr_0.8fr_1fr_96px] items-center px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg ${file.color} flex items-center justify-center text-base flex-shrink-0`}
                    >
                      {file.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Deleted {file.deletedAgo}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">{file.size}</div>
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-slate-500 bg-white/5 border border-white/10 rounded-md px-2 py-1">
                      {file.type}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {file.deletedAgo}
                  </div>
                  <DaysBar daysLeft={file.daysLeft} />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => restore(file.id)}
                      title="Restore file"
                      className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-400 flex items-center justify-center transition"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button
                      onClick={() => setModal({ type: "delete", id: file.id })}
                      title="Delete permanently"
                      className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-400 flex items-center justify-center transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Mobile card */}
                <div className="flex md:hidden items-center gap-3 px-4 py-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl ${file.color} flex items-center justify-center text-lg flex-shrink-0`}
                  >
                    {file.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-semibold tracking-wider text-slate-500 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
                        {file.type}
                      </span>
                      <span className="text-xs text-slate-600">
                        {file.size}
                      </span>
                      <DaysBar daysLeft={file.daysLeft} />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Deleted {file.deletedAgo}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => restore(file.id)}
                      title="Restore"
                      className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 flex items-center justify-center transition"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button
                      onClick={() => setModal({ type: "delete", id: file.id })}
                      title="Delete permanently"
                      className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-4 md:px-5 py-3.5 border-t border-white/5 text-xs text-slate-600">
                <span>
                  Showing{" "}
                  <strong className="text-slate-400">{filtered.length}</strong>{" "}
                  of <strong className="text-slate-400">{files.length}</strong>{" "}
                  files
                </span>
                <div className="flex items-center gap-1.5">
                  {["‹", "1", "›"].map((p) => (
                    <div
                      key={p}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs cursor-pointer border transition
                        ${
                          p === "1"
                            ? "bg-violet-600 border-violet-600 text-white font-semibold"
                            : "bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-white/20"
                        }`}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CONFIRM MODAL */}
      {modal && (
        <ConfirmModal
          message={
            modal.type === "delete"
              ? "Permanently delete this file? This cannot be undone."
              : modal.type === "emptyBin"
                ? "Empty the entire Recycle Bin? All files will be permanently deleted."
                : "Restore all files back to your vault?"
          }
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default RecycleBin;
