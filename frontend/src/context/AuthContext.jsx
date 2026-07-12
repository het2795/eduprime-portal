import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('eduprime_token') || null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('eduprime_theme') !== 'light');

  // Verify and fetch profile on boot
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Session restore failed. Clearing credentials.', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  // Sync Dark/Light theme class with document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('eduprime_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('eduprime_theme', 'light');
    }
  }, [darkMode]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      
      localStorage.setItem('eduprime_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, user: receivedUser };
    } catch (err) {
      console.error('Login request failed:', err);
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('eduprime_token');
    setToken(null);
    setUser(null);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    darkMode,
    login,
    logout,
    toggleTheme,
    updateProfileState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
