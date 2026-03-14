import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios';
import useAuthStore from '../store/authStore';

interface FailedQueueItem {
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (error: unknown) => void;
}

const instance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    config.headers = config.headers ?? ({} as AxiosRequestHeaders);
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError & { config?: InternalAxiosRequestConfig }) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return instance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.get<{ accessToken: string }>('/api/refreshToken', {
          withCredentials: true,
        });

        const newToken = res.data.accessToken;
        useAuthStore.getState().actionSetToken(newToken);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }

        processQueue(null, newToken);
        return instance(originalRequest);
      } catch (err) {
        processQueue(err);
        useAuthStore.getState().actionClearAuth?.();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
