import axios from 'axios';

// Create an Axios instance with the base URL of the Express backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://t-backend-production.up.railway.app/api',
});

// Map to store pending requests
const pendingRequests = new Map();

// Generate a unique key for each request
import { InternalAxiosRequestConfig } from 'axios';
const getRequestKey = (config: InternalAxiosRequestConfig) => `${config.method}:${config.url}`;

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Implement Request Cancellation for duplicate GET requests
    if (config.method?.toLowerCase() === 'get') {
      const requestKey = getRequestKey(config);
      if (pendingRequests.has(requestKey)) {
        const controller = pendingRequests.get(requestKey);
        controller.abort('Duplicate request canceled');
      }
      const controller = new AbortController();
      config.signal = controller.signal;
      pendingRequests.set(requestKey, controller);
    }

    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => {
    if (response.config.method?.toLowerCase() === 'get') {
      pendingRequests.delete(getRequestKey(response.config));
    }
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
    } else if (error.config?.method?.toLowerCase() === 'get') {
      pendingRequests.delete(getRequestKey(error.config));
    }

    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-error')); // Custom event to trigger logout in App.tsx
    }
    return Promise.reject(error);
  }
);

export default api;
