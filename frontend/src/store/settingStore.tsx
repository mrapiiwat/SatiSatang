import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from '../api/axios';
import type { SettingState, SettingStore } from '../interface/store';

const defaultSettings: SettingState = {
  appLanguage: 'th',
  aiLanguage: 'th',
  theme: 'system',
  isNotificationEnabled: true,
  budgetStartDate: 1,
  userId: null,
};

const settingStore: StateCreator<SettingStore> = (set) => ({
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
});

const usePersist = {
  name: 'user-settings',
  getStorage: () => createJSONStorage(() => localStorage),
};

const useSettingStore = create(persist(settingStore, usePersist));

export default useSettingStore;
