import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.jsx';
import { getOrders, getAnalytics } from '../services/mockApi.js';
import { formatPrice, formatRelativeTime, getStatusBadgeClass, capitalise } from '../utils/helpers.js';
import { StatCardSkeleton, ListRowSkeleton } from '../components/SkeletonCard.jsx';

const CATEGORY_QUICK = [
  { label: 'Breakfast', emoji: '🥞', cat: 'Breakfast' },
  { label: 'Lunch',     emoji: '🍔', cat: 'Lunch' },
  { label: 'Drinks',    emoji: '☕', cat: 'Drinks' },
  { label: 'Desserts',  emoji: '🍫', cat: 'Desserts' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), getOrders()])
      .then(([a, o]) => { setAnalytics(a); setOrders(o.slice(0, 5)); })
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ icon, iconBg, value, label, change }) => (
    <div className="card stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && <div className={`stat-change ${change.startsWith('+') ? 'up' : 'down'}`}>{change}</div>}
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Welcome header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
          {greeting}, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]} 👋</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Here's what's happening at the cafeteria today.
        </p>
      </div>

      {/* Stats */}
      <section className="section">
        <div className="grid-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard icon="🧾" iconBg="var(--info-muted)"     value={analytics?.totalOrders}   label="Total Orders"    change="+12% this week" />
              <StatCard icon="⏳" iconBg="rgba(245,158,11,0.15)"  value={analytics?.pendingOrders} label="Pending Orders"  />
              <StatCard icon="💰" iconBg="var(--success-muted)"   value={formatPrice(analytics?.totalRevenue ?? 0)} label="Total Revenue" change="+8% this month" />
              <StatCard icon="🍽" iconBg="var(--purple-muted)"    value={analytics?.menuItemCount} label="Menu Items" />
            </>
          )}
        </div>
      </section>

      {/* Quick order + recent orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', flexWrap: 'wrap' }}>

        {/* Quick categories */}
        <div>
          <div className="section-header">
            <h2 className="section-title">Quick Order</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/menu')}>
              View all →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {CATEGORY_QUICK.map((c) => (
              <button
                key={c.cat}
                id={`quick-${c.cat.toLowerCase()}-btn`}
                className="card"
                onClick={() => navigate(`/menu?category=${c.cat}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px', cursor: 'pointer', border: 'none',
                  textAlign: 'left', width: '100%', transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.background = 'var(--accent-muted)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''; }}
              >
                <span style={{ fontSize: '1.6rem' }}>{c.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{c.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Browse items →</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div>
          <div className="section-header">
            <h2 className="section-title">Recent Orders</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')}>
              View all →
            </button>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ListRowSkeleton key={i} />)
              : orders.length === 0
              ? (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <div className="empty-icon">🧾</div>
                  <p>No orders yet. Start by browsing the menu!</p>
                </div>
              )
              : orders.map((order) => (
                <div key={order.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 16px', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '1.3rem' }}>🧾</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{order.id}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {formatRelativeTime(order.createdAt)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className={getStatusBadgeClass(order.status)} style={{ display: 'block', marginBottom: '4px' }}>
                      {capitalise(order.status)}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
