import { useState, useMemo } from "react";
import { deleteFile, downloadFile } from "../../services/fileService";
import ShareModal from "./ShareModal";

const getFileIcon = (name) => {
  const ext = name?.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return { icon: "image", color: "text-green-400 bg-green-400/10" };
  if (["mp4", "mov", "avi", "mkv"].includes(ext))
    return { icon: "videocam", color: "text-yellow-400 bg-yellow-400/10" };
  if (["zip", "rar", "tar", "gz"].includes(ext))
    return { icon: "folder_zip", color: "text-orange-400 bg-orange-400/10" };
  if (["pdf"].includes(ext))
    return { icon: "picture_as_pdf", color: "text-red-400 bg-red-400/10" };
  return { icon: "description", color: "text-blue-400 bg-blue-400/10" };
};

const getTypeBadge = (name) => {
  const ext = name?.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "IMAGE";
  if (["mp4", "mov", "avi", "mkv"].includes(ext)) return "VIDEO";
  if (["zip", "rar", "tar", "gz"].includes(ext)) return "ARCHIVE";
  if (["pdf"].includes(ext)) return "PDF DOCUMENT";
  if (["doc", "docx"].includes(ext)) return "DOCUMENT";
  return ext?.toUpperCase() || "FILE";
};

const formatSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function FileTable({ files, onRefresh }) {
  const [shareFile, setShareFile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter by search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name?.toLowerCase().includes(q));
  }, [files, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Reset to page 1 on search
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (file) => {
    if (!confirm(`Delete "${file.name}"?`)) return;
    setDeletingId(file.id);
    setMenuOpenId(null);
    try {
      await deleteFile(file.id);
      onRefresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  // Stats cards
  const stats = {
    documents: files.filter((f) => {
      const ext = f.name?.split(".").pop()?.toLowerCase();
      return ["doc", "docx", "txt", "pdf"].includes(ext);
    }).length,
    images: files.filter((f) => {
      const ext = f.name?.split(".").pop()?.toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
    }).length,
    videos: files.filter((f) => {
      const ext = f.name?.split(".").pop()?.toLowerCase();
      return ["mp4", "mov", "avi", "mkv"].includes(ext);
    }).length,
    others: files.filter((f) => {
      const ext = f.name?.split(".").pop()?.toLowerCase();
      return ![
        "doc",
        "docx",
        "txt",
        "pdf",
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg",
        "mp4",
        "mov",
        "avi",
        "mkv",
      ].includes(ext);
    }).length,
  };

  // Pagination range (show max 5 page buttons)
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(totalPages, page + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "DOCUMENTS",
            value: stats.documents,
            icon: "description",
            color: "text-blue-400 bg-blue-400/10",
          },
          {
            label: "IMAGES",
            value: stats.images,
            icon: "image",
            color: "text-green-400 bg-green-400/10",
          },
          {
            label: "VIDEOS",
            value: stats.videos,
            icon: "videocam",
            color: "text-yellow-400 bg-yellow-400/10",
          },
          {
            label: "OTHERS",
            value: stats.others,
            icon: "folder_zip",
            color: "text-violet-400 bg-violet-400/10",
          },
        ].map((card) => (
          <div key={card.label} className="custom-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}
              >
                <span className="material-symbols-outlined text-lg">
                  {card.icon}
                </span>
              </div>
            </div>
            <div className="text-3xl font-black text-white">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="custom-card rounded-2xl flex flex-col">
        {/* Search + page size row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-white/5">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search files..."
              className="w-full bg-[#111] border border-white/10 rounded-xl text-white text-sm py-2 pl-9 pr-4 outline-none focus:border-violet-500/50 transition placeholder:text-slate-600"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
              </button>
            )}
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#111] border border-white/10 rounded-lg text-white px-2 py-1 outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>
        </div>

        {/* Scrollable table area */}
        <div className="overflow-auto max-h-[480px]">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-[#111827]">
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Name
                </th>
                <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Size
                </th>
                <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Last Modified
                </th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    {search
                      ? `No files matching "${search}"`
                      : "No files yet. Upload something!"}
                  </td>
                </tr>
              ) : (
                paginated.map((file) => {
                  const { icon, color } = getFileIcon(file.name);
                  const badge = getTypeBadge(file.name);
                  return (
                    <tr
                      key={file.id}
                      className="hover:bg-white/[0.02] transition"
                    >
                      {/* Name */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div
                            className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${color}`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {icon}
                            </span>
                          </div>
                          <span
                            className="text-white font-medium truncate max-w-[180px]"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-6 text-slate-400 whitespace-nowrap">
                        {formatSize(file.size)}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-white/5">
                          {badge}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-6 text-slate-400 whitespace-nowrap">
                        {formatDate(file.createdAt || file.uploadedAt)}
                      </td>

                      {/* 3-dot menu */}
                      <td className="py-3 px-6 relative">
                        <button
                          onClick={() =>
                            setMenuOpenId(
                              menuOpenId === file.id ? null : file.id,
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                        >
                          <span className="material-symbols-outlined text-base">
                            more_vert
                          </span>
                        </button>

                        {menuOpenId === file.id && (
                          <div className="absolute right-6 top-10 z-20 w-40 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                            <button
                              onClick={() => {
                                downloadFile(file.id, file.name);
                                setMenuOpenId(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
                            >
                              <span className="material-symbols-outlined text-base">
                                download
                              </span>
                              Download
                            </button>
                            <button
                              onClick={() => {
                                setShareFile(file);
                                setMenuOpenId(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-violet-400 transition"
                            >
                              <span className="material-symbols-outlined text-base">
                                share
                              </span>
                              Share
                            </button>
                            <button
                              onClick={() => handleDelete(file)}
                              disabled={deletingId === file.id}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition"
                            >
                              <span className="material-symbols-outlined text-base">
                                delete
                              </span>
                              {deletingId === file.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-white/5">
          {/* Info */}
          <p className="text-slate-500 text-sm">
            Showing{" "}
            <span className="text-white font-medium">
              {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="text-white font-medium">
              {Math.min(page * pageSize, filtered.length)}
            </span>{" "}
            of <span className="text-white font-medium">{filtered.length}</span>{" "}
            {search ? "results" : "files"}
          </p>

          {/* Page buttons */}
          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Prev
            </button>

            {/* First page if not in range */}
            {getPageNumbers()[0] > 1 && (
              <>
                <button
                  onClick={() => setPage(1)}
                  className="w-8 h-8 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
                >
                  1
                </button>
                {getPageNumbers()[0] > 2 && (
                  <span className="text-slate-600 px-1">...</span>
                )}
              </>
            )}

            {/* Page number buttons */}
            {getPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                  p === page
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {p}
              </button>
            ))}

            {/* Last page if not in range */}
            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
              <>
                {getPageNumbers()[getPageNumbers().length - 1] <
                  totalPages - 1 && (
                  <span className="text-slate-600 px-1">...</span>
                )}
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-8 h-8 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
                >
                  {totalPages}
                </button>
              </>
            )}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {shareFile && (
        <ShareModal file={shareFile} onClose={() => setShareFile(null)} />
      )}
    </>
  );
}

export default FileTable;
