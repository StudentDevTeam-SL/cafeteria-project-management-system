import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext.jsx';
import { placeOrder } from '../services/mockApi.js';
import { formatPrice } from '../utils/helpers.js';
import Spinner from '../components/Spinner.jsx';
import { useToastCtx } from '../routes/AppRouter.jsx';

export default function CartPage() {
  const toast = useToastCtx();
  const { items, total, removeItem, updateQty, clearCart } = useCart();
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [note, setNote]         = useState('');
  const navigate = useNavigate();

  const TAX_RATE  = 0.08;
  const tax       = total * TAX_RATE;
  const grandTotal = total + tax;

  const handleOrder = async () => {
    try {
      setLoading(true);
      await placeOrder({
        items: items.map(({ id, name, emoji, price, qty }) => ({ id, name, emoji, price, qty })),
        total: grandTotal,
        note,
      });
      clearCart();
      setSuccess(true);
      toast?.success('🎉 Order placed! We\'ll have it ready soon.');
    } catch (err) {
      toast?.error(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="empty-state animate-scaleIn" style={{ paddingTop: '80px' }}>
        <div style={{ fontSize: '4rem', animation: 'scaleIn 0.4s ease' }}>🎉</div>
        <h2>Order Placed!</h2>
        <p>Your order has been received. We'll have it ready soon.</p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button id="track-order-btn" className="btn btn-primary" onClick={() => navigate('/orders')}>
            Track My Order
          </button>
          <button id="back-menu-btn" className="btn btn-ghost" onClick={() => navigate('/menu')}>
            Order More
          </button>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="empty-state animate-fadeUp" style={{ paddingTop: '80px' }}>
        <div className="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add items from the menu to get started.</p>
        <button id="cart-browse-btn" className="btn btn-primary" onClick={() => navigate('/menu')}>
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Your Cart</h1>
          <p className="page-subtitle">{items.reduce((s, i) => s + i.qty, 0)} items ready to order</p>
        </div>
        <button
          id="clear-cart-btn"
          className="btn btn-danger btn-sm"
          onClick={() => { clearCart(); toast?.info('Cart cleared.'); }}
        >
          Clear Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
        {/* Items list */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {items.map((item) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '18px 20px', borderBottom: '1px solid var(--border)',
              animation: 'fadeUp 0.25s ease',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '14px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', flexShrink: 0,
              }}>
                {item.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatPrice(item.price)} each</div>
              </div>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => item.qty === 1 ? removeItem(item.id) : updateQty(item.id, item.qty - 1)}>
                  {item.qty === 1 ? '🗑' : '−'}
                </button>
                <span className="qty-value">{item.qty}</span>
                <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
              </div>
              <div style={{ fontWeight: 800, color: 'var(--accent)', width: '70px', textAlign: 'right', flexShrink: 0 }}>
                {formatPrice(item.price * item.qty)}
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Subtotal', value: formatPrice(total) },
                { label: 'Tax (8%)', value: formatPrice(tax) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Note */}
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="order-note" className="input-label">Special instructions (optional)</label>
              <textarea
                id="order-note"
                className="input"
                rows={2}
                placeholder="e.g. No onions, extra sauce…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ resize: 'vertical', minHeight: '60px' }}
              />
            </div>

            <button
              id="cart-place-order-btn"
              className="btn btn-primary btn-lg"
              onClick={handleOrder}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', gap: '10px' }}
            >
              {loading ? <><Spinner size="sm" /> Placing order…</> : `Place Order · ${formatPrice(grandTotal)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
