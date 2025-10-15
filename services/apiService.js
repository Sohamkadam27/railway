import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // This will be proxied by Vite to your backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the token to every request
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

// AUTH
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (credentials) => api.post('/auth/register', credentials);
export const getMe = () => api.get('/auth/me');

// ASSETS
export const getAssets = () => api.get('/assets');
export const getAssetById = (uid) => api.get(`/assets/${uid}`);
export const updateAsset = (uid, data) => api.put(`/assets/${uid}`, data);

// REPORTS
export const getVendorReport = () => api.get('/vendors');
export const getInventoryReport = () => api.get('/inventory');
export const getDashboardSummary = () => api.get('/dashboard-summary');

export default api;