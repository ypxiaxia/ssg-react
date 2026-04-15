import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  user: any | null;
  token: string | null;
  language: string;
  kefu: any[];
  version: number;
  currency: string;
  setAuth: (user: any, token: string) => void;
  setUser: (user: any) => void;
  setLanguage: (language: string) => void;
  setConfig: (kefu: any[], version: number, currency: string) => void;
  logout: () => void;
}

export const useAuthStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      language: 'en',
      kefu: [],
      version: 0,
      currency: 'USD',
      setAuth: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      setLanguage: (language) => set({ language }),
      setConfig: (kefu, version, currency) => set({ kefu, version, currency }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
