// Generates a deterministic gradient color pair from a string (e.g. a name)
const PALETTE = [
  ['#6366f1', '#8b5cf6'],
  ['#ec4899', '#a855f7'],
  ['#0ea5e9', '#6366f1'],
  ['#10b981', '#0ea5e9'],
  ['#f59e0b', '#ef4444'],
  ['#14b8a6', '#6366f1'],
  ['#f97316', '#ec4899'],
  ['#84cc16', '#0ea5e9'],
];

function getPalette(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({ name = '?', size = 40, fontSize }) {
  const [from, to] = getPalette(name);
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        minWidth: size,
        fontSize: fontSize || size * 0.38,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        boxShadow: `0 2px 8px ${from}44`,
      }}
      aria-label={name}
    >
      {initials || '?'}
    </div>
  );
}
