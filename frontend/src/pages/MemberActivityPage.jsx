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
                  className="group relative bg-surface-container/40 backdrop-blur-lg border border-white/5 hover:border-primary/30 rounded-xl p-5 cursor-pointer transition-all duration-500 hover:bg-surface-container/60 hover:-translate-y-1"
                >
                  <div className="flex gap-4 items-center relative z-10">
                    <div className="relative">
                      <Avatar
                        name={m.username}
                        avatarUrl={m.avatarUrl}
                        size={56}
                        className={`border border-white/10 ${!online ? 'grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100' : ''}`}
                      />
                      {online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary rounded-full border-2 border-surface presence-dot" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-title-md text-title-md text-on-surface truncate group-hover:text-primary transition-colors">{m.username}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{m.title || 'Member'}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                    <div className="flex gap-2 flex-wrap">
                      {(m.tags || []).slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant font-label-caps text-[10px] uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className={`font-body-sm text-body-sm ${online ? 'text-primary/80' : 'text-on-surface-variant/50'}`}>
                      {online ? 'Active now' : resolveLastSeen(m) ? relativeTime(resolveLastSeen(m)) : ''}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {profile && (
          <aside className="fixed inset-0 z-50 w-full h-full bg-surface-container-low/95 backdrop-blur-3xl flex flex-col xl:static xl:inset-auto xl:z-20 xl:w-[480px] xl:h-full xl:bg-surface-container-low/60 xl:border-l xl:border-white/5">
            <button className="absolute top-6 right-6 text-on-surface-variant hover:text-primary transition-colors" onClick={() => setSelectedId(null)} type="button">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="p-10 pb-6 border-b border-white/5">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <Avatar name={profile.username} avatarUrl={profile.avatarUrl} size={128} className="border-2 border-primary/20" />
                {resolveStatus(profile) === 'online' && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-primary rounded-full border-2 border-surface-container-low presence-dot" />
                )}
              </div>
              <div className="text-center">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">{profile.username}</h2>
                <p className="font-title-md text-title-md text-primary/80 mb-4">{profile.title || 'Member'}</p>
                <div className="flex justify-center gap-2 mb-6 flex-wrap">
                  {(profile.tags || []).map((tag) => (
                    <span key={tag} className="px-3 py-1.5 rounded-sm border border-outline-variant/30 text-on-surface font-label-caps text-[11px] uppercase tracking-widest bg-surface/50">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={messageMember}
                  type="button"
                  className="w-full py-4 rounded-lg bg-gradient-to-r from-primary-container/20 to-transparent border border-primary/30 text-primary font-title-md text-[15px] hover:bg-primary/10 hover:border-primary transition-all duration-300 flex items-center justify-center gap-2 mb-3"
                >
                  <span className="material-symbols-outlined text-[20px]">forum</span>
                  Message Member
                </button>
                {connectionStatus === 'accepted' ? (
                  <div className="w-full py-2 text-center font-label-caps text-label-caps text-tertiary">Connected</div>
                ) : connectionStatus === 'pending_sent' ? (
                  <div className="w-full py-2 text-center font-label-caps text-label-caps text-on-surface-variant">Request Pending</div>
                ) : connectionStatus === 'pending_received' ? (
                  <button onClick={acceptConnectionRequest} type="button" className="w-full py-3 rounded-lg border border-primary/30 text-primary font-label-caps text-label-caps">
                    Accept Connection Request
                  </button>
                ) : (
                  <button onClick={sendConnectionRequest} type="button" className="w-full py-3 rounded-lg border border-outline-variant/50 text-on-surface-variant hover:border-primary/50 hover:text-primary font-label-caps text-label-caps transition-colors">
                    Send Connection Request
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 pt-6 flex flex-col gap-8">
              <div>
                <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-[0.2em]">Network Intelligence</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container/30 rounded-lg p-4 border border-white/5">
                    <div className="font-display-lg text-[32px] leading-tight text-on-surface mb-1">{sidebarStats?.boardroomsJoined ?? '—'}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Boardrooms Joined</div>
                  </div>
                  <div className="bg-surface-container/30 rounded-lg p-4 border border-white/5">
                    <div className="font-display-lg text-[32px] leading-tight text-primary mb-1">{level ?? '—'}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Activity Level</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-[0.2em]">Recent Activity</h3>
                {feed.length === 0 ? (
                  <p className="font-body-sm text-body-sm text-on-surface-variant/60">No recent activity.</p>
                ) : (
                  <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-gradient-to-b before:from-primary/30 before:to-transparent">
                    {feed.map((entry, i) => (
                      <div key={entry.id} className="relative pl-8">
                        <div className={`absolute left-[5px] top-1.5 w-2 h-2 rounded-full ${i === 0 ? 'bg-primary shadow-[0_0_10px_rgba(242,202,80,0.5)]' : 'bg-outline-variant'}`} />
                        <p className="font-body-sm text-body-sm text-on-surface mb-1">{ACTIVITY_LABEL[entry.type] || entry.type}</p>
                        <p className="font-label-caps text-[10px] text-on-surface-variant/60">{relativeTime(entry.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-[0.2em]">Professional Nexus</h3>
                <div className="bg-surface-container/20 rounded-xl border border-white/5 p-5">
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{profile.bio || 'No bio provided yet.'}</p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
