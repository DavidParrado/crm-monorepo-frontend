import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';
import { SuperAdminUser } from '@/types/tenant';
import * as authService from '@/services/authService';
import * as iamService from '@/services/iamService';

interface AuthState {
  user: User | SuperAdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginSuperAdmin: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isSuperAdmin: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const data = await authService.login({ username, password });

          set({
            token: data.access_token,
            user: data.user,
            isAuthenticated: true,
            isSuperAdmin: false,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginSuperAdmin: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const data = await iamService.login({ username, password });

          set({
            token: data.access_token,
            user: data.user,
            isAuthenticated: true,
            isSuperAdmin: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isSuperAdmin: false,
          isLoading: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      checkAuth: async () => {
        const { token, isSuperAdmin } = get();

        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          if (isSuperAdmin) {
            // Validate super admin token
            const user = await iamService.getProfile(token);
            set({ user, isAuthenticated: true, isSuperAdmin: true });
          } else {
            // Validate regular user token
            const user = await authService.getProfile();
            set({ user, isAuthenticated: true });
          }
        } catch (error) {
          // Token expired or invalid - clear auth state
          set({ user: null, token: null, isAuthenticated: false, isSuperAdmin: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isSuperAdmin: state.isSuperAdmin,
      }),
    }
  )
);
