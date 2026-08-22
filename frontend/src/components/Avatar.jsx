import { initials } from '../lib/format';

export function Avatar({ name, avatarUrl, size = 40, className = '' }) {
  const px = `${size}px`;
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || ''}
        className={`rounded-full object-cover ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }
  return (
    <div
      className={`rounded-full bg-surface-bright border border-outline-variant/40 flex items-center justify-center text-primary font-title-md shrink-0 ${className}`}
      style={{ width: px, height: px, fontSize: Math.max(11, size * 0.36) }}
