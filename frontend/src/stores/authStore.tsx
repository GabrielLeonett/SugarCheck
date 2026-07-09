import { create } from 'zustand';
import { apiPrivate } from '../apis/axios.js';
import type { User } from '../types/types.js';
import { authFirebase } from '../config/firebase.js';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signOut } from 'firebase/auth';
import { preferenceStore } from '../hooks/usePreferenceConfig.js';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  refresh: () => Promise<string>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (user: User, accessToken: string) => void;
  setLoading: (loading: boolean) => void;
  loginWithProvider: (providerName: 'google' | 'facebook') => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthLoading: true,

  setAuth: (user: User, accessToken: string) => set({ user, accessToken }),
  setLoading: (loading: boolean) => set({ isAuthLoading: loading }),

  login: async (username, password) => {
    const response = await apiPrivate.post('/auth/login', { username, password }, { withCredentials: true });

    await preferenceStore.getState().load();

    set({ user: response.data.user, accessToken: response.data.accessToken });
  },

  logout: async () => {
    try {
      await signOut(authFirebase);
      await apiPrivate.post('/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error("Error durante el proceso de cierre de sesión:", error);
    } finally {
      set({ user: null, accessToken: null });
    }
  },

  refresh: async () => {
    try {
      const response = await apiPrivate.post('/auth/refresh', {}, { withCredentials: true });
      set({ user: response.data.user, accessToken: response.data.accessToken });
      await preferenceStore.getState().load();
      return response.data.accessToken;
    } catch (error) {
      set({ user: null, accessToken: null });
      throw error;
    }
  },

  loginWithProvider: async (providerName: 'google' | 'facebook') => {
    try {
      const provider = providerName === 'google'
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();

      const userCredential = await signInWithPopup(authFirebase, provider);
      const firebaseToken = await userCredential.user.getIdToken();

      const response = await apiPrivate.post(
        '/auth/firebase-login',
        { token: firebaseToken },
        { withCredentials: true }
      );

      set({ user: response.data.user, accessToken: response.data.accessToken });
    } catch (error: unknown) {
      console.error(`Error en login federado con ${providerName}:`, error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || (error as Error).message || 'Error de autenticación';
      throw new Error(errorMessage);
    }
  }
}));
