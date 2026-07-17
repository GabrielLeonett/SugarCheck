import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { ApiError } from './api-error';
import type { BackendErrorResponse } from '../types/types';
import i18n from '../stores/i18n';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

function addLanguageHeader(config: any) {
  if (config.headers) {
    config.headers['Accept-Language'] = i18n.language || 'es';
  }
  return config;
}

function handleResponseError(error: AxiosError<BackendErrorResponse>) {
  const data = error.response?.data;

  const apiError = new ApiError(
    data?.message || error.message || 'Error inesperado',
    data?.code || 'UNKNOWN_ERROR',
    data?.field,
    data?.statusCode || error.response?.status || 500,
  );

  return Promise.reject(apiError);
}

export const apiPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const apiPublic = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiPrivate.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return addLanguageHeader(config);
  },
  (error) => Promise.reject(error)
);

apiPrivate.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<BackendErrorResponse>) => {
    const prevRequest = error?.config;

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

    return handleResponseError(error);
  }
);

apiPublic.interceptors.request.use(
  (config) => addLanguageHeader(config),
  (error) => Promise.reject(error)
);

apiPublic.interceptors.response.use(
  (response) => response,
  (error: AxiosError<BackendErrorResponse>) => handleResponseError(error)
);
