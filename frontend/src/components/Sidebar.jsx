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
      <div className="px-8 mb-10 flex items-center gap-4">
        <Avatar name={user?.username} avatarUrl={user?.avatarUrl} size={48} className="border border-outline-variant/30" />
        <div className="min-w-0">
          <h2 className="font-title-md text-title-md text-on-surface truncate">{user?.username}</h2>
          <p className="font-body-sm text-body-sm text-primary flex items-center gap-1 mt-1 truncate">
            <span className="material-symbols-outlined text-[14px] shrink-0">verified</span>
            <span className="truncate">{user?.title || 'Verified Member'}</span>
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group flex items-center gap-4 px-8 py-4 font-title-md text-title-md transition-all duration-300 ${
                isActive
                  ? 'text-primary border-r-2 border-primary bg-gradient-to-r from-primary/10 to-transparent'
                  : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-white/5'
              }`
            }
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform duration-500">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="px-8 mt-4 flex flex-col gap-3">
        <button
          onClick={() => navigate('/boardrooms?create=1')}
