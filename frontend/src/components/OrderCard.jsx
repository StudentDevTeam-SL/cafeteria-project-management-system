import { useState } from 'react';
import { formatPrice, formatDate, formatRelativeTime, getStatusBadgeClass, capitalise } from '../utils/helpers.js';

export default function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="card"
      style={{
        padding: '18px 20px',
        marginBottom: '12px',
        transition: 'all 0.2s ease',
        animation: 'fadeUp 0.3s ease',
      }}
    >
      {/* Header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        onClick={() => setExpanded((v) => !v)}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
      >
        {/* Order ID */}
        <div style={{
          width: 48, height: 48, borderRadius: '12px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', flexShrink: 0,
        }}>
          🧾
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.id}</span>
            <span className={getStatusBadgeClass(order.status)}>
              {capitalise(order.status)}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            {formatDate(order.createdAt)} · {formatRelativeTime(order.createdAt)}
            {order.note && <> · <em>"{order.note}"</em></>}
          </div>
        </div>

        {/* Total + expand toggle */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1rem' }}>
            {formatPrice(order.total)}
          </div>
          <div style={{
            fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px',
            transition: 'transform 0.2s ease',
            display: 'inline-block',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            ▾
          </div>
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', animation: 'fadeUp 0.2s ease' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Items Ordered
          </div>
          {order.items.map((item) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '8px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
              <span style={{ flex: 1, fontSize: '0.9rem' }}>{item.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>×{item.qty}</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent)' }}>
                {formatPrice(item.price * item.qty)}
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', fontWeight: 700, gap: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total</span>
            <span style={{ color: 'var(--accent)' }}>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
