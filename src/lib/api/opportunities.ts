import axios from 'axios';
import { Opportunity, OpportunityFilters } from '../types/opportunity';

// Configuration de l'URL de base de l'API
const API_URL = 'https://454b-105-72-56-65.ngrok-free.app/api';

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

// Fonctions d'API pour les opportunités
export const opportunitiesApi = {
  // Récupérer toutes les opportunités avec filtres optionnels
  getOpportunities: async (filters?: OpportunityFilters): Promise<Opportunity[]> => {
    try {
      const response = await apiClient.get('/v1/opportunities/', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  },

  // Récupérer une opportunité par ID
  getOpportunity: async (id: string): Promise<Opportunity> => {
    try {
      const response = await apiClient.get(`/v1/opportunities/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching opportunity ${id}:`, error);
      throw error;
    }
  },

  // Créer une nouvelle opportunité
  createOpportunity: async (data: Partial<Opportunity>): Promise<Opportunity> => {
    try {
      const response = await apiClient.post('/v1/opportunities/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  },

  // Mettre à jour une opportunité existante
  updateOpportunity: async (id: string, data: Partial<Opportunity>): Promise<Opportunity> => {
    try {
      const response = await apiClient.patch(`/v1/opportunities/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating opportunity ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une opportunité
  deleteOpportunity: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/v1/opportunities/${id}/`);
    } catch (error) {
      console.error(`Error deleting opportunity ${id}:`, error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une opportunité
  updateOpportunityStage: async (id: string, stage: string): Promise<Opportunity> => {
    try {
      const response = await apiClient.patch(`/v1/opportunities/${id}/update_stage/`, { stage });
      return response.data;
    } catch (error) {
      console.error(`Error updating opportunity ${id} stage:`, error);
      throw error;
    }
  },

  // Marquer une opportunité comme gagnée
  markAsWon: async (id: string, data?: { closingNotes?: string }): Promise<Opportunity> => {
    try {
      const response = await apiClient.post(`/v1/opportunities/${id}/mark_as_won/`, data || {});
      return response.data;
    } catch (error) {
      console.error(`Error marking opportunity ${id} as won:`, error);
      throw error;
    }
  },

  // Marquer une opportunité comme perdue
  markAsLost: async (id: string, data: { lossReason: string; lossDescription?: string }): Promise<Opportunity> => {
    try {
      const response = await apiClient.post(`/v1/opportunities/${id}/mark_as_lost/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error marking opportunity ${id} as lost:`, error);
      throw error;
    }
  },

  // Créer un devis à partir d'une opportunité
  createQuoteFromOpportunity: async (id: string): Promise<{ quoteId: string }> => {
    try {
      const response = await apiClient.post(`/v1/opportunities/${id}/create_quote/`);
      return response.data;
    } catch (error) {
      console.error(`Error creating quote from opportunity ${id}:`, error);
      throw error;
    }
  },

  // Créer un projet à partir d'une opportunité gagnée
  createProjectFromOpportunity: async (id: string): Promise<{ projectId: string }> => {
    try {
      const response = await apiClient.post(`/v1/opportunities/${id}/create_project/`);
      return response.data;
    } catch (error) {
      console.error(`Error creating project from opportunity ${id}:`, error);
      throw error;
    }
  },

  // Obtenir les statistiques des opportunités
  getOpportunityStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/v1/opportunities/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunity stats:', error);
      throw error;
    }
  },
};

export default opportunitiesApi;
