import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { onSessionExpired } from '../api/axios';
import { useToast } from '../hooks/useToast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Fetch current user from /api/auth/get-me
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/get-me');
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      // 401 or token missing - user is unauthenticated
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial authentication check on application mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Subscribe to automatic session expiration emitted by Axios interceptor
  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      setUser(null);
      setIsAuthenticated(false);
      toast.warning('Your session has expired. Please sign in again.');
    });
    return unsubscribe;
  }, [toast]);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const userData = response.data.user;
      setUser(userData);
      setIsAuthenticated(true);
      toast.success(response.data.message || 'Signed in successfully!');
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/register', { name, email, password });
      const userData = response.data.user;
      setUser(userData);
      setIsAuthenticated(true);
      toast.success(response.data.message || 'Account created successfully!');
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout current device
  const logout = async () => {
    try {
      const response = await api.post('/logout', {});
      toast.success(response.data?.message || 'Logged out successfully');
    } catch (error) {
      console.warn('Logout error (continuing local cleanup):', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Logout all devices
  const logoutAll = async () => {
    try {
      const response = await api.post('/logout-all', {});
      toast.success(response.data?.message || 'Logged out from all devices successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to logout from all devices';
      toast.error(message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Explicit session refresh
  const refreshSession = async () => {
    try {
      await api.post('/refresh-token', {});
      await checkAuth();
      toast.success('Session refreshed successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to refresh session';
      toast.error(message);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        logoutAll,
        refreshSession,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
