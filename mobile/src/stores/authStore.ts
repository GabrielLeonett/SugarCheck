import { create } from 'zustand';
import { authApi } from '../apis/auth';
import { preferenceStore } from './preferenceStore';
import { signOut } from 'firebase/auth';
import { authFirebase } from '../config/firebase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  refresh: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<void>;
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

  login: async (email, password) => {
    const response = await authApi.login(email, password);
    set({ user: response.user, accessToken: response.accessToken });
  },

  logout: async () => {
    try {
      await signOut(authFirebase);
      await authApi.logout();
    } catch (error) {
      console.error('Error durante cierre de sesión:', error);
    } finally {
      set({ user: null, accessToken: null });
    }
  },

  refresh: async () => {
    try {
      const response = await authApi.refresh();
      set({ user: response.user, accessToken: response.accessToken });
      return response.accessToken;
    } catch (error) {
      set({ user: null, accessToken: null });
      return null;
    }
  },

  loginWithProvider: async (providerName: 'google' | 'facebook') => {
    try {
      const { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = providerName === 'google'
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();

      const userCredential = await signInWithPopup(authFirebase, provider);
      const firebaseToken = await userCredential.user.getIdToken();
      const response = await authApi.firebaseLogin(firebaseToken);
      set({ user: response.user, accessToken: response.accessToken });
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as Error)?.message ||
        'Error de autenticación';
      throw new Error(errorMessage);
    }
  },
}));
