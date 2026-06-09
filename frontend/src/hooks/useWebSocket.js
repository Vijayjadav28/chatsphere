import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';

const WS_URL = 'http://localhost:8080/ws';

export function useWebSocket() {
  const { token, user } = useAuth();
  const {
    appendMessage,
    setTyping,
    setOnline,
    handleReadReceipt,
    activeContact,
    incrementUnread,
  } = useChat();

  const stompClient = useRef(null);
  const activeContactRef = useRef(activeContact);
  const [isConnected, setIsConnected] = useState(false);

  // Keep ref in sync so callbacks always see the latest activeContact
  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  useEffect(() => {
    if (!token || !user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 4000,
      onConnect: () => {
        console.log('[WS] Connected');
        setIsConnected(true);

        // Private message queue
        client.subscribe(`/user/queue/messages`, (frame) => {
          const msg = JSON.parse(frame.body);
          const contactId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
          appendMessage(contactId, msg);

          // Increment unread + browser notification if contact isn't active
          if (msg.senderId !== user.id && activeContactRef.current?.id !== msg.senderId) {
            incrementUnread(msg.senderId);
            // Browser notification
            if (document.hidden && Notification.permission === 'granted') {
              new Notification(`New message from ${msg.senderName}`, {
                body: msg.content,
                icon: '/chat-icon.svg',
              });
            }
          }
        });

        // Typing indicator
        client.subscribe(`/user/queue/typing`, (frame) => {
          const data = JSON.parse(frame.body);
          setTyping(data.senderId, data.typing);
          if (data.typing) {
            setTimeout(() => setTyping(data.senderId, false), 3000);
          }
        });

        // Read receipts
        client.subscribe(`/user/queue/read`, (frame) => {
          const data = JSON.parse(frame.body);
          handleReadReceipt(data.receiverId);
        });

        // Online status broadcasts
        client.subscribe(`/topic/status`, (frame) => {
          const data = JSON.parse(frame.body);
          setOnline(data.userId, data.status === 'ONLINE');
        });
      },
      onDisconnect: () => {
        console.log('[WS] Disconnected');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers?.message);
        setIsConnected(false);
        toast.error('Connection error. Retrying…', { id: 'ws-error' });
      },
      onWebSocketError: () => {
        setIsConnected(false);
        toast.error('Cannot reach server. Is the backend running?', { id: 'ws-error', duration: 5000 });
      },
    });

    client.activate();
    stompClient.current = client;

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (client.active) client.deactivate();
    };
  }, [token, user]);

  const sendMessage = useCallback((receiverId, content, type = 'TEXT') => {
    if (!stompClient.current?.active) {
      toast.error('Not connected. Please wait…');
      return;
    }
    stompClient.current.publish({
      destination: '/app/chat',
      body: JSON.stringify({ receiverId, content, type }),
    });
  }, []);

  const sendTyping = useCallback((receiverId, typing) => {
    if (!stompClient.current?.active) return;
    stompClient.current.publish({
      destination: '/app/typing',
      body: JSON.stringify({ receiverId, typing }),
    });
  }, []);

  const sendReadReceipt = useCallback((senderId) => {
    if (!stompClient.current?.active) return;
    stompClient.current.publish({
      destination: '/app/read',
      body: JSON.stringify({ senderId }),
    });
  }, []);

  return { sendMessage, sendTyping, sendReadReceipt, isConnected };
}
