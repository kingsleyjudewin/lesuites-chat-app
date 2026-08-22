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
