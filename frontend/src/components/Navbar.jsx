import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../store/CartContext.jsx';
import CartDrawer from './CartDrawer.jsx';

const PAGE_TITLES = {
  '/':       { title: 'Dashboard',   sub: 'Overview of your cafeteria activity' },
  '/menu':   { title: 'Menu',        sub: 'Browse and order fresh meals' },
  '/cart':   { title: 'Your Cart',   sub: 'Review items before checkout' },
  '/orders': { title: 'My Orders',   sub: 'Track your order history' },
  '/admin':  { title: 'Admin Panel', sub: 'Manage the cafeteria system' },
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { itemCount } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const info = PAGE_TITLES[pathname] ?? { title: 'Catateria', sub: '' };

  return (
    <>
      <header
        className="app-topbar"
        style={{
          background: 'rgba(10,10,15,0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        {/* Page info */}
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2 }}>{info.title}</h1>
          {info.sub && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{info.sub}</p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--success)' }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--success)',
              animation: 'pulse 2s infinite',
              display: 'inline-block',
            }} />
            Live
          </div>

          {/* Cart button */}
          <button
            id="cart-open-btn"
            aria-label={`Open cart (${itemCount} items)`}
            onClick={() => setDrawerOpen(true)}
            style={{
              position: 'relative',
              width: 40, height: 40,
              borderRadius: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
              color: 'var(--text-primary)',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-muted)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
          >
            🛒
            {itemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -5, right: -5,
                minWidth: 18, height: 18,
                borderRadius: '999px',
                background: 'var(--accent)',
                color: '#0a0a0f',
                fontSize: '0.68rem',
                fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
                border: '2px solid var(--bg-base)',
                animation: 'scaleIn 0.2s ease',
              }}>
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {drawerOpen && (
        <CartDrawer onClose={() => setDrawerOpen(false)} />
      )}
    </>
  );
}
