import { useState, useEffect } from 'react';
import { api } from '../api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mv-token');
    if (!token) { setLoading(false); return; }
    api.auth.me()
      .then(data => setUser(data.user))
      .catch(() => localStorage.removeItem('mv-token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem('mv-token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.auth.register(name, email, password);
    localStorage.setItem('mv-token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('mv-token');
    setUser(null);
  };

  return { user, loading, login, register, logout };
}
