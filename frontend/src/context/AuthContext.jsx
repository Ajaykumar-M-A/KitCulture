import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('kit_culture_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('kit_culture_access_token') || null;
  });

  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem('kit_culture_refresh_token') || null;
  });

  const [loading, setLoading] = useState(false);

  // Sync token to API client
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('kit_culture_access_token', accessToken);
    } else {
      localStorage.removeItem('kit_culture_access_token');
    }

    if (refreshToken) {
      localStorage.setItem('kit_culture_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('kit_culture_refresh_token');
    }

    if (user) {
      localStorage.setItem('kit_culture_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kit_culture_user');
    }
  }, [accessToken, refreshToken, user]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await api.login({ username, password });
      setAccessToken(data.access);
      setRefreshToken(data.refresh);
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('kit_culture_access_token');
    localStorage.removeItem('kit_culture_refresh_token');
    localStorage.removeItem('kit_culture_user');
  };

  const isAuthenticated = !!accessToken && !!user;
  const isAdmin = isAuthenticated && (user?.is_staff || user?.is_superuser);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
