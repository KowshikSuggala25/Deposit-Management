const Pagination = ({ pagination, onPageChange }) => {
  const { page, totalPages, total } = pagination;

  if (total <= pagination.limit) {
    return null;
  }

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
      <p>{`Page ${page} of ${totalPages}`}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page <= 1}
          className="rounded-lg border border-white/40 bg-white/60 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
          className="rounded-lg border border-white/40 bg-white/60 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
