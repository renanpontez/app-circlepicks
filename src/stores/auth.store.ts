import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { getStorage } from '@/core/config';
import type { AuthUser } from '@/domain/models';

const storageService = getStorage();

const zustandStorage: StateStorage = {
  getItem: (name: string) => {
    const value = storageService.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storageService.setString(name, value);
  },
  removeItem: (name: string) => {
    storageService.delete(name);
  },
};

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signIn: (user: AuthUser, token: string) => void;
  signOut: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
      }),

      setAccessToken: (accessToken) => set({ accessToken }),

      setLoading: (isLoading) => set({ isLoading }),

      setInitialized: (isInitialized) => set({ isInitialized }),

      signIn: (user, token) => set({
        user,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
      }),

      signOut: () => set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      }),

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
