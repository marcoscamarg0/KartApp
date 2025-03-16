import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id?: string;
  email: string;
  name?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login com mais detalhes
  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulação de autenticação
      const ADMIN_EMAIL = 'admin@admin.com';
      const ADMIN_PASSWORD = 'admin123';

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const userData: User = {
          id: 'admin-123',
          email,
          name: 'Administrador'
        };

        // Salvar usuário no storage
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        return true;
      } else {
        setError('Credenciais inválidas');
        return false;
      }
    } catch (err) {
      setError('Erro ao fazer login');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout com limpeza de storage
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (err) {
      console.error('Erro no logout', err);
    }
  }, []);

  // Recuperar usuário salvo
  const loadStoredUser = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Erro ao carregar usuário', err);
    }
  }, []);

  return {
    user,
    login,
    logout,
    loadStoredUser,
    isAuthenticated: !!user,
    isLoading,
    error
  };
};

export default useAuth;