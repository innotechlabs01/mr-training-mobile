import axios from 'axios';
import { getClerkToken } from '../auth/clerk';
import Constants from 'expo-constants';

declare const __DEV__: boolean;

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl as string;

const apiClient = axios.create({
  baseURL: __DEV__
    ? 'http://localhost:3000/api'
    : `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getClerkToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to get a fresh token and retry once
      const token = await getClerkToken();
      if (token && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      }

      // Token refresh failed — caller should handle redirect to auth
    }

    return Promise.reject(error);
  },
);

export { apiClient };
