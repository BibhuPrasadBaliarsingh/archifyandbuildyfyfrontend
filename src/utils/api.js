import axios from 'axios';

// In development, `/api` is proxied to the local backend by Vite.
// In production, use the Render backend URL via VITE_API_URL.
// If VITE_API_URL is not provided, fall back to the known production backend.
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://archifyandbuildyfybackend.onrender.com/api' : '/api');
const api = axios.create({ baseURL });

export const getErrorMessage = (err) => {
  if (!err) return 'Unknown error';
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || (err.request && !err.response)) {
    return 'Network Error';
  }
  return err.message || 'Request failed';
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const skipRedirect = ['/auth/admin/login', '/auth/employee/login'];
    if (err.response?.status === 401 && !skipRedirect.includes(err.config?.url)) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
