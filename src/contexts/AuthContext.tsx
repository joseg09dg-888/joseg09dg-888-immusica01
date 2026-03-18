import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => void;
  handleAuthCallback: (code: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('im_music_token'));
  const [loading, setLoading] = useState<boolean>(!!token);

  useEffect(() => {
    if (token) {
      setLoading(true);
      // Fetch user data if token exists
      api.get('/auth/me')
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = () => {
    window.location.href = `${api.defaults.baseURL}/auth/login`;
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('im_music_token', token);
      setToken(token);
      setUser(user);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('im_music_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const handleAuthCallback = async (code: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/auth/callback?code=${code}`);
      const { token, user } = response.data;
      localStorage.setItem('im_music_token', token);
      setToken(token);
      setUser(user);
    } catch (error) {
      console.error('Error en autenticación:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithEmail, logout, handleAuthCallback, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
