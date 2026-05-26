export const DATE_PRESETS = [
  { value: 'all', label: 'All time' },
  { value: 'day', label: 'Today' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
];

export const normalizeText = (value) => String(value ?? '').toLowerCase().trim();

export const toValidDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const matchesDatePreset = (value, preset = 'all', now = new Date()) => {
  if (preset === 'all') return true;

  const date = toValidDate(value);
  if (!date) return false;

  const sameYear = date.getFullYear() === now.getFullYear();
  if (preset === 'year') return sameYear;

  const sameMonth = sameYear && date.getMonth() === now.getMonth();
  if (preset === 'month') return sameMonth;

  return (
    sameMonth &&
    date.getDate() === now.getDate()
  );
};

export const uniqueOptions = (rows, getter) => (
  [...new Set(rows.map(getter).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b)))
);

export const numberInRange = (value, range) => {
  const n = Number(value || 0);
  switch (range) {
    case 'under10':
      return n < 10;
    case '10to25':
      return n >= 10 && n <= 25;
    case '25plus':
      return n > 25;
    case 'under500':
      return n < 500;
    case '500to1000':
      return n >= 500 && n <= 1000;
    case '1000plus':
      return n > 1000;
    default:
      return true;
  }
};
