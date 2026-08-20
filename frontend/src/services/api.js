import axios from 'axios';

const LIVE_AWS_URL = 'http://51.21.127.52:5000/api';

// On web deployments (HTTPS), use relative '/api' so Vercel proxies requests securely without Mixed Content errors
const isBrowserHttps = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
const defaultBaseUrl = isBrowserHttps ? '/api' : LIVE_AWS_URL;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || defaultBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 Unauthorized errors and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If unauthorized and not already on login page, trigger page reload or auth event
      if (!window.location.pathname.includes('/login')) {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
