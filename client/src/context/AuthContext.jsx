import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('saas_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('saas_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    setToken(null);
    setUser(null);
  }, []);

  // Validate stored token against backend on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const storedToken = localStorage.getItem('saas_token');
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const response = await axiosClient.get('/auth/me');
        if (isMounted && response.data && response.data.success) {
          setUser(response.data.user);
          localStorage.setItem('saas_user', JSON.stringify(response.data.user));
        }
      } catch {
        // Token invalid or expired
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    // Listen for 401 unauthorized events from Axios interceptor
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Login action
  const login = async (email, password) => {
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('saas_token', receivedToken);
      localStorage.setItem('saas_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  // Register action
  const register = async (name, email, password) => {
    try {
      const response = await axiosClient.post('/auth/register', { name, email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('saas_token', receivedToken);
      localStorage.setItem('saas_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
