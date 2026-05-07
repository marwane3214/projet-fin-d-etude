import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isAffilie: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('cimr_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('cimr_user', JSON.stringify(user));
      localStorage.setItem('cimr_token', user.token);
    } else {
      localStorage.removeItem('cimr_user');
      localStorage.removeItem('cimr_token');
    }
  }, [user]);

  const login = (userData: AuthUser) => setUser(userData);
  const logout = () => setUser(null);
  const hasRole = (role: UserRole) => user?.roles?.includes(role) ?? false;
  const isAdmin = hasRole('ROLE_ADMIN');
  const isAffilie = hasRole('ROLE_AFFILIE');

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasRole, isAdmin, isAffilie }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
