import { useState } from 'react';
import { useCart } from '../store/CartContext.jsx';
import { formatPrice } from '../utils/helpers.js';
import { useToastCtx } from '../routes/AppRouter.jsx';

export default function MenuCard({ item }) {
  const toast = useToastCtx();
  const { addItem, getItemQty, updateQty, removeItem } = useCart();
  const [added, setAdded] = useState(false);
  const qty = getItemQty(item.id);

  const handleAdd = () => {
    addItem(item);
    setAdded(true);
    toast?.success(`${item.emoji} ${item.name} added to cart!`);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      className="card animate-fadeUp"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Popular badge */}
      {item.popular && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
          color: '#0a0a0f', fontSize: '0.65rem', fontWeight: 800,
          padding: '3px 8px', borderRadius: '999px', letterSpacing: '0.06em',
        }}>
          ★ POPULAR
        </div>
      )}

      {/* Emoji icon */}
      <div style={{
        width: 56, height: 56, borderRadius: '16px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.8rem',
      }}>
        {item.emoji}
      </div>

      {/* Name + desc */}
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>{item.name}</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
          {item.description}
        </p>
      </div>

      {/* Category chip */}
      <span style={{
        fontSize: '0.72rem', fontWeight: 600,
        color: 'var(--text-muted)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: '999px',
        padding: '2px 10px',
        alignSelf: 'flex-start',
      }}>
        {item.category}
      </span>

      {/* Price + cart controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>
          {formatPrice(item.price)}
        </span>

        {qty === 0 ? (
          <button
            id={`add-to-cart-${item.id}`}
            aria-label={`Add ${item.name} to cart`}
            onClick={handleAdd}
            style={{
              width: 36, height: 36, borderRadius: '10px',
              background: added
                ? 'var(--success-muted)'
                : 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              color: added ? 'var(--success)' : '#0a0a0f',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: added ? '1rem' : '1.2rem',
              fontWeight: 700,
              transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              transform: added ? 'scale(1.15)' : 'scale(1)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: added ? 'none' : '0 4px 12px rgba(245,158,11,0.3)',
            }}
          >
            {added ? '✓' : '+'}
          </button>
        ) : (
          <div className="qty-control">
            <button
              id={`menu-dec-${item.id}`}
              className="qty-btn"
              aria-label={`Decrease quantity of ${item.name}`}
              onClick={() => qty === 1 ? removeItem(item.id) : updateQty(item.id, qty - 1)}
            >
              {qty === 1 ? '🗑' : '−'}
            </button>
            <span className="qty-value">{qty}</span>
            <button
              id={`menu-inc-${item.id}`}
              className="qty-btn"
              aria-label={`Increase quantity of ${item.name}`}
              onClick={() => updateQty(item.id, qty + 1)}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
