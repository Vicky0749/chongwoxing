import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, nickname: string, role: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      api.get('/auth/me').then(res => setUser(res.data)).catch(() => { localStorage.removeItem('token'); setToken(null); });
    }
  }, [token]);

  const login = async (phone: string, password: string) => {
    const res = await api.post('/auth/login', { phone, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser({ ...res.data, avatar: '', real_name: '', id_card: '', bio: '', rating: 0, review_count: 0, order_count: 0, balance: 0, service_radius: 5, service_start_time: '08:00', service_end_time: '22:00' });
  };

  const register = async (phone: string, password: string, nickname: string, role: string) => {
    const res = await api.post('/auth/register', { phone, password, nickname, role });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser({ id: res.data.userId, phone, nickname, role: res.data.role as 'owner' | 'walker', avatar: '', real_name: '', id_card: '', bio: '', rating: 0, review_count: 0, order_count: 0, balance: 0, service_radius: 5, service_start_time: '08:00', service_end_time: '22:00' });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    const res = await api.get('/auth/me');
    setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
