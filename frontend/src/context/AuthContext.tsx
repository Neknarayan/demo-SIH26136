import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, LoginPayload, RegisterPayload } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  currentUser: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [loading, setLoading] = useState(true);

  // Restore JWT session (refresh flow) on mount
  useEffect(() => {
    const handleLogoutEvent = () => {
      setCurrentUser(null);
      setToken(null);
    };
    
    window.addEventListener('auth:logout', handleLogoutEvent);
    
    // Attempt silent refresh to get user session on load
    api.authMe()
      .then((u) => {
        setToken(api.getToken());
        setCurrentUser(u);
      })
      .catch(() => {
        // Not logged in or expired refresh token
        api.setToken(null);
        setToken(null);
        setCurrentUser(null);
      })
      .finally(() => setLoading(false));
      
    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    const resp = await api.authLogin(payload);
    api.setToken(resp.access_token);
    setToken(resp.access_token);
    setCurrentUser(resp.user);
  };

  const register = async (payload: RegisterPayload) => {
    await api.authRegister(payload);
    // Registration returns just the response message now, no token (Prompt 2 spec)
    // Wait, earlier my register returned startup. But prompt says "Registration doesn't log them in, they must log in".
    // Wait, the API I wrote actually does return the startup, but no token!
    // So we don't set token.
  };

  const logout = async () => {
    try {
      await api.authLogout();
    } catch (e) {
      // ignore
    }
    api.setToken(null);
    setToken(null);
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth:logout'));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        login,
        register,
        logout
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
