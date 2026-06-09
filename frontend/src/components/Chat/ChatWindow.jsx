import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { getConversation } from '../../api/messages';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({ contact, sendMessage, sendTyping, sendReadReceipt, onBack }) {
  const { user } = useAuth();
  const { messages, loadMessages, markRead, typingUsers } = useChat();
  const bottomRef = useRef(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const msgs = messages[contact.id] || [];
  const isTyping = typingUsers[contact.id];

  // Load history when contact changes
  useEffect(() => {
    setLoadingHistory(true);
    getConversation(contact.id)
      .then((data) => {
        loadMessages(contact.id, data);
        markRead(contact.id);
        sendReadReceipt(contact.id);
      })
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  }, [contact.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs.length, isTyping]);

  const handleSend = (content) => sendMessage(contact.id, content);
  const handleTyping = (typing) => sendTyping(contact.id, typing);

  // Group messages by date
  const grouped = groupByDate(msgs);

  return (
    <div className="chat-window">
      <ChatHeader contact={contact} onBack={onBack} />

      {/* Messages area */}
      <div className="messages-area" id="messages-area">

        {loadingHistory ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <span className="spinner" style={{ margin: '0 auto 10px', display: 'block', width: 28, height: 28 }} />
              <p style={{ fontSize: 13 }}>Loading messages…</p>
            </div>
          </div>
        ) : msgs.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', gap: 12, padding: 40,
          }}>
            <span style={{ fontSize: 52, opacity: 0.35 }}>👋</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Start a conversation
            </p>
            <p style={{ fontSize: 13, textAlign: 'center', maxWidth: 260 }}>
              Say hello to <strong style={{ color: 'var(--text-primary)' }}>{contact.name}</strong>! Your messages are end-to-end encrypted.
            </p>
          </div>
        ) : (
          grouped.map(({ date, messages: dayMsgs }) => (
            <div key={date}>
              {/* Date separator */}
              <div className="date-separator">
                <div className="date-separator-line" />
                <span className="date-separator-text">{date}</span>
                <div className="date-separator-line" />
              </div>

              {dayMsgs.map((msg, i) => {
                const isSent = msg.senderId === user.id;
                // Show avatar only for first consecutive received message
                const showAvatar = !isSent && (i === 0 || dayMsgs[i - 1]?.senderId !== msg.senderId);
                return (
                  <MessageBubble
                    key={msg.id ?? `temp-${i}`}
                    message={msg}
                    isSent={isSent}
                    showAvatar={showAvatar}
                    contactName={contact.name}
                  />
                );
              })}
            </div>
          ))
        )}

        {isTyping && <TypingIndicator name={contact.name} />}
        <div ref={bottomRef} style={{ height: 4 }} />
      </div>

      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
}

function groupByDate(messages) {
  const groups = {};
  for (const msg of messages) {
    const key = formatDate(msg.timestamp);
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
  }
  return Object.entries(groups).map(([date, messages]) => ({ date, messages }));
}

function formatDate(timestamp) {
  if (!timestamp) return 'Today';
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}
