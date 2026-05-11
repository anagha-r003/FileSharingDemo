import { PAGE_SIZE_OPTIONS } from "../../../common/constants/fileTypes";

function SharedLinksToolbar({
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  view,
  onViewChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-white/5">
      <div className="relative w-full sm:w-64 md:w-72">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder="Search shared links..."
          className="w-full bg-[#111] border border-white/10 rounded-xl text-white text-sm py-2 pl-9 pr-4 outline-none focus:border-violet-500/50 transition"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="hidden sm:inline">Show</span>
          <select
            value={pageSize}
            onChange={onPageSizeChange}
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
            onClick={() => onViewChange("list")}
            className={`p-1.5 rounded-md transition ${view === "list" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            <span className="material-symbols-outlined text-base">list</span>
          </button>
          <button
            onClick={() => onViewChange("grid")}
            className={`p-1.5 rounded-md transition ${view === "grid" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            <span className="material-symbols-outlined text-base">
              grid_view
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SharedLinksToolbar;
