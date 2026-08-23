import { useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Avatar } from '../components/Avatar';
import { PresenceDot } from '../components/PresenceDot';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { api } from '../lib/api';
import { relativeTime, timeOnly } from '../lib/format';

function otherParticipant(conversation, myId) {
  if (conversation.type === 'group') return null;
  return conversation.participants.find((p) => p.id === myId) ? conversation.participants.find((p) => p.id !== myId) : null;
}

function conversationTitle(conversation, myId) {
  if (conversation.type === 'group') return conversation.name || 'Group';
  return otherParticipant(conversation, myId)?.username || 'Conversation';
}

export function MessagingPage() {
  const { user } = useAuth();
  const { socket, resolveStatus } = useSocketContext();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [memberResults, setMemberResults] = useState([]);
  const [typingUserIds, setTypingUserIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const selected = conversations.find((c) => c.id === selectedId) || null;

  async function loadConversations() {
    const list = await api.get('/conversations');
    setConversations(list);
    return list;
  }

  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-join every conversation's room so list previews update live, not just the one open on screen.
  useEffect(() => {
    if (!socket) return;
    conversations.forEach((c) => socket.emit('join_conversation', c.id));
  }, [socket, conversations]);

  useEffect(() => {
    if (!selectedId) return undefined;
    (async () => {
      const list = await api.get(`/conversations/${selectedId}/messages`);
      setMessages(list);
    })();
    setTypingUserIds(new Set());
    return undefined;
  }, [selectedId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Mark anything from a peer as seen once it's rendered in the open conversation.
  useEffect(() => {
    if (!socket || !selectedId || !user) return;
    messages.forEach((m) => {
      if (m.senderId !== user.id && !m.readBy?.some((r) => r.userId === user.id)) {
        socket.emit('message_seen', { messageId: m.id });
      }
    });
  }, [messages, socket, selectedId, user]);

  useEffect(() => {
    if (!socket) return undefined;

    const onReceive = (message) => {
      if (message.contextType !== 'conversation') return;
      if (message.contextId === selectedId) setMessages((list) => [...list, message]);
      setConversations((list) =>
        list.map((c) => (c.id === message.contextId ? { ...c, lastMessage: { text: message.text, senderId: message.senderId, createdAt: message.createdAt } } : c))
      );
    };
    const onEdited = (message) => setMessages((list) => list.map((m) => (m.id === message.id ? message : m)));
    const onDeleted = ({ messageId }) => setMessages((list) => list.filter((m) => m.id !== messageId));
    const onSeen = ({ messageId, userId, seenAt }) =>
      setMessages((list) => list.map((m) => (m.id === messageId ? { ...m, readBy: [...(m.readBy || []).filter((r) => r.userId !== userId), { userId, seenAt }], status: 'seen' } : m)));
    const onTyping = ({ userId, contextId }) => {
      if (contextId !== selectedId) return;
      setTypingUserIds((set) => new Set(set).add(userId));
    };
    const onStoppedTyping = ({ userId, contextId }) => {
      if (contextId !== selectedId) return;
      setTypingUserIds((set) => {
        const next = new Set(set);
        next.delete(userId);
        return next;
      });
    };

    socket.on('receive_message', onReceive);
    socket.on('message_edited', onEdited);
    socket.on('message_deleted', onDeleted);
    socket.on('message_seen', onSeen);
    socket.on('user_typing', onTyping);
    socket.on('user_stopped_typing', onStoppedTyping);

    return () => {
      socket.off('receive_message', onReceive);
      socket.off('message_edited', onEdited);
      socket.off('message_deleted', onDeleted);
      socket.off('message_seen', onSeen);
      socket.off('user_typing', onTyping);
      socket.off('user_stopped_typing', onStoppedTyping);
    };
  }, [socket, selectedId]);

  useEffect(() => {
    if (!query.trim()) {
      setMemberResults([]);
      return undefined;
    }
    const handle = setTimeout(async () => {
      const result = await api.get(`/users?q=${encodeURIComponent(query.trim())}`);
      setMemberResults(result.items.filter((u) => u.id !== user.id));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, user.id]);

  async function openDirectConversation(memberId) {
    const conversation = await api.post('/conversations', { type: 'direct', participantId: memberId });
    await loadConversations();
    setSelectedId(conversation.id);
    setQuery('');
  }

  function handleDraftChange(value) {
    setDraft(value);
    if (!socket || !selectedId) return;
    socket.emit('user_typing', { contextType: 'conversation', contextId: selectedId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('user_stopped_typing', { contextType: 'conversation', contextId: selectedId });
    }, 1500);
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!draft.trim() || !socket || !selectedId) return;
    socket.emit('send_message', { contextType: 'conversation', contextId: selectedId, text: draft.trim() }, (ack) => {
      if (!ack.success) setError(ack.error || 'Failed to send message');
    });
    setDraft('');
    socket.emit('user_stopped_typing', { contextType: 'conversation', contextId: selectedId });
  }

  async function saveEdit(messageId) {
    if (!editDraft.trim()) return;
    await api.patch(`/messages/${messageId}`, { text: editDraft.trim() });
    setEditingId(null);
  }

  async function deleteMessage(messageId) {
    await api.delete(`/messages/${messageId}`);
  }

  async function react(messageId, type) {
    await api.post(`/messages/${messageId}/reactions`, { type });
  }

  async function handleAttach(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !selectedId) return;
    try {
      const { uploadUrl, storageKey } = await api.post('/files/presign', {
        contextType: 'conversation',
        contextId: selectedId,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      });
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'content-type': file.type } });
      await api.post('/files', {
        storageKey,
        contextType: 'conversation',
        contextId: selectedId,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      });
      socket.emit('send_message', { contextType: 'conversation', contextId: selectedId, text: `📎 Shared a file: ${file.name}` });
    } catch (err) {
      setError(err.message || 'File upload failed');
    }
  }

  const title = selected ? conversationTitle(selected, user.id) : null;
  const other = selected ? otherParticipant(selected, user.id) : null;
  const otherStatus = other ? resolveStatus(other) : null;
  const isPeerTyping = other ? typingUserIds.has(other.id) : false;

  return (
    <div className="text-on-surface font-body-lg overflow-hidden h-screen flex bg-surface-container-lowest">
      <Sidebar />

      <aside
        className={`w-full md:w-80 h-screen md:fixed md:left-80 top-0 flex-col py-panel-padding bg-surface-container-low backdrop-blur-xl shadow-2xl z-20 border-r border-outline-variant/30 ${
          selected ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="px-gutter mb-6">
          <div className="glass-panel rounded-full flex items-center px-4 py-3 border border-outline-variant">
            <span className="material-symbols-outlined text-on-surface-variant mr-3">search</span>
            <input
              className="bg-transparent border-none outline-none text-on-surface w-full placeholder:text-on-surface-variant/50 font-body-sm text-body-sm focus:ring-0"
              placeholder="Search members..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="gold-separator mx-gutter mb-4" />

        <nav className="flex-1 overflow-y-auto px-4 space-y-2 pb-20 md:pb-0">
          {query.trim() ? (
            memberResults.map((m) => (
              <button
                key={m.id}
                onClick={() => openDirectConversation(m.id)}
                type="button"
                className="w-full flex items-center p-3 rounded-xl hover:bg-surface-variant/50 transition-colors text-left"
              >
                <Avatar name={m.username} avatarUrl={m.avatarUrl} size={44} className="mr-4" />
                <div className="flex-1 min-w-0">
                  <span className="font-title-md text-title-md text-on-surface block truncate">{m.username}</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{m.title || 'Member'}</p>
                </div>
              </button>
            ))
          ) : conversations.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant/60 px-3">No conversations yet — search a member above to start one.</p>
          ) : (
            conversations.map((c) => {
              const peer = otherParticipant(c, user.id);
              const status = peer ? resolveStatus(peer) : null;
              const active = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  type="button"
                  className={`w-full flex items-center p-3 rounded-xl cursor-pointer relative transition-colors duration-300 text-left ${
                    active ? 'bg-surface-variant border-l-2 border-primary' : 'hover:bg-surface-variant/50'
                  }`}
                >
                  <div className="relative w-12 h-12 flex-shrink-0 mr-4">
                    {status === 'online' && <div className="presence-ring" />}
                    <Avatar name={conversationTitle(c, user.id)} avatarUrl={peer?.avatarUrl} size={48} className="border border-outline-variant/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`font-title-md text-title-md truncate block ${active ? 'text-primary font-bold' : 'text-on-surface'}`}>
                        {conversationTitle(c, user.id)}
                      </span>
                      {c.lastMessage && <span className="font-body-sm text-[10px] text-on-surface-variant/60">{relativeTime(c.lastMessage.createdAt)}</span>}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant/70 truncate">{c.lastMessage?.text || 'No messages yet'}</p>
                  </div>
                </button>
              );
            })
          )}
        </nav>
      </aside>

      <main
        className={`${
          selected ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col relative bg-surface-container-lowest h-screen overflow-hidden md:ml-[40rem]`}
      >
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant/60 font-title-md text-title-md">
            Select a conversation to begin.
          </div>
        ) : (
          <>
            <header className="h-20 px-gutter flex justify-between items-center border-b border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-md z-10 flex-shrink-0">
              <div className="flex items-center">
                <button
                  type="button"
                  aria-label="Back to conversations"
                  className="md:hidden mr-3 text-on-surface-variant hover:text-primary transition-colors"
                  onClick={() => setSelectedId(null)}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="relative w-10 h-10 mr-4">
                  {otherStatus === 'online' && <div className="presence-ring" />}
                  <Avatar name={title} avatarUrl={other?.avatarUrl} size={40} className="border border-primary/50" />
                </div>
                <div>
                  <h2 className="font-title-md text-title-md text-primary font-bold">{title}</h2>
                  <div className="flex items-center mt-0.5 gap-2">
                    {isPeerTyping ? (
                      <span className="font-label-caps text-[10px] text-primary tracking-widest uppercase">typing…</span>
                    ) : other ? (
                      <span className="font-label-caps text-[10px] text-on-surface-variant tracking-widest uppercase">
                        {otherStatus === 'online' ? 'Active now' : `Last seen ${relativeTime(other.lastSeen)}`}
                      </span>
                    ) : (
                      <span className="font-label-caps text-[10px] text-on-surface-variant tracking-widest uppercase">{selected.participants.length} members</span>
                    )}
                  </div>
                </div>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-panel-padding space-y-6 z-10 flex flex-col relative">
              {messages.map((m) => {
                const mine = m.senderId === user.id;
                const seenByOther = m.readBy?.some((r) => r.userId !== user.id);
                const myReaction = m.reactions?.find((r) => r.userId === user.id)?.type;
                return (
                  <div key={m.id} className={`flex items-end max-w-2xl group ${mine ? 'justify-end ml-auto' : ''}`}>
                    {editingId === m.id ? (
                      <div className="glass-panel p-4 rounded-2xl border border-primary/40 w-full">
                        <input
                          className="w-full bg-transparent border-none outline-none text-on-surface font-body-lg"
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2 justify-end">
                          <button className="text-on-surface-variant text-body-sm" onClick={() => setEditingId(null)} type="button">
                            Cancel
                          </button>
                          <button className="text-primary text-body-sm font-bold" onClick={() => saveEdit(m.id)} type="button">
                            Save
                          </button>
                        </div>
                      </div>
                    ) : mine ? (
                      <div className="flex flex-col items-end">
                        <div className="bg-gradient-to-br from-primary-container to-primary-fixed-dim p-6 rounded-2xl rounded-br-sm shadow-[0_10px_40px_-10px_rgba(242,202,80,0.2)] relative">
                          <p className="font-body-lg text-body-lg text-on-primary leading-relaxed font-medium">{m.text}</p>
                        </div>
                        <div className="mt-2 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                          <button className="font-label-caps text-[10px] text-on-surface-variant hover:text-primary" onClick={() => { setEditingId(m.id); setEditDraft(m.text); }} type="button">
                            edit
                          </button>
                          <button className="font-label-caps text-[10px] text-on-surface-variant hover:text-error" onClick={() => deleteMessage(m.id)} type="button">
                            delete
                          </button>
                          <span className="font-label-caps text-[10px] text-on-surface-variant">{timeOnly(m.createdAt)}</span>
                          <span className={`material-symbols-outlined text-[14px] ${seenByOther ? 'text-primary' : 'text-on-surface-variant/40'}`}>done_all</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Avatar name={m.senderId} size={32} className="mr-3 mb-1 border border-outline-variant" />
                        <div>
                          <div className="glass-panel p-6 rounded-2xl rounded-bl-sm border border-outline-variant/50 relative">
                            <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">{m.text}</p>
                          </div>
                          <div className="mt-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => react(m.id, 'approved')}
                              type="button"
                              className={`inline-flex items-center font-label-caps text-[10px] rounded-full px-2 py-1 border ${
                                myReaction === 'approved' ? 'text-primary bg-surface-variant/50 border-primary/30' : 'text-on-surface-variant bg-surface-variant/30 border-outline-variant/50'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[12px] mr-1">check</span> Approved
                            </button>
                            <button
                              onClick={() => react(m.id, 'executive')}
                              type="button"
                              className={`inline-flex items-center font-label-caps text-[10px] rounded-full px-2 py-1 border ${
                                myReaction === 'executive' ? 'text-primary bg-surface-variant/50 border-primary/30' : 'text-on-surface-variant bg-surface-variant/30 border-outline-variant/50'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[12px] mr-1">verified_user</span> Executive
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {error && <p className="px-gutter font-body-sm text-body-sm text-error">{error}</p>}

            <div className="px-gutter pb-24 md:pb-8 z-20">
              <form
                onSubmit={sendMessage}
                className="w-full max-w-3xl mx-auto glass-panel rounded-full p-2 pl-6 flex items-center border border-outline-variant shadow-2xl transition-all duration-300 bg-surface-container-low/90"
              >
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleAttach} />
                <button aria-label="Attach Document" type="button" className="text-on-surface-variant hover:text-primary transition-colors mr-3" onClick={() => fileInputRef.current?.click()}>
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <input
                  className="flex-1 bg-transparent border-none outline-none text-on-surface placeholder:text-on-surface-variant/50 font-body-lg text-body-lg py-3 focus:ring-0"
                  placeholder="Draft response..."
                  value={draft}
                  onChange={(e) => handleDraftChange(e.target.value)}
                />
                <button aria-label="Send" type="submit" className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-[0_0_20px_rgba(242,202,80,0.3)] gold-glint">
                  <span className="material-symbols-outlined relative z-10">send</span>
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
