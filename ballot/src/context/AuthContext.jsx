import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI, setAuthToken } from '../services/api';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  verifyEmail: async () => {},
  logout: () => {},
  updateUser: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated user profile on app startup if token exists
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('ballot_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          setAuthToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    setAuthToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password, confirmPassword, role) => {
    const res = await authAPI.register({ name, email, password, confirmPassword, role });
    return res;
  };

  const verifyEmail = async (email, otp) => {
    const res = await authAPI.verifyEmail({ email, otp });
    if (res.token) {
      setAuthToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        verifyEmail,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export function OrganizerRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
}
