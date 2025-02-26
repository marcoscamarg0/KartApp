import React, { 
    createContext, 
    useState, 
    useContext, 
    ReactNode,
    useMemo,
    useCallback
  } from 'react';
  
  interface User {
    email: string;
  }
  
  interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  // Componente de provedor de autenticação com export default
  const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
  
    const login = useCallback((email: string, password: string): boolean => {
      const ADMIN_EMAIL = 'admin@kartapp.com';
      const ADMIN_PASSWORD = 'admin123';
  
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setUser({ email });
        return true;
      }
      return false;
    }, []); 
  
    const logout = useCallback(() => {
      setUser(null);
    }, []); 
  
    const contextValue = useMemo(() => ({
      user,
      login,
      logout,
      isAuthenticated: !!user
    }), [user, login, logout]); 
  
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  // Hook personalizado para usar o contexto
  export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
      throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    
    return context;
  };
  
  export default AuthProvider;