import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'expo-router'; // ← ADD THIS
import { API_BASE_URL } from '../src/config/api';

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
  if (user && token) {
    router.replace('/(tabs)');
  }
}, [user, token]);


  const register = async (name: string, username: string, email: string, password: string) => {
  const url = `${API_BASE_URL}/api/auth/register`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password }),
    });

    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    router.replace('/(auth)/login');
  } catch (e: any) {
    console.log('Register error:', e.message);
    throw e;
  }
};


  const login = async (email: string, password: string) => {
    const url = `${API_BASE_URL}/api/auth/login`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    setUser(data.user);
    setToken(data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
