const sizeMap = { sm: 18, md: 28, lg: 44 };

export default function Spinner({ size = 'md', center = false, label = 'Loading…' }) {
  const px = sizeMap[size] ?? 28;

  const el = (
    <span
      aria-label={label}
      role="status"
      style={{
        display: 'inline-block',
        width: px,
        height: px,
        borderRadius: '50%',
        border: `${Math.max(2, px / 9)}px solid rgba(245,158,11,0.2)`,
        borderTopColor: '#f59e0b',
        animation: 'spin 0.75s linear infinite',
        flexShrink: 0,
      }}
    />
  );

  if (center) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        {el}
      </div>
    );
  }
  return el;
}
