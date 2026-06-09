import Avatar from '../Common/Avatar';

export default function MessageBubble({ message, isSent, showAvatar, contactName }) {
  const time = formatTime(message.timestamp);

  return (
    <div className={`message-row ${isSent ? 'sent' : 'received'}`}
         style={{ alignItems: 'flex-end', gap: 8 }}>

      {/* Avatar for received messages */}
      {!isSent && (
        <div style={{ width: 28, flexShrink: 0 }}>
          {showAvatar && <Avatar name={contactName} size={28} />}
        </div>
      )}

      <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
        {message.content}
        <div className="message-meta">
          <span>{time}</span>
          {isSent && (
            <span className="read-tick" title={message.isRead ? 'Seen' : 'Delivered'}>
              {message.isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
