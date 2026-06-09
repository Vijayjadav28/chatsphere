import { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState({});       // { [contactId]: MessageDTO[] }
  const [typingUsers, setTypingUsers] = useState({});  // { [contactId]: boolean }
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Set of userId numbers
  const [unreadCounts, setUnreadCounts] = useState({}); // { [contactId]: number }
  const [lastMessages, setLastMessages] = useState({}); // { [contactId]: MessageDTO }

  // ── Load full conversation ────────────────────────────────────────────────
  const loadMessages = useCallback((contactId, msgs) => {
    setMessages((prev) => ({ ...prev, [contactId]: msgs }));
    // Track last message per contact
    if (msgs.length > 0) {
      setLastMessages((prev) => ({ ...prev, [contactId]: msgs[msgs.length - 1] }));
    }
  }, []);

  // ── Append a single new message ───────────────────────────────────────────
  const appendMessage = useCallback((contactId, msg) => {
    setMessages((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), msg],
    }));
    setLastMessages((prev) => ({ ...prev, [contactId]: msg }));
  }, []);

  // ── Mark messages from a contact as read (when I open their chat) ─────────
  const markRead = useCallback((contactId) => {
    setMessages((prev) => {
      const msgs = prev[contactId] || [];
      return {
        ...prev,
        [contactId]: msgs.map((m) =>
          m.senderId === contactId ? { ...m, isRead: true } : m
        ),
      };
    });
    setUnreadCounts((prev) => ({ ...prev, [contactId]: 0 }));
  }, []);

  // ── Handle incoming read receipt (my sent messages were seen) ─────────────
  const handleReadReceipt = useCallback((contactId) => {
    setMessages((prev) => {
      const msgs = prev[contactId] || [];
      return {
        ...prev,
        [contactId]: msgs.map((m) =>
          m.receiverId === contactId ? { ...m, isRead: true } : m
        ),
      };
    });
  }, []);

  // ── Delete a message locally ──────────────────────────────────────────────
  const deleteMessage = useCallback((contactId, messageId) => {
    setMessages((prev) => {
      const msgs = (prev[contactId] || []).filter((m) => m.id !== messageId);
      return { ...prev, [contactId]: msgs };
    });
  }, []);

  const setTyping = useCallback((contactId, isTyping) => {
    setTypingUsers((prev) => ({ ...prev, [contactId]: isTyping }));
  }, []);

  const setOnline = useCallback((userId, isOnline) => {
    setOnlineUsers((prev) => {
      const next = new Set(prev);
      if (isOnline) next.add(userId);
      else next.delete(userId);
      return next;
    });
  }, []);

  // Initialize online status from API user list
  const initOnlineStatus = useCallback((users) => {
    setOnlineUsers((prev) => {
      const next = new Set(prev);
      users.forEach((u) => {
        if (u.status === 'ONLINE') next.add(u.id);
      });
      return next;
    });
  }, []);

  const incrementUnread = useCallback((contactId) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [contactId]: (prev[contactId] || 0) + 1,
    }));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        activeContact, setActiveContact,
        messages, loadMessages, appendMessage, markRead, handleReadReceipt, deleteMessage,
        typingUsers, setTyping,
        onlineUsers, setOnline, initOnlineStatus,
        unreadCounts, incrementUnread,
        lastMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
