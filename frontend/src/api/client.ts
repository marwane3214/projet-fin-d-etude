import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// JWT interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cimr_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect on login failures — let the login form handle those
      const url = error.config?.url || '';
      if (!url.includes('/api/auth/login')) {
        localStorage.removeItem('cimr_token');
        localStorage.removeItem('cimr_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;