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

