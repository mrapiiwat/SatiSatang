import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from '../api/axios';
import type { SettingState, SettingStore } from '../interface/store';
import { requestForToken } from '../config/firebase';

const defaultSettings: SettingState = {
  appLanguage: 'th',
  aiLanguage: 'th',
  theme: 'system',
  isNotificationEnabled: true,
  budgetStartDate: 1,
  userId: null,
  lastSyncedToken: null,
};

const settingStore: StateCreator<SettingStore> = (set, get) => ({
  ...defaultSettings,

  actionSetSettings: (settings) => {
    set({ ...settings });
  },

  actionUpdateSetting: async (data) => {
    set({ ...data });

    try {
      await axios.put('/setting', data);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },

  actionClearSettings: () => {
    set({ ...defaultSettings });
    useSettingStore.persist.clearStorage();
  },

  actionSyncFCMToken: async () => {
    const state = get();

    if (!state.isNotificationEnabled || !state.userId) return;

    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const currentToken = await requestForToken();
      if (currentToken && currentToken !== state.lastSyncedToken) {
        await axios.post('/notification/token', { token: currentToken });
        set({ lastSyncedToken: currentToken });
      }
    } catch (error) {
      console.error('Failed to sync notification token:', error);
    }
  },
});

const usePersist = {
  name: 'user-settings',
  getStorage: () => createJSONStorage(() => localStorage),
};

const useSettingStore = create(persist(settingStore, usePersist));

export default useSettingStore;
