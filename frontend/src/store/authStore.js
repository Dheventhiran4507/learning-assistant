import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) => {
        console.log('AuthStore: Logging in user:', userData?.email || userData?.id);
        set({
          user: userData,
          token,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        console.log('AuthStore: Logging out');
        try {
          // Clear sessionToken on server so another device can log in
          await api.post('/auth/logout');
        } catch (_) {
          // ignore — still clear locally even if request fails
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      getToken: () => get().token,
    }),
    {
      name: 'auth-storage',
    }
  )
);
