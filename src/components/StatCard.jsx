/**
 * Reusable StatCard component for Dashboard analytics with icon and subtext
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  variant = 'default',
}) {
  return (
    <div className={`tile stat-tile ${variant}`}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      <b className="stat-value">{value}</b>
      {(subtitle || badge) && (
        <div className="stat-footer">
          {badge && <span className="stat-badge">{badge}</span>}
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
