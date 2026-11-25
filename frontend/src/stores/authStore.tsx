import { create } from 'zustand';
import { apiPrivate, apiPublic } from '../apis/axios.js';
import type { User } from '../types/types.js';
import { authFirebase } from '../config/firebase.js';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signOut } from 'firebase/auth';
import { preferenceStore } from '../hooks/usePreferenceConfig.js';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  isNewUser: boolean;
  isLoggingOut: boolean;
  refresh: () => Promise<string>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (user: User, accessToken: string) => void;
  setLoading: (loading: boolean) => void;
  loginWithProvider: (providerName: 'google' | 'facebook') => Promise<void>;
  clearNewUserFlag: () => void;
}

/**
 * "Época" de la sesión: se incrementa en cada login y en cada logout.
 *
 * Sirve para descartar respuestas de `refresh()` que estaban en vuelo cuando
 * el usuario cerró sesión. Sin esto, un refresh lento podía terminar después
 * del logout y volver a dejar `user`/`accessToken` poblados (sesión fantasma).
 */
let authEpoch = 0;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthLoading: true,
  isNewUser: false,
  isLoggingOut: false,

  setAuth: (user: User, accessToken: string) => {
    authEpoch += 1;
    set({ user, accessToken });
  },
  setLoading: (loading: boolean) => set({ isAuthLoading: loading }),

  clearNewUserFlag: () => set({ isNewUser: false }),

  login: async (username, password) => {
    // El login es un endpoint público: si se usara apiPrivate, el interceptor
    // intentaría refrescar la sesión ante un 401 (credenciales inválidas) y
    // ocultaría el error real con un "no se encontró token".
    const response = await apiPublic.post('/auth/login', { username, password }, { withCredentials: true });

    authEpoch += 1;
    await preferenceStore.getState().load();
    console.log('Login successful, user data:', response.data.user);
    set({ user: response.data.user, accessToken: response.data.accessToken, isNewUser: false });
  },
  
  logout: async () => {
    authEpoch += 1;
    set({ isLoggingOut: true });

    // 1. El servidor es el único que puede borrar las cookies httpOnly.
    //    Se llama SIEMPRE y de forma independiente a Firebase: si `signOut`
    //    falla, el cierre de sesión del backend no debe verse afectado.
    try {
      await apiPublic.post('/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('No se pudo cerrar la sesión en el servidor:', error);
    }

    try {
      await signOut(authFirebase);
    } catch (error) {
      console.error('No se pudo cerrar la sesión de Firebase:', error);
    }

    // 2. Limpiar el estado local y los datos del usuario anterior.
    preferenceStore.getState().reset();
    set({ user: null, accessToken: null, isNewUser: false, isLoggingOut: false });
  },
  
  refresh: async () => {
    const epoch = authEpoch;

    try {
      const response = await apiPrivate.post('/auth/refresh', {}, { withCredentials: true });

      // Si el usuario cerró sesión (o inició otra) mientras el refresh estaba
      // en vuelo, no resucitamos la sesión anterior.
      if (epoch !== authEpoch || get().isLoggingOut) {
        throw new Error('La sesión cambió durante la petición de refresco.');
      }

      set({ user: response.data.user, accessToken: response.data.accessToken });
      await preferenceStore.getState().load();
      return response.data.accessToken;
    } catch (error) {
      if (epoch === authEpoch) {
        set({ user: null, accessToken: null });
      }
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
        
        const response = await apiPublic.post(
          '/auth/firebase-login',
          { token: firebaseToken },
          { withCredentials: true }
        );
      
      authEpoch += 1;
      console.log('Login successful, user data:', response.data.user);
      set({ user: response.data.user, accessToken: response.data.accessToken, isNewUser: response.data.isNewUser ?? false });
    } catch (error: unknown) {
      console.error(`Error en login federado con ${providerName}:`, error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || (error as Error).message || 'Error de autenticación';
      throw new Error(errorMessage);
    }
  }
}));
