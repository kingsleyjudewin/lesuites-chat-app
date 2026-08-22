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

  return (
    <div className="font-body-lg overflow-hidden flex h-screen text-on-surface bg-surface-container-lowest">
      <Sidebar />

      <main className="ml-80 flex-1 flex h-screen overflow-hidden">
        <section className="w-96 glass-panel border-r border-white/5 flex flex-col">
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
          <div className="flex-1 overflow-y-auto px-gutter pb-gutter space-y-3">
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

        <section className="flex-1 flex flex-col relative">
          {!detail ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant/60 font-title-md text-title-md">
              Select a boardroom to begin.
            </div>
          ) : (
            <>
              <header className="h-20 glass-panel border-b border-white/5 px-gutter flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">corporate_fare</span>
                  </div>
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-lg">{detail.name}</h2>
                    <div className="font-label-caps text-label-caps text-on-surface-variant/70 mt-1">{onlineCount} Members Online</div>
                  </div>
                </div>
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

