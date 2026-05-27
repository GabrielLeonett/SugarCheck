import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Evita errores de compilación en entornos donde "process" no está tipado
const BASE_URL = import.meta.env.VITE_BACKEND_URL || ''; // Tu backend

export const api = axios.create({
  baseURL: BASE_URL,
});

export const apiPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Interceptor de Petición: Inyecta el token dinámicamente desde el store
apiPrivate.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Maneja el error 401 y renueva el token
apiPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error?.config;

    if (error?.response?.status === 401 && !prevRequest?.sent) {
      prevRequest.sent = true;
      try {
        // Llamamos directamente a la acción del store para refrescar
        const refreshFunction = useAuthStore.getState().refresh;
        const newAccessToken = await refreshFunction();

        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiPrivate(prevRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);