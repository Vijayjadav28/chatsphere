import { useState } from 'react';
import Avatar from '../Common/Avatar';
import { useChat } from '../../context/ChatContext';

export default function ChatHeader({ contact, onBack }) {
  const { onlineUsers, typingUsers } = useChat();
  const isOnline = onlineUsers.has(contact.id);
  const isTyping = typingUsers[contact.id];
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="chat-header">
      {/* Back button (mobile) */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 20, padding: '4px 8px',
            borderRadius: 'var(--radius-md)', marginRight: 4,
          }}
          title="Back to contacts"
        >
          ←
        </button>
      )}

      {/* Avatar */}
      <div style={{ position: 'relative' }}>
        <Avatar name={contact.name} size={42} />
        <span className={`online-badge ${isOnline ? 'online' : 'offline'}`} />
      </div>

      {/* Name + status */}
      <div className="chat-header-info">
        <p className="chat-header-name">{contact.name}</p>
        {isTyping ? (
          <p className="chat-header-status" style={{ color: 'var(--accent-from)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'flex', gap: 2 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'var(--accent-from)',
                  animation: `dot-bounce 1.2s infinite ${i * 0.2}s`,
                  display: 'inline-block',
                }} />
              ))}
            </span>
            typing…
          </p>
        ) : (
          <p className={`chat-header-status ${isOnline ? 'online-status' : ''}`}>
            {isOnline ? <><span className="status-dot" /> Online</> : formatLastSeen(contact.lastSeen)}
          </p>
        )}
      </div>

      {/* Options menu */}
      <div style={{ position: 'relative' }}>
        <button
          id="chat-options-btn"
          onClick={() => setShowOptions((p) => !p)}
          title="Chat options"
          style={{
            background: showOptions ? 'var(--bg-hover)' : 'transparent',
            border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 20,
            padding: '6px 10px', borderRadius: 'var(--radius-md)',
            transition: 'all 0.2s', fontFamily: 'inherit',
          }}
        >
          ⋮
        </button>

        {showOptions && (
          <div
            style={{
              position: 'absolute', top: '110%', right: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              minWidth: 180, zIndex: 50,
              overflow: 'hidden',
              animation: 'msg-in 0.15s ease',
            }}
            onMouseLeave={() => setShowOptions(false)}
          >
            <OptionItem icon="👤" label={`View ${contact.name}'s profile`} onClick={() => setShowOptions(false)} />
            <OptionItem icon="🔔" label="Mute notifications" onClick={() => setShowOptions(false)} />
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <OptionItem icon="🗑️" label="Clear chat" danger onClick={() => {
              setShowOptions(false);
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

function OptionItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '9px 14px',
        background: 'none', border: 'none',
        color: danger ? 'var(--danger)' : 'var(--text-primary)',
        fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
        cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 9,
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      <span>{icon}</span> {label}
    </button>
  );
}

function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'Offline';
  const diff = Date.now() - new Date(lastSeen).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Last seen just now';
  if (mins < 60) return `Last seen ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Last seen ${hrs}h ago`;
  return `Last seen ${Math.floor(hrs / 24)}d ago`;
}
