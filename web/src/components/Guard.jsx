import { useAuthStore } from '../store/authStore.js';

export default function Guard({ perm, children, fallback = null, mode = 'hide' }) {
  const can = useAuthStore((s) => s.can);
  const allowed = can(perm);
  if (allowed) return children;
  if (mode === 'disable') return (
    <span aria-disabled className="opacity-50 pointer-events-none" title="You don't have permission">{children}</span>
  );
  return fallback;
}




