import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore, type ToastType } from '../../store/toastStore';

const ToastAlert: React.FC = () => {
  const { message, type, visible, hideToast } = useToastStore();

  const colors: Record<ToastType, string> = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => hideToast(), 3000);
    return () => clearTimeout(timeout);
  }, [visible, hideToast]);

  return (
    <div className="fixed top-6 left-0 right-0 z-[9999] flex justify-center pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            className="pointer-events-auto flex items-center gap-2 bg-white rounded-lg shadow-md px-4 py-2 border border-gray-200 text-black-900 font-medium"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.25 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 100) hideToast();
            }}
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[type] }}></span>
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToastAlert;
