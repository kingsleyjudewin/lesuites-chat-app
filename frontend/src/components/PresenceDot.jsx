export function PresenceDot({ status, size = 14, className = '' }) {
  if (!status || status === 'offline') return null;
