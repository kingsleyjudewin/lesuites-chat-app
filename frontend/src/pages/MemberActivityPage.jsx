import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { api } from '../lib/api';
import { activityLevel, relativeTime } from '../lib/format';

const FILTERS = ['all', 'online', 'offline'];

const ACTIVITY_LABEL = {
  joined_boardroom: 'Joined a boardroom.',
  left_boardroom: 'Left a boardroom.',
  connected_with: 'Connected with a fellow member.',
  profile_updated: 'Updated their profile.',
};

export function MemberActivityPage() {
  const { user: me } = useAuth();
  const { resolveStatus, resolveLastSeen } = useSocketContext();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('all');
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [feed, setFeed] = useState([]);
  const [sidebarStats, setSidebarStats] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null); // null | 'pending_sent' | 'pending_received' | 'accepted'
  const [connectionRequestId, setConnectionRequestId] = useState(null);

  useEffect(() => {
    (async () => {
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const result = await api.get(`/users${query}`);
      setMembers(result.items.filter((u) => u.id !== me.id));
    })();
  }, [filter, me.id]);

  useEffect(() => {
    if (!selectedId) {
      setProfile(null);
      return;
    }
    (async () => {
      const [p, activityFeed, stats, connections] = await Promise.all([
        api.get(`/users/${selectedId}`),
        api.get(`/activity/${selectedId}`),
        api.get(`/activity/${selectedId}/sidebar`),
        api.get('/connections'),
      ]);
      setProfile(p);
      setFeed(activityFeed);
      setSidebarStats(stats);

      const existing = connections.find((c) => (c.sender === selectedId || c.receiver === selectedId) && (c.sender === me.id || c.receiver === me.id));
      if (!existing) {
        setConnectionStatus(null);
      } else if (existing.status === 'accepted') {
        setConnectionStatus('accepted');
      } else if (existing.sender === me.id) {
        setConnectionStatus('pending_sent');
