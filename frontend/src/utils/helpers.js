/** Format a number as a price string. e.g. 12.5 → "$12.50" */
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

/** Format an ISO date string to a readable date. e.g. "Apr 18, 2026" */
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/** Format an ISO date string to a relative time string. e.g. "2 hours ago" */
export const formatRelativeTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return formatDate(iso);
};

/** Map an order status string to a CSS badge class. */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed':   return 'badge badge-success';
    case 'pending':     return 'badge badge-warning';
    case 'in-progress': return 'badge badge-info';
    case 'cancelled':   return 'badge badge-danger';
    default:            return 'badge badge-muted';
  }
};

/** Capitalise the first letter of a string. */
export const capitalise = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');

/** Truncate a string to maxLen characters. */
export const truncate = (str, maxLen = 80) =>
  str.length > maxLen ? str.slice(0, maxLen) + '…' : str;

/** Calculate total from cart items. */
export const calcCartTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.qty, 0);

/** Generate a simple unique ID. */
export const uid = () => Math.random().toString(36).slice(2, 10);
