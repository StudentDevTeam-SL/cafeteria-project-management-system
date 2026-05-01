import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import {
  LogOut, ChefHat, Moon, Sun, LayoutDashboard, UtensilsCrossed,
  Package, FileText, Settings, Users, DollarSign, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/orders', icon: FileText, label: 'Orders' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

// Admin-only sidebar items
const ADMIN_ITEMS = [
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/salaries', icon: DollarSign, label: 'Salaries' },
];

const NavItem = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
        isActive
          ? 'bg-primary/15 text-primary'
          : 'text-gray-500 dark:text-slate-400 hover:bg-primary/8 hover:text-primary dark:hover:text-primary'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-accent rounded-r-full"
        />
      )}
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
      <span className="font-medium text-sm">{label}</span>
      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
    </Link>
  );
};

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 flex items-center justify-between border-b border-gray-200/50 dark:border-slate-700/50">
        <Link to="/dashboard" className="flex items-center space-x-3" onClick={onClose}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent leading-tight">
              Cafeteria Management
            </h1>
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 px-4 pb-2">Main</p>
        {NAV_ITEMS.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}

        {user?.role === 'Admin' && ADMIN_ITEMS.length > 0 && (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 px-4 pt-4 pb-2">Admin Only</p>
            {ADMIN_ITEMS.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-200/50 dark:border-slate-700/50 space-y-3">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-sm flex-shrink-0">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.full_name || 'Admin'}</p>
            <span className="badge badge-blue text-xs">{user?.role || 'Admin'}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-slate-500" />
            }
          </button>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-light dark:bg-dark transition-colors duration-300 overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="hidden lg:flex w-64 flex-col glass dark:glass-dark shadow-2xl border-r border-gray-200/50 dark:border-slate-700/50 flex-shrink-0"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="fixed left-0 top-0 h-full z-50 w-64 flex flex-col glass dark:glass-dark shadow-2xl lg:hidden"
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700 glass dark:glass-dark">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <span className="font-black gradient-text">Cafeteria Management</span>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-500" />}
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
