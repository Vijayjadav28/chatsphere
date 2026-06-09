export default function TypingIndicator({ name }) {
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span /><span /><span />
      </div>
      <span className="typing-text">{name} is typing…</span>
    </div>
  );
}
