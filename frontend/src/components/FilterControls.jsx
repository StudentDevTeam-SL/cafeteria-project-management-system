import { Calendar, RotateCcw } from 'lucide-react';
import { DATE_PRESETS } from '../utils/filterUtils';

export const DatePresetSelect = ({ value, onChange, label = 'Time' }) => (
  <label className="relative w-full sm:w-40 shrink-0">
    <span className="sr-only">{label}</span>
    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    <select
      className="form-input pl-9 text-sm py-2"
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={label}
    >
      {DATE_PRESETS.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </label>
);

export const FilterSelect = ({ value, onChange, options, label, className = '' }) => (
  <label className={`w-full sm:w-40 shrink-0 ${className}`}>
    <span className="sr-only">{label}</span>
    <select
      className="form-input text-sm py-2 capitalize"
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={label}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </label>
);

export const ResetFiltersButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-3 py-2 rounded-xl glass-card text-xs font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5"
  >
    <RotateCcw className="w-3.5 h-3.5" />
    Reset
  </button>
);
