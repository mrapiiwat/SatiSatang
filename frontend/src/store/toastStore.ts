import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

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
    setTimeout(() => set({ visible: false }), 3000);
  },
  hideToast: () => set({ visible: false }),
}));

export const showToastAlert = (message: string, type: ToastType) => {
  useToastStore.getState().showToast(message, type);
};
