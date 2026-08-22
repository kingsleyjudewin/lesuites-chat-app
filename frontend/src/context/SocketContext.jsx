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
