import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Plus, Search, Edit2, Trash2, X, TrendingUp, Users, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import staffTeamImg from '../assets/staff_team.png';

/* ── Mock Salary Data ── */
const mockSalaries = [
  { id: 1, employee_id: 1, employee_name: 'Ahmed Hassan', job_title: 'Head Chef', base_salary: 3500, bonus: 500, deduction: 0, payment_date: '2026-04-30', status: 'paid' },
  { id: 2, employee_id: 2, employee_name: 'Sarah Mohammed', job_title: 'Cashier', base_salary: 2000, bonus: 200, deduction: 50, payment_date: '2026-04-30', status: 'pending' },
  { id: 3, employee_id: 3, employee_name: 'John Doe', job_title: 'Kitchen Staff', base_salary: 1800, bonus: 0, deduction: 100, payment_date: '2026-04-30', status: 'paid' },
  { id: 4, employee_id: 4, employee_name: 'Fatima Ali', job_title: 'Server', base_salary: 1700, bonus: 150, deduction: 0, payment_date: '2026-04-30', status: 'pending' },
  { id: 5, employee_id: 5, employee_name: 'Mohammed Khalid', job_title: 'Barista', base_salary: 2200, bonus: 300, deduction: 75, payment_date: '2026-04-30', status: 'paid' },
  { id: 6, employee_id: 6, employee_name: 'Aisha Noor', job_title: 'Inventory Manager', base_salary: 2800, bonus: 400, deduction: 0, payment_date: '2026-04-30', status: 'processing' },
];

const getNet = (s) => s.base_salary + s.bonus - s.deduction;

const STATUS_CFG = {
  paid: { label: 'Paid', cls: 'badge-green', icon: CheckCircle },
  pending: { label: 'Pending', cls: 'badge-yellow', icon: Clock },
  processing: { label: 'Processing', cls: 'badge-blue', icon: AlertCircle },
};

/* ── Salary Modal ── */
const SalaryModal = ({ record, onClose, onSave }) => {
  const [form, setForm] = useState(record || { employee_name: '', job_title: '', base_salary: '', bonus: '0', deduction: '0', payment_date: '', status: 'pending' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100 dark:border-slate-700 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-black gradient-text mb-6">{record ? 'Edit Salary' : 'Add Salary Record'}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Employee Name</label>
              <input className="form-input" value={form.employee_name} onChange={e => setForm({ ...form, employee_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Job Title</label>
              <input className="form-input" value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Base ($)</label>
              <input className="form-input" type="number" value={form.base_salary} onChange={e => setForm({ ...form, base_salary: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Bonus ($)</label>
              <input className="form-input" type="number" value={form.bonus} onChange={e => setForm({ ...form, bonus: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Deduction ($)</label>
              <input className="form-input" type="number" value={form.deduction} onChange={e => setForm({ ...form, deduction: e.target.value })} />
            </div>
          </div>
          <div className="glass-card p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Net Salary</span>
            <span className="text-xl font-black text-emerald-500">
              ${(Number(form.base_salary || 0) + Number(form.bonus || 0) - Number(form.deduction || 0)).toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Payment Date</label>
              <input className="form-input" type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800">Cancel</button>
          <button onClick={() => onSave({ ...form, base_salary: Number(form.base_salary), bonus: Number(form.bonus), deduction: Number(form.deduction) })} className="flex-1 btn-primary py-2.5 text-sm">Save</button>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Main ── */
const Salaries = () => {
  const [salaries, setSalaries] = useState(mockSalaries);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const totalPayroll = salaries.reduce((s, r) => s + getNet(r), 0);
  const paidCount = salaries.filter(r => r.status === 'paid').length;
  const totalBonuses = salaries.reduce((s, r) => s + r.bonus, 0);
  const totalDeductions = salaries.reduce((s, r) => s + r.deduction, 0);

  const filtered = salaries.filter(s =>
    s.employee_name.toLowerCase().includes(search.toLowerCase()) ||
    s.job_title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (form) => {
    if (editRecord) {
      setSalaries(prev => prev.map(s => s.id === editRecord.id ? { ...s, ...form } : s));
    } else {
      setSalaries(prev => [...prev, { ...form, id: Date.now(), employee_id: Date.now() }]);
    }
    setIsModalOpen(false);
    setEditRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Salary & Payroll</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage employee salaries, bonuses and deductions.</p>
        </div>
        <button onClick={() => { setEditRecord(null); setIsModalOpen(true); }} className="btn-primary flex items-center space-x-2 self-start">
          <Plus className="w-5 h-5" />
          <span>Add Record</span>
        </button>
      </motion.div>

      {/* Banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative rounded-2xl overflow-hidden h-36 shadow-xl">
        <img src={staffTeamImg} alt="Staff" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-dark/30 flex items-center px-8">
          <div>
            <p className="text-white/60 text-sm">This Month's Payroll</p>
            <h2 className="text-white text-3xl font-black">${totalPayroll.toLocaleString()}</h2>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Payroll', value: `$${totalPayroll.toLocaleString()}`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Employees', value: salaries.length, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Total Bonuses', value: `$${totalBonuses.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Deductions', value: `$${totalDeductions.toLocaleString()}`, icon: Calendar, color: 'text-red-400', bg: 'bg-red-400/10' },
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

      {/* Payroll Progress */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Payroll Status</h3>
          <span className="text-sm text-gray-400">{paidCount}/{salaries.length} processed</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(paidCount / salaries.length) * 100}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{Math.round((paidCount / salaries.length) * 100)}% payroll completed</p>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="form-input pl-9 text-sm" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>
                <th>Base Salary</th>
                <th>Bonus</th>
                <th>Deduction</th>
                <th>Net Salary</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record, idx) => {
                const cfg = STATUS_CFG[record.status];
                return (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                  >
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                          {record.employee_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm">{record.employee_name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-gray-400">{record.job_title}</td>
                    <td className="font-medium">${record.base_salary.toLocaleString()}</td>
                    <td className="text-emerald-500 font-medium">+${record.bonus}</td>
                    <td className="text-red-400 font-medium">-${record.deduction}</td>
                    <td className="font-black text-primary">${getNet(record).toLocaleString()}</td>
                    <td className="text-xs text-gray-400">{record.payment_date}</td>
                    <td><span className={`badge ${cfg.cls} gap-1`}><cfg.icon className="w-3 h-3" />{cfg.label}</span></td>
                    <td>
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditRecord(record); setIsModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setSalaries(prev => prev.filter(s => s.id !== record.id))} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
            <DollarSign className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p>No salary records found</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <SalaryModal record={editRecord} onClose={() => { setIsModalOpen(false); setEditRecord(null); }} onSave={handleSave} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Salaries;
