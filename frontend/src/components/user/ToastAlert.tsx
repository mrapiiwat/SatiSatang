/*
  The react-refresh rule warns when a file exports non-component values alongside components.
  This file intentionally exports the toast store and helper function together with the
  ToastAlert component for convenience. Disable the rule here so ESLint/fast-refresh
  doesn't report a warning.
*/
/* eslint-disable react-refresh/only-export-components */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  type: 'info',
  visible: false,
  showToast: (message, type) => {
    set({ message, type, visible: true });
    setTimeout(() => set({ visible: false }), 3000); // auto-hide 3 วิ
  },
  hideToast: () => set({ visible: false }),
}));

export const showToastAlert = (message: string, type: ToastType) => {
  useToastStore.getState().showToast(message, type);
};

const ToastAlert: React.FC = () => {
  const { message, type, visible, hideToast } = useToastStore();

  const colors = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  // Reset scroll lock ถ้ามีการปัดออกเร็ว
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
              if (Math.abs(info.offset.x) > 100) hideToast(); // ปัดออก
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
