import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  DollarSign, ShoppingBag, AlertTriangle, TrendingUp, TrendingDown,
  Users, ArrowUpRight, ArrowDownRight, Clock,
  CheckCircle, XCircle, Loader, Star, BriefcaseBusiness, MessageSquare,
  Bell, DatabaseBackup, DownloadCloud, UploadCloud, RefreshCcw, ShieldCheck,
  UserCheck, Activity, CalendarDays, ChevronRight, Utensils, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import api from '../api/axios';

const categoryData = [
  { name: 'Main Course', value: 45, color: '#0f766e' },
  { name: 'Beverages', value: 25, color: '#2563eb' },
  { name: 'Snacks', value: 20, color: '#f59e0b' },
  { name: 'Others', value: 10, color: '#e11d48' },
];

const topItems = [
  { name: 'Double Burger', sales: 142, trend: 'up' },
  { name: 'Chicken Pizza', sales: 98, trend: 'up' },
  { name: 'Iced Latte', sales: 76, trend: 'down' },
  { name: 'Caesar Salad', sales: 54, trend: 'up' },
];

const toneStyles = {
  blue: {
    icon: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
    accent: 'bg-blue-500',
    ring: 'ring-blue-500/10',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    accent: 'bg-emerald-500',
    ring: 'ring-emerald-500/10',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    accent: 'bg-amber-500',
    ring: 'ring-amber-500/10',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
    accent: 'bg-rose-500',
    ring: 'ring-rose-500/10',
  },
  teal: {
    icon: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300',
    accent: 'bg-teal-500',
    ring: 'ring-teal-500/10',
  },
  violet: {
    icon: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
    accent: 'bg-violet-500',
    ring: 'ring-violet-500/10',
  },
};

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`;

const formatMetric = (value) => Number(value || 0).toLocaleString();

const EmptyChartState = ({ label }) => (
  <div className="flex h-full min-h-44 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm font-semibold text-slate-400 dark:border-white/10 dark:text-slate-500">
    {label}
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="dashboard-icon-soft">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div>
        <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-300">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

const StatCard = React.memo(({ title, value, icon: Icon, trend, trendValue, tone = 'blue', description, delay }) => {
  const styles = toneStyles[tone] || toneStyles.blue;
  const positive = trend !== 'down';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`dashboard-stat-card ${styles.ring}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${styles.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`dashboard-trend ${positive ? 'dashboard-trend-up' : 'dashboard-trend-down'}`}>
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {trendValue}
        </span>
      </div>
      <div className="mt-5">
        <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</h3>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-300">{description}</p>
      </div>
    </motion.div>
  );
});

const StatusBadge = React.memo(({ status }) => {
  const map = {
    completed: { cls: 'badge-green', icon: CheckCircle, label: 'Completed' },
    processing: { cls: 'badge-blue', icon: Loader, label: 'Processing' },
    pending: { cls: 'badge-yellow', icon: Clock, label: 'Pending' },
    cancelled: { cls: 'badge-red', icon: XCircle, label: 'Cancelled' },
  };
  const { cls, icon: Icon, label } = map[status] || map.pending;

  return (
    <span className={`badge ${cls} gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
});

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-slate-950/10 dark:border-white/10 dark:bg-slate-950">
      <p className="mb-2 text-xs font-black uppercase text-slate-500 dark:text-slate-400">{label}</p>
      {payload.map((p) => (
        <p key={`${p.dataKey}-${p.name}`} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {p.dataKey === 'sales' ? formatCurrency(p.value) : formatMetric(p.value)}
        </p>
      ))}
    </div>
  );
};

const NotificationDrawer = ({ open, onClose, notifications, loading }) => {
  const severityClasses = {
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-400/20',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-400/20',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/20',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.button
            type="button"
            aria-label="Close notifications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ duration: 0.25 }}
            className="relative h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-teal-600 dark:text-teal-300">Notification Center</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Manager updates</h2>
              </div>
              <button type="button" onClick={onClose} className="dashboard-action dashboard-action-ghost px-3 py-2">
                Close
              </button>
            </div>

            {loading && <div className="py-12 text-center text-sm font-semibold text-slate-400">Loading notifications...</div>}
            {!loading && notifications.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">
                No notifications right now.
              </div>
            )}
            <div className="space-y-3">
              {notifications.map((item) => (
                <Link
                  key={item.id}
                  to={item.href || '#'}
                  onClick={onClose}
                  className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:bg-teal-50/60 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-teal-400/30 dark:hover:bg-teal-400/10"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${severityClasses[item.severity] || severityClasses.info}`}>
                      {item.severity}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : 'Now'}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">{item.message}</p>
                </Link>
              ))}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

const PeopleInsights = ({ roleBreakdown, employeeStatus, jobPipeline }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.34 }}
    className="grid grid-cols-1 gap-5 xl:grid-cols-3"
  >
    <div className="dashboard-panel p-5">
      <SectionHeader icon={UserCheck} title="People by Role" subtitle="Staffing shape across the floor" />
      <div className="h-56 min-h-56 min-w-0">
        {roleBreakdown?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roleBreakdown}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="people" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChartState label="No role data yet" />}
      </div>
    </div>

    <div className="dashboard-panel p-5">
      <SectionHeader icon={Users} title="Employees" subtitle="Active and inactive records" />
      <div className="h-56 min-h-56 min-w-0">
        {employeeStatus?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={employeeStatus} cx="50%" cy="50%" outerRadius={82} dataKey="value" label>
                {employeeStatus.map((entry, index) => (
                  <Cell key={entry.name} fill={index === 0 ? '#10b981' : '#f97316'} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} employees`} contentStyle={{ background: 'rgba(15,23,42,0.92)', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : <EmptyChartState label="No employee status yet" />}
      </div>
    </div>

    <div className="dashboard-panel p-5">
      <SectionHeader icon={BriefcaseBusiness} title="Job Pipeline" subtitle="Applicant movement by stage" />
      <div className="h-56 min-h-56 min-w-0">
        {jobPipeline?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jobPipeline}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="applications" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChartState label="No applications yet" />}
      </div>
    </div>
  </motion.div>
);

const LoginActivityPanel = ({ rows }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.42 }}
    className="dashboard-panel overflow-hidden"
  >
    <div className="border-b border-slate-200 p-5 dark:border-white/10">
      <SectionHeader
        icon={ShieldCheck}
        title="Manager/Admin Login Activity"
        subtitle="Who entered the admin area and whether the session is still open."
      />
    </div>
    <div className="overflow-x-auto">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Login Time</th>
            <th>Closed Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <p className="text-sm font-black">{row.full_name || row.username}</p>
                <p className="text-xs font-semibold text-slate-400">{row.username}</p>
              </td>
              <td><span className="badge badge-blue">{row.role}</span></td>
              <td className="text-xs font-semibold text-slate-500 dark:text-slate-300">{new Date(row.login_at).toLocaleString()}</td>
              <td className="text-xs font-semibold text-slate-500 dark:text-slate-300">{row.logout_at ? new Date(row.logout_at).toLocaleString() : 'Open session'}</td>
              <td><span className={`badge ${row.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{row.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="py-10 text-center text-sm font-semibold text-slate-400">No login activity yet.</div>}
    </div>
  </motion.div>
);

const BackupRestorePanel = ({
  tables,
  selectedTables,
  onToggleTable,
  onSelectAll,
  onExport,
  onRestoreFile,
  onRestore,
  status,
  restoreFileName,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.38 }}
    className="dashboard-panel p-5"
  >
    <SectionHeader
      icon={DatabaseBackup}
      title="Database Backup and Restore"
      subtitle="Admin tools for exporting and restoring selected operational tables."
      action={(
        <button type="button" onClick={onSelectAll} className="dashboard-action dashboard-action-ghost">
          <RefreshCcw className="h-4 w-4" />
          Toggle All
        </button>
      )}
    />

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {tables.map((table) => (
        <label key={table.key} className="dashboard-check-row">
          <input
            type="checkbox"
            checked={selectedTables.includes(table.key)}
            onChange={() => onToggleTable(table.key)}
            className="h-4 w-4 rounded border-slate-300 accent-teal-600"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-slate-900 dark:text-white">{table.label}</span>
            <span className="text-xs font-semibold text-slate-400">{table.count} rows</span>
          </span>
        </label>
      ))}
    </div>

    <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onExport} className="dashboard-action dashboard-action-primary">
          <DownloadCloud className="h-4 w-4" />
          Export Selected
        </button>
        <label className="dashboard-action dashboard-action-ghost cursor-pointer">
          <UploadCloud className="h-4 w-4" />
          Choose Backup File
          <input type="file" accept="application/json,.json" onChange={onRestoreFile} className="hidden" />
        </label>
        <button type="button" onClick={onRestore} className="dashboard-action dashboard-action-ghost">
          <DatabaseBackup className="h-4 w-4" />
          Restore Selected
        </button>
      </div>
      <div className="text-sm font-semibold text-slate-500 dark:text-slate-300">
        {restoreFileName && <span className="font-black text-teal-600 dark:text-teal-300">{restoreFileName}</span>}
        {status && <span className={restoreFileName ? 'ml-3' : ''}>{status}</span>}
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const [activeChart, setActiveChart] = useState('sales');
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    staff: 0,
    lowStock: 0,
    employeeStatus: [],
    roleBreakdown: [],
    jobPipeline: [],
    loginActivity: [],
    notificationCount: 0,
  });
  const [orders, setOrders] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [backupTables, setBackupTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [backupStatus, setBackupStatus] = useState('');
  const [restorePayload, setRestorePayload] = useState(null);
  const [restoreFileName, setRestoreFileName] = useState('');

  const canManage = user?.role === 'Admin' || user?.role === 'Manager';
  const isAdmin = user?.role === 'Admin';

  const fetchNotifications = useCallback(async () => {
    if (!canManage) return;
    setNotificationsLoading(true);
    try {
      const response = await api.get('dashboard/notifications/');
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setNotificationsLoading(false);
    }
  }, [canManage]);

  const fetchBackupTables = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const response = await api.get('dashboard/backup/tables/');
      const tables = response.data.tables || [];
      setBackupTables(tables);
      setSelectedTables((current) => current.length ? current : tables.map((table) => table.key));
    } catch (err) {
      console.error('Failed to fetch backup tables:', err);
      setBackupStatus('Could not load backup tables.');
    }
  }, [isAdmin]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [sRes, oRes] = await Promise.all([
        api.get('dashboard/stats/'),
        api.get('orders/')
      ]);
      setStats(sRes.data);
      setOrders((oRes.data.results || oRes.data).slice(0, 5));
      setWeeklyData([
        { name: 'Mon', sales: 4200, orders: 42 },
        { name: 'Tue', sales: 3800, orders: 38 },
        { name: 'Wed', sales: 5600, orders: 56 },
        { name: 'Thu', sales: 4900, orders: 49 },
        { name: 'Fri', sales: 7200, orders: 72 },
        { name: 'Sat', sales: 8100, orders: 81 },
        { name: 'Sun', sales: 6800, orders: 68 },
      ]);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  }, []);

  const toggleBackupTable = (key) => {
    setSelectedTables((current) => (
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    ));
  };

  const toggleAllBackupTables = () => {
    setSelectedTables((current) => (
      current.length === backupTables.length ? [] : backupTables.map((table) => table.key)
    ));
  };

  const exportBackup = async () => {
    if (!selectedTables.length) {
      setBackupStatus('Select at least one table to export.');
      return;
    }
    setBackupStatus('Exporting selected tables...');
    try {
      const response = await api.post('dashboard/backup/export/', { tables: selectedTables });
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = `cafeteria-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(anchor.href);
      setBackupStatus('Backup exported.');
    } catch (err) {
      console.error('Failed to export backup:', err);
      setBackupStatus('Backup export failed.');
    }
  };

  const handleRestoreFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setRestorePayload(parsed);
      setRestoreFileName(file.name);
      setBackupStatus('Backup file loaded. Choose tables and restore.');
    } catch (err) {
      console.error('Invalid backup file:', err);
      setRestorePayload(null);
      setRestoreFileName('');
      setBackupStatus('Invalid backup JSON file.');
    }
  };

  const restoreBackup = async () => {
    if (!restorePayload) {
      setBackupStatus('Choose a backup file first.');
      return;
    }
    if (!selectedTables.length) {
      setBackupStatus('Select at least one table to restore.');
      return;
    }
    setBackupStatus('Restoring selected tables...');
    try {
      const response = await api.post('dashboard/backup/restore/', {
        backup: restorePayload,
        tables: selectedTables,
      });
      setBackupStatus(`Restore complete: ${Object.keys(response.data.restored || {}).join(', ')}`);
      fetchDashboardData();
      fetchBackupTables();
    } catch (err) {
      console.error('Failed to restore backup:', err);
      setBackupStatus(err.response?.data?.error || 'Restore failed.');
    }
  };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    Promise.resolve().then(() => {
      fetchDashboardData();
      fetchNotifications();
      fetchBackupTables();
    });
    return () => clearInterval(t);
  }, [fetchBackupTables, fetchDashboardData, fetchNotifications]);

  const greetingHour = time.getHours();
  const greeting = greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = user?.full_name?.split(' ')[0] || 'Manager';

  const openOrderCount = useMemo(() => (
    orders.filter((order) => !['completed', 'cancelled'].includes(order.status)).length
  ), [orders]);

  const weeklyRevenue = useMemo(() => (
    weeklyData.reduce((sum, day) => sum + Number(day.sales || 0), 0)
  ), [weeklyData]);

  const heroMetrics = [
    { label: 'Today revenue', value: formatCurrency(stats.revenue), detail: 'Synced from orders', icon: DollarSign },
    { label: 'Open orders', value: formatMetric(openOrderCount || stats.orders), detail: 'Needs service attention', icon: Clock },
    { label: 'Active staff', value: formatMetric(stats.staff), detail: 'Checked into operations', icon: Users },
  ];

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      trend: 'up',
      trendValue: '+14%',
      tone: 'blue',
      description: 'Revenue from completed orders',
    },
    {
      title: 'Total Orders',
      value: formatMetric(stats.orders),
      icon: ShoppingBag,
      trend: 'up',
      trendValue: '+8%',
      tone: 'teal',
      description: 'Orders moving through service',
    },
    {
      title: 'Active Staff',
      value: formatMetric(stats.staff),
      icon: Users,
      trend: 'up',
      trendValue: '+5%',
      tone: 'emerald',
      description: 'Available employees today',
    },
    {
      title: 'Low Stock Items',
      value: formatMetric(stats.lowStock),
      icon: AlertTriangle,
      trend: 'down',
      trendValue: '-3%',
      tone: 'amber',
      description: 'Items requiring inventory review',
    },
  ];

  return (
    <div className="dashboard-page">
      <NotificationDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        loading={notificationsLoading}
      />

      <motion.section
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-hero"
      >
        <div className="relative z-10 grid gap-6 p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.65fr)] lg:p-7">
          <div className="flex min-w-0 flex-col gap-7">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-white/70">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-cyan-200" />
                  {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
                {greeting}, {firstName}
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-white/70">
                A cleaner service command center for sales, stock, staffing, and customer flow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {canManage && (
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(true);
                    fetchNotifications();
                  }}
                  className="dashboard-hero-action"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                  {stats.notificationCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                      {stats.notificationCount}
                    </span>
                  )}
                </button>
              )}
              <Link to="/contact-messages" className="dashboard-hero-action">
                <MessageSquare className="h-4 w-4" />
                Contact Messages
              </Link>
              {canManage && (
                <Link to="/admin/jobs" className="dashboard-hero-action dashboard-hero-action-primary">
                  <BriefcaseBusiness className="h-4 w-4" />
                  Jobs
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="dashboard-hero-meter">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-cyan-100/70">Live service board</p>
                <h2 className="mt-1 text-2xl font-black text-white">{formatCurrency(weeklyRevenue)}</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1.5 text-xs font-black text-emerald-100 ring-1 ring-emerald-300/20">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Live data
              </span>
            </div>
            <div className="space-y-3">
              {heroMetrics.map(({ label, value, detail, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-cyan-100">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase text-white/50">{label}</p>
                    <p className="truncate text-sm font-semibold text-white/60">{detail}</p>
                  </div>
                  <p className="text-lg font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => (
          <StatCard key={card.title} {...card} delay={0.08 + index * 0.06} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="dashboard-panel p-5 xl:col-span-2"
        >
          <SectionHeader
            icon={BarChart3}
            title="Revenue Overview"
            subtitle="Weekly performance by revenue or order count"
            action={(
              <div className="dashboard-segment">
                {['sales', 'orders'].map((chart) => (
                  <button
                    key={chart}
                    type="button"
                    onClick={() => setActiveChart(chart)}
                    className={`dashboard-segment-button ${activeChart === chart ? 'dashboard-segment-button-active' : ''}`}
                  >
                    {chart}
                  </button>
                ))}
              </div>
            )}
          />
          <div className="h-80 min-h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === 'sales' ? (
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="sales" name="sales" stroke="#0f766e" strokeWidth={3} fill="url(#salesGrad)" dot={{ fill: '#0f766e', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              ) : (
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="orders" name="orders" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="dashboard-panel p-5"
        >
          <SectionHeader icon={Utensils} title="Sales by Category" subtitle="Today's order mix" />
          <div className="h-56 min-h-56 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={58} outerRadius={86} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: 'rgba(15,23,42,0.92)', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {categoryData.map((category) => (
              <div key={category.name} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: category.color }} />
                  <span className="truncate font-semibold text-slate-600 dark:text-slate-300">{category.name}</span>
                </div>
                <span className="font-black text-slate-950 dark:text-white">{category.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {canManage && (
        <PeopleInsights
          roleBreakdown={stats.roleBreakdown || []}
          employeeStatus={stats.employeeStatus || []}
          jobPipeline={stats.jobPipeline || []}
        />
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46 }}
          className="dashboard-panel overflow-hidden xl:col-span-2"
        >
          <div className="border-b border-slate-200 p-5 dark:border-white/10">
            <SectionHeader
              icon={Activity}
              title="Recent Orders"
              subtitle="Latest activity from the order queue"
              action={<span className="badge badge-teal">Live</span>}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Item</th>
                  <th>Staff</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td className="font-mono text-xs font-black text-teal-600 dark:text-teal-300">#ORD-{order.id}</td>
                    <td className="max-w-36 truncate text-sm font-black">{order.items?.[0]?.menu_item_name || 'N/A'}</td>
                    <td className="text-xs font-semibold text-slate-500 dark:text-slate-300">{order.employee_name || 'System'}</td>
                    <td className="font-black text-emerald-600 dark:text-emerald-300">{formatCurrency(order.total_price)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                      {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <div className="py-10 text-center text-sm font-semibold text-slate-400">No recent orders yet.</div>}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="dashboard-panel p-5"
        >
          <SectionHeader
            icon={Star}
            title="Top Menu Items"
            subtitle="High performing items this week"
          />
          <div className="space-y-4">
            {topItems.map((item, i) => (
              <div key={item.name} className="dashboard-rank-row">
                <div className="dashboard-rank-number">{i + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-black text-slate-900 dark:text-white">{item.name}</p>
                    <div className={`flex items-center text-xs font-black ${item.trend === 'up' ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-500'}`}>
                      {item.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.sales / 142) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08 + 0.4 }}
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500"
                      />
                    </div>
                    <span className="text-xs font-black text-slate-500 dark:text-slate-300">{item.sales}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-500 dark:text-slate-300">Top item revenue</span>
              <span className="font-black text-teal-600 dark:text-teal-300">$4,883</span>
            </div>
          </div>
        </motion.div>
      </div>

      {canManage && <LoginActivityPanel rows={stats.loginActivity || []} />}

      {isAdmin && (
        <BackupRestorePanel
          tables={backupTables}
          selectedTables={selectedTables}
          onToggleTable={toggleBackupTable}
          onSelectAll={toggleAllBackupTables}
          onExport={exportBackup}
          onRestoreFile={handleRestoreFile}
          onRestore={restoreBackup}
          status={backupStatus}
          restoreFileName={restoreFileName}
        />
      )}
    </div>
  );
};

export default Dashboard;
