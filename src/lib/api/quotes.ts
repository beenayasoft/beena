import axios from 'axios';

// URL de l'API Backend Django
const API_URL = 'http://localhost:8000/api';

// Créer une instance axios avec config d'authentification
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

// Types pour les réponses du backend
export interface QuoteStatus {
  DRAFT: 'draft';
  SENT: 'sent';
  ACCEPTED: 'accepted';
  REJECTED: 'rejected';
  EXPIRED: 'expired';
  CANCELLED: 'cancelled';
}

export interface QuoteItem {
  id: string;
  quote: string;
  type: 'chapter' | 'section' | 'work' | 'product' | 'service' | 'discount';
  type_display: string;
  parent?: string;
  position: number;
  reference?: string;
  designation: string;
  description?: string;
  unit: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  tva_rate: string;
  tva_rate_display: string;
  margin: number;
  total_ht: number;
  total_ttc: number;
  work_id?: string;
  created_at: string;
  updated_at: string;
  children?: QuoteItem[];
}

// Types pour l'éditeur avancé
export interface EditorQuoteItem {
  id?: string;
  designation: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercentage: number;
  tvaRate: string;
  type: 'chapter' | 'section' | 'work' | 'product' | 'service' | 'discount';
  reference?: string;
  position?: number;
  parent?: string;
  totalHt?: number;
  totalTtc?: number;
}

export interface BulkQuoteData {
  quote: {
    tier?: string;
    client_name?: string;
    client_address?: string;
    project_name?: string;
    issue_date?: string;
    expiry_date?: string;
    conditions?: string;
    notes?: string;
    status?: string;
    number?: string;
  };
  items: EditorQuoteItem[];
}

export interface BatchOperation {
  type: 'create' | 'update' | 'delete';
  item_id?: string;
  data?: Partial<EditorQuoteItem>;
}

export interface Quote {
  id: string;
  number: string;
  status: string;
  status_display: string;
  tier: string;
  client_name: string;
  client_type: string;
  client_address: string;
  project_name: string;
  project_address: string;
  issue_date: string;
  expiry_date: string;
  issue_date_formatted: string;
  expiry_date_formatted: string;
  validity_period: number;
  notes?: string;
  conditions?: string;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  items_count: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface QuoteDetail extends Quote {
  tier_details: any;
  items: QuoteItem[];
  items_stats: {
    total_items: number;
    chapters: number;
    sections: number;
    products: number;
    services: number;
    works: number;
    discounts: number;
  };
  vat_breakdown: Array<{
    rate: number;
    base_ht: number;
    vat_amount: number;
  }>;
}

export interface QuoteStats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  cancelled: number;
  total_amount: number;
  acceptance_rate: number;
}

export interface QuoteFilters {
  status?: string;
  client_id?: string;
  status_list?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  ordering?: string;
}

export interface CreateQuoteData {
  tier: string;
  project_name: string;
  project_address?: string;
  validity_period?: number;
  notes?: string;
  conditions?: string;
}

export interface CreateQuoteItemData {
  quote: string;
  type: string;
  parent?: string;
  position: number;
  reference?: string;
  designation: string;
  description?: string;
  unit: string;
  quantity: number;
  unit_price: number;
  discount_percentage?: number;
  tva_rate: string;
  margin?: number;
  work_id?: string;
}

// API Devis
export const quotesApi = {
  // ==================== DEVIS ====================
  
  // Récupérer toutes les statistiques des devis
  getStats: async (): Promise<QuoteStats> => {
    try {
      console.log("API: Récupération des statistiques des devis");
      const response = await apiClient.get('/quotes/stats/');
      console.log("Réponse stats devis:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des stats devis:", error);
      throw error;
    }
  },

  // Récupérer tous les devis avec filtres
  getQuotes: async (filters?: QuoteFilters): Promise<Quote[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await apiClient.get(`/quotes/?${params.toString()}`);
      
      // Gérer la pagination si présente
      if (response.data.results) {
        return response.data.results;
      }
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des devis:", error);
      throw error;
    }
  },

  // Récupérer un devis par ID avec tous les détails
  getQuote: async (id: string): Promise<QuoteDetail> => {
    try {
      const response = await apiClient.get(`/quotes/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du chargement du devis ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau devis
  createQuote: async (quoteData: CreateQuoteData): Promise<Quote> => {
    try {
      const response = await apiClient.post('/quotes/', quoteData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du devis:", error);
      throw error;
    }
  },

  // Mettre à jour un devis
  updateQuote: async (id: string, quoteData: Partial<CreateQuoteData>): Promise<Quote> => {
    try {
      const response = await apiClient.patch(`/quotes/${id}/`, quoteData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du devis ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un devis
  deleteQuote: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/quotes/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du devis ${id}:`, error);
      throw error;
    }
  },

  // ==================== NOUVEAUX ENDPOINTS BULK ====================

  // Création complète d'un devis avec tous ses éléments en une seule transaction
  bulkCreateQuote: async (quoteData: BulkQuoteData): Promise<QuoteDetail> => {
    try {
      console.log("API: Création bulk d'un devis complet", quoteData);
      const response = await apiClient.post('/quotes/bulk_create/', quoteData);
      console.log("Réponse création bulk:", response.data);
      return response.data.quote;
    } catch (error) {
      console.error("Erreur lors de la création bulk du devis:", error);
      throw error;
    }
  },

  // Mise à jour complète d'un devis avec tous ses éléments en une seule transaction
  bulkUpdateQuote: async (id: string, quoteData: BulkQuoteData): Promise<QuoteDetail> => {
    try {
      console.log(`API: Mise à jour bulk du devis ${id}`, quoteData);
      const response = await apiClient.put(`/quotes/${id}/bulk_update/`, quoteData);
      console.log("Réponse mise à jour bulk:", response.data);
      return response.data.quote;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour bulk du devis ${id}:`, error);
      throw error;
    }
  },

  // ==================== ACTIONS SUR LES DEVIS ====================

  // Marquer un devis comme envoyé
  markAsSent: async (id: string, note?: string): Promise<Quote> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/mark_as_sent/`, { note });
      return response.data.quote;
    } catch (error) {
      console.error(`Erreur lors de l'envoi du devis ${id}:`, error);
      throw error;
    }
  },

  // Marquer un devis comme accepté
  markAsAccepted: async (id: string, note?: string): Promise<Quote> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/mark_as_accepted/`, { note });
      return response.data.quote;
    } catch (error) {
      console.error(`Erreur lors de l'acceptation du devis ${id}:`, error);
      throw error;
    }
  },

  // Marquer un devis comme refusé
  markAsRejected: async (id: string, note?: string): Promise<Quote> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/mark_as_rejected/`, { note });
      return response.data.quote;
    } catch (error) {
      console.error(`Erreur lors du refus du devis ${id}:`, error);
      throw error;
    }
  },

  // Marquer un devis comme annulé
  markAsCancelled: async (id: string, note?: string): Promise<Quote> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/mark_as_cancelled/`, { note });
      return response.data.quote;
    } catch (error) {
      console.error(`Erreur lors de l'annulation du devis ${id}:`, error);
      throw error;
    }
  },

  // Dupliquer un devis
  duplicateQuote: async (id: string, options?: {
    copy_items?: boolean;
    new_number?: string;
  }): Promise<QuoteDetail> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/duplicate/`, options || {});
      return response.data.quote;
    } catch (error) {
      console.error(`Erreur lors de la duplication du devis ${id}:`, error);
      throw error;
    }
  },

  // Exporter un devis
  exportQuote: async (id: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<{ 
    download_url: string; 
    filename: string; 
  }> => {
    try {
      const response = await apiClient.post(`/quotes/${id}/export/`, { format });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'export du devis ${id}:`, error);
      throw error;
    }
  },

  // ==================== ÉLÉMENTS DE DEVIS ====================

  // Récupérer tous les éléments d'un devis
  getQuoteItems: async (quoteId: string): Promise<QuoteItem[]> => {
    try {
      const response = await apiClient.get(`/quote-items/by_quote/?quote_id=${quoteId}`);
      return response.data.items;
    } catch (error) {
      console.error(`Erreur lors du chargement des éléments du devis ${quoteId}:`, error);
      throw error;
    }
  },

  // Récupérer un élément de devis par ID
  getQuoteItem: async (id: string): Promise<QuoteItem> => {
    try {
      const response = await apiClient.get(`/quote-items/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du chargement de l'élément ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouvel élément de devis
  createQuoteItem: async (itemData: CreateQuoteItemData): Promise<QuoteItem> => {
    try {
      const response = await apiClient.post('/quote-items/', itemData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'élément:", error);
      throw error;
    }
  },

  // Mettre à jour un élément de devis
  updateQuoteItem: async (id: string, itemData: Partial<CreateQuoteItemData>): Promise<QuoteItem> => {
    try {
      const response = await apiClient.patch(`/quote-items/${id}/`, itemData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'élément ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un élément de devis
  deleteQuoteItem: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/quote-items/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'élément ${id}:`, error);
      throw error;
    }
  },

  // Réorganiser les éléments d'un devis
  reorderQuoteItems: async (itemsOrder: string[]): Promise<void> => {
    try {
      console.log("API: Réorganisation des éléments", itemsOrder);
      await apiClient.post('/quote-items/reorder/', { items_order: itemsOrder });
    } catch (error) {
      console.error("Erreur lors de la réorganisation des éléments:", error);
      throw error;
    }
  },

  // ==================== NOUVEAUX ENDPOINTS POUR L'ÉDITEUR ====================

  // Opérations en lot sur les éléments
  batchOperations: async (operations: BatchOperation[]): Promise<{
    results: Array<{
      operation: string;
      item_id: string;
      success: boolean;
    }>;
  }> => {
    try {
      console.log("API: Opérations en lot sur les éléments", operations);
      const response = await apiClient.post('/quote-items/batch_operations/', { operations });
      console.log("Réponse opérations en lot:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors des opérations en lot:", error);
      throw error;
    }
  },

  // ==================== UTILITAIRES ====================

  // Rechercher des devis
  searchQuotes: async (query: string): Promise<Quote[]> => {
    try {
      return await quotesApi.getQuotes({ search: query });
    } catch (error) {
      console.error("Erreur lors de la recherche de devis:", error);
      throw error;
    }
  },

  // Obtenir les devis d'un client
  getQuotesByClient: async (clientId: string): Promise<Quote[]> => {
    try {
      return await quotesApi.getQuotes({ client_id: clientId });
    } catch (error) {
      console.error(`Erreur lors du chargement des devis du client ${clientId}:`, error);
      throw error;
    }
  },

  // Obtenir les devis par statut
  getQuotesByStatus: async (status: string): Promise<Quote[]> => {
    try {
      return await quotesApi.getQuotes({ status });
    } catch (error) {
      console.error(`Erreur lors du chargement des devis avec le statut ${status}:`, error);
      throw error;
    }
  },

  // ==================== FONCTIONS UTILITAIRES POUR L'ÉDITEUR ====================

  // Convertir un QuoteItem backend vers EditorQuoteItem frontend
  backendToEditorItem: (backendItem: QuoteItem): EditorQuoteItem => {
    return {
      id: backendItem.id,
      designation: backendItem.designation,
      description: backendItem.description,
      quantity: backendItem.quantity,
      unit: backendItem.unit,
      unitPrice: backendItem.unit_price,
      discountPercentage: backendItem.discount_percentage || 0,
      tvaRate: backendItem.tva_rate,
      type: backendItem.type,
      reference: backendItem.reference,
      position: backendItem.position,
      parent: backendItem.parent,
      totalHt: backendItem.total_ht,
      totalTtc: backendItem.total_ttc,
    };
  },

  // Convertir un EditorQuoteItem frontend vers le format backend
  editorToBackendItem: (editorItem: EditorQuoteItem): Partial<CreateQuoteItemData> => {
    return {
      designation: editorItem.designation,
      description: editorItem.description,
      quantity: editorItem.quantity,
      unit: editorItem.unit,
      unit_price: editorItem.unitPrice,
      discount_percentage: editorItem.discountPercentage || 0,
      tva_rate: editorItem.tvaRate,
      type: editorItem.type,
      reference: editorItem.reference,
    };
  },

  // Calculer le total HT d'un élément
  calculateItemTotal: (item: EditorQuoteItem): number => {
    const baseTotal = item.quantity * item.unitPrice;
    const discountAmount = baseTotal * (item.discountPercentage / 100);
    return baseTotal - discountAmount;
  },

  // Calculer le total TTC d'un élément
  calculateItemTotalTTC: (item: EditorQuoteItem): number => {
    const totalHT = quotesApi.calculateItemTotal(item);
    const tvaRate = parseFloat(item.tvaRate) / 100;
    return totalHT * (1 + tvaRate);
  },

  // Calculer les totaux d'une liste d'éléments
  calculateTotals: (items: EditorQuoteItem[]): {
    totalHT: number;
    totalTVA: number;
    totalTTC: number;
    vatBreakdown: Array<{ rate: number; base: number; amount: number }>;
  } => {
    let totalHT = 0;
    let totalTVA = 0;
    const vatBreakdown = new Map<number, { base: number; amount: number }>();

    items.forEach(item => {
      const itemTotalHT = quotesApi.calculateItemTotal(item);
      const tvaRate = parseFloat(item.tvaRate);
      const tvaAmount = itemTotalHT * (tvaRate / 100);

      totalHT += itemTotalHT;
      totalTVA += tvaAmount;

      if (vatBreakdown.has(tvaRate)) {
        const existing = vatBreakdown.get(tvaRate)!;
        existing.base += itemTotalHT;
        existing.amount += tvaAmount;
      } else {
        vatBreakdown.set(tvaRate, { base: itemTotalHT, amount: tvaAmount });
      }
    });

    const vatBreakdownArray = Array.from(vatBreakdown.entries()).map(([rate, data]) => ({
      rate,
      base: data.base,
      amount: data.amount,
    }));

    return {
      totalHT: Math.round(totalHT * 100) / 100,
      totalTVA: Math.round(totalTVA * 100) / 100,
      totalTTC: Math.round((totalHT + totalTVA) * 100) / 100,
      vatBreakdown: vatBreakdownArray,
    };
  },
}; 