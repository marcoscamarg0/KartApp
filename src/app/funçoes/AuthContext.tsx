// src/app/funçoes/AuthContext.tsx
import React, { createContext, useState, useContext, useMemo } from 'react';

interface AuthContextData {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn(): Promise<void>;
  signOut(): void;
}

// Definindo o tipo para as props do AuthProvider
interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    setIsLoading(true);
    try {
      // Sua lógica de autenticação aqui
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setIsAuthenticated(false);
  };

  // Usando useMemo para memorizar o valor do contexto
  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      signIn,
      signOut,
    }),
    [isAuthenticated, isLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthProvider;