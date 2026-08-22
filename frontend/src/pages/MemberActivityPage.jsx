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
      } else {
        setConnectionStatus('pending_received');
      }
      setConnectionRequestId(existing?.id || null);
    })();
  }, [selectedId, me.id]);

  async function sendConnectionRequest() {
    const req = await api.post('/connections/requests', { receiverId: selectedId });
    setConnectionStatus('pending_sent');
    setConnectionRequestId(req.id);
  }

  async function acceptConnectionRequest() {
    await api.patch(`/connections/requests/${connectionRequestId}`, { status: 'accepted' });
    setConnectionStatus('accepted');
  }

  async function messageMember() {
    await api.post('/conversations', { type: 'direct', participantId: selectedId });
    navigate('/messages');
  }

  const level = sidebarStats ? activityLevel(sidebarStats) : null;

  return (
    <div className="bg-background text-on-background font-body-lg antialiased min-h-screen overflow-hidden flex">
      <Sidebar />

      <main className="flex-1 md:ml-80 h-screen flex relative">
        <section className="flex-1 h-full overflow-y-auto px-margin-safe py-margin-safe lg:p-[40px] flex flex-col max-w-4xl">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight mb-2">Member Activity</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                Real-time network intelligence and executive movements across your trusted circles.
              </p>
            </div>
            <div className="flex bg-surface-container-high rounded-full p-1 border border-white/5 backdrop-blur-md self-start md:self-auto shrink-0">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  type="button"
                  className={`px-6 py-2 rounded-full font-label-caps text-label-caps capitalize transition-colors ${
                    filter === f ? 'bg-surface-variant text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max pb-20">
            {members.length === 0 && <p className="font-body-sm text-body-sm text-on-surface-variant/60">No members found.</p>}
            {members.map((m) => {
              const status = resolveStatus(m);
              const online = status === 'online';
              return (
                <article
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
