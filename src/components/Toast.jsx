import { useEffect } from 'react';

/**
 * Reusable notification banner / toast with auto-dismiss
 */
export default function Toast({
  message,
  type = 'info', // 'success' | 'error' | 'info'
  duration = 4000,
  onClose,
}) {
  useEffect(() => {
    if (!message || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-banner toast-${type}`} role="alert">
      <span className="toast-icon">
        {type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}
      </span>
      <span className="toast-message">{message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Close message"
      >
        ×
      </button>
    </div>
  );
}
