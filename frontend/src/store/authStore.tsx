import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from '../api/axios';
import type { AuthStore, formLogin } from '../interface/store';
import useSettingStore from './settingStore';

const authStore: StateCreator<AuthStore> = (set) => ({
  user: null,
  token: null,
  isConsentAccepted: false,
  actionSetUser: (user) => {
    set({ user });
  },
  actionSetToken: (token) => {
    set({ token });
  },
  actionSetConsent: (status) => {
    set({ isConsentAccepted: status });
  },
  actionClearAuth: () => {
    set({ user: null, token: null, isConsentAccepted: false });
    useAuthStore.persist.clearStorage();
  },
  actionLogin: async (form: formLogin) => {
    const res = await axios.post('/login', form);
    set({
      token: res.data.accessToken,
    });

    return res;
  },
  actionLogout: async () => {
    const res = await axios.post('/logout');
    set({
      user: null,
      token: null,
    });
    useAuthStore.persist.clearStorage();
    useSettingStore.getState().actionClearSettings();
    return res;
  },
});

const usePersist = {
  name: 'auth',
  getStorage: () => createJSONStorage(() => localStorage),
};

const useAuthStore = create(persist(authStore, usePersist));

export default useAuthStore;
