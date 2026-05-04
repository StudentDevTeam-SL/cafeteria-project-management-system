import { useState, useCallback } from 'react';
import { uid } from '../utils/helpers.js';

/**
 * useToast — manage a stack of toast notifications.
 *
 * Returns:
 *   toasts    – array of active toast objects
 *   toast     – object with .success / .error / .info / .warning shortcuts
 *   dismiss   – (id) => void, remove a specific toast
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = uid();
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const toast = {
    success: (msg, dur)  => show(msg, 'success', dur),
    error:   (msg, dur)  => show(msg, 'error',   dur ?? 5000),
    info:    (msg, dur)  => show(msg, 'info',    dur),
    warning: (msg, dur)  => show(msg, 'warning', dur),
  };

  return { toasts, toast, dismiss };
}
