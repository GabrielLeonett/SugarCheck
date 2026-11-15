import { create } from 'zustand';
import { authApi } from '../apis/auth';
import { signOut } from 'firebase/auth';
import { authFirebase } from '../config/firebase';
import type { User } from '../types';
import { useGuestStore } from './guestStore';
import { preferenceStore } from './preferenceStore';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  isNewUser: boolean;
  refresh: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (user: User, accessToken: string) => void;
  setLoading: (loading: boolean) => void;
  loginWithProvider: (providerName: 'google' | 'facebook') => Promise<void>;
  clearNewUserFlag: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthLoading: true,
  isNewUser: false,

  setAuth: (user: User, accessToken: string) => set({ user, accessToken }),
  setLoading: (loading: boolean) => set({ isAuthLoading: loading }),

  clearNewUserFlag: () => set({ isNewUser: false }),

  login: async (email, password) => {
    const response = await authApi.login(email, password);
    await useGuestStore.getState().beginAccountSession();
    set({ user: response.user, accessToken: response.accessToken, isNewUser: false });
    preferenceStore.getState().reset();
    await preferenceStore.getState().load().catch((error) => {
      console.error('No se pudieron cargar las preferencias de la cuenta:', error);
    });
  },

  logout: async () => {
    try {
      await signOut(authFirebase);
      await authApi.logout();
    } catch (error) {
      console.error('Error durante cierre de sesión:', error);
    } finally {
      try {
        await useGuestStore.getState().setGuestMode(false);
      } catch (error) {
        console.error('No se pudo actualizar el modo invitado al cerrar sesión:', error);
      }
      preferenceStore.getState().reset();
      set({ user: null, accessToken: null, isNewUser: false });
    }
  },

  refresh: async () => {
    try {
      const response = await authApi.refresh();
      await useGuestStore.getState().beginAccountSession();
      set({ user: response.user, accessToken: response.accessToken });
      preferenceStore.getState().reset();
      await preferenceStore.getState().load().catch((error) => {
        console.error('No se pudieron cargar las preferencias de la cuenta:', error);
      });
      return response.accessToken;
    } catch {
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
      await useGuestStore.getState().beginAccountSession();
      set({ user: response.user, accessToken: response.accessToken, isNewUser: response.isNewUser ?? false });
      preferenceStore.getState().reset();
      await preferenceStore.getState().load().catch((error) => {
        console.error('No se pudieron cargar las preferencias de la cuenta:', error);
      });
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as Error)?.message ||
        'Error de autenticación';
      throw new Error(errorMessage);
    }
  },
}));
