import axios from 'axios';
import { Opportunity, OpportunityFilters } from '../types/opportunity';

// Configuration de l'URL de base de l'API

const API_URL = 'http://localhost:8000/api';

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
      const response = await apiClient.get('/opportunities/', { params: filters });
      console.log('📊 Réponse API opportunités:', {
        total: response.data.count || 'N/A',
        returned: response.data.results?.length || response.data.length || 0,
        structure: response.data.results ? 'paginée' : 'directe'
      });
      
      return response.data.results || response.data; // Support pagination
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  },

  // Récupérer une opportunité par ID
  getOpportunity: async (id: string): Promise<Opportunity> => {
    try {
      const response = await apiClient.get(`/opportunities/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching opportunity ${id}:`, error);
      throw error;
    }
  },

  // Créer une nouvelle opportunité
  createOpportunity: async (data: Partial<Opportunity>): Promise<Opportunity> => {
    try {
      const response = await apiClient.post('/opportunities/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  },

  // Mettre à jour une opportunité existante
  updateOpportunity: async (id: string, data: Partial<Opportunity>): Promise<Opportunity> => {
    try {
      const response = await apiClient.patch(`/opportunities/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating opportunity ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une opportunité
  deleteOpportunity: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/opportunities/${id}/`);
    } catch (error) {
      console.error(`Error deleting opportunity ${id}:`, error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une opportunité
  updateOpportunityStage: async (id: string, stage: string): Promise<Opportunity> => {
    try {
      const response = await apiClient.patch(`/opportunities/${id}/update_stage/`, { stage });
      return response.data;
    } catch (error) {
      console.error(`Error updating opportunity ${id} stage:`, error);
      throw error;
    }
  },

  // Marquer une opportunité comme gagnée
  markAsWon: async (id: string, data?: { project_id?: string }): Promise<Opportunity> => {
    try {
      const response = await apiClient.post(`/opportunities/${id}/mark_won/`, data || {});
      return response.data.opportunity || response.data;
    } catch (error) {
      console.error(`Error marking opportunity ${id} as won:`, error);
      throw error;
    }
  },

  // Marquer une opportunité comme perdue
  markAsLost: async (id: string, data: { loss_reason: string; loss_description?: string }): Promise<Opportunity> => {
    try {
      const response = await apiClient.post(`/opportunities/${id}/mark_lost/`, data);
      return response.data.opportunity || response.data;
    } catch (error) {
      console.error(`Error marking opportunity ${id} as lost:`, error);
      throw error;
    }
  },

  // Créer un devis à partir d'une opportunité
  createQuoteFromOpportunity: async (id: string, data?: { title?: string; description?: string }): Promise<{ quote_id: string; quote: any }> => {
    try {
      const response = await apiClient.post(`/opportunities/${id}/create_quote/`, data || {});
      return response.data;
    } catch (error) {
      console.error(`Error creating quote from opportunity ${id}:`, error);
      throw error;
    }
  },

  // Obtenir les données Kanban
  getKanbanData: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/opportunities/kanban/');
      return response.data;
    } catch (error) {
      console.error('Error fetching kanban data:', error);
      throw error;
    }
  },

  // Obtenir les statistiques des opportunités
  getOpportunityStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/opportunities/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunity stats:', error);
      throw error;
    }
  },
};

export default opportunitiesApi;
