import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, AlertTriangle, Package, Edit2, Trash2, X, TrendingUp, ArrowUpDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';
import PaginationFooter from '../components/PaginationFooter';
import { DatePresetSelect, FilterSelect, ResetFiltersButton } from '../components/FilterControls';
import { usePagination } from '../hooks/usePagination';
import inventoryImg from '../assets/inventory.png';
import { matchesDatePreset, normalizeText, numberInRange } from '../utils/filterUtils';
import api from '../api/axios';

// MOCK_INVENTORY removed, fetching from API

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
        className="glass-card dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md dark:border-slate-700"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors">
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
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [valueFilter, setValueFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [sortField, setSortField] = useState('item_name');
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchInventory = async () => {
    try {
      const res = await api.get('inventory/');
      setItems(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventory();
  }, []);

  const lowStock = items.filter(i => i.quantity <= i.min_stock);
  const unitOptions = ['all', ...new Set(items.map(i => i.unit).filter(Boolean))];

  const filtered = items
    .filter(i => {
      const matchCat = category === 'All' || i.category === category;
      const stockStatus = getStockStatus(i.quantity, i.min_stock).label.toLowerCase();
      const totalValue = Number(i.quantity || 0) * Number(i.cost || 0);
      const matchSearch = normalizeText(i.item_name).includes(normalizeText(search));
      const matchTime = matchesDatePreset(i.updated_at, timeFilter);
      const matchStock = stockFilter === 'all' || stockStatus === stockFilter;
      const matchUnit = unitFilter === 'all' || i.unit === unitFilter;
      const matchValue = numberInRange(totalValue, valueFilter);
      return matchCat && matchSearch && matchTime && matchStock && matchUnit && matchValue;
    })
    .sort((a, b) => {
      if (sortField === 'quantity') return a.quantity - b.quantity;
      if (sortField === 'cost') return b.cost - a.cost;
      return a.item_name.localeCompare(b.item_name);
    });
  const {
    page: inventoryPage,
    pageSize: inventoryPageSize,
    totalItems: inventoryTotalItems,
    paginatedItems: paginatedInventory,
    setPage: setInventoryPage,
  } = usePagination(filtered, 10, `${category}|${search}|${timeFilter}|${stockFilter}|${unitFilter}|${valueFilter}|${sortField}`);

  const handleSave = async (form) => {
    try {
      if (editItem) {
        const res = await api.patch(`inventory/${editItem.id}/`, form);
        setItems(prev => prev.map(i => i.id === editItem.id ? res.data : i));
      } else {
        const res = await api.post('inventory/', form);
        setItems(prev => [...prev, res.data]);
      }
      setIsModalOpen(false);
      setEditItem(null);
    } catch (err) {
      console.error('Failed to save inventory item:', err);
    }
  };

  const handleDelete = async (item) => {
    try {
      await api.delete(`inventory/${item.id}/`);
      setItems(prev => prev.filter(i => i.id !== item.id));
      showToast(`Deleted ${item.item_name} from inventory`, {
        type: 'warning',
        duration: 3000
      });
    } catch (err) {
      console.error('Failed to delete inventory item:', err);
    }
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
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Alert variant="warning" title="Low Stock Alert">
            <p className="text-xs">
              {lowStock.map(i => i.item_name).join(', ')} — need restocking.
            </p>
          </Alert>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Filtered Items', value: filtered.length, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Low Stock', value: filtered.filter(i => i.quantity <= i.min_stock).length, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Total Value', value: `$${filtered.reduce((s, i) => s + i.quantity * i.cost, 0).toFixed(0)}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Categories', value: new Set(filtered.map(i=>i.category)).size, icon: Package, color: 'text-violet-500', bg: 'bg-violet-500/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-300" />
          <input className="form-input pl-9 text-sm" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex space-x-2 overflow-x-auto">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${category === c ? 'bg-primary text-white' : 'glass-card text-gray-500 hover:text-primary'}`}>{c}</button>
          ))}
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setSortField('item_name')} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${sortField === 'item_name' ? 'bg-primary/10 text-primary' : 'glass-card text-slate-500 dark:text-slate-300'}`}><ArrowUpDown className="w-3 h-3" /><span>Name</span></button>
          <button onClick={() => setSortField('quantity')} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${sortField === 'quantity' ? 'bg-primary/10 text-primary' : 'glass-card text-slate-500 dark:text-slate-300'}`}><ArrowUpDown className="w-3 h-3" /><span>Qty</span></button>
        </div>
        <div className="flex flex-wrap gap-2">
          <DatePresetSelect value={timeFilter} onChange={setTimeFilter} label="Inventory updated time" />
          <FilterSelect
            value={stockFilter}
            onChange={setStockFilter}
            label="Stock level"
            options={[
              { value: 'all', label: 'All stock levels' },
              { value: 'good', label: 'Good' },
              { value: 'low', label: 'Low' },
              { value: 'critical', label: 'Critical' },
            ]}
          />
          <FilterSelect
            value={unitFilter}
            onChange={setUnitFilter}
            label="Unit"
            options={unitOptions.map(unit => ({ value: unit, label: unit === 'all' ? 'All units' : unit }))}
          />
          <FilterSelect
            value={valueFilter}
            onChange={setValueFilter}
            label="Inventory value"
            options={[
              { value: 'all', label: 'All values' },
              { value: 'under500', label: 'Under $500' },
              { value: '500to1000', label: '$500 - $1,000' },
              { value: '1000plus', label: '$1,000+' },
            ]}
          />
          <ResetFiltersButton onClick={() => {
            setSearch('');
            setCategory('All');
            setTimeFilter('all');
            setStockFilter('all');
            setUnitFilter('all');
            setValueFilter('all');
            setSortField('item_name');
          }} />
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
              {paginatedInventory.map((item, idx) => {
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
                    <td className="font-bold">{item.quantity} <span className="text-slate-500 dark:text-slate-300 font-normal text-xs">{item.unit}</span></td>
                    <td className="w-32">
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(status.percent, 100)}%` }}
                          transition={{ duration: 1, delay: idx * 0.05 + 0.3 }}
                          className={`h-full rounded-full ${status.bar}`}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">Min: {item.min_stock} {item.unit}</p>
                    </td>
                    <td className="text-sm">${Number(item.cost).toFixed(2)}</td>
                    <td className="font-bold text-emerald-500">${(item.quantity * item.cost).toFixed(2)}</td>
                    <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                    <td>
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditItem(item); setIsModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-500 dark:text-slate-300 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setItemToDelete(item)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 dark:text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 dark:text-slate-300">
            <Package className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p>No inventory items found</p>
          </div>
        )}
        <PaginationFooter
          page={inventoryPage}
          totalItems={inventoryTotalItems}
          pageSize={inventoryPageSize}
          onPageChange={setInventoryPage}
        />
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
