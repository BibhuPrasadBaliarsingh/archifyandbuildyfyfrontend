import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    const name  = localStorage.getItem('name');
    const id    = localStorage.getItem('id');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ token, role, name, id });
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password, role) => {
    const endpoint = role === 'admin' ? '/auth/admin/login' : '/auth/employee/login';
    const { data } = await api.post(endpoint, { username, password });
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    localStorage.setItem('token', data.token);
    localStorage.setItem('role',  data.role);
    localStorage.setItem('name',  data.name);
    localStorage.setItem('id',    data.id || '');
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    api.defaults.headers.common['Authorization'] = '';
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
