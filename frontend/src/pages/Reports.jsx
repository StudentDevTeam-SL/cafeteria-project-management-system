import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import {
  FileText, Download, Filter, ArrowUpDown, UtensilsCrossed,
  ShoppingBag, Package, ChevronDown, Search, Printer
} from 'lucide-react';
import api from '../api/axios';

/* ─── helpers ─────────────────────────────────────────────────────────── */
const fmt  = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtN = (n) => Number(n || 0).toLocaleString();

function exportCSV(rows, cols, filename) {
  const header = cols.map(c => c.label).join(',');
  const body   = rows.map(r => cols.map(c => `"${r[c.key] ?? ''}"`).join(',')).join('\n');
  const blob   = new Blob([header + '\n' + body], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function exportPDF(title) {
  const originalTitle = document.title;
  document.title = title;
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body * { visibility: hidden; }
      .print-area, .print-area * { visibility: visible; }
      .print-area { position: absolute; left: 0; top: 0; width: 100%; }
      .glass-card { border: none !important; box-shadow: none !important; background: transparent !important; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border-bottom: 1px solid #ddd !important; padding: 12px 8px !important; color: black !important; }
      th { text-align: left; background: #f8fafc !important; }
      .badge { border: 1px solid #aaa; background: transparent !important; color: black !important; }
      .print-header { display: block !important; margin-bottom: 20px; font-size: 24px; font-weight: bold; color: black; }
      .print-hide { display: none !important; }
    }
  `;
  document.head.appendChild(style);
  window.print();
  document.head.removeChild(style);
  document.title = originalTitle;
}

function printSingleReceipt(order) {
  const originalTitle = document.title;
  document.title = `Receipt_Order_${order.order_number || order.id}`;
  
  const receipt = document.createElement('div');
  receipt.className = 'print-single-receipt';
  receipt.innerHTML = `
    <div style="padding: 40px; font-family: sans-serif; max-width: 400px; margin: 0 auto; color: black; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; margin-bottom: 5px; font-size: 24px; font-weight: 900;">Grand Cafeteria</h2>
      <p style="text-align: center; font-size: 14px; color: #666; margin-top: 0;">Order Receipt</p>
      <div style="border-bottom: 2px dashed #ccc; margin: 20px 0;"></div>
      <div style="margin-bottom: 10px; font-size: 14px;">
        <span style="display: inline-block; width: 100px; color: #666;">Order ID:</span> 
        <strong>#${order.order_number || order.id}</strong>
      </div>
      <div style="margin-bottom: 10px; font-size: 14px;">
        <span style="display: inline-block; width: 100px; color: #666;">Date:</span> 
        <strong>${new Date(order.created_at).toLocaleString()}</strong>
      </div>
      <div style="margin-bottom: 10px; font-size: 14px;">
        <span style="display: inline-block; width: 100px; color: #666;">Customer:</span> 
        <strong>${order.employee_name || 'Guest'}</strong>
      </div>
      <div style="margin-bottom: 10px; font-size: 14px;">
        <span style="display: inline-block; width: 100px; color: #666;">Payment:</span> 
        <strong style="text-transform: capitalize;">${order.payment_method}</strong>
      </div>
      <div style="margin-bottom: 10px; font-size: 14px;">
        <span style="display: inline-block; width: 100px; color: #666;">Status:</span> 
        <strong style="text-transform: capitalize;">${order.status}</strong>
      </div>
      <div style="border-bottom: 2px dashed #ccc; margin: 20px 0;"></div>
      <div style="text-align: right; font-size: 20px;">
        <span style="color: #666; font-size: 16px; margin-right: 10px;">Total:</span>
        <strong>$${Number(order.total_price || 0).toFixed(2)}</strong>
      </div>
      <p style="text-align: center; font-size: 14px; color: #666; margin-top: 40px;">Thank you!</p>
    </div>
  `;
  document.body.appendChild(receipt);

  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body > :not(.print-single-receipt) { display: none !important; }
      .print-single-receipt { display: block !important; width: 100%; }
    }
  `;
  document.head.appendChild(style);

  window.print();

  document.head.removeChild(style);
  document.body.removeChild(receipt);
  document.title = originalTitle;
}

/* ─── small shared components ─────────────────────────────────────────── */
const SummaryCard = ({ label, value, color = 'text-primary' }) => (
  <div className="glass-card p-4 text-center">
    <p className="text-xs text-slate-400 mb-1 font-medium">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

const Th = ({ children, col, sort, setSort }) => {
  const active = sort.col === col;
  return (
    <th
      className="cursor-pointer select-none"
      onClick={() => setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }))}
    >
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-3 h-3 ${active ? 'text-primary' : 'opacity-30'}`} />
      </span>
    </th>
  );
};

const ExportBar = ({ onCSV, onPDF }) => (
  <div className="flex gap-2">
    <button onClick={onCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card text-xs font-semibold text-slate-500 hover:text-primary transition-colors">
      <Download className="w-3.5 h-3.5" /> CSV
    </button>
    <button onClick={onPDF} className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card text-xs font-semibold text-slate-500 hover:text-primary transition-colors">
      <Printer className="w-3.5 h-3.5" /> PDF
    </button>
  </div>
);

/* ─── MENU REPORT ──────────────────────────────────────────────────────── */
const MenuReport = () => {
  const [items, setItems]   = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState('All');
  const [sort, setSort]     = useState({ col: 'name', dir: 'asc' });

  useEffect(() => { api.get('menu/').then(r => setItems(r.data.results || r.data)).catch(() => {}); }, []);

  const cats = ['All', ...new Set(items.map(i => i.category_name || i.category).filter(Boolean))];

  const filtered = items
    .filter(i => (cat === 'All' || (i.category_name || i.category) === cat) &&
      i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let av = a[sort.col] ?? '', bv = b[sort.col] ?? '';
      if (sort.col === 'price') { av = Number(av); bv = Number(bv); }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const chartData = cats.slice(1).map(c => ({
    name: c,
    count: items.filter(i => (i.category_name || i.category) === c).length,
    avg: +(items.filter(i => (i.category_name || i.category) === c)
      .reduce((s, i) => s + Number(i.price), 0) /
      (items.filter(i => (i.category_name || i.category) === c).length || 1)).toFixed(2),
  }));

  const CSV_COLS = [
    { key: 'name', label: 'Name' }, { key: 'category_name', label: 'Category' },
    { key: 'price', label: 'Price' }, { key: 'is_active', label: 'Available' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Items" value={items.length} />
        <SummaryCard label="Active" value={items.filter(i => i.is_active).length} color="text-emerald-500" />
        <SummaryCard label="Inactive" value={items.filter(i => !i.is_active).length} color="text-red-400" />
        <SummaryCard label="Avg Price" value={fmt(items.reduce((s,i)=>s+Number(i.price),0)/(items.length||1))} color="text-violet-500" />
      </div>

      {/* Chart */}
      <div className="glass-card p-5">
        <p className="text-sm font-bold mb-4">Items by Category</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} name="Items" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters + Export */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input className="form-input pl-8 text-sm py-2" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input text-sm py-2" value={cat} onChange={e => setCat(e.target.value)}>
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <ExportBar onCSV={() => exportCSV(filtered, CSV_COLS, 'menu-report.csv')} onPDF={() => exportPDF('Menu Report')} />
      </div>

      {/* Table */}
      <div className="print-area w-full">
        <h2 className="hidden print-header">Menu Report — {new Date().toLocaleDateString()}</h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <Th col="name" sort={sort} setSort={setSort}>Name</Th>
              <Th col="category_name" sort={sort} setSort={setSort}>Category</Th>
              <Th col="price" sort={sort} setSort={setSort}>Price</Th>
              <th>Available</th>
            </tr></thead>
            <tbody>
              {filtered.map(i => (
                <tr key={i.id}>
                  <td className="font-medium text-sm">{i.name}</td>
                  <td><span className="badge badge-blue text-xs">{i.category_name || i.category}</span></td>
                  <td className="font-bold text-emerald-500">{fmt(i.price)}</td>
                  <td><span className={"badge " + (i.is_active ? 'badge-green' : 'badge-red')}>{i.is_active ? 'Yes' : 'No'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-slate-400">No items found</div>}
        </div>
      </div>
    </div>
    </div>
  );
};

/* ─── ORDERS REPORT ────────────────────────────────────────────────────── */
const OrdersReport = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort]     = useState({ col: 'created_at', dir: 'desc' });

  useEffect(() => { api.get('orders/').then(r => setOrders(r.data.results || r.data)).catch(() => {}); }, []);

  const filtered = orders
    .filter(o => (status === 'all' || o.status === status) &&
      ((o.order_number || '') + (o.employee_name || '')).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let av = a[sort.col] ?? '', bv = b[sort.col] ?? '';
      if (sort.col === 'total_price') { av = Number(av); bv = Number(bv); }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const revenue  = orders.filter(o => o.status !== 'cancelled').reduce((s,o) => s + Number(o.total_price || 0), 0);
  const byMethod = ['cash','paypal','mastercard','zaad'].map(m => ({
    name: m, total: +orders.filter(o=>o.payment_method===m).reduce((s,o)=>s+Number(o.total_price||0),0).toFixed(2),
  }));

  const STATUSES = ['all','pending','processing','completed','cancelled'];
  const STATUS_COLOR = { completed:'badge-green', processing:'badge-blue', pending:'badge-yellow', cancelled:'badge-red' };

  const CSV_COLS = [
    { key: 'id', label: 'ID' }, { key: 'employee_name', label: 'Employee' },
    { key: 'status', label: 'Status' }, { key: 'payment_method', label: 'Payment' },
    { key: 'total_price', label: 'Total' }, { key: 'created_at', label: 'Date' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Orders" value={orders.length} />
        <SummaryCard label="Revenue" value={fmt(revenue)} color="text-emerald-500" />
        <SummaryCard label="Completed" value={orders.filter(o=>o.status==='completed').length} color="text-blue-500" />
        <SummaryCard label="Cancelled" value={orders.filter(o=>o.status==='cancelled').length} color="text-red-400" />
      </div>

      <div className="glass-card p-5">
        <p className="text-sm font-bold mb-4">Revenue by Payment Method</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byMethod} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>"$" + v} />
            <Tooltip formatter={v => fmt(v)} contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="total" fill="#8b5cf6" radius={[4,4,0,0]} name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input className="form-input pl-8 text-sm py-2" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input text-sm py-2 capitalize" value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
        <ExportBar onCSV={() => exportCSV(filtered, CSV_COLS, 'orders-report.csv')} onPDF={() => exportPDF('Orders Report')} />
      </div>

      <div className="print-area w-full">
        <h2 className="hidden print-header">Orders Report — {new Date().toLocaleDateString()}</h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <Th col="id" sort={sort} setSort={setSort}>Order ID</Th>
              <Th col="employee_name" sort={sort} setSort={setSort}>Employee</Th>
              <th>Status</th>
              <th>Payment</th>
              <Th col="total_price" sort={sort} setSort={setSort}>Total</Th>
              <Th col="created_at" sort={sort} setSort={setSort}>Date</Th>
              <th className="print-hide">Receipt</th>
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-xs font-bold text-primary">#{o.order_number || o.id}</td>
                  <td className="text-sm">{o.employee_name || 'Guest'}</td>
                  <td><span className={"badge " + (STATUS_COLOR[o.status] || 'badge-blue') + " capitalize"}>{o.status}</span></td>
                  <td><span className="badge badge-blue capitalize text-xs">{o.payment_method}</span></td>
                  <td className="font-bold text-emerald-500">{fmt(o.total_price)}</td>
                  <td className="text-xs text-slate-400">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="print-hide">
                    <button onClick={() => printSingleReceipt(o)} className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors" title="Print Receipt">
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-slate-400">No orders found</div>}
        </div>
      </div>
    </div>
    </div>
  );
};

/* ─── INVENTORY REPORT ─────────────────────────────────────────────────── */
const InventoryReport = () => {
  const [items, setItems]   = useState([]);
  const [search, setSearch] = useState('');
  const [stockF, setStockF] = useState('all');
  const [sort, setSort]     = useState({ col: 'item_name', dir: 'asc' });

  useEffect(() => { api.get('inventory/').then(r => setItems(r.data.results || r.data)).catch(() => {}); }, []);

  const getStatus = (i) => {
    const r = i.quantity / (i.min_stock || 1);
    if (r <= 0.5) return 'critical';
    if (r <= 1)   return 'low';
    return 'good';
  };

  const filtered = items
    .filter(i => {
      const ms = stockF === 'all' || getStatus(i) === stockF;
      const mq = i.item_name.toLowerCase().includes(search.toLowerCase());
      return ms && mq;
    })
    .sort((a, b) => {
      let av = a[sort.col] ?? '', bv = b[sort.col] ?? '';
      if (['quantity','cost','min_stock'].includes(sort.col)) { av = Number(av); bv = Number(bv); }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const totalValue = items.reduce((s,i) => s + i.quantity * i.cost, 0);
  const lowCount   = items.filter(i => getStatus(i) !== 'good').length;

  const chartData = [...new Set(items.map(i=>i.category))].map(c => ({
    name: c, value: items.filter(i=>i.category===c).reduce((s,i)=>s+i.quantity*i.cost,0).toFixed(2),
    items: items.filter(i=>i.category===c).length,
  }));

  const STATUS_CLS = { critical:'badge-red', low:'badge-yellow', good:'badge-green' };
  const CSV_COLS = [
    { key: 'item_name', label: 'Item' }, { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Qty' }, { key: 'unit', label: 'Unit' },
    { key: 'min_stock', label: 'Min Stock' }, { key: 'cost', label: 'Cost/Unit' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Items" value={items.length} />
        <SummaryCard label="Total Value" value={fmt(totalValue)} color="text-emerald-500" />
        <SummaryCard label="Low / Critical" value={lowCount} color="text-amber-500" />
        <SummaryCard label="Categories" value={new Set(items.map(i=>i.category)).size} color="text-violet-500" />
      </div>

      <div className="glass-card p-5">
        <p className="text-sm font-bold mb-4">Stock Value by Category</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>"$" + v} />
            <Tooltip formatter={v=>fmt(v)} contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="value" fill="#10b981" radius={[4,4,0,0]} name="Value ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input className="form-input pl-8 text-sm py-2" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input text-sm py-2" value={stockF} onChange={e => setStockF(e.target.value)}>
            <option value="all">All Stock Levels</option>
            <option value="good">Good</option>
            <option value="low">Low</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <ExportBar onCSV={() => exportCSV(filtered, CSV_COLS, 'inventory-report.csv')} onPDF={() => exportPDF('Inventory Report')} />
      </div>

      <div className="print-area w-full">
        <h2 className="hidden print-header">Inventory Report — {new Date().toLocaleDateString()}</h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <Th col="item_name" sort={sort} setSort={setSort}>Item</Th>
              <Th col="category" sort={sort} setSort={setSort}>Category</Th>
              <Th col="quantity" sort={sort} setSort={setSort}>Quantity</Th>
              <Th col="min_stock" sort={sort} setSort={setSort}>Min Stock</Th>
              <Th col="cost" sort={sort} setSort={setSort}>Cost/Unit</Th>
              <th>Total Value</th>
              <th>Status</th>
            </tr></thead>
            <tbody>
              {filtered.map(i => {
                const st = getStatus(i);
                return (
                  <tr key={i.id}>
                    <td className="font-medium text-sm">{i.item_name}</td>
                    <td><span className="badge badge-blue text-xs">{i.category}</span></td>
                    <td className="font-bold">{i.quantity} <span className="text-xs text-slate-400 font-normal">{i.unit}</span></td>
                    <td className="text-slate-400 text-sm">{i.min_stock}</td>
                    <td className="text-sm">{fmt(i.cost)}</td>
                    <td className="font-bold text-emerald-500">{fmt(i.quantity * i.cost)}</td>
                    <td><span className={"badge " + STATUS_CLS[st] + " capitalize"}>{st}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-slate-400">No inventory items found</div>}
        </div>
      </div>
    </div>
    </div>
  );
};

/* ─── MAIN PAGE ────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'menu',      label: 'Menu',      icon: UtensilsCrossed, Component: MenuReport },
  { id: 'orders',    label: 'Orders',    icon: ShoppingBag,     Component: OrdersReport },
  { id: 'inventory', label: 'Inventory', icon: Package,         Component: InventoryReport },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const Active = TABS.find(t => t.id === activeTab)?.Component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Reports</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Analyse and export cafeteria data.</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 glass-card rounded-2xl self-start">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === t.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-primary'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Report */}
      {Active && <Active />}
    </div>
  );
};

export default Reports;
