import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginCredentials, RegisterData } from '@/lib/api/auth';

// Type pour les données de l'utilisateur
interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  company: string;
}

// Type pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// Création du contexte avec une valeur par défaut undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider d'authentification
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await authApi.getUserInfo();
          setUser(userData);
        } catch (error) {
          // Essayer de rafraîchir le token si la requête échoue
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshData = await authApi.refreshToken(refreshToken);
              localStorage.setItem('accessToken', refreshData.access);
              if (refreshData.refresh) {
                localStorage.setItem('refreshToken', refreshData.refresh);
              }
              
              // Réessayer de récupérer les informations utilisateur
              const userData = await authApi.getUserInfo();
              setUser(userData);
            } catch (refreshError) {
              // Si le rafraîchissement échoue, déconnecter l'utilisateur
              handleLogout();
              setError('Session expirée, veuillez vous reconnecter.');
            }
          } else {
            handleLogout();
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login(credentials);
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      // Si l'API login ne renvoie pas les données utilisateur, les récupérer
      if (data.user) {
        setUser(data.user);
      } else {
        const userData = await authApi.getUserInfo();
        setUser(userData);
      }
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erreur de connexion');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      setUser(response.user || null);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erreur lors de l\'inscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  // Valeur du contexte
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export default useAuth; 