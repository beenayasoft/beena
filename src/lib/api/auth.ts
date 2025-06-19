import axios from 'axios';

// Configuration de l'URL de base de l'API
const API_URL = ' https://https://454b-105-72-56-65.ngrok-free.app//api';

// Types pour les données d'authentification
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  company: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    company: string;
  };
}

// Instance axios avec configuration de base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fonctions d'API pour l'authentification
export const authApi = {
  // Connexion utilisateur
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  },

  // Inscription utilisateur
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register/', data);
    return response.data;
  },

  // Rafraîchir le token
  refreshToken: async (refresh: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh/', { refresh });
    return response.data;
  },

  // Récupérer les informations de l'utilisateur connecté
  getUserInfo: async (): Promise<any> => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },
};

export default authApi; 
