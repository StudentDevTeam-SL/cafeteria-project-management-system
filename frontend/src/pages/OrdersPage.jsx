import { useEffect, useState, useMemo } from 'react';
import { getOrders } from '../services/mockApi.js';
import OrderCard from '../components/OrderCard.jsx';
import { ListRowSkeleton } from '../components/SkeletonCard.jsx';
import { useNavigate } from 'react-router-dom';

const STATUS_FILTERS = ['All', 'pending', 'in-progress', 'completed', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    getOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    filter === 'All' ? orders : orders.filter((o) => o.status === filter),
    [orders, filter]
  );

  const label = (s) => s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ');
  const count = (s) => s === 'All' ? orders.length : orders.filter((o) => o.status === s).length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Track and review your order history</p>
        </div>
        <button id="refresh-orders-btn" className="btn btn-ghost btn-sm" onClick={() => { setLoading(true); getOrders().then(setOrders).finally(() => setLoading(false)); }}>
          ↺ Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div className="tab-nav" style={{ display: 'inline-flex' }}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              id={`order-filter-${s}`}
              className={`tab-btn${filter === s ? ' active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {label(s)}
              {' '}
              <span style={{
                fontSize: '0.72rem', fontWeight: 800,
                minWidth: 17, height: 17,
                borderRadius: '999px',
                background: filter === s ? 'rgba(0,0,0,0.2)' : 'var(--bg-elevated)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px', marginLeft: '4px',
              }}>
                {count(s)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          {Array.from({ length: 4 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <h3>No {filter !== 'All' ? label(filter).toLowerCase() : ''} orders yet</h3>
          <p>Place your first order from the menu!</p>
          <button id="orders-go-menu-btn" className="btn btn-primary" onClick={() => navigate('/menu')}>
            Browse Menu
          </button>
        </div>
      ) : (
        filtered.map((order) => <OrderCard key={order.id} order={order} />)
      )}
    </div>
  );
}
