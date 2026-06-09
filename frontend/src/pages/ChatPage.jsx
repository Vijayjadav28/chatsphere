import { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import { useChat } from '../context/ChatContext';
import { useWebSocket } from '../hooks/useWebSocket';

export default function ChatPage() {
  const { activeContact, setActiveContact } = useChat();
  const { sendMessage, sendTyping, sendReadReceipt, isConnected } = useWebSocket();

  return (
    <>
      {/* Offline banner */}
      {!isConnected && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          color: '#fff',
          padding: '8px 20px',
          fontSize: 13,
          fontWeight: 600,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          <span>⚠️</span>
          <span>Not connected to server. Make sure the backend is running on port 8080.</span>
        </div>
      )}

      <div
        className="chat-layout"
        style={{ paddingTop: !isConnected ? 40 : 0 }}
      >
        {/* Sidebar — hidden on mobile when chat is open */}
        <div style={{
          display: activeContact ? undefined : 'block',
        }}>
          <Sidebar isConnected={isConnected} />
        </div>

        {/* Chat area */}
        {activeContact ? (
          <ChatWindow
            key={activeContact.id}
            contact={activeContact}
            sendMessage={sendMessage}
            sendTyping={sendTyping}
            sendReadReceipt={sendReadReceipt}
            onBack={() => setActiveContact(null)}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      color: 'var(--text-muted)',
      textAlign: 'center',
      padding: 40,
      background: 'var(--bg-primary)',
    }}>
      {/* Animated logo */}
      <div style={{
        width: 80, height: 80,
        background: 'var(--accent-grad)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 38,
        boxShadow: 'var(--shadow-accent)',
        animation: 'float 3s ease-in-out infinite',
      }}>
        💬
      </div>

      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Welcome to ChatSphere
        </h2>
        <p style={{ fontSize: 14, maxWidth: 300, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          Select a person from the sidebar to start a real-time conversation.
        </p>
      </div>

      <div style={{
        display: 'flex', gap: 20, marginTop: 8,
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {[
          { icon: '⚡', label: 'Real-time' },
          { icon: '✓✓', label: 'Read receipts' },
          { icon: '💬', label: 'Typing indicator' },
          { icon: '🟢', label: 'Online status' },
        ].map(({ icon, label }) => (
          <div key={label} style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            fontSize: 12,
            color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>{icon}</span> {label}
          </div>
        ))}
      </div>
    </div>
  );
}
