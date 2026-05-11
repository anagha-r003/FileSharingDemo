import { formatDate } from "../../../common/utils/fileUtils";

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

function SharedLinksListView({
  paginated,
  menuOpenId,
  onMenuToggle,
  getFileIcon,
  onCopy,
  onRevoke,
}) {
  return (
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

            return (
              <tr key={link.id} className="hover:bg-white/[0.02] transition">
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
                  {isExpired ? (
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
                      onMenuToggle(menuOpenId === link.id ? null : link.id)
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                  >
                    <span className="material-symbols-outlined text-base">
                      more_vert
                    </span>
                  </button>
                  {menuOpenId === link.id && (
                    <ActionMenu
                      link={link}
                      position="bottom"
                      onCopy={onCopy}
                      onRevoke={onRevoke}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SharedLinksListView;
