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
    const response = await apiPrivate.post('/auth/login', { email, password }, { withCredentials: true });

    // ➔ OBTENER ACCIÓN FUERA DE REACT Y EJECUTARLA SIN ERRORES
    await preferenceStore.getState().load();
    
    set({ user: response.data.user, accessToken: response.data.accessToken });
  },

  logout: async () => {
    try {
      // 1. Revocación de token en proveedor de identidad (Firebase)
      await signOut(authFirebase);

      // 2. Destrucción de sesión por cookies en el Servidor (NestJS)
      await apiPrivate.post('/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error("Error durante el proceso de cierre de sesión:", error);
    } finally {
      // 3. Limpieza obligatoria del estado local independientemente del estado de la red
      set({ user: null, accessToken: null });
    }
  },

  refresh: async () => {
    try {
      const response = await apiPrivate.post('/auth/refresh', {}, { withCredentials: true });
      set({ user: response.data.user, accessToken: response.data.accessToken });
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

      // Autenticación federada vía ventana emergente (Popup)
      const userCredential = await signInWithPopup(authFirebase, provider);

      // Extracción del Json Web Token (IdToken) emitido por Firebase
      const firebaseToken = await userCredential.user.getIdToken();

      // Transmisión del token al Backend para su respectiva verificación y registro/login
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