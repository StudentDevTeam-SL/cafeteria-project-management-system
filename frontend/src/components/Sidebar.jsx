import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.jsx';

const NAV_LINKS = [
  { to: '/',        label: 'Dashboard', icon: '⊞', exact: true },
  { to: '/menu',    label: 'Menu',      icon: '🍽️' },
  { to: '/cart',    label: 'My Cart',   icon: '🛒' },
  { to: '/orders',  label: 'Orders',    icon: '📋' },
];

const ADMIN_LINK = { to: '/admin', label: 'Admin', icon: '🛡️' };

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 16px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: 550,
    color: isActive ? '#0a0a0f' : 'var(--text-secondary)',
    background: isActive ? 'var(--accent)' : 'transparent',
    transition: 'all 0.18s ease',
    cursor: 'pointer',
    textDecoration: 'none',
  });

  return (
    <aside
      className="app-sidebar"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
          }}>
            🍴
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Catateria
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              Cafeteria System
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px 8px' }}>
          Main Menu
        </div>

        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            style={linkStyle}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.dataset.active) {
                e.currentTarget.style.background = '';
                e.currentTarget.style.color = '';
              }
            }}
          >
            <span style={{ fontSize: '1.05rem', width: '22px', textAlign: 'center', flexShrink: 0 }}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '16px 8px 8px' }}>
              Admin
            </div>
            <NavLink to={ADMIN_LINK.to} style={linkStyle}>
              <span style={{ fontSize: '1.05rem', width: '22px', textAlign: 'center', flexShrink: 0 }}>{ADMIN_LINK.icon}</span>
              {ADMIN_LINK.label}
            </NavLink>
          </>
        )}
      </nav>

      {/* User Profile Footer */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px', borderRadius: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-muted), var(--bg-elevated))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
            border: '2px solid var(--border-accent)',
          }}>
            {user?.avatar || '👤'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
          <button
            id="logout-btn"
            aria-label="Log out"
            onClick={handleLogout}
            title="Log out"
            style={{
              width: 30, height: 30, borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', fontSize: '1rem',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-muted)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
