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
