import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

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
  async (config) => {
    const { useAuthStore } = await import('../stores/authStore');
    const token = useAuthStore.getState().accessToken;
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error?.config;

    if (
      error?.response?.status === 401 &&
      !prevRequest?.sent &&
      !prevRequest?.url?.includes('/auth/refresh')
    ) {
      prevRequest.sent = true;
      try {
        const { useAuthStore } = await import('../stores/authStore');
        const refreshFunction = useAuthStore.getState().refresh;
        const newAccessToken = await refreshFunction();
        if (newAccessToken) {
          prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
        return apiPrivate(prevRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
