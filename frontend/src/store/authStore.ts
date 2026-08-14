import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrating: boolean;
  setSession: (user: User, accessToken: string) => void;
  updateUser: (user: User) => void;
  hydrate: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SESSION_KEY = 'lms.session.v2'; // v2: now holds { user, accessToken }

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrating: true,

  setSession: (user, accessToken) => {
    set({ user, accessToken });
    SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ user, accessToken })).catch(() => {
      // Non-fatal: user stays logged in for this app session even if persistence fails.
    });
  },

  // Replace the stored user (e.g. after changing password clears
  // mustChangePassword) without touching the access token.
  updateUser: (user) => {
    set((state) => {
      if (state.accessToken) {
        SecureStore.setItemAsync(
          SESSION_KEY,
          JSON.stringify({ user, accessToken: state.accessToken })
        ).catch(() => {});
      }
      return { user };
    });
  },

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (raw) {
        const { user, accessToken } = JSON.parse(raw) as { user: User; accessToken: string };
        set({ user, accessToken, isHydrating: false });
      } else {
        set({ user: null, accessToken: null, isHydrating: false });
      }
    } catch {
      set({ user: null, accessToken: null, isHydrating: false });
    }
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
    set({ user: null, accessToken: null });
  },
}));

/**
 * Read the current token outside of a React component (e.g. from the API
 * client's request helper, which isn't a hook). Zustand stores support this
 * via getState() — it's just a regular module-level store under the hood.
 */
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}
