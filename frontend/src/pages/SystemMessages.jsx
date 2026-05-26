import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Mail, MessageSquare, RefreshCw, Search, ShieldCheck,
  Trash2, Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PaginationFooter from '../components/PaginationFooter';
import { DatePresetSelect, ResetFiltersButton } from '../components/FilterControls';
import { usePagination } from '../hooks/usePagination';
import { matchesDatePreset, normalizeText } from '../utils/filterUtils';
import api from '../api/axios';

const formatDate = value => value ? new Date(value).toLocaleString() : 'No date';

const exportCSV = (rows) => {
  const header = 'Email,Source,Subscribed At';
  const body = rows.map(row => (
    `"${row.email || ''}","${row.source || ''}","${formatDate(row.created_at)}"`
  )).join('\n');
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'newsletter-messages.csv';
  anchor.click();
};

const SystemMessages = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('menu/newsletter-subscriptions/');
      setSubscriptions(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch newsletter subscriptions:', err);
      setError('Failed to load subscribed emails.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchSubscriptions, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchSubscriptions]);

  const filtered = useMemo(() => subscriptions.filter(item => (
    normalizeText(item.email).includes(normalizeText(search)) &&
    matchesDatePreset(item.created_at, timeFilter)
  )), [subscriptions, search, timeFilter]);

  const {
    page,
    pageSize,
    totalItems,
    paginatedItems,
    setPage,
  } = usePagination(filtered, 10, `${search}|${timeFilter}`);

  const handleDelete = async (item) => {
    if (!isAdmin) return;
    const confirmed = window.confirm(`Delete subscription for ${item.email}?`);
    if (!confirmed) return;

    try {
      await api.delete(`menu/newsletter-subscriptions/${item.id}/`);
      setSubscriptions(prev => prev.filter(row => row.id !== item.id));
    } catch (err) {
      console.error('Failed to delete newsletter subscription:', err);
      setError('Failed to delete subscribed email.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black gradient-text">Messages</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            Newsletter email subscriptions from the public footer.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge ${isAdmin ? 'badge-purple' : 'badge-blue'} text-sm`}>
            {isAdmin ? 'Admin full access' : 'Manager read access'}
          </span>
          <button onClick={fetchSubscriptions} className="btn-ghost inline-flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={() => exportCSV(filtered)} className="btn-primary inline-flex items-center gap-2">
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Subscribers', value: subscriptions.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Visible Now', value: filtered.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Access', value: isAdmin ? 'Full' : 'Read', icon: ShieldCheck, color: 'text-violet-500', bg: 'bg-violet-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="glass-card p-5"
          >
            <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="form-input pl-10"
              placeholder="Search email..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <DatePresetSelect value={timeFilter} onChange={setTimeFilter} label="Subscription time" />
          <ResetFiltersButton onClick={() => {
            setSearch('');
            setTimeFilter('all');
          }} />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Source</th>
                <th>Subscribed At</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Mail className="h-4 w-4" />
                      </div>
                      <a href={`mailto:${item.email}`} className="font-bold text-primary hover:underline">
                        {item.email}
                      </a>
                    </div>
                  </td>
                  <td><span className="badge badge-blue capitalize">{item.source || 'footer'}</span></td>
                  <td className="text-xs text-slate-400">{formatDate(item.created_at)}</td>
                  {isAdmin && (
                    <td>
                      <button
                        onClick={() => handleDelete(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400">No subscribed emails found</div>
          )}
          {loading && (
            <div className="py-12 text-center text-slate-400">Loading subscribed emails...</div>
          )}
        </div>
        <PaginationFooter
          page={page}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default SystemMessages;
