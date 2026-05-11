import { useState, useMemo, useEffect } from "react";
import SharedLinksStats from "./SharedLinksStats";
import SharedLinksToolbar from "./SharedLinksToolbar";
import SharedLinksListView from "./SharedLinksListView";
import SharedLinksGridView from "./SharedLinksGridView";

function getFileIcon(name) {
  const ext = name?.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return { icon: "image", color: "text-green-400 bg-green-400/10" };
  if (["pdf"].includes(ext))
    return { icon: "picture_as_pdf", color: "text-red-400 bg-red-400/10" };
  return { icon: "description", color: "text-blue-400 bg-blue-400/10" };
}

function SharedLinksTable({ sharedLinks = [], onRefresh }) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [view, setView] = useState("list");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".menu-wrapper")) setMenuOpenId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sharedLinks;
    return sharedLinks.filter(
      (l) =>
        l.fileName?.toLowerCase().includes(q) ||
        l.recipientEmail?.toLowerCase().includes(q),
    );
  }, [sharedLinks, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Stats
  const stats = {
    active: sharedLinks.filter((l) => new Date(l.expiryDate) > new Date())
      .length,
    expired: sharedLinks.filter((l) => new Date(l.expiryDate) <= new Date())
      .length,
    totalViews: sharedLinks.reduce(
      (acc, curr) => acc + (curr.viewCount || 0),
      0,
    ),
    files: sharedLinks.length,
  };

  // Handlers
  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
  };

  const handleRevoke = (linkId) => {
    // TODO: Implement revoke functionality
    console.log("Revoke link:", linkId);
  };

  return (
    <>
      {/* Stats */}
      <SharedLinksStats stats={stats} />

      {/* Main Container */}
      <div className="custom-card rounded-2xl flex flex-col">
        {/* Toolbar */}
        <SharedLinksToolbar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          pageSize={pageSize}
          onPageSizeChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          view={view}
          onViewChange={setView}
        />

        {/* List View */}
        {view === "list" && (
          <SharedLinksListView
            paginated={paginated}
            menuOpenId={menuOpenId}
            onMenuToggle={setMenuOpenId}
            getFileIcon={getFileIcon}
            onCopy={handleCopyLink}
            onRevoke={handleRevoke}
          />
        )}

        {/* Grid View */}
        {view === "grid" && (
          <SharedLinksGridView
            paginated={paginated}
            menuOpenId={menuOpenId}
            onMenuToggle={setMenuOpenId}
            getFileIcon={getFileIcon}
            onCopy={handleCopyLink}
            onRevoke={handleRevoke}
          />
        )}
      </div>
    </>
  );
}

export default SharedLinksTable;
