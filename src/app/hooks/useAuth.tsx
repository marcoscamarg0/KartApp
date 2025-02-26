import { useState } from 'react';

interface User {
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  // Função de login simulada
  const login = (email: string, password: string): boolean => {
    const ADMIN_EMAIL = 'admin@kartapp.com';
    const ADMIN_PASSWORD = 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setUser({ email });
      return true;
    }
    return false;
  };

  // Função de logout
  const logout = () => {
    setUser(null);
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };
};

export default useAuth;