import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getClerkToken } from '../auth/clerk';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl as string;
const GO_API_URL = Constants.expoConfig?.extra?.goApiUrl as string || 'http://localhost:8080';

/**
 * Next.js API Client — fallback for endpoints not in Go API.
 * Migrated domains now target Go API v1 base URL.
 * Used for: /api/coaching/*, /api/coach/*, /api/athlete/*, /api/marketing/*, /api/polar/*
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: `${GO_API_URL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Go API Client — primary source for business logic endpoints.
 * Used for: /api/v1/users, /api/v1/training, /api/v1/memberships, /api/v1/events, etc.
 */
const goApiClient: AxiosInstance = axios.create({
  baseURL: `${GO_API_URL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Shared auth interceptor for both clients
const setupAuthInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await getClerkToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Try to get a fresh token and retry once
        const token = await getClerkToken();
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        }

        // Token refresh failed — caller should handle redirect to auth
      }

      return Promise.reject(error);
    },
  );
};

// Apply auth interceptors to both clients
setupAuthInterceptor(apiClient);
setupAuthInterceptor(goApiClient);

export { apiClient, goApiClient };
