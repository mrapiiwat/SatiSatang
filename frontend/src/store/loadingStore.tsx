import { create } from 'zustand';
import type { LoadingState } from '../interface/store';

const useLoadingStore = create<LoadingState>((set) => ({
  loadingCount: 0,

  startLoading: () => set((state) => ({ loadingCount: state.loadingCount + 1 })),

  stopLoading: () =>
    set((state) => ({
      loadingCount: Math.max(0, state.loadingCount - 1),
    })),
}));

export default useLoadingStore;
