import useAuthStore from '../store/authStore';

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const { token: rawToken, actionSetToken, actionClearAuth } = useAuthStore.getState();
  const token = rawToken ?? undefined;

  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const fetchWithToken = async (customToken?: string) => {
    const newHeaders = new Headers(options.headers || {});
    if (customToken) newHeaders.set('Authorization', `Bearer ${customToken}`);
    return await fetch(url, { ...options, headers: newHeaders, credentials: 'include' });
  };

  let response = await fetchWithToken(token);

  if (response.status !== 401) return response;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({
        resolve: async (newToken: string) => {
          try {
            const retry = await fetchWithToken(newToken);
            resolve(retry);
          } catch (err) {
            reject(err);
          }
        },
        reject,
      });
    });
  }

  isRefreshing = true;
  try {
    const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/refreshToken`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!refreshResponse.ok) throw new Error('Refresh token invalid');

    const data = await refreshResponse.json();
    const newToken = data.accessToken;

    actionSetToken(newToken);
    processQueue(null, newToken);

    response = await fetchWithToken(newToken);
  } catch (err) {
    processQueue(err);
    actionClearAuth?.();
    throw err;
  } finally {
    isRefreshing = false;
  }

  return response;
}
