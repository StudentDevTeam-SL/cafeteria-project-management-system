import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 relative overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500" />
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
        
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title || 'Confirm Action'}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message || 'Are you sure you want to proceed?'}</p>
          
          <div className="flex gap-3">
            <button 
              onClick={onCancel} 
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              No, Cancel
            </button>
            <button 
              onClick={onConfirm} 
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmModal;
