import { Fragment, useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Download, ArrowUpDown, UtensilsCrossed,
  ShoppingBag, Package, Search, Printer, BriefcaseBusiness, ExternalLink,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PaginationFooter from '../components/PaginationFooter';
import { DatePresetSelect, FilterSelect, ResetFiltersButton } from '../components/FilterControls';
import { usePagination } from '../hooks/usePagination';
import { matchesDatePreset, normalizeText, numberInRange, uniqueOptions } from '../utils/filterUtils';
import { openProtectedMedia } from '../utils/downloadMedia';
import api from '../api/axios';

/* ─── helpers ─────────────────────────────────────────────────────────── */
const fmt  = (n) => `$${Number(n || 0).toFixed(2)}`;
const getOrderTotal = (order) => Number(order.total_price ?? order.total_amount ?? order.total ?? 0);
const getSalaryNet = (record) => Number(record.net_salary ?? (
  Number(record.base_salary || 0) + Number(record.bonus || 0) - Number(record.deduction || 0)
));


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

function printSingleSalaryRecord(record) {
  const originalTitle = document.title;
  document.title = `Salary_${record.employee_name || record.id}`;

  const netSalary = getSalaryNet(record);
  const receipt = document.createElement('div');
  receipt.className = 'print-single-salary';
  receipt.innerHTML = `
    <div style="padding: 40px; font-family: sans-serif; max-width: 520px; margin: 0 auto; color: black; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="text-align: center; margin-bottom: 5px; font-size: 24px; font-weight: 900;">Grand Cafeteria</h2>
      <p style="text-align: center; font-size: 14px; color: #666; margin-top: 0;">Salary Record</p>
      <div style="border-bottom: 2px dashed #ccc; margin: 20px 0;"></div>
      <div style="display: grid; gap: 10px; font-size: 14px;">
        <div><span style="display: inline-block; width: 140px; color: #666;">Employee:</span><strong>${record.employee_name || 'Not set'}</strong></div>
        <div><span style="display: inline-block; width: 140px; color: #666;">Position:</span><strong>${record.employee_position || 'Not set'}</strong></div>
        <div><span style="display: inline-block; width: 140px; color: #666;">Payment Date:</span><strong>${record.payment_date || 'Not set'}</strong></div>
        <div><span style="display: inline-block; width: 140px; color: #666;">Status:</span><strong style="text-transform: capitalize;">${record.status || 'pending'}</strong></div>
      </div>
      <div style="border-bottom: 2px dashed #ccc; margin: 20px 0;"></div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tbody>
          <tr><td style="padding: 8px 0; color: #666;">Base Salary</td><td style="padding: 8px 0; text-align: right; font-weight: 700;">${fmt(record.base_salary)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Bonus</td><td style="padding: 8px 0; text-align: right; font-weight: 700;">+${fmt(record.bonus)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Deduction</td><td style="padding: 8px 0; text-align: right; font-weight: 700;">-${fmt(record.deduction)}</td></tr>
        </tbody>
      </table>
      <div style="border-top: 2px solid #111827; margin-top: 14px; padding-top: 16px; text-align: right; font-size: 22px;">
        <span style="color: #666; font-size: 15px; margin-right: 12px;">Net Salary:</span>
        <strong>${fmt(netSalary)}</strong>
      </div>
      <p style="text-align: center; font-size: 12px; color: #666; margin-top: 32px;">Printed ${new Date().toLocaleString()}</p>
    </div>
  `;
  document.body.appendChild(receipt);

  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body > :not(.print-single-salary) { display: none !important; }
      .print-single-salary { display: block !important; width: 100%; }
    }
  `;
  document.head.appendChild(style);

  window.print();

  document.head.removeChild(style);
  document.body.removeChild(receipt);
  document.title = originalTitle;
}

function printSingleInventoryItem(item) {
  const originalTitle = document.title;
  document.title = `Inventory_${item.item_name || item.id}`;

  const quantity = Number(item.quantity || 0);
  const minStock = Number(item.min_stock || 0);
  const cost = Number(item.cost || 0);
  const totalValue = quantity * cost;
  const ratio = quantity / (minStock || 1);
  const status = ratio <= 0.5 ? 'Critical' : ratio <= 1 ? 'Low' : 'Good';

  const receipt = document.createElement('div');
  receipt.className = 'print-single-inventory';
  receipt.innerHTML = `
    <div style="padding: 40px; font-family: sans-serif; max-width: 520px; margin: 0 auto; color: black; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="text-align: center; margin-bottom: 5px; font-size: 24px; font-weight: 900;">Grand Cafeteria</h2>
      <p style="text-align: center; font-size: 14px; color: #666; margin-top: 0;">Inventory Item Record</p>
      <div style="border-bottom: 2px dashed #ccc; margin: 20px 0;"></div>
      <div style="display: grid; gap: 10px; font-size: 14px;">
        <div><span style="display: inline-block; width: 140px; color: #666;">Item:</span><strong>${item.item_name || 'Not set'}</strong></div>
        <div><span style="display: inline-block; width: 140px; color: #666;">Category:</span><strong>${item.category || 'Not set'}</strong></div>
        <div><span style="display: inline-block; width: 140px; color: #666;">Status:</span><strong>${status}</strong></div>
        <div><span style="display: inline-block; width: 140px; color: #666;">Unit:</span><strong>${item.unit || 'Unit'}</strong></div>
      </div>
      <div style="border-bottom: 2px dashed #ccc; margin: 20px 0;"></div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tbody>
          <tr><td style="padding: 8px 0; color: #666;">Quantity</td><td style="padding: 8px 0; text-align: right; font-weight: 700;">${quantity} ${item.unit || ''}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Minimum Stock</td><td style="padding: 8px 0; text-align: right; font-weight: 700;">${minStock} ${item.unit || ''}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Cost per Unit</td><td style="padding: 8px 0; text-align: right; font-weight: 700;">${fmt(cost)}</td></tr>
        </tbody>
      </table>
      <div style="border-top: 2px solid #111827; margin-top: 14px; padding-top: 16px; text-align: right; font-size: 22px;">
        <span style="color: #666; font-size: 15px; margin-right: 12px;">Total Value:</span>
        <strong>${fmt(totalValue)}</strong>
      </div>
      <p style="text-align: center; font-size: 12px; color: #666; margin-top: 32px;">Printed ${new Date().toLocaleString()}</p>
    </div>
  `;
  document.body.appendChild(receipt);

  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body > :not(.print-single-inventory) { display: none !important; }
      .print-single-inventory { display: block !important; width: 100%; }
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
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sort, setSort]     = useState({ col: 'name', dir: 'asc' });

  useEffect(() => { api.get('menu/').then(r => setItems(r.data.results || r.data)).catch(() => {}); }, []);

  const cats = ['All', ...new Set(items.map(i => i.category_name || i.category).filter(Boolean))];

  const filtered = items
    .filter(i => {
      const itemStatus = i.status || (i.is_active ? 'active' : 'inactive');
      return (cat === 'All' || (i.category_name || i.category) === cat) &&
        normalizeText(i.name).includes(normalizeText(search)) &&
        matchesDatePreset(i.created_at, timeFilter) &&
        numberInRange(i.price, priceFilter) &&
        (statusFilter === 'all' || itemStatus === statusFilter);
    })
    .sort((a, b) => {
      let av = a[sort.col] ?? '', bv = b[sort.col] ?? '';
      if (sort.col === 'price') { av = Number(av); bv = Number(bv); }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  const {
    page: menuReportPage,
    pageSize: menuReportPageSize,
    totalItems: menuReportTotalItems,
    paginatedItems: paginatedMenuRows,
    setPage: setMenuReportPage,
  } = usePagination(filtered, 10, `${cat}|${search}|${timeFilter}|${statusFilter}|${priceFilter}|${sort.col}|${sort.dir}`);

  const chartData = cats.slice(1).map(c => ({
    name: c,
    count: filtered.filter(i => (i.category_name || i.category) === c).length,
    avg: +(filtered.filter(i => (i.category_name || i.category) === c)
      .reduce((s, i) => s + Number(i.price), 0) /
      (filtered.filter(i => (i.category_name || i.category) === c).length || 1)).toFixed(2),
  }));

  const CSV_COLS = [
    { key: 'name', label: 'Name' }, { key: 'category_name', label: 'Category' },
    { key: 'price', label: 'Price' }, { key: 'is_active', label: 'Available' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Filtered Items" value={filtered.length} />
        <SummaryCard label="Active" value={filtered.filter(i => i.is_active).length} color="text-emerald-500" />
        <SummaryCard label="Inactive" value={filtered.filter(i => !i.is_active).length} color="text-red-400" />
        <SummaryCard label="Avg Price" value={fmt(filtered.reduce((s,i)=>s+Number(i.price),0)/(filtered.length||1))} color="text-violet-500" />
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
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-52 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input className="form-input pl-8 text-sm py-2" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input text-sm py-2 w-full sm:w-44 shrink-0" value={cat} onChange={e => setCat(e.target.value)}>
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
          <DatePresetSelect value={timeFilter} onChange={setTimeFilter} label="Menu report time" />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            label="Menu report status"
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <FilterSelect
            value={priceFilter}
            onChange={setPriceFilter}
            label="Menu report price"
            options={[
              { value: 'all', label: 'All prices' },
              { value: 'under10', label: 'Under $10' },
              { value: '10to25', label: '$10 - $25' },
              { value: '25plus', label: '$25+' },
            ]}
          />
          <ResetFiltersButton onClick={() => {
            setSearch('');
            setCat('All');
            setTimeFilter('all');
            setStatusFilter('all');
            setPriceFilter('all');
          }} />
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
              {paginatedMenuRows.map(i => (
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
        <PaginationFooter
          page={menuReportPage}
          totalItems={menuReportTotalItems}
          pageSize={menuReportPageSize}
          onPageChange={setMenuReportPage}
          className="print-hide"
        />
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
  const [timeFilter, setTimeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [sort, setSort]     = useState({ col: 'created_at', dir: 'desc' });

  useEffect(() => { api.get('orders/').then(r => setOrders(r.data.results || r.data)).catch(() => {}); }, []);

  const filtered = orders
    .filter(o => {
      const total = getOrderTotal(o);
      return (status === 'all' || o.status === status) &&
        (normalizeText(o.order_number).includes(normalizeText(search)) ||
          normalizeText(o.employee_name).includes(normalizeText(search)) ||
          normalizeText(o.customer_name).includes(normalizeText(search))) &&
        matchesDatePreset(o.created_at, timeFilter) &&
        (paymentFilter === 'all' || normalizeText(o.payment_method) === paymentFilter) &&
        (typeFilter === 'all' || normalizeText(o.order_type || 'takeaway') === typeFilter) &&
        numberInRange(total, amountFilter);
    })
    .sort((a, b) => {
      let av = a[sort.col] ?? '', bv = b[sort.col] ?? '';
      if (sort.col === 'total_price') { av = Number(av); bv = Number(bv); }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  const {
    page: ordersReportPage,
    pageSize: ordersReportPageSize,
    totalItems: ordersReportTotalItems,
    paginatedItems: paginatedOrderRows,
    setPage: setOrdersReportPage,
  } = usePagination(filtered, 10, `${status}|${search}|${timeFilter}|${paymentFilter}|${typeFilter}|${amountFilter}|${sort.col}|${sort.dir}`);

  const revenue  = filtered.filter(o => o.status !== 'cancelled').reduce((s,o) => s + getOrderTotal(o), 0);
  const byMethod = ['cash','paypal','mastercard','zaad'].map(m => ({
    name: m, total: +filtered.filter(o=>normalizeText(o.payment_method)===m).reduce((s,o)=>s+getOrderTotal(o),0).toFixed(2),
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
        <SummaryCard label="Filtered Orders" value={filtered.length} />
        <SummaryCard label="Revenue" value={fmt(revenue)} color="text-emerald-500" />
        <SummaryCard label="Completed" value={filtered.filter(o=>o.status==='completed').length} color="text-blue-500" />
        <SummaryCard label="Cancelled" value={filtered.filter(o=>o.status==='cancelled').length} color="text-red-400" />
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
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-52 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input className="form-input pl-8 text-sm py-2" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input text-sm py-2 capitalize w-full sm:w-44 shrink-0" value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
          </select>
          <DatePresetSelect value={timeFilter} onChange={setTimeFilter} label="Orders report time" />
          <FilterSelect
            value={paymentFilter}
            onChange={setPaymentFilter}
            label="Orders report payment method"
            options={[
              { value: 'all', label: 'All payments' },
              { value: 'cash', label: 'Cash' },
              { value: 'mastercard', label: 'Mastercard' },
              { value: 'paypal', label: 'PayPal' },
              { value: 'zaad', label: 'Zaad' },
            ]}
          />
          <FilterSelect
            value={typeFilter}
            onChange={setTypeFilter}
            label="Orders report type"
            options={[
              { value: 'all', label: 'All types' },
              { value: 'dine_in', label: 'Dine-in' },
              { value: 'takeaway', label: 'Takeaway' },
              { value: 'delivery', label: 'Delivery' },
            ]}
          />
          <FilterSelect
            value={amountFilter}
            onChange={setAmountFilter}
            label="Orders report total"
            options={[
              { value: 'all', label: 'All totals' },
              { value: 'under10', label: 'Under $10' },
              { value: '10to25', label: '$10 - $25' },
              { value: '25plus', label: '$25+' },
            ]}
          />
          <ResetFiltersButton onClick={() => {
            setSearch('');
            setStatus('all');
            setTimeFilter('all');
            setPaymentFilter('all');
            setTypeFilter('all');
            setAmountFilter('all');
          }} />
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
              {paginatedOrderRows.map(o => (
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
        <PaginationFooter
          page={ordersReportPage}
          totalItems={ordersReportTotalItems}
          pageSize={ordersReportPageSize}
          onPageChange={setOrdersReportPage}
          className="print-hide"
        />
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
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [valueFilter, setValueFilter] = useState('all');
  const [sort, setSort]     = useState({ col: 'item_name', dir: 'asc' });

  useEffect(() => { api.get('inventory/').then(r => setItems(r.data.results || r.data)).catch(() => {}); }, []);

  const getStatus = (i) => {
    const r = i.quantity / (i.min_stock || 1);
    if (r <= 0.5) return 'critical';
    if (r <= 1)   return 'low';
    return 'good';
  };
  const categoryOptions = uniqueOptions(items, i => i.category);
  const unitOptions = uniqueOptions(items, i => i.unit);

  const filtered = items
    .filter(i => {
      const ms = stockF === 'all' || getStatus(i) === stockF;
      const mq = normalizeText(i.item_name).includes(normalizeText(search));
      const mt = matchesDatePreset(i.updated_at, timeFilter);
      const mc = categoryFilter === 'all' || i.category === categoryFilter;
      const mu = unitFilter === 'all' || i.unit === unitFilter;
      const mv = numberInRange(Number(i.quantity || 0) * Number(i.cost || 0), valueFilter);
      return ms && mq && mt && mc && mu && mv;
    })
    .sort((a, b) => {
      let av = a[sort.col] ?? '', bv = b[sort.col] ?? '';
      if (['quantity','cost','min_stock'].includes(sort.col)) { av = Number(av); bv = Number(bv); }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  const {
    page: inventoryReportPage,
    pageSize: inventoryReportPageSize,
    totalItems: inventoryReportTotalItems,
    paginatedItems: paginatedInventoryRows,
    setPage: setInventoryReportPage,
  } = usePagination(filtered, 10, `${stockF}|${search}|${timeFilter}|${categoryFilter}|${unitFilter}|${valueFilter}|${sort.col}|${sort.dir}`);

  const totalValue = filtered.reduce((s,i) => s + i.quantity * i.cost, 0);
  const lowCount   = filtered.filter(i => getStatus(i) !== 'good').length;

  const chartData = [...new Set(filtered.map(i=>i.category))].map(c => ({
    name: c, value: filtered.filter(i=>i.category===c).reduce((s,i)=>s+i.quantity*i.cost,0).toFixed(2),
    items: filtered.filter(i=>i.category===c).length,
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
        <SummaryCard label="Filtered Items" value={filtered.length} />
        <SummaryCard label="Total Value" value={fmt(totalValue)} color="text-emerald-500" />
        <SummaryCard label="Low / Critical" value={lowCount} color="text-amber-500" />
        <SummaryCard label="Categories" value={new Set(filtered.map(i=>i.category)).size} color="text-violet-500" />
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
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-52 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input className="form-input pl-8 text-sm py-2" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input text-sm py-2 w-full sm:w-44 shrink-0" value={stockF} onChange={e => setStockF(e.target.value)}>
            <option value="all">All Stock Levels</option>
            <option value="good">Good</option>
            <option value="low">Low</option>
            <option value="critical">Critical</option>
          </select>
          <DatePresetSelect value={timeFilter} onChange={setTimeFilter} label="Inventory report time" />
          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            label="Inventory report category"
            options={[
              { value: 'all', label: 'All categories' },
              ...categoryOptions.map(category => ({ value: category, label: category })),
            ]}
          />
          <FilterSelect
            value={unitFilter}
            onChange={setUnitFilter}
            label="Inventory report unit"
            options={[
              { value: 'all', label: 'All units' },
              ...unitOptions.map(unit => ({ value: unit, label: unit })),
            ]}
          />
          <FilterSelect
            value={valueFilter}
            onChange={setValueFilter}
            label="Inventory report value"
            options={[
              { value: 'all', label: 'All values' },
              { value: 'under500', label: 'Under $500' },
              { value: '500to1000', label: '$500 - $1,000' },
              { value: '1000plus', label: '$1,000+' },
            ]}
          />
          <ResetFiltersButton onClick={() => {
            setSearch('');
            setStockF('all');
            setTimeFilter('all');
            setCategoryFilter('all');
            setUnitFilter('all');
            setValueFilter('all');
          }} />
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
              <th className="print-hide">Print</th>
            </tr></thead>
            <tbody>
              {paginatedInventoryRows.map(i => {
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
                    <td className="print-hide">
                      <button
                        onClick={() => printSingleInventoryItem(i)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
                        title="Print inventory item"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-slate-400">No inventory items found</div>}
        </div>
        <PaginationFooter
          page={inventoryReportPage}
          totalItems={inventoryReportTotalItems}
          pageSize={inventoryReportPageSize}
          onPageChange={setInventoryReportPage}
          className="print-hide"
        />
      </div>
    </div>
    </div>
  );
};

/* ─── SALARIES REPORT ──────────────────────────────────────────────────── */
const SalariesReport = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [payFilter, setPayFilter] = useState('all');
  const [sort, setSort] = useState({ col: 'payment_date', dir: 'desc' });

  useEffect(() => {
    api.get('salaries/')
      .then(r => setRecords(r.data.results || r.data))
      .catch(() => {});
  }, []);

  const employeeOptions = uniqueOptions(records, record => record.employee_name);
  const statusClasses = { paid: 'badge-green', pending: 'badge-yellow', processing: 'badge-blue' };

  const filtered = records
    .filter(record => {
      const matchSearch = normalizeText(record.employee_name).includes(normalizeText(search)) ||
        normalizeText(record.employee_position).includes(normalizeText(search));
      const matchTime = matchesDatePreset(record.payment_date, timeFilter);
      const matchStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchEmployee = employeeFilter === 'all' || record.employee_name === employeeFilter;
      const matchPay = numberInRange(getSalaryNet(record), payFilter);
      return matchSearch && matchTime && matchStatus && matchEmployee && matchPay;
    })
    .sort((a, b) => {
      let av = a[sort.col] ?? '';
      let bv = b[sort.col] ?? '';
      if (['base_salary', 'bonus', 'deduction', 'net_salary'].includes(sort.col)) {
        av = Number(av);
        bv = Number(bv);
      }
      if (sort.col === 'payment_date') {
        av = new Date(av).getTime() || 0;
        bv = new Date(bv).getTime() || 0;
      }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const {
    page: salariesReportPage,
    pageSize: salariesReportPageSize,
    totalItems: salariesReportTotalItems,
    paginatedItems: paginatedSalaryRows,
    setPage: setSalariesReportPage,
  } = usePagination(filtered, 10, `${search}|${timeFilter}|${statusFilter}|${employeeFilter}|${payFilter}|${sort.col}|${sort.dir}`);

  const totalPayroll = filtered.reduce((sum, record) => sum + getSalaryNet(record), 0);
  const totalBase = filtered.reduce((sum, record) => sum + Number(record.base_salary || 0), 0);
  const totalBonuses = filtered.reduce((sum, record) => sum + Number(record.bonus || 0), 0);
  const totalDeductions = filtered.reduce((sum, record) => sum + Number(record.deduction || 0), 0);

  const chartData = ['paid', 'pending', 'processing'].map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    total: filtered.filter(record => record.status === status).reduce((sum, record) => sum + getSalaryNet(record), 0),
    count: filtered.filter(record => record.status === status).length,
  })).filter(row => row.count > 0 || row.name !== 'Processing');

  const csvRows = filtered.map(record => ({
    ...record,
    net_salary: getSalaryNet(record),
  }));

  const CSV_COLS = [
    { key: 'employee_name', label: 'Employee' },
    { key: 'employee_position', label: 'Position' },
    { key: 'base_salary', label: 'Base Salary' },
    { key: 'bonus', label: 'Bonus' },
    { key: 'deduction', label: 'Deduction' },
    { key: 'net_salary', label: 'Net Salary' },
    { key: 'payment_date', label: 'Payment Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Payroll Total" value={fmt(totalPayroll)} color="text-emerald-500" />
        <SummaryCard label="Base Salary" value={fmt(totalBase)} />
        <SummaryCard label="Bonuses" value={fmt(totalBonuses)} color="text-violet-500" />
        <SummaryCard label="Deductions" value={fmt(totalDeductions)} color="text-red-400" />
      </div>

      <div className="glass-card p-5">
        <p className="text-sm font-bold mb-4">Payroll by Status</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={value => fmt(value)} contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="total" fill="#10b981" radius={[4,4,0,0]} name="Net Salary" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-52 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input className="form-input pl-8 text-sm py-2" placeholder="Search salaries..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <DatePresetSelect value={timeFilter} onChange={setTimeFilter} label="Salary payment time" />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            label="Salary report status"
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
            ]}
          />
          <FilterSelect
            value={employeeFilter}
            onChange={setEmployeeFilter}
            label="Salary report employee"
            options={[
              { value: 'all', label: 'All employees' },
              ...employeeOptions.map(name => ({ value: name, label: name })),
            ]}
          />
          <FilterSelect
            value={payFilter}
            onChange={setPayFilter}
            label="Salary report net salary"
            options={[
              { value: 'all', label: 'All net salary' },
              { value: 'under500', label: 'Under $500' },
              { value: '500to1000', label: '$500 - $1,000' },
              { value: '1000plus', label: '$1,000+' },
            ]}
          />
          <ResetFiltersButton onClick={() => {
            setSearch('');
            setTimeFilter('all');
            setStatusFilter('all');
            setEmployeeFilter('all');
            setPayFilter('all');
          }} />
        </div>
        <ExportBar onCSV={() => exportCSV(csvRows, CSV_COLS, 'salaries-report.csv')} onPDF={() => exportPDF('Salaries Report')} />
      </div>

      <div className="print-area w-full">
        <h2 className="hidden print-header">Salaries Report — {new Date().toLocaleDateString()}</h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <Th col="employee_name" sort={sort} setSort={setSort}>Employee</Th>
                <Th col="employee_position" sort={sort} setSort={setSort}>Position</Th>
                <Th col="base_salary" sort={sort} setSort={setSort}>Base</Th>
                <Th col="bonus" sort={sort} setSort={setSort}>Bonus</Th>
                <Th col="deduction" sort={sort} setSort={setSort}>Deduction</Th>
                <Th col="net_salary" sort={sort} setSort={setSort}>Net Salary</Th>
                <Th col="payment_date" sort={sort} setSort={setSort}>Payment Date</Th>
                <th>Status</th>
                <th className="print-hide">Print</th>
              </tr></thead>
              <tbody>
                {paginatedSalaryRows.map(record => (
                  <tr key={record.id}>
                    <td className="font-bold text-sm">{record.employee_name}</td>
                    <td className="text-xs text-slate-500 dark:text-slate-300">{record.employee_position || 'Not set'}</td>
                    <td className="font-semibold">{fmt(record.base_salary)}</td>
                    <td className="font-semibold text-emerald-500">+{fmt(record.bonus)}</td>
                    <td className="font-semibold text-red-400">-{fmt(record.deduction)}</td>
                    <td className="font-black text-primary">{fmt(getSalaryNet(record))}</td>
                    <td className="text-xs text-slate-400">{record.payment_date || 'Not set'}</td>
                    <td><span className={`badge ${statusClasses[record.status] || 'badge-blue'} capitalize`}>{record.status}</span></td>
                    <td className="print-hide">
                      <button
                        onClick={() => printSingleSalaryRecord(record)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
                        title="Print salary record"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center text-slate-400">No salary records found</div>}
          </div>
          <PaginationFooter
            page={salariesReportPage}
            totalItems={salariesReportTotalItems}
            pageSize={salariesReportPageSize}
            onPageChange={setSalariesReportPage}
            className="print-hide"
          />
        </div>
      </div>
    </div>
  );
};

/* ─── JOBS REPORT ──────────────────────────────────────────────────────── */
const JobsReport = () => {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sort, setSort] = useState({ col: 'created_at', dir: 'desc' });

  useEffect(() => {
    api.get('menu/job-applications/')
      .then(r => setApplications(r.data.results || r.data))
      .catch(() => {});
  }, []);

  const applicantName = app => `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Applicant';
  const positions = uniqueOptions(applications, app => app.position);
  const statusOptions = ['new', 'reviewing', 'contacted', 'closed'];
  const statusClasses = { new: 'badge-blue', reviewing: 'badge-yellow', contacted: 'badge-green', closed: 'badge-red' };

  const filtered = applications
    .filter(app => {
      const haystack = [
        applicantName(app), app.email, app.phone, app.position, app.experience_level,
        app.availability, app.expected_salary, app.portfolio_url, app.cover_letter,
      ].map(normalizeText).join(' ');

      return haystack.includes(normalizeText(search)) &&
        (statusFilter === 'all' || app.status === statusFilter) &&
        (positionFilter === 'all' || app.position === positionFilter) &&
        matchesDatePreset(app.created_at, timeFilter);
    })
    .sort((a, b) => {
      let av = sort.col === 'name' ? applicantName(a) : (a[sort.col] ?? '');
      let bv = sort.col === 'name' ? applicantName(b) : (b[sort.col] ?? '');
      if (sort.col === 'created_at') {
        av = new Date(av).getTime() || 0;
        bv = new Date(bv).getTime() || 0;
      }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const {
    page: jobsReportPage,
    pageSize: jobsReportPageSize,
    totalItems: jobsReportTotalItems,
    paginatedItems: paginatedJobRows,
    setPage: setJobsReportPage,
  } = usePagination(filtered, 8, `${search}|${statusFilter}|${positionFilter}|${timeFilter}|${sort.col}|${sort.dir}`);

  const csvRows = filtered.map(app => ({
    name: applicantName(app),
    email: app.email,
    phone: app.phone,
    position: app.position,
    experience_level: app.experience_level,
    availability: app.availability,
    start_date: app.start_date ? new Date(app.start_date).toLocaleDateString() : '',
    expected_salary: app.expected_salary,
    portfolio_url: app.portfolio_url,
    status: app.status,
    cover_letter: app.cover_letter,
    created_at: app.created_at ? new Date(app.created_at).toLocaleString() : '',
  }));

  const CSV_COLS = [
    { key: 'name', label: 'Applicant' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'position', label: 'Position' },
    { key: 'experience_level', label: 'Experience' },
    { key: 'availability', label: 'Availability' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'expected_salary', label: 'Expected Salary' },
    { key: 'portfolio_url', label: 'Portfolio' },
    { key: 'status', label: 'Status' },
    { key: 'cover_letter', label: 'Cover Letter' },
    { key: 'created_at', label: 'Submitted At' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Applications" value={filtered.length} />
        <SummaryCard label="New" value={filtered.filter(app => app.status === 'new').length} color="text-blue-500" />
        <SummaryCard label="Reviewing" value={filtered.filter(app => app.status === 'reviewing').length} color="text-amber-500" />
        <SummaryCard label="Contacted" value={filtered.filter(app => app.status === 'contacted').length} color="text-emerald-500" />
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-52 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input className="form-input pl-8 text-sm py-2" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            label="Jobs report status"
            options={[
              { value: 'all', label: 'All statuses' },
              ...statusOptions.map(status => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) })),
            ]}
          />
          <FilterSelect
            value={positionFilter}
            onChange={setPositionFilter}
            label="Jobs report position"
            options={[
              { value: 'all', label: 'All positions' },
              ...positions.map(position => ({ value: position, label: position })),
            ]}
          />
          <DatePresetSelect value={timeFilter} onChange={setTimeFilter} label="Jobs report time" />
          <ResetFiltersButton onClick={() => {
            setSearch('');
            setStatusFilter('all');
            setPositionFilter('all');
            setTimeFilter('all');
          }} />
        </div>
        <ExportBar onCSV={() => exportCSV(csvRows, CSV_COLS, 'jobs-report.csv')} onPDF={() => exportPDF('Jobs Report')} />
      </div>

      <div className="print-area w-full">
        <h2 className="hidden print-header">Jobs Report — {new Date().toLocaleDateString()}</h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <Th col="name" sort={sort} setSort={setSort}>Applicant</Th>
                <Th col="position" sort={sort} setSort={setSort}>Position</Th>
                <th>Contact</th>
                <Th col="experience_level" sort={sort} setSort={setSort}>Experience</Th>
                <th>Availability</th>
                <th>Start / Salary</th>
                <th>Status</th>
                <Th col="created_at" sort={sort} setSort={setSort}>Submitted</Th>
                <th className="print-hide">CV</th>
              </tr></thead>
              <tbody>
                {paginatedJobRows.map(app => (
                  <Fragment key={app.id}>
                    <tr key={app.id}>
                      <td className="font-bold text-sm">{applicantName(app)}</td>
                      <td className="text-sm">{app.position}</td>
                      <td>
                        <p className="text-xs font-semibold">{app.email}</p>
                        <p className="text-xs text-slate-400">{app.phone}</p>
                      </td>
                      <td className="text-sm">{app.experience_level}</td>
                      <td className="text-xs text-slate-400">{app.availability || 'Not set'}</td>
                      <td>
                        <p className="text-xs">{app.start_date ? new Date(app.start_date).toLocaleDateString() : 'No date'}</p>
                        <p className="text-xs text-slate-400">{app.expected_salary || 'No salary'}</p>
                      </td>
                      <td><span className={`badge ${statusClasses[app.status] || 'badge-blue'} capitalize`}>{app.status}</span></td>
                      <td className="text-xs text-slate-400">{app.created_at ? new Date(app.created_at).toLocaleString() : 'Not set'}</td>
                      <td className="print-hide">
                        {app.cv_url ? (
                          <button
                            type="button"
                            onClick={() => openProtectedMedia(app.cv_url).catch(() => {})}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary"
                          >
                            CV <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">No CV</span>
                        )}
                      </td>
                    </tr>
                    <tr key={`${app.id}-message`}>
                      <td colSpan={9} className="text-xs text-slate-500 dark:text-slate-300">
                        <span className="font-bold text-slate-700 dark:text-slate-100">Cover letter:</span> {app.cover_letter || 'No message'}
                        {app.portfolio_url && <span className="print-hide"> · Portfolio: {app.portfolio_url}</span>}
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center text-slate-400">No job applications found</div>}
          </div>
          <PaginationFooter
            page={jobsReportPage}
            totalItems={jobsReportTotalItems}
            pageSize={jobsReportPageSize}
            onPageChange={setJobsReportPage}
            className="print-hide"
          />
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

const SALARIES_TAB = { id: 'salaries', label: 'Salaries', icon: DollarSign, Component: SalariesReport };
const JOBS_TAB = { id: 'jobs', label: 'Jobs', icon: BriefcaseBusiness, Component: JobsReport };

const Reports = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('menu');
  const managementTabs = user?.role === 'Admin' || user?.role === 'Manager' ? [SALARIES_TAB] : [];
  const tabs = user?.role === 'Admin' ? [...TABS, ...managementTabs, JOBS_TAB] : [...TABS, ...managementTabs];
  const Active = tabs.find(t => t.id === activeTab)?.Component || tabs[0]?.Component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Reports</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Analyse and export cafeteria data.</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 glass-card rounded-2xl self-start">
          {tabs.map(t => (
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
