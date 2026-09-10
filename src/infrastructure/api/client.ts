import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getClerkToken } from '../auth/clerk';
import Constants from 'expo-constants';

// Backend authority: ACTIVE = Next.js (apps/web), served at `/api/*`.
// See apps/api/AGENTS.md ("backend activo = Next.js API Routes") + apps/mobile/AGENTS.md ("contrato /api/coaching/*").
// Decision A (executed): mobile targets Next.js `/api/*`. Go API (apps/api) is auxiliar/no-activo.
const API_BASE_URL: string = Constants.expoConfig?.extra?.apiBaseUrl ?? '';

/**
 * Primary API client → Next.js active backend (`/api/*`).
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Secondary client → same Next.js backend. Retained to minimize caller churn during the
 * Go→Next.js consolidation; callers have been re-mapped to `/api/*` paths.
 */
const goApiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
