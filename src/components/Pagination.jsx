/**
 * Reusable pagination component for lists and tables
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(totalItems, currentPage * pageSize);

  if (totalItems === 0) return null;

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        Showing <b>{start}</b> to <b>{end}</b> of <b>{totalItems}</b> records
      </div>
      <div className="pagination-controls">
        <label className="page-size-picker">
          Per page:
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          &laquo; Prev
        </button>
        <span className="page-current">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          Next &raquo;
        </button>
      </div>
    </div>
  );
}
