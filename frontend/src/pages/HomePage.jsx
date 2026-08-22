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
