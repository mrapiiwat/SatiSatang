import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from '../api/axios';

interface userSchema {
  id: string;
  email: string;
  name: string;
  balance: string;
}
interface formLogin {
  email: string;
  password: string;
}

interface AuthStore {
  user: userSchema | null;
  token: string | null;
  actionSetUser: (user: userSchema) => void;
  actionSetToken: (token: string) => void;
  actionClearAuth: () => void;
  actionLogin: (form: formLogin) => void;
  actionLogout: () => void;
}

const authStore: StateCreator<AuthStore> = (set) => ({
  user: null,
  token: null,
  actionSetUser: (user) => {
    set({ user });
  },
  actionSetToken: (token) => {
    set({ token });
  },
  actionClearAuth: () => set({ user: null, token: null }),
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
    return res;
  },
});

const usePersist = {
  name: 'auth',
  getStorage: () => createJSONStorage(() => localStorage),
};

const useAuthStore = create(persist(authStore, usePersist));

export default useAuthStore;
