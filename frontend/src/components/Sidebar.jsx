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
    <>
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
          type="button"
          className="w-full py-4 rounded bg-gradient-to-r from-primary-container to-primary text-on-primary font-title-md text-title-md gold-glint shadow-[0_0_20px_rgba(212,175,55,0.2)]"
        >
          New Briefing
        </button>
        <button
          onClick={logout}
          type="button"
          className="w-full py-3 rounded bg-surface-bright text-on-surface-variant font-label-caps text-label-caps tracking-widest border border-outline-variant/50 hover:border-error/50 hover:text-error transition-all duration-300"
        >
          Sign Out
        </button>
      </div>
      </nav>

      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 z-40 bg-surface-container-lowest/95 backdrop-blur-2xl border-t border-white/5 items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 h-full ${isActive ? 'text-primary' : 'text-on-surface-variant/60'}`
            }
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="font-label-caps text-[9px] tracking-wide">{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
        <button onClick={logout} type="button" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-on-surface-variant/60">
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <span className="font-label-caps text-[9px] tracking-wide">Sign Out</span>
        </button>
      </nav>
    </>
  );
}
