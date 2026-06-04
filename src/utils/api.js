import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

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
