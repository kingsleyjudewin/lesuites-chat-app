import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const CARDS = [
  { key: 'conversations', icon: 'chat_bubble', label: 'Messages', to: '/messages', title: 'Total Conversations' },
  { key: 'boardrooms', icon: 'groups', label: 'Board Room', to: '/boardrooms', title: 'Active Discussions' },
  { key: 'online', icon: 'group_work', label: 'Member Activity', to: '/members', title: 'Members Online' },
];

export function HomePage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ conversations: null, boardrooms: null, online: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [conversations, boardrooms, onlineUsers] = await Promise.all([
        api.get('/conversations'),
        api.get('/boardrooms'),
        api.get('/users?status=online&limit=1'),
      ]);
      if (!cancelled) {
        setCounts({ conversations: conversations.length, boardrooms: boardrooms.length, online: onlineUsers.total });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-background text-on-surface min-h-screen flex font-body-lg overflow-hidden antialiased">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0805] via-background to-[#050402]" />
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full mix-blend-screen opacity-30" />
      </div>

      <Sidebar />

      <main className="md:ml-80 w-full min-h-screen relative z-10 flex flex-col justify-center items-center px-margin-safe pt-panel-padding pb-24 md:pb-panel-padding">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="relative w-48 h-48 mb-12 rounded-full glass-panel flex items-center justify-center shadow-2xl shadow-primary/5 border border-primary/20">
            <span className="font-display-lg text-display-lg text-primary">LS</span>
            <div className="absolute inset-0 rounded-full border border-primary/10 scale-110" />
            <div className="absolute inset-0 rounded-full border border-primary/5 scale-125" />
          </div>

          <h2 className="font-display-lg text-display-lg text-on-surface mb-6 tracking-tight">
            Welcome Back, <span className="gold-text-gradient">{user?.username}</span>
          </h2>
          <p className="font-title-md text-title-md text-on-surface-variant max-w-2xl mx-auto opacity-80 leading-relaxed">
            Exclusive communication. Private conversations. Trusted members.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full mt-24">
            {CARDS.map((card) => (
              <Link
                key={card.key}
                to={card.to}
                className="glass-panel rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-full bg-surface-bright/50 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-primary text-2xl">{card.icon}</span>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase mb-2">{card.label}</span>
                <span className="font-display-lg text-[32px] text-on-surface mb-1">{counts[card.key] ?? '—'}</span>
                <span className="font-title-md text-title-md text-on-surface opacity-90 group-hover:text-primary transition-colors">
                  {card.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
