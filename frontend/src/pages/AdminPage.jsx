import { useEffect, useState } from 'react';
import { getOrders, getMenu, updateOrderStatus, addMenuItem, deleteMenuItem, getAnalytics } from '../services/mockApi.js';
import { formatPrice, formatRelativeTime, getStatusBadgeClass, capitalise } from '../utils/helpers.js';
import Spinner from '../components/Spinner.jsx';
import { useToastCtx } from '../routes/AppRouter.jsx';

const ORDER_STATUSES = ['pending', 'in-progress', 'completed', 'cancelled'];

// ─── Orders Tab ─────────────────────────────────────────────────────────────
function OrdersTab({ toast }) {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { getOrders().then(setOrders).finally(() => setLoading(false)); }, []);

  const handleStatus = async (id, status) => {
    try {
      setUpdating(id);
      const updated = await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      toast?.success(`Order ${id} updated to ${capitalise(status)}.`);
    } catch (err) {
      toast?.error(err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <Spinner center />;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Items</th>
            <th>Total</th>
            <th>Time</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td style={{ fontWeight: 700 }}>{order.id}</td>
              <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {order.items.map((i) => `${i.emoji} ${i.name} ×${i.qty}`).join(', ')}
              </td>
              <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatPrice(order.total)}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatRelativeTime(order.createdAt)}</td>
              <td><span className={getStatusBadgeClass(order.status)}>{capitalise(order.status)}</span></td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    id={`order-status-${order.id}`}
                    className="input"
                    style={{ padding: '6px 10px', fontSize: '0.82rem', width: '140px' }}
                    value={order.status}
                    onChange={(e) => handleStatus(order.id, e.target.value)}
                    disabled={updating === order.id}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{capitalise(s)}</option>
                    ))}
                  </select>
                  {updating === order.id && <Spinner size="sm" />}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Menu Management Tab ─────────────────────────────────────────────────────
const CATEGORIES_LIST = ['Breakfast', 'Lunch', 'Drinks', 'Snacks', 'Desserts'];
const BLANK = { name: '', category: 'Breakfast', price: '', description: '', emoji: '🍽', available: true };

function MenuTab({ toast }) {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]     = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { getMenu().then(setItems).finally(() => setLoading(false)); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast?.warning('Name and price are required.'); return; }
    try {
      setSaving(true);
      const newItem = await addMenuItem({ ...form, price: parseFloat(form.price) });
      setItems((prev) => [...prev, newItem]);
      setForm(BLANK);
      toast?.success(`✅ "${newItem.name}" added to menu.`);
    } catch (err) {
      toast?.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    try {
      setDeleting(id);
      await deleteMenuItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast?.info(`"${name}" removed from menu.`);
    } catch (err) {
      toast?.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <Spinner center />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
      {/* Items table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Item</th><th>Category</th><th>Price</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.category}</td>
                <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatPrice(item.price)}</td>
                <td>
                  <span className={item.available ? 'badge badge-success' : 'badge badge-muted'}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td>
                  <button
                    id={`delete-item-${item.id}`}
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item.id, item.name)}
                    disabled={deleting === item.id}
                    style={{ gap: '6px' }}
                  >
                    {deleting === item.id ? <Spinner size="sm" /> : '🗑'} Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add item form */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Add Menu Item</h3>
        <form id="add-menu-item-form" onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { id: 'item-name-input',  label: 'Name',  field: 'name',  type: 'text',   placeholder: 'e.g. Chicken Sandwich' },
            { id: 'item-emoji-input', label: 'Emoji', field: 'emoji', type: 'text',   placeholder: '🍴' },
            { id: 'item-price-input', label: 'Price', field: 'price', type: 'number', placeholder: '0.00' },
          ].map(({ id, label, field, type, placeholder }) => (
            <div key={field} className="input-group">
              <label htmlFor={id} className="input-label">{label}</label>
              <input id={id} type={type} className="input" placeholder={placeholder} value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} step={type === 'number' ? '0.01' : undefined} min={type === 'number' ? '0' : undefined} />
            </div>
          ))}
          <div className="input-group">
            <label htmlFor="item-category-input" className="input-label">Category</label>
            <select id="item-category-input" className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES_LIST.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="item-desc-input" className="input-label">Description</label>
            <textarea id="item-desc-input" className="input" rows={2} placeholder="Brief description…" value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          <button id="add-menu-submit-btn" type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: 'center', gap: '8px' }}>
            {saving ? <><Spinner size="sm" /> Adding…</> : '+ Add Item'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Analytics Tab ───────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState(null);
  useEffect(() => { getAnalytics().then(setData); }, []);

  if (!data) return <Spinner center />;

  const statCards = [
    { icon: '🧾', label: 'Total Orders',    value: data.totalOrders,     bg: 'var(--info-muted)' },
    { icon: '⏳', label: 'Pending',         value: data.pendingOrders,    bg: 'rgba(245,158,11,0.15)' },
    { icon: '🔄', label: 'In Progress',     value: data.inProgressOrders, bg: 'var(--purple-muted)' },
    { icon: '✅', label: 'Completed',       value: data.completedOrders,  bg: 'var(--success-muted)' },
    { icon: '💰', label: 'Revenue',         value: formatPrice(data.totalRevenue), bg: 'var(--success-muted)' },
    { icon: '🍽', label: 'Menu Items',      value: data.menuItemCount,    bg: 'var(--info-muted)' },
  ];

  const maxCount = Math.max(...data.topItems.map((i) => i.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div className="grid-3">
        {statCards.map(({ icon, label, value, bg }) => (
          <div key={label} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>{value}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Top items chart */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', fontWeight: 700 }}>Most Ordered Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {data.topItems.map(({ name, count }) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '140px', fontSize: '0.85rem', color: 'var(--text-secondary)', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
              <div style={{ flex: 1, height: 10, borderRadius: '999px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(count / maxCount) * 100}%`,
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-dark))',
                  transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <span style={{ width: '26px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Page ──────────────────────────────────────────────────────────────
const TABS = ['Orders', 'Menu', 'Analytics'];

export default function AdminPage() {
  const toast = useToastCtx();
  const [activeTab, setActiveTab] = useState('Orders');

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">🛡️ Admin Panel</h1>
          <p className="page-subtitle">Manage orders, menu items, and view analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav" style={{ marginBottom: '28px', maxWidth: '320px' }}>
        {TABS.map((t) => (
          <button
            key={t}
            id={`admin-tab-${t.toLowerCase()}`}
            className={`tab-btn${activeTab === t ? ' active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="animate-fadeUp">
        {activeTab === 'Orders'    && <OrdersTab toast={toast} />}
        {activeTab === 'Menu'      && <MenuTab toast={toast} />}
        {activeTab === 'Analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
}
