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

