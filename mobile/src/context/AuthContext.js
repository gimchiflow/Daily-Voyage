import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('mv-token').then(token => {
      if (!token) { setLoading(false); return; }
      api.auth.me()
        .then(data => setUser(data.user))
        .catch(() => AsyncStorage.removeItem('mv-token'))
        .finally(() => setLoading(false));
    });
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    await AsyncStorage.setItem('mv-token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.auth.register(name, email, password);
    await AsyncStorage.setItem('mv-token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('mv-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
