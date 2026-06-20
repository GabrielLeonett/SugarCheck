import { create } from 'zustand';
import { api } from '../api/axios';
import type { User } from '../types/types.js';
import { authFirebase } from '../config/firebase.js';
// ➔ CORREGIDO: Importamos los proveedores necesarios de Firebase
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signOut } from 'firebase/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  refresh: () => Promise<string>;
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
    const response = await api.post('/auth/login', { email, password }, { withCredentials: true });
    set({ user: response.data.user, accessToken: response.data.accessToken });
  },

  logout: async () => {
    try {
      // 1. Cerrar sesión en Firebase pasándole tu instancia 'authFirebase'
      await signOut(authFirebase);

      // 2. Destruir la sesión/cookies en tu backend de NestJS
      await api.post('/auth/logout', {}, { withCredentials: true });

    } catch (error) {
      console.error("Error durante el proceso de cierre de sesión:", error);
    } finally {
      // 3. Pase lo que pase en la red, limpiamos el estado global de Zustand
      set({ user: null, accessToken: null });
    }
  },

  refresh: async () => {
    try {
      const response = await api.post('/auth/refresh', {}, { withCredentials: true });
      set({ user: response.data.user, accessToken: response.data.accessToken });
      return response.data.accessToken;
    } catch (error) {
      set({ user: null, accessToken: null });
      throw error;
    }
  },

  loginWithProvider: async (providerName: 'google' | 'facebook') => {
    try {
      // ➔ CORREGIDO: Nombre correcto de la clase GoogleAuthProvider
      const provider = providerName === 'google'
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();

      // 2. Abrir el popup del navegador para que el usuario inicie sesión
      const userCredential = await signInWithPopup(authFirebase, provider);
      
      // 3. Extraer el IdToken de Google/Facebook verificado por Firebase
      const firebaseToken = await userCredential.user.getIdToken();

      // 4. Mandárselo a tu NestJS
      const response = await api.post(
        '/auth/firebase-login',
        { token: firebaseToken },
        { withCredentials: true }
      );

      // Si el backend devuelve por ejemplo { data: { user, accessToken } } en vez de { user, accessToken } directo,
      // tu set() actual va a fallar silenciosamente guardando campos vacíos.
      set({ user: response.data.user, accessToken: response.data.accessToken });


    } catch (error: unknown) {
      console.error(`Error en login con ${providerName}:`, error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || (error as Error).message || 'Error de autenticación';
      throw new Error(errorMessage);
    }
  }
}));