export default function StatusBadge({ status }) {
  const badgeStyles = {
    'Complete': { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-text)' },
    'Pending': { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: 'var(--warning-text)' },
    'In Transit': { bg: 'var(--info-bg)', text: 'var(--info-text)', border: 'var(--info-text)' },
    'Issued': { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-text)' },
    'Approved': { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-text)' },
  };
  const defaultStyle = { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)', border: 'var(--border-color)' };
  const style = badgeStyles[status] || defaultStyle;
  
  return (
    <span 
      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
        opacity: 0.9
      }}
    >
      {status}
    </span>
  );
}

