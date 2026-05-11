import { useMemo } from "react";

function Pagination({ page, setPage, totalItems, pageSize, label = "items" }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const pageNumbers = useMemo(() => {
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
  }, [page, totalPages]);
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 md:px-6 py-4 border-t border-white/5">
      {/* Info */}
      <p className="text-slate-500 text-xs sm:text-sm text-center md:text-left">
        Showing{" "}
        <span className="text-white font-medium">
          {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}
        </span>{" "}
        to{" "}
        <span className="text-white font-medium">
          {Math.min(page * pageSize, totalItems)}
        </span>{" "}
        of <span className="text-white font-medium">{totalItems}</span> {label}
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-2">
        {/* Prev */}
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Prev
        </button>

        {/* First page */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => setPage(1)}
              className="w-8 h-8 rounded-lg text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              1
            </button>

            {pageNumbers[0] > 2 && (
              <span className="text-slate-600 px-1">...</span>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-8 h-8 rounded-lg text-xs sm:text-sm font-medium transition ${
              p === page
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {p}
          </button>
        ))}

        {/* Last page */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="text-slate-600 px-1">...</span>
            )}

            <button
              onClick={() => setPage(totalPages)}
              className="w-8 h-8 rounded-lg text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
export default Pagination;
