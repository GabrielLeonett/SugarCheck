import { create } from 'zustand';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { authApi } from '../apis/auth';
import { signOut } from 'firebase/auth';
import { authFirebase } from '../config/firebase';
import i18n from '../i18n';
import type { User } from '../types';
import { useGuestStore } from './guestStore';
import { preferenceStore } from './preferenceStore';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  isNewUser: boolean;
  refresh: () => Promise<string | null>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (user: User, accessToken: string) => void;
  setLoading: (loading: boolean) => void;
  loginWithProvider: (providerName: 'google' | 'facebook') => Promise<void>;
  exchangeOAuthCode: (code: string) => Promise<void>;
  clearNewUserFlag: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthLoading: true,
  isNewUser: false,

  setAuth: (user: User, accessToken: string) => set({ user, accessToken }),
  setLoading: (loading: boolean) => set({ isAuthLoading: loading }),

  clearNewUserFlag: () => set({ isNewUser: false }),

  login: async (username, password) => {
    const response = await authApi.login(username, password);
    await useGuestStore.getState().beginAccountSession();
    set({ user: response.user, accessToken: response.accessToken, isNewUser: false });
    preferenceStore.getState().reset();
    await preferenceStore.getState().load().catch((error) => {
      console.error('No se pudieron cargar las preferencias de la cuenta:', error);
    });
  },

  logout: async () => {
    // 1. El servidor debe intentar cerrar la sesión SIEMPRE. `signOut` de
    //    Firebase va aparte para que un fallo suyo no lo impida.
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error al cerrar la sesión en el servidor:', error);
    }

    try {
      await signOut(authFirebase);
    } catch (error) {
      console.error('Error al cerrar la sesión de Firebase:', error);
    }

    // 2. Limpiar el estado local.
    try {
      await useGuestStore.getState().setGuestMode(false);
    } catch (error) {
      console.error('No se pudo actualizar el modo invitado al cerrar sesión:', error);
    }

    preferenceStore.getState().reset();
    set({ user: null, accessToken: null, isNewUser: false });
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

  exchangeOAuthCode: async (code) => {
    const response = await authApi.exchangeOAuthCode(code);
    await useGuestStore.getState().beginAccountSession();
    set({ user: response.user, accessToken: response.accessToken, isNewUser: response.isNewUser ?? false });
    preferenceStore.getState().reset();
    await preferenceStore.getState().load().catch((error) => {
      console.error('No se pudieron cargar las preferencias de la cuenta:', error);
    });
  },

  loginWithProvider: async (providerName: 'google' | 'facebook') => {
    const redirectUri = Linking.createURL('auth/callback');

    const result = await WebBrowser.openAuthSessionAsync(
      authApi.oauthStartUrl(providerName, redirectUri),
      redirectUri,
    );

    if (result.type !== 'success' || !result.url) {
      throw new Error(i18n.t('auth:socialLoginCancelled'));
    }

    const { queryParams } = Linking.parse(result.url);

    if (typeof queryParams?.error === 'string') {
      throw new Error(i18n.t('auth:socialLoginError', { provider: providerName }));
    }

    const code = queryParams?.code;
    if (typeof code !== 'string' || code.length === 0) {
      throw new Error(i18n.t('auth:socialLoginError', { provider: providerName }));
    }

    await get().exchangeOAuthCode(code);
  },
}));
