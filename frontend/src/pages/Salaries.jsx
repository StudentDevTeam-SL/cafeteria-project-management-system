import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Plus, Search, Edit2, Trash2, X,
  TrendingUp, Users, Calendar, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import Alert from '../components/Alert';
import PaginationFooter from '../components/PaginationFooter';
import { DatePresetSelect, FilterSelect, ResetFiltersButton } from '../components/FilterControls';
import { usePagination } from '../hooks/usePagination';
import staffTeamImg from '../assets/staff_team.png';
import { matchesDatePreset, normalizeText, numberInRange, uniqueOptions } from '../utils/filterUtils';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

// Helper: compute net from plain numbers
const getNet = (s) => Number(s.base_salary) + Number(s.bonus) - Number(s.deduction);

const STATUS_CFG = {
  paid:       { label: 'Paid',       cls: 'badge-green',  icon: CheckCircle },
  pending:    { label: 'Pending',    cls: 'badge-yellow', icon: Clock       },
  processing: { label: 'Processing', cls: 'badge-blue',   icon: AlertCircle },
};

/* ── Salary Modal — uses employee dropdown (FK-safe) ── */
const SalaryModal = ({ record, employees, onClose, onSave }) => {
  const defaultForm = {
    employee:     '',
    base_salary:  '',
    bonus:        '0',
    deduction:    '0',
    payment_date: '',
    status:       'pending',
  };

  // When editing, seed form from existing record
  const [form, setForm] = useState(
    record
      ? {
          employee:     record.employee ?? '',
          base_salary:  record.base_salary,
          bonus:        record.bonus,
          deduction:    record.deduction,
          payment_date: record.payment_date,
          status:       record.status,
        }
      : defaultForm
  );
  const [formError, setFormError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const net = Number(form.base_salary || 0) + Number(form.bonus || 0) - Number(form.deduction || 0);

  const parseMoney = (value, fallback = 0) => {
    if (value === '' || value === null || value === undefined) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  };

  const handleSave = () => {
    if (!form.employee) {
      setFormError('Please select an employee before saving this salary record.');
      return;
    }
    const baseSalary = parseMoney(form.base_salary, null);
    const bonus = parseMoney(form.bonus);
    const deduction = parseMoney(form.deduction);
    if (baseSalary === null || bonus === null || deduction === null) {
      setFormError('Salary, bonus, and deduction must be valid positive numbers.');
      return;
    }
    if (!form.payment_date) {
      setFormError('Please choose a payment date before saving this salary record.');
      return;
    }
    setFormError('');
    onSave({
      employee:     Number(form.employee),
      base_salary:  baseSalary,
      bonus,
      deduction,
      payment_date: form.payment_date,
      status:       form.status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md dark:border-slate-700 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-black gradient-text mb-6">{record ? 'Edit Salary' : 'Add Salary Record'}</h2>

        <div className="space-y-4">
          {formError && (
            <Alert variant="error" title="Missing employee">
              {formError}
            </Alert>
          )}

          {/* Employee dropdown — sends FK integer, not a free-text name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Employee</label>
            <select
              className="form-input"
              value={form.employee}
              onChange={e => { set('employee', e.target.value); setFormError(''); }}
            >
              <option value="">Select employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} — {emp.job_title || emp.position}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Base ($)</label>
              <input className="form-input" type="number" min="0" value={form.base_salary} onChange={e => set('base_salary', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Bonus ($)</label>
              <input className="form-input" type="number" min="0" value={form.bonus} onChange={e => set('bonus', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Deduction ($)</label>
              <input className="form-input" type="number" min="0" value={form.deduction} onChange={e => set('deduction', e.target.value)} />
            </div>
          </div>

          <div className="glass-card p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Net Salary</span>
            <span className="text-xl font-black text-emerald-500">${net.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Payment Date</label>
              <input className="form-input" type="date" value={form.payment_date} onChange={e => set('payment_date', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Status</label>
              <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800">Cancel</button>
          <button onClick={handleSave} className="flex-1 btn-primary py-2.5 text-sm">Save</button>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Main ── */
const Salaries = () => {
  const { showToast } = useToast();
  const [salaries,     setSalaries]     = useState([]);
  const [employees,    setEmployees]    = useState([]);   // for dropdown
  const [search,       setSearch]       = useState('');
  const [timeFilter,   setTimeFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [payFilter,    setPayFilter]    = useState('all');
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [editRecord,   setEditRecord]   = useState(null);

  const fetchSalaries = async () => {
    try {
      const res = await api.get('salaries/');
      setSalaries(res.data.results || res.data);
    } catch (err) { console.error('Failed to fetch salaries:', err); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('employees/');
      setEmployees(res.data.results || res.data);
    } catch (err) { console.error('Failed to fetch employees:', err); }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSalaries();
    fetchEmployees();
  }, []);

  // Search by employee_name or employee_position returned by serializer
  const employeeOptions = uniqueOptions(salaries, s => s.employee_name);
  const filtered = salaries.filter(s => {
    const matchSearch = normalizeText(s.employee_name).includes(normalizeText(search)) ||
      normalizeText(s.employee_position).includes(normalizeText(search));
    const matchTime = matchesDatePreset(s.payment_date, timeFilter);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchEmployee = employeeFilter === 'all' || s.employee_name === employeeFilter;
    const matchPay = numberInRange(getNet(s), payFilter);
    return matchSearch && matchTime && matchStatus && matchEmployee && matchPay;
  });
  const totalPayroll    = filtered.reduce((s, r) => s + getNet(r), 0);
  const paidCount       = filtered.filter(r => r.status === 'paid').length;
  const totalBonuses    = filtered.reduce((s, r) => s + Number(r.bonus), 0);
  const totalDeductions = filtered.reduce((s, r) => s + Number(r.deduction), 0);

  const {
    page: salariesPage,
    pageSize: salariesPageSize,
    totalItems: salariesTotalItems,
    paginatedItems: paginatedSalaries,
    setPage: setSalariesPage,
  } = usePagination(filtered, 10, `${search}|${timeFilter}|${statusFilter}|${employeeFilter}|${payFilter}`);

  const handleSave = async (form) => {
    try {
      if (editRecord) {
        const res = await api.patch(`salaries/${editRecord.id}/`, form);
        setSalaries(prev => prev.map(s => s.id === editRecord.id ? res.data : s));
      } else {
        const res = await api.post('salaries/', form);
        setSalaries(prev => [...prev, res.data]);
      }
      setIsModalOpen(false);
      setEditRecord(null);
    } catch (err) {
      console.error('Failed to save salary record:', err.response?.data || err.message);
      showToast(`Error: ${JSON.stringify(err.response?.data || err.message)}`, { type: 'error', duration: 5000 });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`salaries/${id}/`);
      setSalaries(prev => prev.filter(s => s.id !== id));
    } catch (err) { console.error('Failed to delete salary record:', err); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Salary &amp; Payroll</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage employee salaries, bonuses and deductions.</p>
        </div>
        <button onClick={() => { setEditRecord(null); setIsModalOpen(true); }} className="btn-primary flex items-center space-x-2 self-start">
          <Plus className="w-5 h-5" /><span>Add Record</span>
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
          { label: 'Total Payroll',  value: `$${totalPayroll.toLocaleString()}`,    icon: DollarSign, color: 'text-primary',     bg: 'bg-primary/10'     },
          { label: 'Records',        value: filtered.length,                        icon: Users,      color: 'text-violet-500',  bg: 'bg-violet-500/10'  },
          { label: 'Total Bonuses',  value: `$${totalBonuses.toLocaleString()}`,    icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Deductions',     value: `$${totalDeductions.toLocaleString()}`, icon: Calendar,   color: 'text-red-400',     bg: 'bg-red-400/10'     },
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

      {/* Payroll Progress */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Payroll Status</h3>
          <span className="text-sm text-slate-500 dark:text-slate-300">{paidCount}/{filtered.length} processed</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: filtered.length ? `${(paidCount / filtered.length) * 100}%` : '0%' }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-300 mt-2">
          {filtered.length ? Math.round((paidCount / filtered.length) * 100) : 0}% payroll completed
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-300" />
          <input className="form-input pl-9 text-sm" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <DatePresetSelect value={timeFilter} onChange={setTimeFilter} label="Payment date time" />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            label="Salary status"
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
            label="Employee"
            options={[
              { value: 'all', label: 'All employees' },
              ...employeeOptions.map(name => ({ value: name, label: name })),
            ]}
          />
          <FilterSelect
            value={payFilter}
            onChange={setPayFilter}
            label="Net salary"
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
              {paginatedSalaries.map((record, idx) => {
                const cfg = STATUS_CFG[record.status] || STATUS_CFG.pending;
                return (
                  <motion.tr key={record.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                          {(record.employee_name || '?').charAt(0)}
                        </div>
                        <span className="font-semibold text-sm">{record.employee_name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500 dark:text-slate-300">{record.employee_position}</td>
                    <td className="font-medium">${Number(record.base_salary).toLocaleString()}</td>
                    <td className="text-emerald-500 font-medium">+${Number(record.bonus)}</td>
                    <td className="text-red-400 font-medium">-${Number(record.deduction)}</td>
                    <td className="font-black text-primary">${getNet(record).toLocaleString()}</td>
                    <td className="text-xs text-slate-500 dark:text-slate-300">{record.payment_date}</td>
                    <td><span className={`badge ${cfg.cls} gap-1`}><cfg.icon className="w-3 h-3" />{cfg.label}</span></td>
                    <td>
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditRecord(record); setIsModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-500 dark:text-slate-300 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(record.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 dark:text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
            <DollarSign className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p>No salary records found</p>
          </div>
        )}
        <PaginationFooter
          page={salariesPage}
          totalItems={salariesTotalItems}
          pageSize={salariesPageSize}
          onPageChange={setSalariesPage}
        />
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <SalaryModal
            record={editRecord}
            employees={employees}
            onClose={() => { setIsModalOpen(false); setEditRecord(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Salaries;
