import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Undo, CheckCircle, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, options = {}) => {
    const id = Date.now();
    const duration = options.duration || 7000;
    const toast = { id, message, ...options };
    
    setToasts(prev => [...prev, toast]);

    if (!options.onUndo) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleUndo = useCallback((toast) => {
    if (toast.onUndo) {
      toast.onUndo();
    }
    removeToast(toast.id);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              onClose={() => removeToast(toast.id)} 
              onUndo={() => handleUndo(toast)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose, onUndo }) => {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 7000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onClose();
      }
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      layout
      className="pointer-events-auto bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col gap-3 min-w-[300px] overflow-hidden relative"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {toast.type === 'success' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          ) : toast.type === 'warning' ? (
             <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          )}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {toast.onUndo && (
            <button 
              onClick={onUndo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
            >
              <Undo className="w-3.5 h-3.5" /> Undo
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {toast.onUndo && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
          <motion.div 
            className="h-full bg-emerald-500" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}
    </motion.div>
  );
};
