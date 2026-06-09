import Avatar from '../Common/Avatar';

export default function UserItem({ user, isActive, isOnline, unread, lastMessage, onClick }) {
  return (
    <div
      className={`user-item${isActive ? ' active' : ''}`}
      onClick={onClick}
      id={`user-item-${user.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Avatar + badge */}
      <div className="user-item-avatar-wrap">
        <Avatar name={user.name} size={44} />
        <span className={`online-badge ${isOnline ? 'online' : 'offline'}`} />
      </div>

      {/* Name + last message preview */}
      <div className="user-item-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <p className="user-item-name">{user.name}</p>
          {lastMessage && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 4 }}>
              {formatTime(lastMessage.timestamp)}
            </span>
          )}
        </div>
        <p className={`user-item-status ${isOnline && !lastMessage ? 'online-text' : ''}`}
           style={{ color: unread > 0 ? 'var(--text-secondary)' : undefined,
                    fontWeight: unread > 0 ? 500 : undefined }}>
          {lastMessage
            ? truncate(lastMessage.content, 32)
            : isOnline ? '● Online' : formatLastSeen(user.lastSeen)}
        </p>
      </div>

      {/* Unread badge */}
      {unread > 0 && (
        <span className="unread-badge">{unread > 99 ? '99+' : unread}</span>
      )}
    </div>
  );
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'Offline';
  const diff = Date.now() - new Date(lastSeen).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
