import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Shield, Mail, User, Lock, Briefcase, Search, Edit2, Trash2, Phone, CreditCard, ShoppingCart, Plus, Minus, Check, Clock, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import PaymentModal from '../components/PaymentModal';
import api from '../api/axios';

// MOCK_EMPLOYEES removed, fetching from API

/* ── Employee Form Modal ── */
const SHIFT_HOURS = {
  'Morning': '06:00 - 14:00',
  'Evening': '14:00 - 22:00',
  'Night': '22:00 - 06:00',
  'Full Time': '08:00 - 17:00'
};

const EmployeeModal = React.memo(({ emp, onClose, onSave }) => {
  const [form, setForm] = useState(emp || { user_id:'', full_name:'', phone:'', job_title:'', status:'active', shift:'', hours:'' });
  const [busy, setBusy] = useState(false);
  
  const parseHours = (h) => {
    const p = (h || '').split(' - ');
    return { 
      start: p[0]?.match(/^\d{2}:\d{2}$/) ? p[0] : '08:00',
      end: p[1]?.match(/^\d{2}:\d{2}$/) ? p[1] : '16:00'
    };
  };
  const { start, end } = parseHours(form.hours);

  const handleShiftChange = (e) => {
    const shift = e.target.value;
    const updates = { shift };
    if (SHIFT_HOURS[shift]) updates.hours = SHIFT_HOURS[shift];
    setForm(f => ({ ...f, ...updates }));
  };

  const submit = async e => { e.preventDefault(); setBusy(true); await new Promise(r=>setTimeout(r,700)); onSave({...form, hours: `${start} - ${end}`}); setBusy(false); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{opacity:0,scale:.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.9}}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-slate-700 relative max-h-[90vh] overflow-y-auto">
        <div className="h-1 bg-gradient-to-r from-primary to-accent" />
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400"><X className="w-5 h-5" /></button>
        <div className="p-6">
          <h2 className="text-2xl font-black gradient-text mb-5">{emp ? 'Edit Employee' : 'Add Employee'}</h2>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="field-label">User ID (Optional)</label><input type="number" className="form-input" value={form.user_id} onChange={e=>setForm({...form,user_id:e.target.value})} placeholder="Linked User ID" /></div>
              <div><label className="field-label">Full Name</label><input required className="form-input" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Full name" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="field-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+252 63 000 0000" /></div>
              <div><label className="field-label">Job Title</label><input required className="form-input" value={form.job_title} onChange={e=>setForm({...form,job_title:e.target.value})} placeholder="e.g. Chef" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1"><label className="field-label">Shift</label><select className="form-input" value={form.shift} onChange={handleShiftChange}><option value="">Select...</option><option>Morning</option><option>Evening</option><option>Night</option><option>Full Time</option></select></div>
              <div className="col-span-2">
                <label className="field-label">Working Hours</label>
                <div className="flex items-center gap-3">
                  <input type="time" className="form-input text-center" value={start} onChange={e => setForm({...form, hours: `${e.target.value} - ${end}`})} />
                  <span className="text-slate-400 font-bold">-</span>
                  <input type="time" className="form-input text-center" value={end} onChange={e => setForm({...form, hours: `${start} - ${e.target.value}`})} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 mt-2">
              <span className="text-sm font-medium">Employee Active Status</span>
              <button type="button" onClick={() => setForm({ ...form, status: form.status === 'active' ? 'inactive' : 'active' })}>
                {form.status === 'active' ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
              </button>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" disabled={busy} className="flex-1 btn-primary py-3 text-sm flex items-center justify-center">
                {busy ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (emp ? 'Update' : 'Save Employee')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
});



/* ── Main ── */
const Employees = () => {
  const { user, switchRole } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'Admin';
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmp, setEditEmp]     = useState(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setFilter] = useState('all');
  const [empToDelete, setEmpToDelete] = useState(null);


  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('employees/');
      setEmployees(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const filtered = employees.filter(e => {
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchSearch = e.full_name.toLowerCase().includes(search.toLowerCase()) || 
                        e.job_title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleSave = async form => {
    try {
      const payload = { ...form };
      if (!payload.user_id || payload.user_id === '') {
        payload.user_id = null;
      } else {
        payload.user_id = parseInt(payload.user_id, 10);
      }
      
      if (editEmp) {
        const res = await api.patch(`employees/${editEmp.id}/`, payload);
        setEmployees(p => p.map(e => e.id === editEmp.id ? res.data : e));
        showToast('Employee updated successfully', { type: 'success' });
      } else {
        const res = await api.post('employees/', payload);
        setEmployees(p => [...p, res.data]);
        showToast('Employee added successfully', { type: 'success' });
      }
      setModalOpen(false); setEditEmp(null);
    } catch (err) {
      console.error('Failed to save employee:', err.response?.data || err.message);
      showToast(`Error: ${JSON.stringify(err.response?.data || err.message)}`, { type: 'error', duration: 5000 });
    }
  };

  const handleDelete = async (emp) => {
    try {
      await api.delete(`employees/${emp.id}/`);
      setEmployees(p => p.filter(e => e.id !== emp.id));
      showToast(`Deleted employee ${emp.full_name}`, { type: 'warning', duration: 3000 });
    } catch (err) { console.error('Failed to delete employee:', err); }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`employees/${id}/toggle/`);
      setEmployees(p => p.map(e => e.id === id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e));
    } catch (err) { console.error('Failed to toggle status:', err); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Employee Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage cafeteria staff, roles and permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Role switcher for testing */}
          <motion.button whileHover={{scale:1.04}} onClick={switchRole}
            className="px-4 py-2.5 rounded-xl glass-card text-xs font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> View as: {user?.role}
          </motion.button>
          <motion.button whileHover={{scale:1.05,y:-2}} whileTap={{scale:.97}}
            onClick={()=>{setEditEmp(null);setModalOpen(true);}}
            className="btn-primary ripple-btn flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Add Employee
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label:'Total Staff',    value:employees.length,                                           color:'text-primary',     bg:'bg-primary/10'     },
          { label:'Active',         value:employees.filter(e=>e.status==='active').length,            color:'text-emerald-500', bg:'bg-emerald-500/10' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.08}}
            whileHover={{y:-4,scale:1.02}} className="glass-card hover-lift p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <User className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="form-input pl-9 text-sm" placeholder="Search employees..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {['all', 'active', 'inactive'].map(f => (
            <motion.button key={f} whileHover={{scale:1.05}} whileTap={{scale:.97}} onClick={()=>setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${statusFilter===f?'bg-primary text-white shadow-lg shadow-primary/30':'glass-card text-slate-500 hover:text-primary'}`}>
              {f === 'all' ? 'All Staff' : f}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map(emp => (
            <motion.div 
              layout 
              initial={{opacity:0,y:20,scale:.95}} 
              animate={{opacity:1,y:0,scale:1}} 
              exit={{opacity:0,scale:.9, transition: { duration: 0.15 }}}
              whileHover={{y:-5}} 
              key={emp.id}
              className="glass-card p-6 relative group flex flex-col"
            >
              {/* Top */}
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary/20">
                    {emp.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base truncate pr-2">{emp.full_name}</h3>
                    <p className="text-xs text-slate-400 truncate">User ID: {emp.user_id || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={()=>{setEditEmp(emp);setModalOpen(true);}} className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={()=>setEmpToDelete(emp)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {/* Info */}
              <div className="space-y-1.5 text-sm flex-1">
                <div className="flex items-center gap-2 text-slate-400"><Briefcase className="w-3.5 h-3.5 shrink-0" /><span className="text-xs truncate">{emp.job_title}</span></div>
                <div className="flex items-center gap-2 text-slate-400"><Phone className="w-3.5 h-3.5 shrink-0" /><span className="text-xs truncate">{emp.phone}</span></div>
                <div className="flex items-center gap-2 text-slate-400"><Calendar className="w-3.5 h-3.5 shrink-0" /><span className="text-xs truncate">{emp.shift || 'No shift set'}</span></div>
                <div className="flex items-center gap-2 text-slate-400"><Clock className="w-3.5 h-3.5 shrink-0" /><span className="text-xs truncate">{emp.hours || 'No hours set'}</span></div>
              </div>
              {/* Status */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/40">
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${emp.status==='active'?'text-emerald-500':'text-slate-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${emp.status==='active'?'bg-emerald-500 animate-pulse':'bg-slate-400'}`} />
                  {emp.status}
                </span>
                <button onClick={() => handleToggleStatus(emp.id)} title="Toggle Active Status" className="hover:scale-110 transition-transform">
                  {emp.status === 'active' ? <ToggleRight className="w-7 h-7 text-emerald-500" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {modalOpen && (
          <EmployeeModal emp={editEmp} onClose={()=>{setModalOpen(false);setEditEmp(null);}} onSave={handleSave} />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!empToDelete}
        title="Delete Employee"
        message={`Are you sure you want to remove "${empToDelete?.full_name}" from the system?`}
        onConfirm={() => { handleDelete(empToDelete); setEmpToDelete(null); }}
        onCancel={() => setEmpToDelete(null)}
      />
    </div>
  );
};

export default Employees;
