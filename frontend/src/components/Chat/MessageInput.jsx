import { useState, useRef, useEffect } from 'react';

const EMOJIS = [
  '😊','😂','❤️','👍','🔥','🎉','😢','😍','🙏','💪',
  '✨','😎','🤔','👏','🥳','😅','💯','🤗','😴','👋',
  '😭','🫡','😤','🤩','🥺','😇','🤣','😆','🫶','💀',
  '🎊','🚀','⭐','💡','🎯','✅','❌','💬','📱','🔔',
];

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const typingTimer = useRef(null);
  const textareaRef = useRef(null);
  const isTypingRef = useRef(false);
  const emojiRef = useRef(null);

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping(true);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false;
      onTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    const msg = text.trim();
    if (!msg) return;
    onSend(msg);
    setText('');
    clearTimeout(typingTimer.current);
    isTypingRef.current = false;
    onTyping(false);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter = new line (default textarea behavior)
  };

  const addEmoji = (emoji) => {
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newText = text.slice(0, start) + emoji + text.slice(end);
      setText(newText);
      // Restore cursor position after emoji
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + emoji.length;
        el.focus();
      }, 0);
    } else {
      setText((p) => p + emoji);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  }, [text]);

  return (
    <div className="message-input-area" style={{ position: 'relative' }}>
      {/* Emoji picker */}
      {showEmoji && (
        <div className="emoji-picker-wrap" ref={emojiRef}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: 4,
            maxWidth: 280,
          }}>
            <div style={{
              gridColumn: '1 / -1',
              fontSize: 11,
              color: 'var(--text-muted)',
              marginBottom: 4,
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Emojis
            </div>
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 22,
                  padding: 4,
                  borderRadius: 6,
                  lineHeight: 1,
                  transition: 'transform 0.12s, background 0.12s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.3)';
                  e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'none';
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="message-input-wrap">
        {/* Emoji toggle */}
        <button
          id="emoji-btn"
          className="emoji-btn"
          type="button"
          onClick={() => setShowEmoji((p) => !p)}
          title="Pick an emoji"
          style={{ opacity: showEmoji ? 1 : 0.7 }}
        >
          😊
        </button>

        {/* Text area */}
        <textarea
          ref={textareaRef}
          id="message-input"
          className="message-input-field"
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        {/* Character count hint (shown when > 200 chars) */}
        {text.length > 200 && (
          <span style={{ fontSize: 10, color: text.length > 500 ? 'var(--danger)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {text.length}
          </span>
        )}

        {/* Send button */}
        <button
          id="send-btn"
          className="send-btn"
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          title="Send (Enter)"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
