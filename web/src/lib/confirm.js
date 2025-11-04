export function confirm({
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm = () => {},
  onCancel = () => {},
} = {}) {
  // Minimal wrapper: fall back to native confirm for now
  const ok = window.confirm(`${title}\n\n${message}`);
  if (ok) onConfirm(); else onCancel();
  return ok;
}


