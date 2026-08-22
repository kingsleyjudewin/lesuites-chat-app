import { NavLink, useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/messages', label: 'Messages', icon: 'chat_bubble' },
  { to: '/boardrooms', label: 'Boardroom', icon: 'account_balance' },
  { to: '/members', label: 'Member Activity', icon: 'diversity_3' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="hidden md:flex h-screen w-80 fixed left-0 top-0 z-40 bg-surface-container-lowest/90 backdrop-blur-2xl border-r border-white/5 shadow-[40px_0_60px_-15px_rgba(0,0,0,0.5)] flex-col py-panel-padding">
