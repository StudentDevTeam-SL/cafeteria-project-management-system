import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, Mail, MessageSquare, RefreshCw, Search, ShieldCheck,
  Trash2, UserRound
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PaginationFooter from '../components/PaginationFooter';
import { DatePresetSelect, ResetFiltersButton } from '../components/FilterControls';
import { usePagination } from '../hooks/usePagination';
import { matchesDatePreset, normalizeText } from '../utils/filterUtils';
import api from '../api/axios';

const formatDate = value => value ? new Date(value).toLocaleString() : 'No date';

const ContactMessages = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('menu/contact-messages/');
      const rows = res.data.results || res.data;
      setMessages(rows);
      setSelectedMessage(current => {
        if (!current) return rows[0] || null;
        return rows.find(message => message.id === current.id) || rows[0] || null;
      });
    } catch (err) {
      console.error('Failed to fetch contact messages:', err);
      setError('Failed to load contact messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filtered = useMemo(() => messages.filter(message => {
    const text = [
      message.name,
      message.email,
      message.subject,
      message.message,
    ].map(normalizeText).join(' ');

    return text.includes(normalizeText(search)) &&
      matchesDatePreset(message.created_at, timeFilter);
  }), [messages, search, timeFilter]);

  const {
    page,
    pageSize,
    totalItems,
    paginatedItems,
    setPage,
  } = usePagination(filtered, 8, `${search}|${timeFilter}`);

  const handleDelete = async (message) => {
    if (!isAdmin) return;
    const confirmed = window.confirm(`Delete message from ${message.name}?`);
    if (!confirmed) return;

    try {
      await api.delete(`menu/contact-messages/${message.id}/`);
      setMessages(prev => prev.filter(item => item.id !== message.id));
      setSelectedMessage(prev => prev?.id === message.id ? null : prev);
    } catch (err) {
      console.error('Failed to delete contact message:', err);
      setError('Failed to delete contact message.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black gradient-text">Contact Us Messages</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            {isAdmin ? 'Read and manage public contact messages.' : 'Read public contact messages. Admin controls are locked.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge ${isAdmin ? 'badge-purple' : 'badge-blue'} text-sm`}>
            {isAdmin ? 'Admin full access' : 'Read only'}
          </span>
          <button onClick={fetchMessages} className="btn-ghost inline-flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Messages', value: messages.length, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Visible Now', value: filtered.length, icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: isAdmin ? 'Access Level' : 'Your Access', value: isAdmin ? 'Full' : 'Read', icon: ShieldCheck, color: 'text-violet-500', bg: 'bg-violet-500/10' },
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
              placeholder="Search messages..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <DatePresetSelect value={timeFilter} onChange={setTimeFilter} label="Message time" />
          <ResetFiltersButton onClick={() => {
            setSearch('');
            setTimeFilter('all');
            setSelectedMessage(null);
          }} />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(message => (
                  <tr
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`cursor-pointer ${selectedMessage?.id === message.id ? 'bg-primary/5' : ''}`}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{message.name}</p>
                          <p className="text-xs text-slate-400 truncate">{message.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="max-w-80 truncate text-sm font-semibold">{message.subject}</p>
                      <p className="max-w-80 truncate text-xs text-slate-400">{message.message}</p>
                    </td>
                    <td className="text-xs text-slate-400">{formatDate(message.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={event => {
                            event.stopPropagation();
                            setSelectedMessage(message);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Read
                        </button>
                        {isAdmin && (
                          <button
                            onClick={event => {
                              event.stopPropagation();
                              handleDelete(message);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <div className="py-12 text-center text-slate-400">No contact messages found</div>
            )}
            {loading && (
              <div className="py-12 text-center text-slate-400">Loading contact messages...</div>
            )}
          </div>
          <PaginationFooter
            page={page}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>

        <div className="glass-card p-6">
          {selectedMessage ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Reading Message</p>
                  <h2 className="mt-1 text-2xl font-black">{selectedMessage.subject}</h2>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(selectedMessage.created_at)}</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(selectedMessage)}
                    className="rounded-xl bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
                    title="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200/70 bg-white/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Name</p>
                  <p className="font-bold">{selectedMessage.name}</p>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Email</p>
                  <a href={`mailto:${selectedMessage.email}`} className="break-all font-bold text-primary hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-slate-400">Message</h3>
                <p className="max-h-96 overflow-y-auto rounded-xl border border-slate-200/70 bg-white/50 p-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-80 items-center justify-center text-center text-slate-400">
              Select a message to read it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactMessages;
