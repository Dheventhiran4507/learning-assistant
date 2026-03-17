import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      logout: () => {
        console.log('AuthStore: Logging out');
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
