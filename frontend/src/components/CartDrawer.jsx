import { useState } from 'react';
import { useCart } from '../store/CartContext.jsx';
import { placeOrder } from '../services/mockApi.js';
import { formatPrice } from '../utils/helpers.js';
import Spinner from './Spinner.jsx';
import { useNavigate } from 'react-router-dom';
import { useToastCtx } from '../routes/AppRouter.jsx';

function CartItem({ item, onRemove, onQty }) {
  return (
    <div style={{
      display: 'flex', gap: '14px', alignItems: 'center',
      padding: '14px 0',
      borderBottom: '1px solid var(--border)',
      animation: 'fadeUp 0.25s ease',
    }}>
      {/* Emoji */}
      <div style={{
        width: 48, height: 48, borderRadius: '12px',
        background: 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', flexShrink: 0,
        border: '1px solid var(--border)',
      }}>
        {item.emoji}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, marginTop: '2px' }}>
          {formatPrice(item.price * item.qty)}
        </div>
      </div>

      {/* Qty controls */}
      <div className="qty-control">
        <button
          id={`cart-dec-${item.id}`}
          className="qty-btn"
          aria-label={`Decrease quantity of ${item.name}`}
          onClick={() => item.qty === 1 ? onRemove(item.id) : onQty(item.id, item.qty - 1)}
        >
          {item.qty === 1 ? '🗑' : '−'}
        </button>
        <span className="qty-value">{item.qty}</span>
        <button
          id={`cart-inc-${item.id}`}
          className="qty-btn"
          aria-label={`Increase quantity of ${item.name}`}
          onClick={() => onQty(item.id, item.qty + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function CartDrawer({ onClose }) {
  const toast = useToastCtx();
  const { items, total, removeItem, updateQty, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const TAX_RATE = 0.08;
  const tax = total * TAX_RATE;
  const grandTotal = total + tax;

  const handleCheckout = async () => {
    if (!items.length) return;
    try {
      setLoading(true);
      await placeOrder({ items: items.map(({ id, name, emoji, price, qty }) => ({ id, name, emoji, price, qty })), total: grandTotal });
      clearCart();
      onClose();
      toast?.success('🎉 Order placed successfully! Check your Orders page.');
      navigate('/orders');
    } catch (err) {
      toast?.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="overlay" onClick={onClose} />

      {/* Drawer */}
      <div className="drawer" role="dialog" aria-label="Shopping cart" aria-modal="true">
        <div className="drawer-header">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Cart</h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {items.length === 0 ? 'Empty' : `${items.reduce((s, i) => s + i.qty, 0)} items`}
            </p>
          </div>
          <button
            id="cart-close-btn"
            aria-label="Close cart"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            style={{ fontSize: '1.2rem' }}
          >
            ×
          </button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add items from the Menu to get started.</p>
              <button
                id="cart-go-menu-btn"
                className="btn btn-primary btn-sm"
                onClick={() => { onClose(); navigate('/menu'); }}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={removeItem}
                onQty={updateQty}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span><span>{formatPrice(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <span>Tax (8%)</span><span>{formatPrice(tax)}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              id="place-order-btn"
              className="btn btn-primary w-full btn-lg"
              onClick={handleCheckout}
              disabled={loading}
              style={{ width: '100%', gap: '10px' }}
            >
              {loading ? (
                <><Spinner size="sm" /> Placing order…</>
              ) : (
                <>Place Order · {formatPrice(grandTotal)}</>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
