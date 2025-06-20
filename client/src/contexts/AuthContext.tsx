import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only check auth on protected routes
    const publicPaths = ['/', '/login', '/register'];
    if (publicPaths.includes(window.location.pathname)) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await auth.me();
      console.log("dfsdfsghdf",response);
      
      setUser(response.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await auth.login({ email, password });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const response = await auth.register({ name, email, password });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
      localStorage.removeItem('user');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Logout failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 