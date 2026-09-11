import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthUser, LoginPayload, RegisterPayload } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  // ── JWT Auth session ────────────────────────────────────────────────────────
  jwtUser: AuthUser | null;
  token: string | null;
  authLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;

  // ── Demo persona selector (existing dashboards, unchanged) ──────────────────
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User) => void;
  loading: boolean;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── JWT state ───────────────────────────────────────────────────────────────
  const [jwtUser, setJwtUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [authLoading, setAuthLoading] = useState(true);

  // Restore JWT session from localStorage on mount
  useEffect(() => {
    const stored = api.getToken();
    if (stored) {
      api.authMe()
        .then((u) => setJwtUser(u))
        .catch(() => {
          api.setToken(null);
          setToken(null);
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    const resp = await api.authLogin(payload);
    api.setToken(resp.access_token);
    setToken(resp.access_token);
    setJwtUser(resp.user);
  };

  const register = async (payload: RegisterPayload) => {
    const resp = await api.authRegister(payload);
    api.setToken(resp.access_token);
    setToken(resp.access_token);
    setJwtUser(resp.user);
  };

  const logout = () => {
    api.setToken(null);
    setToken(null);
    setJwtUser(null);
  };

  // ── Demo persona state (unchanged from original) ────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
      const savedId = api.getSavedUserId();
      if (savedId) {
        const found = data.find((u) => u.id === savedId);
        if (found) {
          setCurrentUserState(found);
          api.setUserId(found.id);
          return;
        }
      }
      if (data.length > 0 && !currentUser) {
        const defaultUser = data.find((u) => u.role === 'officer') || data[0];
        setCurrentUserState(defaultUser);
        api.setUserId(defaultUser.id);
      }
    } catch (err) {
      console.error('Failed to load demo users:', err);
    } finally {
      setLoading(false);
    }
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    api.setUserId(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        jwtUser,
        token,
        authLoading,
        login,
        register,
        logout,
        currentUser,
        users,
        setCurrentUser,
        loading,
        refreshUsers,
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
