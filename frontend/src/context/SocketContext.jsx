import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { accessToken, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [presence, setPresence] = useState({}); // userId -> { status, lastSeen }
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!accessToken || !user) {
      disconnectSocket();
      setSocket(null);
      return undefined;
    }

    const s = connectSocket(accessToken);
    setSocket(s);

    const onOnline = ({ userId }) => setPresence((p) => ({ ...p, [userId]: { ...p[userId], status: 'online' } }));
    const onOffline = ({ userId, lastSeen }) => setPresence((p) => ({ ...p, [userId]: { status: 'offline', lastSeen } }));
    const onStatusChanged = ({ userId, status }) => setPresence((p) => ({ ...p, [userId]: { ...p[userId], status } }));
    const onNotification = (n) => setNotifications((list) => [n, ...list].slice(0, 20));

    s.on('user_online', onOnline);
    s.on('user_offline', onOffline);
    s.on('user_status_changed', onStatusChanged);
    s.on('notification', onNotification);

    return () => {
      s.off('user_online', onOnline);
      s.off('user_offline', onOffline);
      s.off('user_status_changed', onStatusChanged);
      s.off('notification', onNotification);
    };
  }, [accessToken, user]);

  const dismissNotification = (id) => setNotifications((list) => list.filter((n) => n.id !== id));

  // Prefer a live socket-reported status over whatever a REST payload's own `.status` field says —
  // REST snapshots can be stale by the time they render, live presence events are not.
  const resolveStatus = (entity) => presence[entity?.id]?.status ?? entity?.status ?? 'offline';
