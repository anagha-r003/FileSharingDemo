function ActionMenu({ link, position, onCopy, onRevoke }) {
  return (
    <div
      className={`absolute ${position === "grid" ? "top-8 right-2" : "right-0 top-full mt-1"} z-50 w-44 bg-[#1e2130] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1`}
    >
      <button
        onClick={() => onCopy(link.shareUrl)}
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
        onClick={() => onRevoke(link.id)}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition group"
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
}

function SharedLinksGridView({
  paginated,
  menuOpenId,
  onMenuToggle,
  getFileIcon,
  onCopy,
  onRevoke,
}) {
  return (
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
                onMenuToggle(menuOpenId === link.id ? null : link.id);
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
                <ActionMenu
                  link={link}
                  position="grid"
                  onCopy={onCopy}
                  onRevoke={onRevoke}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SharedLinksGridView;
