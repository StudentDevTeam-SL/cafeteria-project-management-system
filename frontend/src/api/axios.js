import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/' : 'http://localhost:8000/api/');

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ── Request interceptor: attach access token ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'undefined') {
    // Axios 1.x best practice: use .set() or check if it's an AxiosHeaders instance
    if (config.headers.set) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else       prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh');

      // No refresh token or explicitly logged out -> force redirect
      if (!refreshToken || refreshToken === 'undefined') {
        localStorage.clear(); // Clear all to be safe
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers.set) {
              originalRequest.headers.set('Authorization', `Bearer ${token}`);
            } else {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshUrl = API_BASE_URL + 'auth/refresh/';
        const { data } = await axios.post(refreshUrl, { refresh: refreshToken });
        
        const newAccess = data.access;
        const newRefresh = data.refresh;

        if (!newAccess) throw new Error('No access token returned');

        localStorage.setItem('token', newAccess);
        if (newRefresh) {
          localStorage.setItem('refresh', newRefresh);
        }
        
        // Update instance defaults for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
        
        processQueue(null, newAccess);

        // Update the current failed request
        if (originalRequest.headers.set) {
          originalRequest.headers.set('Authorization', `Bearer ${newAccess}`);
        } else {
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // If it fails with 401 and we ALREADY retried it, force logout
    if (error.response?.status === 401 && originalRequest._retry) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
