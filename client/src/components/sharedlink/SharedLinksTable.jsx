import { useState, useMemo, useEffect } from "react";
import { revokeShareLink } from "../../services/shareService";
import Pagination from "../common/Pagination";

const getFileIcon = (name) => {
  const ext = name?.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return { icon: "image", color: "text-green-400 bg-green-400/10" };
  if (["pdf"].includes(ext))
    return { icon: "picture_as_pdf", color: "text-red-400 bg-red-400/10" };
  return { icon: "description", color: "text-blue-400 bg-blue-400/10" };
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

function SharedLinksTable({ sharedLinks = [], onRefresh, showToast }) {
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sharedLinks;
    return sharedLinks.filter(
      (l) =>
        l.fileName?.toLowerCase().includes(q) ||
        l.recipientEmail?.toLowerCase().includes(q),
    );
  }, [sharedLinks, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = {
    active: sharedLinks.filter(
      (l) => l.active === true && new Date(l.expiryDate) > new Date(),
    ).length,

    expired: sharedLinks.filter(
      (l) => l.active === false || new Date(l.expiryDate) <= new Date(),
    ).length,
    totalViews: sharedLinks.reduce(
      (acc, curr) => acc + (curr.viewCount || 0),
      0,
    ),
    files: sharedLinks.length,
  };

  const handleRevoke = async (shareId) => {
    const link = sharedLinks.find((l) => l.id === shareId);

    if (
      !link ||
      link.active === false ||
      new Date(link.expiryDate) <= new Date()
    ) {
      showToast?.("Link already inactive");
      return;
    }
    try {
      await revokeShareLink(shareId);
      showToast?.("Share link revoked!");

      setMenuOpenId(null);

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to revoke share link", error);
      showToast?.("Failed to revoke link");
    }
  };

  const ActionMenu = ({ link, position = "bottom" }) => (
    <div
      className={`absolute ${position === "grid" ? "top-8 right-2" : "right-0 top-full mt-1"} z-50 w-44 bg-[#1e2130] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1`}
    >
      <button
        onClick={() => {
          navigator.clipboard.writeText(link.shareUrl);
          showToast?.("Link copied!");
          setMenuOpenId(null);
        }}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition group"
      >
        <span className="w-7 h-7 rounded-lg bg-blue-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-400/20 transition">
          <span
            className="material-symbols-outlined text-blue-400"
            style={{ fontSize: 15 }}
          >
            content_copy
          </span>
        </span>
        Copy Link
      </button>
      <div className="mx-3 my-1 border-t border-white/5" />
      <button
        disabled={
          link.active === false || new Date(link.expiryDate) <= new Date()
        }
        onClick={() => {
          handleRevoke(link.id);
        }}
        className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition group ${
          link.active === false || new Date(link.expiryDate) <= new Date()
            ? "opacity-50 cursor-not-allowed text-slate-500"
            : "text-red-400 hover:bg-red-400/10"
        }`}
      >
        <span className="w-7 h-7 rounded-lg bg-red-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-red-400/20 transition">
          <span
            className="material-symbols-outlined text-red-400"
            style={{ fontSize: 15 }}
          >
            link_off
          </span>
        </span>
        Revoke
      </button>
    </div>
  );

  return (
    <>
      {/* Stats Cards - Identical to FileTable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6">
        {[
          {
            label: "ACTIVE",
            value: stats.active,
            icon: "link",
            color: "text-green-400 bg-green-400/10",
          },
          {
            label: "EXPIRED",
            value: stats.expired,
            icon: "link_off",
            color: "text-red-400 bg-red-400/10",
          },
          {
            label: "VIEWS",
            value: stats.totalViews,
            icon: "visibility",
            color: "text-blue-400 bg-blue-400/10",
          },
          {
            label: "TOTAL SHARES",
            value: stats.files,
            icon: "share",
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
        {/* Toolbar - Identical to FileTable */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-white/5">
          <div className="relative w-full sm:w-64 md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shared links..."
              className="w-full bg-[#111] border border-white/10 rounded-xl text-white text-sm py-2 pl-9 pr-4 outline-none focus:border-violet-500/50 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="hidden sm:inline">Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-[#111] border border-white/10 rounded-lg text-white px-2 py-1 outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 ml-auto sm:ml-0">
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md transition ${view === "list" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                <span className="material-symbols-outlined text-base">
                  list
                </span>
              </button>
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md transition ${view === "grid" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                <span className="material-symbols-outlined text-base">
                  grid_view
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* LIST VIEW */}
        {view === "list" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase">
                    Shared Asset
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase">
                    Recipient
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase">
                    Expires
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="py-3 px-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.map((link) => {
                  const { icon, color } = getFileIcon(link.fileName);
                  const isExpired = new Date(link.expiryDate) <= new Date();

                  const isRevoked = link.active === false;

                  return (
                    <tr
                      key={link.id}
                      className="hover:bg-white/[0.02] transition"
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {icon}
                            </span>
                          </div>
                          <span className="text-white font-medium truncate max-w-[160px]">
                            {link.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-slate-400">
                        {link.recipientEmail}
                      </td>
                      <td className="py-3 px-6 text-slate-400">
                        {formatDate(link.expiryDate)}
                      </td>
                      <td className="py-3 px-6">
                        {isRevoked ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-400/10 text-gray-400 border border-gray-400/20 uppercase tracking-wider">
                            Revoked
                          </span>
                        ) : isExpired ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-400/10 text-red-400 border border-red-400/20 uppercase tracking-wider">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-400/10 text-green-400 border border-green-400/20 uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-6 relative menu-wrapper">
                        <button
                          onClick={() =>
                            setMenuOpenId(
                              menuOpenId === link.id ? null : link.id,
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                        >
                          <span className="material-symbols-outlined text-base">
                            more_vert
                          </span>
                        </button>
                        {menuOpenId === link.id && (
                          <ActionMenu link={link} position="bottom" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* GRID VIEW */}
        {view === "grid" && (
          <div className="p-4 md:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {paginated.map((link) => {
              const { icon, color } = getFileIcon(link.fileName);
              const isExpired = new Date(link.expiryDate) <= new Date();

              return (
                <div
                  key={link.id}
                  className="group relative flex flex-col rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/5 cursor-pointer transition overflow-hidden"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === link.id ? null : link.id);
                    }}
                    className="absolute top-2 right-2 z-10 p-1 rounded-lg text-white bg-black/40 opacity-0 group-hover:opacity-100 transition"
                  >
                    <span className="material-symbols-outlined text-base">
                      more_vert
                    </span>
                  </button>
                  <div
                    className={`w-full h-24 flex items-center justify-center ${color}`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 36 }}
                    >
                      {icon}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-white text-xs font-medium truncate mb-1">
                      {link.fileName}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">
                        Views: {link.viewCount || 0}
                      </p>
                      <span
                        className={`w-2 h-2 rounded-full ${isExpired ? "bg-red-500" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"}`}
                      ></span>
                    </div>
                  </div>
                  {menuOpenId === link.id && (
                    <div className="menu-wrapper">
                      <ActionMenu link={link} position="grid" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Pagination
          page={page}
          setPage={setPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          label={search ? "results" : "shared links"}
        />
      </div>
    </>
  );
}

export default SharedLinksTable;
