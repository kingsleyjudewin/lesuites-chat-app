export function PresenceDot({ status, size = 14, className = '' }) {
  if (!status || status === 'offline') return null;
  const color = status === 'online' ? 'bg-primary' : 'bg-tertiary';
  const pulse = status === 'online' ? 'presence-dot' : '';
