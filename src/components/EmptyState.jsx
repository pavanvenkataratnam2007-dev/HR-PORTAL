/**
 * Reusable Empty State component with icon, explanation, and action button.
 */
export default function EmptyState({
  icon = '📋',
  title = 'No records found',
  description = 'Try clearing your active filters or adding a new record.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button type="button" className="primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
