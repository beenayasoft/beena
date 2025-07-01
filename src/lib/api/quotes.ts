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
  designation: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount: number;
  vat_rate: string;
  vat_rate_display: string;
  total_ht: number;
  total_ttc: number;
  position: number;
  type: 'product' | 'service' | 'work' | 'chapter' | 'section' | 'discount'; // ✅ Types Django unifiés
  parent?: string;
  reference?: string;
  margin?: number;
  work_id?: string;
}

// Types pour l'éditeur avancé - ALIGNÉS AVEC LE BACKEND DJANGO
export interface EditorQuoteItem {
  id?: string;
  designation: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;                    // ✅ CORRIGÉ : discount (pas discountPercentage)
  vat_rate: string;                    // ✅ CORRIGÉ : vat_rate string (pas tvaRate)
  type: 'product' | 'service' | 'work' | 'chapter' | 'section' | 'discount'; // ✅ Types Django exactes
  reference?: string;
  position?: number;
  parent?: string;
  totalHt?: number;
  totalTtc?: number;
  margin?: number;
  work_id?: string;
}

export interface BulkQuoteData {
  quote: {
    tier: string;                    // ✅ OBLIGATOIRE - ForeignKey vers Tiers
    validity_period?: number;        // ✅ Durée de validité en jours
    notes?: string;                  // ✅ Notes du devis
    conditions?: string;             // ✅ Conditions générales (maps to terms_and_conditions)
    opportunity?: string;            // ✅ ID de l'opportunité associée
    // Champs auto-générés par Django (à ne pas envoyer)
    // client_name, client_address, issue_date, expiry_date, number, status
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
  issue_date: string;
  expiry_date: string;
  issue_date_formatted: string;
  expiry_date_formatted: string;
  validity_period: number;
  notes?: string;
  conditions?: string;
  opportunity?: string;
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
  opportunity_details?: {
    id: string;
    name: string;
    stage: string;
    stage_display: string;
    probability: number;
    amount: number;
  };
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
  // 🚀 NOUVEAUX: Paramètres de pagination
  page?: number;
  page_size?: number;
}

// 📊 Types pour la pagination (similaires aux tiers)
export interface QuotesPaginationInfo {
  count: number;
  num_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

export interface QuotesPaginatedResponse {
  results: Quote[];
  pagination: QuotesPaginationInfo;
}

export interface CreateQuoteData {
  tier: string;
  validity_period?: number;
  notes?: string;
  conditions?: string;
  opportunity?: string;
}

export interface CreateQuoteItemData {
  quote: string;
  designation: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount?: number;
  vat_rate: string;
  type: 'product' | 'service' | 'work' | 'chapter' | 'section' | 'discount'; // ✅ Types Django unifiés
  parent?: string;
  reference?: string;
  margin?: number;
  work_id?: string;
  position?: number;  // ✅ AJOUTÉ pour éliminer l'erreur
}

// API Devis
export const quotesApi = {
  // ==================== DEVIS ====================
  
  // 📊 Récupérer les statistiques globales des devis - OPTIMISÉ
  getStats: async (search?: string): Promise<QuoteStats> => {
    try {
      console.log("📊 API: Récupération des statistiques globales des devis");
      
      const params = new URLSearchParams();
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      const response = await apiClient.get(`/quotes/stats/?${params.toString()}`);
      console.log("📊 Stats devis reçues:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨 Erreur lors du chargement des stats devis:", error);
      // Retourner des stats vides en cas d'erreur
      return {
        total: 0,
        draft: 0,
        sent: 0,
        accepted: 0,
        rejected: 0,
        expired: 0,
        cancelled: 0,
        total_amount: 0,
        acceptance_rate: 0
      };
    }
  },

  // 🚀 Récupérer les devis AVEC PAGINATION OPTIMISÉE
  getQuotes: async (filters?: QuoteFilters): Promise<QuotesPaginatedResponse> => {
    try {
      console.log("🚀 API OPTIMISÉE: Récupération paginée des devis", filters);
      
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await apiClient.get(`/quotes/?${params.toString()}`);
      console.log("📊 Réponse API paginée devis:", response.data);
      
      // Vérifier si la réponse est paginée ou directe (rétrocompatibilité)
      const isPaginated = response.data.pagination && response.data.results;
      
      if (isPaginated) {
        // 🎯 NOUVELLE STRUCTURE PAGINÉE
        console.log("✅ Structure paginée détectée");
        return {
          results: response.data.results,
          pagination: response.data.pagination
        };
      } else {
        // 🔄 ANCIENNE STRUCTURE (fallback) - à supprimer après migration
        console.warn("⚠️ Ancienne structure détectée - utilisant le fallback");
        const quotesData = Array.isArray(response.data) ? response.data : 
                          response.data.results ? response.data.results : [];
        
        return {
          results: quotesData,
          pagination: {
            count: quotesData.length,
            num_pages: 1,
            current_page: 1,
            page_size: quotesData.length,
            has_next: false,
            has_previous: false,
            next_page: null,
            previous_page: null
          }
        };
      }
    } catch (error) {
      console.error("🚨 Erreur lors du chargement des devis:", error);
      throw error;
    }
  },

  // MÉTHODE LEGACY - garde pour compatibilité temporaire
  getQuotesLegacy: async (filters?: QuoteFilters): Promise<Quote[]> => {
    try {
      const response = await quotesApi.getQuotes(filters);
      return response.results;
    } catch (error) {
      console.error('Erreur lors de la récupération des devis (legacy):', error);
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
      console.log("🚀 === API BULK CREATE - DÉBUT ===");
      console.log("🚀 URL:", '/quotes/bulk_create/');
      console.log("🚀 Method:", 'POST');
      console.log("🚀 Payload complet:", JSON.stringify(quoteData, null, 2));
      console.log("🚀 Headers:", {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || 'NO_TOKEN'}`
      });
      console.log("🚀 === ENVOI REQUÊTE ===");
      
      const response = await apiClient.post('/quotes/bulk_create/', quoteData);
      
      console.log("✅ === RÉPONSE BULK CREATE ===");
      console.log("✅ Status:", response.status);
      console.log("✅ Status Text:", response.statusText);
      console.log("✅ Headers réponse:", response.headers);
      console.log("✅ Données réponse:", JSON.stringify(response.data, null, 2));
      console.log("✅ === FIN RÉPONSE ===");
      
      return response.data.quote;
    } catch (error: any) {
      console.error("🚨 === ERREUR BULK CREATE ===");
      console.error("🚨 Error object:", error);
      console.error("🚨 Request URL:", error.config?.url);
      console.error("🚨 Request method:", error.config?.method);
      console.error("🚨 Request data:", error.config?.data);
      console.error("🚨 Response status:", error.response?.status);
      console.error("🚨 Response statusText:", error.response?.statusText);
      console.error("🚨 Response headers:", error.response?.headers);
      console.error("🚨 Response data:", JSON.stringify(error.response?.data, null, 2));
      console.error("🚨 Network error?:", !error.response);
      console.error("🚨 === FIN ERREUR BULK CREATE ===");
      throw error;
    }
  },

  // Mise à jour complète d'un devis avec tous ses éléments en une seule transaction
  bulkUpdateQuote: async (id: string, quoteData: BulkQuoteData): Promise<QuoteDetail> => {
    try {
      console.log("📝 === API BULK UPDATE - DÉBUT ===");
      console.log("📝 URL:", `/quotes/${id}/bulk_update/`);
      console.log("📝 Method:", 'PUT');
      console.log("📝 ID devis:", id);
      console.log("📝 Payload complet:", JSON.stringify(quoteData, null, 2));
      console.log("📝 Headers:", {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || 'NO_TOKEN'}`
      });
      console.log("📝 === ENVOI REQUÊTE ===");
      
      const response = await apiClient.put(`/quotes/${id}/bulk_update/`, quoteData);
      
      console.log("✅ === RÉPONSE BULK UPDATE ===");
      console.log("✅ Status:", response.status);
      console.log("✅ Status Text:", response.statusText);
      console.log("✅ Headers réponse:", response.headers);
      console.log("✅ Données réponse:", JSON.stringify(response.data, null, 2));
      console.log("✅ === FIN RÉPONSE ===");
      
      return response.data.quote;
    } catch (error: any) {
      console.error("🚨 === ERREUR BULK UPDATE ===");
      console.error("🚨 Error object:", error);
      console.error("🚨 Request URL:", error.config?.url);
      console.error("🚨 Request method:", error.config?.method);
      console.error("🚨 Request data:", error.config?.data);
      console.error("🚨 Response status:", error.response?.status);
      console.error("🚨 Response statusText:", error.response?.statusText);
      console.error("🚨 Response headers:", error.response?.headers);
      console.error("🚨 Response data:", JSON.stringify(error.response?.data, null, 2));
      console.error("🚨 Network error?:", !error.response);
      console.error("🚨 === FIN ERREUR BULK UPDATE ===");
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
      const response = await apiClient.get(`/quotes/quote-items/by_quote/?quote_id=${quoteId}`);
      return response.data.items;
    } catch (error) {
      console.error(`Erreur lors du chargement des éléments du devis ${quoteId}:`, error);
      throw error;
    }
  },

  // Récupérer un élément de devis par ID
  getQuoteItem: async (id: string): Promise<QuoteItem> => {
    try {
      const response = await apiClient.get(`/quotes/quote-items/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du chargement de l'élément ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouvel élément de devis
  createQuoteItem: async (itemData: CreateQuoteItemData): Promise<QuoteItem> => {
    try {
      const response = await apiClient.post('/quotes/quote-items/', itemData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'élément:", error);
      throw error;
    }
  },

  // Mettre à jour un élément de devis
  updateQuoteItem: async (id: string, itemData: Partial<CreateQuoteItemData>): Promise<QuoteItem> => {
    try {
      const response = await apiClient.patch(`/quotes/quote-items/${id}/`, itemData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'élément ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un élément de devis
  deleteQuoteItem: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/quotes/quote-items/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'élément ${id}:`, error);
      throw error;
    }
  },

  // Réorganiser les éléments d'un devis
  reorderQuoteItems: async (itemsOrder: string[]): Promise<void> => {
    try {
      console.log("API: Réorganisation des éléments", itemsOrder);
      await apiClient.post('/quotes/quote-items/reorder/', { items_order: itemsOrder });
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
      const response = await apiClient.post('/quotes/quote-items/batch_operations/', { operations });
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
      const response = await quotesApi.getQuotes({ search: query });
      return response.results;
    } catch (error) {
      console.error("Erreur lors de la recherche de devis:", error);
      throw error;
    }
  },

  // Obtenir les devis d'un client
  getQuotesByClient: async (clientId: string): Promise<Quote[]> => {
    try {
      const response = await quotesApi.getQuotes({ client_id: clientId });
      return response.results;
    } catch (error) {
      console.error(`Erreur lors du chargement des devis du client ${clientId}:`, error);
      throw error;
    }
  },

  // Obtenir les devis par statut
  getQuotesByStatus: async (status: string): Promise<Quote[]> => {
    try {
      const response = await quotesApi.getQuotes({ status });
      return response.results;
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
      discount: backendItem.discount,
      vat_rate: backendItem.vat_rate,
      type: backendItem.type,
      reference: backendItem.reference,
      position: backendItem.position,
      parent: backendItem.parent,
      totalHt: backendItem.total_ht,
      totalTtc: backendItem.total_ttc,
      margin: backendItem.margin,
      work_id: backendItem.work_id,
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
      discount: editorItem.discount,
      vat_rate: editorItem.vat_rate,
      type: editorItem.type,
      reference: editorItem.reference,
      position: editorItem.position,
      parent: editorItem.parent,
      margin: editorItem.margin,
      work_id: editorItem.work_id,
    };
  },

  // Calculer le total HT d'un élément
  calculateItemTotal: (item: EditorQuoteItem): number => {
    const baseTotal = item.quantity * item.unitPrice;
    const discountAmount = baseTotal * (item.discount / 100);
    return baseTotal - discountAmount;
  },

  // Calculer le total TTC d'un élément
  calculateItemTotalTTC: (item: EditorQuoteItem): number => {
    const totalHT = quotesApi.calculateItemTotal(item);
    const tvaRate = parseFloat(item.vat_rate) / 100;
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
      const tvaRate = parseFloat(item.vat_rate);
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