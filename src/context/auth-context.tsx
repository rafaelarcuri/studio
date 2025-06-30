
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/data/users';
import { users } from '@/data/users';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isLoading: true,
});

// NOTE: This is a mock authentication provider for prototyping.
// In a real-world application, this would involve secure server-side sessions,
// token management (e.g., JWT), and a database for user storage.
// Passwords would be hashed and never stored or checked in plaintext.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On initial load, try to rehydrate the user from localStorage
    try {
      const storedUser = localStorage.getItem('vendas-agil-user');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        // Re-validate the user against our "database"
        const userExists = users.some(u => u.id === parsedUser.id && u.status === 'ativo');
        if (userExists) {
            // Refresh user data from our "source of truth" in case it was updated
            const freshUser = users.find(u => u.id === parsedUser.id)!;
            const userToStore = { ...freshUser };
            // @ts-ignore
            delete userToStore.password;
            setUser(userToStore);
        } else {
            // User might be disabled or deleted, so clear storage
             localStorage.removeItem('vendas-agil-user');
        }
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('vendas-agil-user');
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (foundUser && foundUser.status === 'ativo') {
      const userToStore = { ...foundUser };
      // In a real app, NEVER store the password, even in a mock.
      // @ts-ignore
      delete userToStore.password;

      setUser(userToStore);
      localStorage.setItem('vendas-agil-user', JSON.stringify(userToStore));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vendas-agil-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
