export default function FormField({ label, hint, error, required, htmlFor, children }) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={htmlFor} className="text-sm text-primary">
          {label}
          {required && <span className="text-danger" aria-label="required" style={{ color: 'var(--danger-text)' }}> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs" style={{ color: 'var(--danger-text)' }}>{error}</p>}
    </div>
  );
}


