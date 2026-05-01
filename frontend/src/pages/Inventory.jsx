import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, AlertTriangle, Package, Edit2, Trash2, X, TrendingDown, TrendingUp, ArrowUpDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import inventoryImg from '../assets/inventory.png';

/* ── Mock Inventory Data ── */
const mockInventory = [
  { id: 1, item_name: 'Chicken Breast', quantity: 45, unit: 'kg', min_stock: 10, category: 'Protein', cost: 8.50, last_updated: '2026-04-26' },
  { id: 2, item_name: 'Arabica Coffee Beans', quantity: 8, unit: 'kg', min_stock: 10, category: 'Beverages', cost: 22.00, last_updated: '2026-04-25' },
  { id: 3, item_name: 'Fresh Lettuce', quantity: 3, unit: 'kg', min_stock: 5, category: 'Vegetables', cost: 3.00, last_updated: '2026-04-26' },
  { id: 4, item_name: 'Pasta (Penne)', quantity: 60, unit: 'kg', min_stock: 15, category: 'Grains', cost: 2.50, last_updated: '2026-04-24' },
  { id: 5, item_name: 'Beef Patties', quantity: 25, unit: 'units', min_stock: 20, category: 'Protein', cost: 4.00, last_updated: '2026-04-26' },
  { id: 6, item_name: 'Whole Milk', quantity: 40, unit: 'liters', min_stock: 30, category: 'Dairy', cost: 1.80, last_updated: '2026-04-26' },
  { id: 7, item_name: 'Bread Rolls', quantity: 12, unit: 'units', min_stock: 50, category: 'Bakery', cost: 0.80, last_updated: '2026-04-25' },
  { id: 8, item_name: 'Orange Juice (Fresh)', quantity: 20, unit: 'liters', min_stock: 15, category: 'Beverages', cost: 3.50, last_updated: '2026-04-26' },
  { id: 9, item_name: 'Parmesan Cheese', quantity: 7, unit: 'kg', min_stock: 5, category: 'Dairy', cost: 18.00, last_updated: '2026-04-24' },
  { id: 10, item_name: 'Olive Oil', quantity: 15, unit: 'liters', min_stock: 8, category: 'Condiments', cost: 6.50, last_updated: '2026-04-23' },
];

const CATEGORIES = ['All', 'Protein', 'Beverages', 'Vegetables', 'Grains', 'Dairy', 'Bakery', 'Condiments'];

const CATEGORY_COLORS = {
  Protein: 'text-rose-500 bg-rose-500/10',
  Beverages: 'text-amber-500 bg-amber-500/10',
  Vegetables: 'text-emerald-500 bg-emerald-500/10',
  Grains: 'text-yellow-600 bg-yellow-500/10',
  Dairy: 'text-blue-500 bg-blue-500/10',
  Bakery: 'text-orange-500 bg-orange-500/10',
  Condiments: 'text-violet-500 bg-violet-500/10',
};

const getStockStatus = (qty, min) => {
  const ratio = qty / min;
  if (ratio <= 0.5) return { label: 'Critical', cls: 'badge-red', bar: 'bg-red-500', percent: ratio * 100 };
  if (ratio <= 1) return { label: 'Low', cls: 'badge-yellow', bar: 'bg-amber-500', percent: ratio * 100 };
  return { label: 'Good', cls: 'badge-green', bar: 'bg-emerald-500', percent: Math.min(ratio * 50, 100) };
};

/* ── Add/Edit Modal ── */
const InventoryModal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState(item || { item_name: '', quantity: '', unit: 'kg', min_stock: '', category: 'Protein', cost: '' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100 dark:border-slate-700"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-black gradient-text mb-6">{item ? 'Edit Item' : 'Add Inventory Item'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Item Name</label>
            <input className="form-input" value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} placeholder="e.g. Chicken Breast" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Quantity</label>
              <input className="form-input" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Unit</label>
              <select className="form-input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                {['kg', 'g', 'liters', 'ml', 'units', 'pcs', 'boxes'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Min. Stock</label>
              <input className="form-input" type="number" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Cost/Unit ($)</label>
              <input className="form-input" type="number" step="0.01" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Category</label>
            <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={() => onSave({ ...form, quantity: Number(form.quantity), min_stock: Number(form.min_stock), cost: Number(form.cost) })} className="flex-1 btn-primary py-2.5 text-sm">Save</button>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Main ── */
const Inventory = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState(mockInventory);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [sortField, setSortField] = useState('item_name');
  const [itemToDelete, setItemToDelete] = useState(null);

  const lowStock = items.filter(i => i.quantity <= i.min_stock);

  const filtered = items
    .filter(i => {
      const matchCat = category === 'All' || i.category === category;
      const matchSearch = i.item_name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortField === 'quantity') return a.quantity - b.quantity;
      if (sortField === 'cost') return b.cost - a.cost;
      return a.item_name.localeCompare(b.item_name);
    });

  const handleSave = (form) => {
    if (editItem) {
      setItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } : i));
    } else {
      setItems(prev => [...prev, { ...form, id: Date.now(), last_updated: new Date().toISOString().split('T')[0] }]);
    }
    setIsModalOpen(false);
    setEditItem(null);
  };

  const handleDelete = (item) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    showToast(`Deleted ${item.item_name} from inventory`, {
      type: 'warning',
      onUndo: () => setItems(p => [...p, item]),
      duration: 7000
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Inventory Control</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Monitor stock levels and manage supplies.</p>
        </div>
        <button onClick={() => { setEditItem(null); setIsModalOpen(true); }} className="btn-primary flex items-center space-x-2 self-start">
          <Plus className="w-5 h-5" />
          <span>Add Item</span>
        </button>
      </motion.div>

      {/* Banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative rounded-2xl overflow-hidden h-36 shadow-xl">
        <img src={inventoryImg} alt="Inventory" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-transparent flex items-center px-8">
          <div>
            <p className="text-white/60 text-sm">Stock Overview</p>
            <h2 className="text-white text-2xl font-black">{items.length} Items · <span className="text-red-400">{lowStock.length} Low Stock</span></h2>
          </div>
        </div>
      </motion.div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card border-l-4 border-amber-500 p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="font-bold text-sm text-amber-600 dark:text-amber-400">Low Stock Alert</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {lowStock.map(i => i.item_name).join(', ')} — need restocking.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: items.length, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Low Stock', value: lowStock.length, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Total Value', value: `$${items.reduce((s, i) => s + i.quantity * i.cost, 0).toFixed(0)}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Categories', value: CATEGORIES.length - 1, icon: Package, color: 'text-violet-500', bg: 'bg-violet-500/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="form-input pl-9 text-sm" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex space-x-2 overflow-x-auto">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${category === c ? 'bg-primary text-white' : 'glass-card text-gray-500 hover:text-primary'}`}>{c}</button>
          ))}
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setSortField('item_name')} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${sortField === 'item_name' ? 'bg-primary/10 text-primary' : 'glass-card text-gray-400'}`}><ArrowUpDown className="w-3 h-3" /><span>Name</span></button>
          <button onClick={() => setSortField('quantity')} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${sortField === 'quantity' ? 'bg-primary/10 text-primary' : 'glass-card text-gray-400'}`}><ArrowUpDown className="w-3 h-3" /><span>Qty</span></button>
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Stock Level</th>
                <th>Cost/Unit</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const status = getStockStatus(item.quantity, item.min_stock);
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-sm">{item.item_name}</span>
                      </div>
                    </td>
                    <td><span className={`badge text-xs ${CATEGORY_COLORS[item.category]}`}>{item.category}</span></td>
                    <td className="font-bold">{item.quantity} <span className="text-gray-400 font-normal text-xs">{item.unit}</span></td>
                    <td className="w-32">
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(status.percent, 100)}%` }}
                          transition={{ duration: 1, delay: idx * 0.05 + 0.3 }}
                          className={`h-full rounded-full ${status.bar}`}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Min: {item.min_stock} {item.unit}</p>
                    </td>
                    <td className="text-sm">${item.cost.toFixed(2)}</td>
                    <td className="font-bold text-emerald-500">${(item.quantity * item.cost).toFixed(2)}</td>
                    <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                    <td>
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditItem(item); setIsModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setItemToDelete(item)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Package className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p>No inventory items found</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <InventoryModal item={editItem} onClose={() => { setIsModalOpen(false); setEditItem(null); }} onSave={handleSave} />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete "${itemToDelete?.item_name}"?`}
        onConfirm={() => { handleDelete(itemToDelete); setItemToDelete(null); }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};

export default Inventory;
