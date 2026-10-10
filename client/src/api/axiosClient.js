import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor: attach JWT token if present in localStorage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('saas_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 unauthorized errors safely without infinite redirect loops
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token only if token was sent and rejected as invalid/expired
      const token = localStorage.getItem('saas_token');
      if (token && error.config && error.config.headers?.Authorization) {
        localStorage.removeItem('saas_token');
        localStorage.removeItem('saas_user');
        // Dispatch custom event so AuthContext can update state without hard page reload
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
