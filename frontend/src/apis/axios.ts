import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

export const apiPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const apiPublic = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
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

    // No reintentar si la petición que falló es el propio refresh (evita bucle infinito)
    if (
      error?.response?.status === 401 &&
      !prevRequest?.sent &&
      !prevRequest?.url?.includes('/auth/refresh')
    ) {
      prevRequest.sent = true;
      try {
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

