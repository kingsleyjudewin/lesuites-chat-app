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
