import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BriefcaseBusiness, CalendarDays, Download, ExternalLink, FileText,
  Mail, Phone, Printer, RefreshCcw, Search, UserRound
} from 'lucide-react';
import PaginationFooter from '../components/PaginationFooter';
import { DatePresetSelect, FilterSelect, ResetFiltersButton } from '../components/FilterControls';
import { usePagination } from '../hooks/usePagination';
import { matchesDatePreset, normalizeText, uniqueOptions } from '../utils/filterUtils';
import api from '../api/axios';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

const STATUS_BADGES = {
  new: 'badge-blue',
  reviewing: 'badge-yellow',
  contacted: 'badge-green',
  closed: 'badge-red',
};

const displayDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleDateString();
};

const displayDateTime = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleString();
};

const getApplicantName = (app) => `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Applicant';

const exportJobsCSV = (rows) => {
  const columns = [
    ['id', 'ID'],
    ['name', 'Applicant'],
    ['email', 'Email'],
    ['phone', 'Phone'],
    ['position', 'Position'],
    ['experience_level', 'Experience'],
    ['availability', 'Availability'],
    ['start_date', 'Start Date'],
    ['expected_salary', 'Expected Salary'],
    ['portfolio_url', 'Portfolio'],
    ['status', 'Status'],
    ['cover_letter', 'Cover Letter'],
    ['created_at', 'Submitted At'],
  ];

  const body = rows.map(row => {
    const data = {
      ...row,
      name: getApplicantName(row),
      start_date: displayDate(row.start_date),
      created_at: displayDateTime(row.created_at),
    };
    return columns.map(([key]) => `"${String(data[key] ?? '').replaceAll('"', '""')}"`).join(',');
  }).join('\n');

  const blob = new Blob([columns.map(([, label]) => label).join(',') + '\n' + body], { type: 'text/csv' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'job-applications-report.csv';
  anchor.click();
};

const printJobs = (rows) => {
  const originalTitle = document.title;
  document.title = 'Job Applications Report';

  const printable = document.createElement('div');
  printable.className = 'print-single-jobs-report';
  printable.innerHTML = `
    <div style="padding: 32px; font-family: Arial, sans-serif; color: #111827;">
      <h1 style="margin: 0 0 6px; font-size: 26px;">The Grand Cafeteria</h1>
      <p style="margin: 0 0 24px; color: #4b5563;">Job Applications Report - ${new Date().toLocaleString()}</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr>
            ${['Applicant', 'Email', 'Phone', 'Position', 'Experience', 'Availability', 'Start Date', 'Salary', 'Status', 'Submitted'].map(label => (
              `<th style="text-align: left; border-bottom: 2px solid #111827; padding: 8px;">${label}</th>`
            )).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td style="border-bottom: 1px solid #d1d5db; padding: 8px;">${getApplicantName(row)}</td>
              <td style="border-bottom: 1px solid #d1d5db; padding: 8px;">${row.email || ''}</td>
              <td style="border-bottom: 1px solid #d1d5db; padding: 8px;">${row.phone || ''}</td>
              <td style="border-bottom: 1px solid #d1d5db; padding: 8px;">${row.position || ''}</td>
              <td style="border-bottom: 1px solid #d1d5db; padding: 8px;">${row.experience_level || ''}</td>
              <td style="border-bottom: 1px solid #d1d5db; padding: 8px;">${row.availability || ''}</td>
              <td style="border-bottom: 1px solid #d1d5db; padding: 8px;">${displayDate(row.start_date)}</td>
              <td style="border-bottom: 1px solid #d1d5db; padding: 8px;">${row.expected_salary || ''}</td>
              <td style="border-bottom: 1px solid #d1d5db; padding: 8px; text-transform: capitalize;">${row.status || ''}</td>
              <td style="border-bottom: 1px solid #d1d5db; padding: 8px;">${displayDateTime(row.created_at)}</td>
            </tr>
            <tr>
              <td colspan="10" style="border-bottom: 1px solid #d1d5db; padding: 8px 8px 14px; color: #374151;">
                <strong>Cover letter:</strong> ${row.cover_letter || 'No message'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body > :not(.print-single-jobs-report) { display: none !important; }
      .print-single-jobs-report { display: block !important; width: 100%; }
    }
  `;

  document.body.appendChild(printable);
  document.head.appendChild(style);
  window.print();
  document.head.removeChild(style);
  document.body.removeChild(printable);
  document.title = originalTitle;
};

const Jobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('menu/job-applications/');
      const rows = response.data.results || response.data;
      setApplications(rows);
      setSelected(current => {
        if (!current) return rows[0] || null;
        return rows.find(row => row.id === current.id) || rows[0] || null;
      });
    } catch (err) {
      console.error('Failed to load job applications:', err);
      setError('Failed to load job applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const positions = useMemo(() => uniqueOptions(applications, app => app.position), [applications]);

  const filtered = useMemo(() => applications.filter(app => {
    const haystack = [
      getApplicantName(app), app.email, app.phone, app.position, app.experience_level,
      app.availability, app.expected_salary, app.portfolio_url, app.cover_letter,
    ].map(normalizeText).join(' ');

    return haystack.includes(normalizeText(search)) &&
      (statusFilter === 'all' || app.status === statusFilter) &&
      (positionFilter === 'all' || app.position === positionFilter) &&
      matchesDatePreset(app.created_at, timeFilter);
  }), [applications, positionFilter, search, statusFilter, timeFilter]);

  const {
    page,
    pageSize,
    totalItems,
    paginatedItems,
    setPage,
  } = usePagination(filtered, 8, `${search}|${statusFilter}|${positionFilter}|${timeFilter}`);

  const updateStatus = async (application, status) => {
    const previous = applications;
    setApplications(rows => rows.map(row => row.id === application.id ? { ...row, status } : row));
    setSelected(current => current?.id === application.id ? { ...current, status } : current);

    try {
      const response = await api.patch(`menu/job-applications/${application.id}/`, { status });
      setApplications(rows => rows.map(row => row.id === application.id ? response.data : row));
      setSelected(current => current?.id === application.id ? response.data : current);
    } catch (err) {
      console.error('Failed to update application status:', err);
      setApplications(previous);
      setSelected(application);
      setError('Failed to update application status.');
    }
  };

  const stats = [
    { label: 'Total Applications', value: applications.length, icon: BriefcaseBusiness, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'New', value: applications.filter(app => app.status === 'new').length, icon: Mail, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Reviewing', value: applications.filter(app => app.status === 'reviewing').length, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Contacted', value: applications.filter(app => app.status === 'contacted').length, icon: Phone, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black gradient-text">Jobs</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">Review job applications, CV files, and applicant details.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchApplications} className="btn-ghost inline-flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={() => exportJobsCSV(filtered)} className="btn-ghost inline-flex items-center gap-2">
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button onClick={() => printJobs(filtered)} className="btn-primary inline-flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5"
          >
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`mt-1 text-3xl font-black ${color}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="form-input pl-10"
              placeholder="Search applicants..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            label="Job status"
            options={[
              { value: 'all', label: 'All statuses' },
              ...STATUS_OPTIONS.map(option => option),
            ]}
          />
          <FilterSelect
            value={positionFilter}
            onChange={setPositionFilter}
            label="Job position"
            options={[
              { value: 'all', label: 'All positions' },
              ...positions.map(position => ({ value: position, label: position })),
            ]}
          />
          <DatePresetSelect value={timeFilter} onChange={setTimeFilter} label="Job submitted time" />
          <ResetFiltersButton onClick={() => {
            setSearch('');
            setStatusFilter('all');
            setPositionFilter('all');
            setTimeFilter('all');
          }} />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Position</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>CV</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(app => (
                  <tr
                    key={app.id}
                    onClick={() => setSelected(app)}
                    className={`cursor-pointer ${selected?.id === app.id ? 'bg-primary/5' : ''}`}
                  >
                    <td>
                      <p className="font-bold text-sm">{getApplicantName(app)}</p>
                      <p className="text-xs text-slate-400">{app.email}</p>
                    </td>
                    <td>
                      <p className="font-semibold text-sm">{app.position}</p>
                      <p className="text-xs text-slate-400">{app.experience_level}</p>
                    </td>
                    <td>
                      <p className="text-xs text-slate-500 dark:text-slate-300">{app.phone}</p>
                      <p className="text-xs text-slate-400">{app.availability || 'Availability not set'}</p>
                    </td>
                    <td>
                      <select
                        className="form-input min-w-32 py-1.5 text-xs capitalize"
                        value={app.status}
                        onClick={event => event.stopPropagation()}
                        onChange={event => updateStatus(app, event.target.value)}
                      >
                        {STATUS_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="text-xs text-slate-400">{displayDateTime(app.created_at)}</td>
                    <td>
                      {app.cv_url ? (
                        <a
                          href={app.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={event => event.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">No CV</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <div className="py-12 text-center text-slate-400">No job applications found</div>
            )}
            {loading && (
              <div className="py-12 text-center text-slate-400">Loading applications...</div>
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
          {selected ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Selected Applicant</p>
                  <h2 className="mt-1 text-2xl font-black">{getApplicantName(selected)}</h2>
                  <span className={`badge ${STATUS_BADGES[selected.status] || 'badge-blue'} mt-3 capitalize`}>
                    {selected.status}
                  </span>
                </div>
                {selected.cv_url && (
                  <a href={selected.cv_url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CV
                  </a>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Mail, label: 'Email', value: selected.email },
                  { icon: Phone, label: 'Phone', value: selected.phone },
                  { icon: BriefcaseBusiness, label: 'Position', value: selected.position },
                  { icon: UserRound, label: 'Experience', value: selected.experience_level },
                  { icon: CalendarDays, label: 'Start Date', value: displayDate(selected.start_date) },
                  { icon: FileText, label: 'Expected Salary', value: selected.expected_salary || 'Not set' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border border-slate-200/70 bg-white/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Icon className="h-4 w-4 text-primary" />
                      {label}
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{value}</p>
                  </div>
                ))}
              </div>

              {selected.portfolio_url && (
                <a
                  href={selected.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  Open portfolio or reference link
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              <div>
                <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-slate-400">Cover Letter</h3>
                <p className="max-h-80 overflow-y-auto rounded-xl border border-slate-200/70 bg-white/50 p-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
                  {selected.cover_letter}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-80 items-center justify-center text-center text-slate-400">
              Select an application to see full information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
