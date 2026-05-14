import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  DollarSign, ShoppingBag, AlertTriangle, TrendingUp, TrendingDown,
  Users, Coffee, ArrowUpRight, ArrowDownRight, Clock,
  CheckCircle, XCircle, Loader, Star
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import dashboardImg from '../assets/dashboard_analytics.png';
import api from '../api/axios';

// MOCK_DATA removed, using API for stats and recent orders
const categoryData = [
  { name: 'Main Course', value: 45, color: '#3b82f6' },
  { name: 'Beverages', value: 25, color: '#8b5cf6' },
  { name: 'Snacks', value: 20, color: '#ec4899' },
  { name: 'Others', value: 10, color: '#f59e0b' },
];

const topItems = [
  { name: 'Double Burger', sales: 142, trend: 'up' },
  { name: 'Chicken Pizza', sales: 98, trend: 'up' },
  { name: 'Iced Latte', sales: 76, trend: 'down' },
  { name: 'Caesar Salad', sales: 54, trend: 'up' },
];

/* ── Stat Card ── */
const StatCard = React.memo(({ title, value, icon: Icon, trend, trendValue, color, bg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -4, scale: 1.01 }}
    className="glass-card p-6 cursor-default hover-lift"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
        trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
      }`}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
        {trendValue}%
      </span>
    </div>
    <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-2xl font-black">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {value}
      </motion.span>
    </h3>
    <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">vs last week</p>
  </motion.div>
));

/* ── Status Badge ── */
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
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
});

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass dark:glass-dark rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs font-bold mb-2 text-slate-500 dark:text-slate-300">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.name === 'sales' ? `$${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ── Main Dashboard ── */
const Dashboard = () => {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const [activeChart, setActiveChart] = useState('sales');
  const [stats, setStats] = useState({ revenue: 0, orders: 0, staff: 0, lowStock: 0 });
  const [orders, setOrders] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [sRes, oRes] = await Promise.all([
        api.get('dashboard/stats/'),
        api.get('orders/')
      ]);
      setStats(sRes.data);
      setOrders((oRes.data.results || oRes.data).slice(0, 5));
      // Mock weekly data if API doesn't provide it yet
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

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
    return () => clearInterval(t);
  }, [fetchDashboardData]);

  const greetingHour = time.getHours();
  const greeting = greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Coffee className="w-5 h-5 text-accent" />
            <span className="text-sm text-slate-500 dark:text-slate-300 font-medium">
              {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {time.toLocaleTimeString()}
            </span>
          </div>
          <h1 className="text-4xl font-black">
            <span className="gradient-text">{greeting}, {user?.full_name?.split(' ')[0] || 'Manager'} 👋</span>
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Here's what's happening at your café today.</p>
        </div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center space-x-2 px-4 py-2 glass dark:glass-dark rounded-xl self-start"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-medium text-accent">Live Data</span>
        </motion.div>
      </motion.div>

      {/* ── Analytics Image Banner ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden h-40 shadow-2xl"
      >
        <img src={dashboardImg} alt="Analytics" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/80 via-dark/40 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8">
          <div>
            <p className="text-white/60 text-sm mb-1">This Week's Performance</p>
            <h2 className="text-white text-3xl font-black">$42,350 <span className="text-accent text-lg font-normal">+14% ↑</span></h2>
          </div>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex space-x-4">
          {[{ label: 'Orders', value: '406' }, { label: 'Avg/Day', value: '$6,050' }, { label: 'New Users', value: '12' }].map((s) => (
            <div key={s.label} className="text-center glass dark:glass-dark rounded-xl px-4 py-2">
              <p className="text-white text-lg font-bold">{s.value}</p>
              <p className="text-white/60 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={DollarSign} trend="up" trendValue="14" color="text-blue-500" bg="bg-blue-500/10" delay={0.1} />
        <StatCard title="Total Orders" value={stats.orders} icon={ShoppingBag} trend="up" trendValue="8" color="text-violet-500" bg="bg-violet-500/10" delay={0.2} />
        <StatCard title="Active Staff" value={stats.staff} icon={Users} trend="up" trendValue="5" color="text-emerald-500" bg="bg-emerald-500/10" delay={0.3} />
        <StatCard title="Low Stock Items" value={stats.lowStock} icon={AlertTriangle} trend="down" trendValue="3" color="text-amber-500" bg="bg-amber-500/10" delay={0.4} />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area / Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold">Revenue Overview</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">Weekly performance</p>
            </div>
            <div className="flex space-x-2">
              {['sales', 'orders'].map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveChart(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    activeChart === c ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 dark:text-slate-300 hover:text-gray-600 dark:hover:text-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AnimatePresence mode="wait">
                {activeChart === 'sales' ? (
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fill="url(#salesGrad)" dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                ) : (
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </AnimatePresence>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-bold mb-1">Sales by Category</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mb-4">Today's breakdown</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                  <span className="text-gray-600 dark:text-slate-300">{c.name}</span>
                </div>
                <span className="font-bold" style={{ color: c.color }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Orders + Top Items ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="xl:col-span-2 glass-card overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <span className="badge badge-blue">Live</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
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
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <td className="font-mono text-xs text-primary">#ORD-{order.id}</td>
                    <td className="font-medium text-xs max-w-32 truncate">{order.items?.[0]?.menu_item_name || 'N/A'}</td>
                    <td className="text-gray-500 dark:text-slate-400 text-xs">{order.employee_name || 'System'}</td>
                    <td className="font-bold text-emerald-500">${Number(order.total_price).toFixed(2)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td className="text-slate-500 dark:text-slate-300 text-xs">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Top Menu Items</h2>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="space-y-4">
            {topItems.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.6 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-black text-primary">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.sales / 142) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 + 0.8 }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-300">{item.sales}</span>
                  </div>
                </div>
                <div className={`flex items-center text-xs font-semibold ${item.trend === 'up' ? 'text-emerald-500' : 'text-red-400'}`}>
                  {item.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-300">Total Revenue</span>
              <span className="font-black text-primary">$4,883</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
