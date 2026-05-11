import { getPaginationRange } from "../../../common/utils/formatUtils";

function FileTablePagination({
  page,
  totalPages,
  pageSize,
  filteredCount,
  searchQuery,
  onPageChange,
}) {
  const pageNumbers = getPaginationRange(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-6 py-4 border-t border-white/5">
      <p className="text-slate-500 text-xs md:text-sm text-center sm:text-left">
        Showing{" "}
        <span className="text-white font-medium">
          {filteredCount === 0 ? 0 : (page - 1) * pageSize + 1}
        </span>{" "}
        to{" "}
        <span className="text-white font-medium">
          {Math.min(page * pageSize, filteredCount)}
        </span>{" "}
        of <span className="text-white font-medium">{filteredCount}</span>{" "}
        {searchQuery ? "results" : "files"}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Prev
        </button>
        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs md:text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className="text-slate-600 px-1">...</span>
            )}
          </>
        )}
        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs md:text-sm font-medium transition ${p === page ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            {p}
          </button>
        ))}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="text-slate-600 px-1">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs md:text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default FileTablePagination;
