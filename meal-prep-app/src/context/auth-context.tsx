import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carrega o token salvo ao inicializar o app
    const loadToken = async () => {
      try {
        if (Platform.OS === 'web') {
          const savedToken = localStorage.getItem('user_token');
          setToken(savedToken);
        }
      } catch (e) {
        console.error('Erro ao carregar token:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    if (Platform.OS === 'web') {
      localStorage.setItem('user_token', newToken);
    }
  };

  const logout = () => {
    setToken(null);
    if (Platform.OS === 'web') {
      localStorage.removeItem('user_token');
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
