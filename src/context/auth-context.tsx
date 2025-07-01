
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/data/users';
import { getUserByEmail, getUserById } from '@/data/users';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
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
    const rehydrateUser = async () => {
        try {
            const storedUserString = localStorage.getItem('vendas-agil-user');
            if (storedUserString) {
                const storedUser: Pick<User, 'id'> = JSON.parse(storedUserString);
                // Re-validate the user against our "database"
                const freshUser = await getUserById(storedUser.id);

                if (freshUser && freshUser.status === 'ativo') {
                    // @ts-ignore
                    delete freshUser.password;
                    setUser(freshUser);
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
    };
    
    rehydrateUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = await getUserByEmail(email);

    // IMPORTANT: Never check passwords in plaintext in a real app.
    // This should be a call to a server endpoint that securely compares a hashed password.
    if (foundUser && foundUser.password === password && foundUser.status === 'ativo') {
      const userToStore = { ...foundUser };
      // @ts-ignore
      delete userToStore.password;

      setUser(userToStore);
      // Only store minimal, non-sensitive info in localStorage
      localStorage.setItem('vendas-agil-user', JSON.stringify({ id: userToStore.id }));
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
