export function PresenceDot({ status, size = 14, className = '' }) {
  if (!status || status === 'offline') return null;
  const color = status === 'online' ? 'bg-primary' : 'bg-tertiary';
  const pulse = status === 'online' ? 'presence-dot' : '';
  return <div className={`${color} ${pulse} rounded-full border-2 border-surface ${className}`} style={{ width: size, height: size }} />;
