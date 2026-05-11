import { useState, useMemo } from "react";
import {
  deleteFile,
  downloadFile,
  viewFile,
  starFile,
  unstarFile,
} from "../../services/fileService";
import ShareModal from "./ShareModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Pagination from "../common/Pagination";
import AddToFolderModal from "./AddToFolderModal";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
const VIDEO_EXTS = new Set(["mp4", "mov", "avi", "mkv"]);
const ARCHIVE_EXTS = new Set(["zip", "rar", "tar", "gz"]);
const DOC_EXTS = new Set(["doc", "docx"]);
const DOC_STAT_EXTS = new Set(["doc", "docx", "txt", "pdf"]);

const getFileExt = (name) => name?.split(".").pop()?.toLowerCase().trim() || "";

const getFileMeta = (name) => {
  const ext = getFileExt(name);
  if (IMAGE_EXTS.has(ext))
    return {
      ext,
      icon: "image",
      color: "text-green-400 bg-green-400/10",
      badge: "IMAGE",
      hasPreview: true,
    };
  if (VIDEO_EXTS.has(ext))
    return {
      ext,
      icon: "videocam",
      color: "text-yellow-400 bg-yellow-400/10",
      badge: "VIDEO",
      hasPreview: false,
    };
  if (ARCHIVE_EXTS.has(ext))
    return {
      ext,
      icon: "folder_zip",
      color: "text-orange-400 bg-orange-400/10",
      badge: "ARCHIVE",
      hasPreview: false,
    };
  if (ext === "pdf")
    return {
      ext,
      icon: "picture_as_pdf",
      color: "text-red-400 bg-red-400/10",
      badge: "PDF DOCUMENT",
      hasPreview: true,
    };
  if (DOC_EXTS.has(ext))
    return {
      ext,
      icon: "description",
      color: "text-blue-400 bg-blue-400/10",
      badge: "DOCUMENT",
      hasPreview: false,
    };
  return {
    ext,
    icon: "description",
    color: "text-blue-400 bg-blue-400/10",
    badge: ext ? ext.toUpperCase() : "FILE",
    hasPreview: false,
  };
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

// Reusable transparent checkbox style
const CB =
  "w-4 h-4 cursor-pointer appearance-none rounded border border-slate-500 checked:bg-violet-600 checked:border-violet-600 bg-transparent transition";

function FileTable({ files, onRefresh }) {
  const [shareFile, setShareFile] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [view, setView] = useState("list");
  const [selectedIds, setSelectedIds] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState([]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name?.toLowerCase().includes(q));
  }, [files, search]);

  // const filteredFolders = useMemo(() => {
  //   const q = search.trim().toLowerCase();
  //   if (!q) return folders;
  //   return folders.filter((f) => f.name?.toLowerCase().includes(q));
  // }, [folders, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const pageIds = paginated.map((f) => f.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected = pageIds.some((id) => selectedIds.includes(id));

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleView = async (file) => {
    try {
      const url = await viewFile(file.id);
      window.open(url, "_blank");
    } catch (err) {
      console.error("View failed", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteTarget(null);
    try {
      await deleteFile([deleteTarget.id]);
      onRefresh();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleToggleStar = async (file) => {
    try {
      if (file.isStarred) await unstarFile(file.id);
      else await starFile(file.id);
      onRefresh();
    } catch (err) {
      console.error("Star/unstar failed", err);
    }
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkDownload = () => {
    selectedIds.forEach((id) => {
      const file = files.find((f) => f.id === id);
      if (file) downloadFile(file.id, file.name);
    });
  };

  const handleBulkShare = () => {
    const file = files.find((f) => f.id === selectedIds[0]);
    if (file) setShareFile(file);
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);

    try {
      await deleteFile(selectedIds);

      clearSelection();
      onRefresh();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setBulkDeleting(false);
    }
  };
  const stats = useMemo(() => {
    const next = { documents: 0, images: 0, videos: 0, others: 0 };
    for (const f of files) {
      const ext = getFileMeta(f.name).ext;
      if (DOC_STAT_EXTS.has(ext)) next.documents += 1;
      else if (IMAGE_EXTS.has(ext)) next.images += 1;
      else if (VIDEO_EXTS.has(ext)) next.videos += 1;
      else next.others += 1;
    }
    return next;
  }, [files]);

  const handleFolderConfirm = (folderName) => {
    setShowFolderModal(false);
    // TODO: await addFilesToFolder(selectedIds, folderName)
    clearSelection();
    onRefresh();
  };

  // const pageNumbers = useMemo(() => {
  //   const delta = 2;
  //   const range = [];
  //   for (
  //     let i = Math.max(1, page - delta);
  //     i <= Math.min(totalPages, page + delta);
  //     i++
  //   ) {
  //     range.push(i);
  //   }
  //   return range;
  // }, [page, totalPages]);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6">
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
          <div key={card.label} className="custom-card p-4 md:p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center ${card.color}`}
              >
                <span className="material-symbols-outlined text-base md:text-lg">
                  {card.icon}
                </span>
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="custom-card rounded-2xl flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 px-4 md:px-6 py-5 border-b border-white/5">
          {/* Search — always visible */}
          <div className="relative w-full sm:w-64 md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search your vault..."
              className="w-full bg-[#111] border border-white/10 rounded-xl text-white text-sm py-2.5 pl-10 pr-4 outline-none focus:border-violet-500/50 transition placeholder:text-slate-600 shadow-inner"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
              </button>
            )}
          </div>

          {/* Right side: bulk toolbar OR normal controls */}
          <div className="flex items-center justify-between xl:justify-end gap-3 w-full xl:w-auto">
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white mr-2">
                  {selectedIds.length} selected
                </span>

                <button
                  onClick={() => setShowFolderModal(true)}
                  title="Add to folder"
                  className="p-2 rounded-lg text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 transition"
                >
                  <span className="material-symbols-outlined text-base">
                    create_new_folder
                  </span>
                </button>

                <button
                  onClick={handleBulkDownload}
                  title="Download selected"
                  className="p-2 rounded-lg text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/20 transition"
                >
                  <span className="material-symbols-outlined text-base">
                    download
                  </span>
                </button>
                <button
                  onClick={handleBulkShare}
                  title="Share selected"
                  className="p-2 rounded-lg text-violet-400 bg-violet-400/10 hover:bg-violet-400/20 border border-violet-400/20 transition"
                >
                  <span className="material-symbols-outlined text-base">
                    share
                  </span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  title="Delete selected"
                  className="p-2 rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 transition disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">
                    delete
                  </span>
                </button>
                <button
                  onClick={clearSelection}
                  title="Clear selection"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <span className="material-symbols-outlined text-base">
                    close
                  </span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium">
                  <span className="hidden sm:inline">Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-[#111] border border-white/10 rounded-lg text-white px-2 py-1.5 outline-none hover:border-white/20 transition cursor-pointer"
                  >
                    {PAGE_SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />
                <div className="flex items-center gap-1 bg-black/40 border border-white/5 rounded-xl p-1">
                  <button
                    onClick={() => setView("list")}
                    className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-slate-500 hover:text-slate-200"}`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      list
                    </span>
                  </button>
                  <button
                    onClick={() => setView("grid")}
                    className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-slate-500 hover:text-slate-200"}`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      grid_view
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* LIST VIEW */}
        {view === "list" && (
          <>
            {/* Desktop */}
            <div
              className="hidden md:block"
              style={{ overflowX: "auto", overflowY: "visible" }}
            >
              <table
                className="w-full text-sm min-w-[600px]"
                style={{ overflow: "visible" }}
              >
                <thead className="sticky top-0 z-10 bg-[#111827]">
                  <tr className="border-b border-white/5">
                    <th className="py-3 pl-6 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        ref={(el) => {
                          if (el)
                            el.indeterminate =
                              somePageSelected && !allPageSelected;
                        }}
                        onChange={toggleSelectAll}
                        className={CB}
                      />
                    </th>
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
                    <th className="py-3 px-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {/* Folders
                  {filteredFolders.map((folder) => (
                    <tr
                      key={`folder-${folder.id}`}
                      className="hover:bg-white/[0.02] transition"
                    >
                      <td className="py-3 pl-6 pr-2 w-10" />
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-amber-400 bg-amber-400/10">
                            <span className="material-symbols-outlined text-lg">
                              folder
                            </span>
                          </div>
                          <span
                            className="text-white font-medium truncate max-w-[160px]"
                            title={folder.name}
                          >
                            {folder.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-slate-400 whitespace-nowrap">
                        —
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                          FOLDER
                        </span>
                      </td>
                      <td className="py-3 px-6 text-slate-400 whitespace-nowrap">
                        {formatDate(folder.createdAt)}
                      </td>
                      <td className="py-3 px-2" />
                    </tr>
                  ))} */}

                  {/* Files */}
                  {paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-slate-500"
                      >
                        {search
                          ? `No results matching "${search}"`
                          : "No files yet. Upload something!"}
                      </td>
                    </tr>
                  ) : (
                    paginated.map((file) => {
                      const { icon, color, badge } = getFileMeta(file.name);
                      const isSelected = selectedIds.includes(file.id);
                      const isHovered = hoveredId === file.id;
                      return (
                        <tr
                          key={file.id}
                          className="transition cursor-pointer"
                          style={{
                            background: isSelected
                              ? "rgba(99,102,241,0.08)"
                              : undefined,
                          }}
                          onMouseEnter={() => setHoveredId(file.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => handleView(file)}
                        >
                          {/* Checkbox */}
                          <td
                            className="py-3 pl-6 pr-2 w-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(isHovered || isSelected) && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => toggleSelect(file.id, e)}
                                className={CB}
                              />
                            )}
                          </td>

                          {/* Name */}
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3 min-w-[180px]">
                              <div
                                className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${color}`}
                              >
                                <span className="material-symbols-outlined text-lg">
                                  {icon}
                                </span>
                              </div>
                              <span
                                className="text-white font-medium truncate max-w-[160px]"
                                title={file.name}
                              >
                                {file.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-6 text-slate-400 whitespace-nowrap">
                            {formatSize(file.size)}
                          </td>

                          <td className="py-3 px-6 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-white/5">
                              {badge}
                            </span>
                          </td>

                          <td className="py-3 px-6 text-slate-400 whitespace-nowrap">
                            {formatDate(file.createdAt || file.uploadedAt)}
                          </td>

                          {/* Star */}
                          <td className="py-3 px-2 whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStar(file);
                              }}
                              className={`p-1 rounded-lg transition-colors ${file.isStarred ? "text-yellow-400" : "text-slate-600 hover:text-yellow-400"}`}
                              title={file.isStarred ? "Unstar" : "Star"}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {file.isStarred ? "star" : "star_outline"}
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-white/5">
              {/* {filteredFolders.map((folder) => (
                <div
                  key={`folder-m-${folder.id}`}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-amber-400 bg-amber-400/10">
                    <span className="material-symbols-outlined text-lg">
                      folder
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {folder.name}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Folder · {formatDate(folder.createdAt)}
                    </p>
                  </div>
                </div>
              ))} */}

              {paginated.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm">
                  {search
                    ? `No results matching "${search}"`
                    : "No files yet. Upload something!"}
                </div>
              ) : (
                paginated.map((file) => {
                  const { icon, color } = getFileMeta(file.name);
                  const isSelected = selectedIds.includes(file.id);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition"
                      style={{
                        background: isSelected
                          ? "rgba(99,102,241,0.08)"
                          : undefined,
                      }}
                      onClick={() => handleView(file)}
                    >
                      {/* Checkbox — wrapped to stop row click propagation */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelect(file.id, e)}
                          className={CB}
                        />
                      </div>

                      <div
                        className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${color}`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {icon}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {formatSize(file.size)} ·{" "}
                          {formatDate(file.createdAt || file.uploadedAt)}
                        </p>
                      </div>

                      {/* Star */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleStar(file);
                        }}
                        className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${file.isStarred ? "text-yellow-400" : "text-slate-600 hover:text-yellow-400"}`}
                        title={file.isStarred ? "Unstar" : "Star"}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {file.isStarred ? "star" : "star_outline"}
                        </span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* GRID VIEW */}
        {view === "grid" && (
          <div className="p-4 md:p-6">
            {/* {filteredFolders.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Folders
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                  {filteredFolders.map((folder) => (
                    <div
                      key={`folder-${folder.id}`}
                      className="group flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-400/30 hover:bg-amber-400/5 cursor-pointer transition"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-amber-400/10">
                        <span
                          className="material-symbols-outlined text-amber-400"
                          style={{ fontSize: 24 }}
                        >
                          folder
                        </span>
                      </div>
                      <span
                        className="text-white text-xs font-medium text-center truncate w-full"
                        title={folder.name}
                      >
                        {folder.name}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {formatDate(folder.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {paginated.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Files
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                  {paginated.map((file) => {
                    const { icon, color, hasPreview } = getFileMeta(file.name);
                    const isSelected = selectedIds.includes(file.id);
                    return (
                      <div
                        key={file.id}
                        onClick={() => handleView(file)}
                        className="group relative flex flex-col rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/5 cursor-pointer transition overflow-hidden"
                        style={{
                          outline: isSelected
                            ? "2px solid rgb(99,102,241)"
                            : undefined,
                        }}
                      >
                        {/* Checkbox — top left, hover only */}
                        <div
                          className="absolute top-2 left-2 z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleSelect(file.id, e)}
                            className={`${CB} ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          />
                        </div>

                        {/* Star — top right */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleStar(file);
                          }}
                          className={`absolute top-2 right-2 z-10 p-1 rounded-lg bg-black/40 transition ${file.isStarred ? "opacity-100 text-yellow-400" : "opacity-0 group-hover:opacity-100 text-white hover:text-yellow-400"}`}
                          title={file.isStarred ? "Unstar" : "Star"}
                        >
                          <span className="material-symbols-outlined text-base">
                            {file.isStarred ? "star" : "star_outline"}
                          </span>
                        </button>

                        {/* Preview / Icon */}
                        {hasPreview ? (
                          <div className="w-full h-24 md:h-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                            <img
                              src={`http://localhost:8080/files/${file.id}/preview`}
                              alt={file.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                            <div
                              className={`w-full h-full hidden items-center justify-center ${color}`}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 36 }}
                              >
                                {icon}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`w-full h-24 md:h-32 flex items-center justify-center ${color}`}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 36 }}
                            >
                              {icon}
                            </span>
                          </div>
                        )}

                        {/* Info */}
                        <div className="p-2 md:p-3">
                          <p
                            className="text-white text-xs font-medium truncate w-full mb-1"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {formatSize(file.size)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {paginated.length === 0 && (
              <div className="py-16 text-center text-slate-500 text-sm">
                {search
                  ? `No results matching "${search}"`
                  : "No files yet. Upload something!"}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}

        <Pagination
          page={page}
          setPage={setPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          label={search ? "results" : "files"}
        />
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          fileName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {shareFile && (
        <ShareModal file={shareFile} onClose={() => setShareFile(null)} />
      )}
      {showFolderModal && (
        <AddToFolderModal
          selectedCount={selectedIds.length}
          folders={folders}
          onConfirm={handleFolderConfirm}
          onClose={() => setShowFolderModal(false)}
        />
      )}
    </>
  );
}

export default FileTable;
