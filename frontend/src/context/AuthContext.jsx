import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('insureflow_token');
    const savedUser = localStorage.getItem('insureflow_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('insureflow_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authService.login({ email, password });
    const { user, token } = data.data;
    localStorage.setItem('insureflow_token', token);
    localStorage.setItem('insureflow_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (formData) => {
    const { data } = await authService.register(formData);
    const { user, token } = data.data;
    localStorage.setItem('insureflow_token', token);
    localStorage.setItem('insureflow_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('insureflow_token');
    localStorage.removeItem('insureflow_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
