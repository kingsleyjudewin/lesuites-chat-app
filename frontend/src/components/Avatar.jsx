import { initials } from '../lib/format';

export function Avatar({ name, avatarUrl, size = 40, className = '' }) {
  const px = `${size}px`;
  if (avatarUrl) {
    return (
