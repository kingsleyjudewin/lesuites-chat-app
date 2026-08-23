import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Avatar } from '../components/Avatar';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { api } from '../lib/api';
import { relativeTime, timeOnly } from '../lib/format';

export function BoardroomPage() {
  const { user } = useAuth();
  const { socket, resolveStatus } = useSocketContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const [boardrooms, setBoardrooms] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDetailsMobile, setShowDetailsMobile] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  async function loadBoardrooms() {
    const list = await api.get('/boardrooms');
    setBoardrooms(list);
    return list;
  }

  useEffect(() => {
    loadBoardrooms();
  }, []);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreate(true);
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return;
    boardrooms.forEach((b) => socket.emit('join_boardroom', b.id));
  }, [socket, boardrooms]);

  useEffect(() => {
    setShowDetailsMobile(false);
    if (!selectedId) {
      setDetail(null);
      setMessages([]);
      return;
    }
    (async () => {
      const [d, m] = await Promise.all([api.get(`/boardrooms/${selectedId}`), api.get(`/boardrooms/${selectedId}/messages`)]);
      setDetail(d);
      setMessages(m);
    })();
  }, [selectedId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return undefined;
    const onReceive = (message) => {
      if (message.contextType === 'boardroom' && message.contextId === selectedId) setMessages((list) => [...list, message]);
    };
    const onEdited = (message) => setMessages((list) => list.map((m) => (m.id === message.id ? message : m)));
    const onDeleted = ({ messageId }) => setMessages((list) => list.filter((m) => m.id !== messageId));
    const onMemberAdded = ({ boardroomId }) => {
      if (boardroomId === selectedId) api.get(`/boardrooms/${boardroomId}`).then(setDetail);
    };
    const onMemberRemoved = ({ boardroomId, userId }) => {
      if (boardroomId === selectedId) {
        if (userId === user.id) setSelectedId(null);
        else api.get(`/boardrooms/${boardroomId}`).then(setDetail);
      }
    };

    socket.on('receive_message', onReceive);
    socket.on('message_edited', onEdited);
    socket.on('message_deleted', onDeleted);
    socket.on('boardroom_member_added', onMemberAdded);
    socket.on('boardroom_member_removed', onMemberRemoved);
    return () => {
      socket.off('receive_message', onReceive);
      socket.off('message_edited', onEdited);
      socket.off('message_deleted', onDeleted);
      socket.off('boardroom_member_added', onMemberAdded);
      socket.off('boardroom_member_removed', onMemberRemoved);
    };
  }, [socket, selectedId, user.id]);

  function sendMessage(e) {
    e.preventDefault();
    if (!draft.trim() || !socket || !selectedId) return;
    socket.emit('send_message', { contextType: 'boardroom', contextId: selectedId, text: draft.trim() }, (ack) => {
      if (!ack.success) setError(ack.error || 'Failed to send message');
    });
    setDraft('');
  }

  async function leaveBoardroom() {
    await api.post(`/boardrooms/${selectedId}/leave`);
    setSelectedId(null);
    await loadBoardrooms();
  }

  async function removeMember(memberId) {
    await api.delete(`/boardrooms/${selectedId}/members/${memberId}`);
    setDetail(await api.get(`/boardrooms/${selectedId}`));
  }

  const myMembership = detail?.members.find((m) => m.userId.id === user.id);
  const isOwner = myMembership?.role === 'owner';
  const onlineCount = detail ? detail.members.filter((m) => resolveStatus(m.userId) === 'online').length : 0;
  const membersById = useMemo(() => Object.fromEntries((detail?.members || []).map((m) => [m.userId.id, m.userId])), [detail]);
  const filteredBoardrooms = boardrooms.filter((b) => b.name.toLowerCase().includes(filter.toLowerCase()));

  const detailsContent = detail && (
    <>
      <p className="font-body-sm text-body-sm text-on-surface-variant/80 mb-6">{detail.description || 'No description provided.'}</p>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-title-md text-title-md">Members</h4>
        <span className="font-label-caps text-label-caps bg-surface-container py-1 px-2 rounded-full border border-white/5">{detail.members.length} Total</span>
      </div>
      {isOwner && (
        <button
          onClick={() => setShowAddMember(true)}
          type="button"
          className="w-full mb-4 flex items-center justify-center gap-2 text-primary font-label-caps text-label-caps py-2 rounded-lg border border-primary/30 hover:bg-primary/10"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          Add Member
        </button>
      )}
      <div className="gold-separator mb-4" />
      <div className="space-y-4">
        {detail.members.map((m) => (
          <div key={m.userId.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
            <Avatar name={m.userId.username} avatarUrl={m.userId.avatarUrl} size={40} className="border border-outline/20" />
            <div className="flex-1 min-w-0">
              <div className="font-title-md text-title-md text-sm truncate">{m.userId.username}</div>
              <div className="font-label-caps text-label-caps text-primary/70 truncate">{m.userId.title || m.role}</div>
            </div>
            {isOwner && m.role !== 'owner' && (
              <button onClick={() => removeMember(m.userId.id)} type="button" className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-opacity">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="font-body-lg overflow-hidden flex h-screen text-on-surface bg-surface-container-lowest">
      <Sidebar />

      <main className="md:ml-80 flex-1 flex h-screen overflow-hidden">
        <section className={`w-full md:w-96 glass-panel border-r border-white/5 flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-gutter pb-4">
            <h2 className="font-headline-lg text-headline-lg mb-6">Boardrooms</h2>
            <div className="relative mb-6">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="w-full bg-[#121212] border-none border-b border-outline/30 text-on-surface font-body-lg pl-12 pr-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-t-lg"
                placeholder="Search discussions..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowCreate(true)}
              type="button"
              className="w-full bg-surface-container-high border border-outline/30 hover:border-primary/50 text-primary font-title-md text-title-md py-3 rounded-lg gold-glint flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              Create Boardroom
            </button>
          </div>
          <div className="gold-separator mx-gutter mb-4" />
          <div className="flex-1 overflow-y-auto px-gutter pb-24 md:pb-gutter space-y-3">
            {filteredBoardrooms.length === 0 && <p className="font-body-sm text-body-sm text-on-surface-variant/60">No boardrooms yet.</p>}
            {filteredBoardrooms.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className={`p-4 rounded-xl cursor-pointer marble-bg relative overflow-hidden transition-colors ${
                  b.id === selectedId ? 'bg-surface-container/50 border border-primary/50' : 'bg-surface/30 border border-white/5 hover:border-outline/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-title-md text-title-md ${b.id === selectedId ? 'text-primary' : ''}`}>{b.name}</h3>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">{b.members.length} members</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant/70 truncate">{b.description || 'No description.'}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`flex-1 flex-col relative ${selectedId ? 'flex' : 'hidden md:flex'}`}>
          {!detail ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant/60 font-title-md text-title-md">
              Select a boardroom to begin.
            </div>
          ) : (
            <>
              <header className="h-20 glass-panel border-b border-white/5 px-gutter flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label="Back to boardrooms"
                    className="md:hidden text-on-surface-variant hover:text-primary transition-colors"
                    onClick={() => setSelectedId(null)}
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">corporate_fare</span>
                  </div>
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-lg">{detail.name}</h2>
                    <div className="font-label-caps text-label-caps text-on-surface-variant/70 mt-1">{onlineCount} Members Online</div>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Boardroom details"
                  className="md:hidden text-on-surface-variant hover:text-primary transition-colors"
                  onClick={() => setShowDetailsMobile(true)}
                >
                  <span className="material-symbols-outlined">info</span>
                </button>
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-gutter space-y-6 flex flex-col relative z-0">
                {messages.map((m) => {
                  const mine = m.senderId === user.id;
                  const sender = membersById[m.senderId];
                  const verified = m.readBy?.length > 0;
                  return mine ? (
                    <div key={m.id} className="flex gap-4 max-w-[80%] self-end flex-row-reverse">
                      <div className="flex flex-col gap-1 items-end">
                        <span className="font-label-caps text-label-caps text-on-surface-variant/60 mr-2">You · {timeOnly(m.createdAt)}</span>
                        <div className="bg-gradient-to-br from-primary-container/20 to-surface-container border border-primary/30 rounded-2xl rounded-br-none p-4 font-body-lg text-on-surface">
                          {m.text}
                        </div>
                        {verified && (
                          <div className="flex items-center gap-1 mt-1 mr-2">
                            <span className="font-label-caps text-label-caps text-primary/70 text-[10px]">Verified</span>
                            <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex gap-4 max-w-[80%]">
                      <Avatar name={sender?.username} avatarUrl={sender?.avatarUrl} size={40} className="border border-outline/20 self-end" />
                      <div className="flex flex-col gap-1">
                        <span className="font-label-caps text-label-caps text-on-surface-variant/60 ml-2">
                          {sender?.username || '…'} · {timeOnly(m.createdAt)}
                        </span>
                        <div className="bg-surface-container/40 backdrop-blur-md border border-white/10 rounded-2xl rounded-bl-none p-4 font-body-lg text-on-surface">
                          {m.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && <p className="px-gutter font-body-sm text-body-sm text-error">{error}</p>}

              <div className="p-gutter pt-0 pb-24 md:pb-2 relative z-10">
                <form onSubmit={sendMessage} className="glass-panel rounded-xl p-2 flex items-end gap-2 border border-white/10 focus-within:border-primary/50 transition-colors">
                  <textarea
                    className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 text-on-surface font-body-lg placeholder-on-surface-variant/50"
                    placeholder="Draft communication..."
                    rows={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) sendMessage(e);
                    }}
                  />
                  <button type="submit" className="p-3 bg-primary text-on-primary rounded-lg gold-glint flex items-center justify-center">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </section>

        {detail && (
          <section className="hidden md:flex w-80 glass-panel border-l border-white/5 flex-col">
            <div className="p-gutter overflow-y-auto flex-1">
              <h3 className="font-headline-lg text-headline-lg mb-2">Details</h3>
              {detailsContent}
            </div>
            <div className="p-gutter border-t border-white/5">
              <button onClick={leaveBoardroom} type="button" className="w-full flex items-center justify-center gap-2 text-error font-title-md text-title-md py-3 rounded-lg hover:bg-error/10 transition-colors border border-transparent hover:border-error/20">
                <span className="material-symbols-outlined">logout</span>
                Leave Boardroom
              </button>
            </div>
          </section>
        )}
      </main>

      {showDetailsMobile && detail && (
        <Modal title="Boardroom Details" onClose={() => setShowDetailsMobile(false)}>
          {detailsContent}
          <button
            onClick={leaveBoardroom}
            type="button"
            className="w-full mt-6 flex items-center justify-center gap-2 text-error font-title-md text-title-md py-3 rounded-lg hover:bg-error/10 transition-colors border border-error/20"
          >
            <span className="material-symbols-outlined">logout</span>
            Leave Boardroom
          </button>
        </Modal>
      )}

      {showCreate && (
        <CreateBoardroomModal
          onClose={() => setShowCreate(false)}
          onCreated={async (id) => {
            setShowCreate(false);
            await loadBoardrooms();
            setSelectedId(id);
          }}
        />
      )}
      {showAddMember && detail && (
        <AddMemberModal
          existingIds={detail.members.map((m) => m.userId.id)}
          onClose={() => setShowAddMember(false)}
          onAdded={async () => {
            setShowAddMember(false);
            setDetail(await api.get(`/boardrooms/${selectedId}`));
          }}
          boardroomId={selectedId}
        />
      )}
    </div>
  );
}

function CreateBoardroomModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!query.trim()) return setResults([]);
    const handle = setTimeout(async () => {
      const r = await api.get(`/users?q=${encodeURIComponent(query.trim())}`);
      setResults(r.items.filter((u) => u.id !== user.id));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, user.id]);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const boardroom = await api.post('/boardrooms', { name, description, memberIds: selected.map((m) => m.id) });
      onCreated(boardroom.id);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Create Boardroom" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full glass-input bg-transparent border-0 border-b border-outline-variant/30 text-on-surface font-body-lg py-3 px-2 focus:ring-0"
          placeholder="Boardroom name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full glass-input bg-transparent border-0 border-b border-outline-variant/30 text-on-surface font-body-lg py-3 px-2 focus:ring-0 resize-none"
          placeholder="Description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="relative">
          <input
            className="w-full glass-input bg-transparent border-0 border-b border-outline-variant/30 text-on-surface font-body-lg py-3 px-2 focus:ring-0"
            placeholder="Add members..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {results.length > 0 && (
            <div className="absolute z-10 w-full bg-surface-container-high border border-outline-variant/30 rounded-lg mt-1 max-h-40 overflow-y-auto">
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-white/5 font-body-sm text-body-sm"
                  onClick={() => {
                    if (!selected.find((s) => s.id === r.id)) setSelected([...selected, r]);
                    setQuery('');
                    setResults([]);
                  }}
                >
                  {r.username}
                </button>
              ))}
            </div>
          )}
        </div>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((m) => (
              <span key={m.id} className="px-3 py-1 rounded-full bg-surface-variant text-on-surface font-label-caps text-[11px] flex items-center gap-1">
                {m.username}
                <button type="button" onClick={() => setSelected(selected.filter((s) => s.id !== m.id))}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <button className="btn-gold w-full rounded-lg py-3 font-title-md text-title-md" type="submit" disabled={submitting || !name.trim()}>
          {submitting ? 'Creating...' : 'Create Boardroom'}
        </button>
      </form>
    </Modal>
  );
}

function AddMemberModal({ boardroomId, existingIds, onClose, onAdded }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) return setResults([]);
    const handle = setTimeout(async () => {
      const r = await api.get(`/users?q=${encodeURIComponent(query.trim())}`);
      setResults(r.items.filter((u) => !existingIds.includes(u.id)));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, existingIds]);

  async function add(userId) {
    await api.post(`/boardrooms/${boardroomId}/members`, { userId });
    onAdded();
  }

  return (
    <Modal title="Add Member" onClose={onClose}>
      <input
        className="w-full glass-input bg-transparent border-0 border-b border-outline-variant/30 text-on-surface font-body-lg py-3 px-2 focus:ring-0 mb-4"
        placeholder="Search members..."
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="space-y-2">
        {results.map((r) => (
          <button key={r.id} type="button" onClick={() => add(r.id)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left">
            <Avatar name={r.username} avatarUrl={r.avatarUrl} size={36} />
            <span className="font-body-lg text-body-lg">{r.username}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
