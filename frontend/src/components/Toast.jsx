import { useEffect } from 'react';

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

function ToastItem({ toast, onDismiss }) {
  return (
    <div
      id={`toast-${toast.id}`}
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '14px 16px',
        borderRadius: '12px',
        background: 'rgba(20,20,28,0.95)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${
          toast.type === 'success' ? 'rgba(16,185,129,0.3)' :
          toast.type === 'error'   ? 'rgba(239,68,68,0.3)'  :
          toast.type === 'warning' ? 'rgba(245,158,11,0.3)' :
                                     'rgba(59,130,246,0.3)'
        }`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: '280px',
        maxWidth: '360px',
        animation: 'toastSlide 0.3s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'pointer',
      }}
      onClick={() => onDismiss(toast.id)}
    >
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{ICONS[toast.type]}</span>
      <span style={{ fontSize: '0.88rem', color: '#f1f5f9', lineHeight: 1.5, flex: 1 }}>
        {toast.message}
      </span>
      <button
        aria-label="Dismiss notification"
        style={{ color: '#475569', fontSize: '1.1rem', flexShrink: 0, lineHeight: 1 }}
        onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}
      >
        ×
      </button>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'flex-end',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
