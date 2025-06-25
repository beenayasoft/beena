import { Opportunity, OpportunityFilters, OpportunityStats } from '../types/opportunity';
import { opportunitiesApi } from '../api/opportunities';
import { quotesApi } from '../api/quotes'; // ✅ Import pour le fallback intelligent
import * as mockAPI from '../mock/opportunities';
import { getServiceConfig, logger, isProduction } from '../config/environment';

// Configuration du service
interface ServiceConfig {
  useAPI: boolean;
  enableFallback: boolean;
  enableMetrics: boolean;
  cacheEnabled: boolean;
  cacheTimeout: number; // ms
}

// Cache intelligent
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  source: 'api' | 'mock';
}

// Métriques de performance
interface ServiceMetrics {
  apiCalls: number;
  apiFailures: number;
  mockFallbacks: number;
  averageResponseTime: number;
  lastError?: string;
}

class OpportunityService {
  private config: ServiceConfig = {
    ...getServiceConfig(), // Configuration depuis l'environnement
  };

  private cache = new Map<string, CacheEntry<any>>();
  private metrics: ServiceMetrics = {
    apiCalls: 0,
    apiFailures: 0,
    mockFallbacks: 0,
    averageResponseTime: 0,
  };

  // 🚀 Idée de génie : Wrapper avec métriques automatiques
  private withMetrics = <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    name: string
  ) => async (...args: T): Promise<R> => {
    const start = Date.now();
    
    try {
      this.metrics.apiCalls++;
      const result = await fn(...args);
      const duration = Date.now() - start;
      
      // Calcul de la moyenne mobile
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime + duration) / 2;
      
      if (this.config.enableMetrics) {
        logger.debug(`✅ ${name}: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.metrics.apiFailures++;
      this.metrics.lastError = error instanceof Error ? error.message : String(error);
      
      if (this.config.enableMetrics) {
        logger.error(`❌ ${name}: ${duration}ms - ${this.metrics.lastError}`);
      }
      
      throw error;
    }
  };

  // 🚀 Idée de génie : Cache hybride intelligent
  private getCached = <T>(key: string): T | null => {
    if (!this.config.cacheEnabled) return null;
    
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > this.config.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    if (this.config.enableMetrics) {
      logger.debug(`📦 Cache hit: ${key} (${entry.source})`);
    }
    
    return entry.data;
  };

  private setCache = <T>(key: string, data: T, source: 'api' | 'mock'): void => {
    if (!this.config.cacheEnabled) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      source,
    });
  };

  // 🚀 Idée de génie : Transformation automatique des types
  private transformOpportunity = (apiData: any): Opportunity => {
    if (apiData.tierId) return apiData; // Déjà au format frontend
    
    return {
      id: apiData.id,
      name: apiData.name,
      tierId: apiData.tier,
      tierName: apiData.tier_name,
      tierType: apiData.tier_type ? [apiData.tier_type] : [],
      stage: apiData.stage,
      estimatedAmount: parseFloat(apiData.estimated_amount || '0'),
      probability: apiData.probability,
      expectedCloseDate: apiData.expected_close_date,
      source: apiData.source,
      description: apiData.description,
      assignedTo: apiData.assigned_to,
      createdAt: apiData.created_at,
      updatedAt: apiData.updated_at,
      closedAt: apiData.closed_at,
      lossReason: apiData.loss_reason,
      lossDescription: apiData.loss_description,
      quoteIds: [], // TODO: À implémenter quand la relation sera disponible
    };
  };

  // 🚀 Transformation des statistiques API → Frontend
  private transformStats = (apiData: any): OpportunityStats => {
    if (apiData.byStage) return apiData; // Déjà au format frontend
    
    // Transformation de la structure backend vers frontend
    const byStage: Record<string, number> = {};
    let wonAmount = 0;
    let lostAmount = 0;
    
    // Transformer by_stage du format backend vers frontend
    if (apiData.by_stage) {
      Object.keys(apiData.by_stage).forEach(stage => {
        const stageData = apiData.by_stage[stage];
        byStage[stage] = stageData.count || 0;
        
        // Calculer les montants spéciaux
        if (stage === 'won') {
          wonAmount = stageData.total_amount || 0;
        } else if (stage === 'lost') {
          lostAmount = stageData.total_amount || 0;
        }
      });
    }
    
    return {
      total: apiData.total || 0,
      byStage: byStage as any, // Cast pour satisfaire TypeScript
      totalAmount: apiData.total_estimated_amount || 0,
      weightedAmount: apiData.weighted_pipeline || 0,
      wonAmount: wonAmount,
      lostAmount: lostAmount,
      conversionRate: apiData.conversion_rate || 0,
    };
  };

  private transformToAPI = (frontendData: Partial<Opportunity>): any => {
    return {
      name: frontendData.name,
      tier: frontendData.tierId,
      stage: frontendData.stage,
      estimated_amount: frontendData.estimatedAmount,
      probability: frontendData.probability,
      expected_close_date: frontendData.expectedCloseDate,
      source: frontendData.source,
      description: frontendData.description,
      assigned_to: frontendData.assignedTo,
      loss_reason: frontendData.lossReason,
      loss_description: frontendData.lossDescription,
    };
  };

  // 🚀 Méthodes publiques avec fallback automatique

  async getOpportunities(filters?: OpportunityFilters): Promise<Opportunity[]> {
    const cacheKey = `opportunities_${JSON.stringify(filters || {})}`;
    const cached = this.getCached<Opportunity[]>(cacheKey);
    if (cached) return cached;

    // Tentative API
    if (this.config.useAPI) {
      try {
        const apiData = await this.withMetrics(opportunitiesApi.getOpportunities, 'getOpportunities')(filters);
        const transformed = apiData.map(this.transformOpportunity);
        this.setCache(cacheKey, transformed, 'api');
        return transformed;
      } catch (error) {
        if (!this.config.enableFallback) throw error;
        
        console.warn('🔄 API failed, falling back to mocks', error);
        this.metrics.mockFallbacks++;
      }
    }

    // Fallback vers mocks
    const mockData = mockAPI.getOpportunities(filters);
    this.setCache(cacheKey, mockData, 'mock');
    return mockData;
  }

  // 🚀 Idée de génie #2 : Méthode spécialisée pour TierDetail avec chargement progressif
  async getOpportunitiesByTier(tierId: string, options?: {
    progressive?: boolean;
    includeMetrics?: boolean;
  }): Promise<{
    opportunities: Opportunity[];
    metrics?: {
      total: number;
      byStage: Record<string, number>;
      totalAmount: number;
      avgAmount: number;
    };
    source: 'api' | 'mock';
  }> {
    const { progressive = true, includeMetrics = true } = options || {};
    const cacheKey = `tier_opportunities_${tierId}_${includeMetrics}`;
    
    // 🚀 Idée de génie #1 : Cache intelligent bidirectionnel
    const cached = this.getCached<any>(cacheKey);
    if (cached) {
      if (this.config.enableMetrics) {
        logger.debug(`📦 Cache hit pour tier ${tierId}: ${cached.opportunities.length} opportunités`);
      }
      return cached;
    }

    let opportunities: Opportunity[] = [];
    let source: 'api' | 'mock' = 'api';

    // Tentative API avec gestion d'erreurs gracieuse
    if (this.config.useAPI) {
      try {
        console.log(`🔍 Récupération opportunités pour tier ${tierId}...`);
        
        // Filtrer par tierId
        const filters: OpportunityFilters = { tierId };
        const apiData = await this.withMetrics(opportunitiesApi.getOpportunities, 'getOpportunitiesByTier')(filters);
        opportunities = apiData.map(this.transformOpportunity);
        source = 'api';
        
        if (this.config.enableMetrics) {
          logger.info(`✅ API: ${opportunities.length} opportunités trouvées pour tier ${tierId}`);
        }
      } catch (error) {
        if (!this.config.enableFallback) throw error;
        
        console.warn(`🔄 API failed pour tier ${tierId}, falling back to mocks`, error);
        this.metrics.mockFallbacks++;
        source = 'mock';
        
        // Fallback vers mocks
        opportunities = mockAPI.getOpportunities({ tierId });
        
        if (this.config.enableMetrics) {
          logger.warn(`⚠️ Mock: ${opportunities.length} opportunités trouvées pour tier ${tierId}`);
        }
      }
    } else {
      // Mode mock complet
      opportunities = mockAPI.getOpportunities({ tierId });
      source = 'mock';
    }

    // 🚀 Calcul des métriques en temps réel (si demandé)
    let metrics;
    if (includeMetrics && opportunities.length > 0) {
      const byStage: Record<string, number> = {};
      let totalAmount = 0;
      
      opportunities.forEach(opp => {
        byStage[opp.stage] = (byStage[opp.stage] || 0) + 1;
        totalAmount += opp.estimatedAmount || 0;
      });
      
      metrics = {
        total: opportunities.length,
        byStage,
        totalAmount,
        avgAmount: opportunities.length > 0 ? totalAmount / opportunities.length : 0,
      };
      
      if (this.config.enableMetrics) {
        logger.debug(`📊 Métriques tier ${tierId}:`, metrics);
      }
    }

    const result = {
      opportunities,
      metrics,
      source,
    };

    // 🚀 Idée de génie #1 : Cache bidirectionnel - Mettre en cache individuellement aussi
    this.setCache(cacheKey, result, source);
    
    // Mettre en cache chaque opportunité individuellement pour optimiser les accès futurs
    opportunities.forEach(opp => {
      this.setCache(`opportunity_${opp.id}`, opp, source);
    });

    return result;
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    const cacheKey = `opportunity_${id}`;
    const cached = this.getCached<Opportunity>(cacheKey);
    if (cached) return cached;

    if (this.config.useAPI) {
      try {
        const apiData = await this.withMetrics(opportunitiesApi.getOpportunity, 'getOpportunity')(id);
        const transformed = this.transformOpportunity(apiData);
        this.setCache(cacheKey, transformed, 'api');
        return transformed;
      } catch (error) {
        if (!this.config.enableFallback) throw error;
        
        console.warn('🔄 API failed, falling back to mocks', error);
        this.metrics.mockFallbacks++;
      }
    }

    const mockData = mockAPI.getOpportunityById(id);
    if (!mockData) throw new Error(`Opportunity ${id} not found`);
    
    this.setCache(cacheKey, mockData, 'mock');
    return mockData;
  }

  async createOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
    if (this.config.useAPI) {
      try {
        const apiData = this.transformToAPI(data);
        const result = await this.withMetrics(opportunitiesApi.createOpportunity, 'createOpportunity')(apiData);
        const transformed = this.transformOpportunity(result);
        
        // Invalider le cache des listes
        this.cache.forEach((_, key) => {
          if (key.startsWith('opportunities_')) {
            this.cache.delete(key);
          }
        });
        
        return transformed;
      } catch (error) {
        if (!this.config.enableFallback) throw error;
        
        console.warn('🔄 API failed, falling back to mocks', error);
        this.metrics.mockFallbacks++;
      }
    }

    // Fallback mock
    const mockResult = mockAPI.createOpportunity(data as any);
    this.cache.clear(); // Invalider tout le cache
    return mockResult;
  }

  async updateOpportunity(id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    if (this.config.useAPI) {
      try {
        const apiData = this.transformToAPI(data);
        const result = await this.withMetrics(opportunitiesApi.updateOpportunity, 'updateOpportunity')(id, apiData);
        const transformed = this.transformOpportunity(result);
        
        // Mettre à jour le cache
        this.setCache(`opportunity_${id}`, transformed, 'api');
        
        return transformed;
      } catch (error) {
        if (!this.config.enableFallback) throw error;
        
        console.warn('🔄 API failed, falling back to mocks', error);
        this.metrics.mockFallbacks++;
      }
    }

    // Fallback mock
    const mockResult = mockAPI.updateOpportunity(id, data);
    if (!mockResult) throw new Error(`Opportunity ${id} not found`);
    
    this.setCache(`opportunity_${id}`, mockResult, 'mock');
    return mockResult;
  }

  async deleteOpportunity(id: string): Promise<boolean> {
    if (this.config.useAPI) {
      try {
        await this.withMetrics(opportunitiesApi.deleteOpportunity, 'deleteOpportunity')(id);
        
        // Nettoyer le cache
        this.cache.delete(`opportunity_${id}`);
        this.cache.forEach((_, key) => {
          if (key.startsWith('opportunities_')) {
            this.cache.delete(key);
          }
        });
        
        return true;
      } catch (error) {
        if (!this.config.enableFallback) throw error;
        
        console.warn('🔄 API failed, falling back to mocks', error);
        this.metrics.mockFallbacks++;
      }
    }

    // Fallback mock
    const result = mockAPI.deleteOpportunity(id);
    if (result) {
      this.cache.clear();
    }
    return result;
  }

  async updateStage(id: string, stage: string): Promise<Opportunity> {
    if (this.config.useAPI) {
      try {
        const result = await this.withMetrics(opportunitiesApi.updateOpportunityStage, 'updateStage')(id, stage);
        const transformed = this.transformOpportunity(result);
        this.setCache(`opportunity_${id}`, transformed, 'api');
        return transformed;
      } catch (error) {
        if (!this.config.enableFallback) throw error;
        
        console.warn('🔄 API failed, falling back to mocks', error);
        this.metrics.mockFallbacks++;
      }
    }

    // Fallback mock avec logique métier
    const opportunity = mockAPI.getOpportunityById(id);
    if (!opportunity) throw new Error(`Opportunity ${id} not found`);
    
    let probability = opportunity.probability;
    switch (stage) {
      case 'new': probability = 10; break;
      case 'needs_analysis': probability = 30; break;
      case 'negotiation': probability = 60; break;
      case 'won': probability = 100; break;
      case 'lost': probability = 0; break;
    }
    
    const result = mockAPI.updateOpportunity(id, { 
      stage: stage as any, 
      probability 
    });
    
    if (!result) throw new Error(`Failed to update opportunity ${id}`);
    
    this.setCache(`opportunity_${id}`, result, 'mock');
    return result;
  }

  async markAsWon(id: string, data?: { project_id?: string }): Promise<Opportunity> {
    if (this.config.useAPI) {
      try {
        const result = await this.withMetrics(opportunitiesApi.markAsWon, 'markAsWon')(id, data);
        const transformed = this.transformOpportunity(result);
        this.setCache(`opportunity_${id}`, transformed, 'api');
        return transformed;
      } catch (error) {
        if (!this.config.enableFallback) throw error;
        
        console.warn('🔄 API failed, falling back to mocks', error);
        this.metrics.mockFallbacks++;
      }
    }

    // Fallback mock
    const result = mockAPI.updateOpportunity(id, { 
      stage: 'won', 
      probability: 100 
    });
    
    if (!result) throw new Error(`Opportunity ${id} not found`);
    
    this.setCache(`opportunity_${id}`, result, 'mock');
    return result;
  }

  async markAsLost(id: string, data: { loss_reason: string; loss_description?: string }): Promise<Opportunity> {
    if (this.config.useAPI) {
      try {
        const result = await this.withMetrics(opportunitiesApi.markAsLost, 'markAsLost')(id, data);
        const transformed = this.transformOpportunity(result);
        this.setCache(`opportunity_${id}`, transformed, 'api');
        return transformed;
      } catch (error) {
        if (!this.config.enableFallback) throw error;
        
        console.warn('🔄 API failed, falling back to mocks', error);
        this.metrics.mockFallbacks++;
      }
    }

    // Fallback mock
    const result = mockAPI.updateOpportunity(id, {
      stage: 'lost',
      probability: 0,
      lossReason: data.loss_reason as any,
      lossDescription: data.loss_description,
    });
    
    if (!result) throw new Error(`Opportunity ${id} not found`);
    
    this.setCache(`opportunity_${id}`, result, 'mock');
    return result;
  }

  async createQuote(id: string, data?: { title?: string; description?: string }): Promise<{ quote_id: string; quote: any }> {
    if (this.config.useAPI) {
      try {
        console.log(`📄 Tentative de création de devis via API opportunités pour ${id}...`);
        return await this.withMetrics(opportunitiesApi.createQuoteFromOpportunity, 'createQuote')(id, data);
      } catch (error) {
        if (!this.config.enableFallback) throw error;
        
        console.warn('🔄 API opportunités failed, tentative de fallback intelligent vers API quotes...', error);
        this.metrics.mockFallbacks++;
        
        // 🚀 FALLBACK INTELLIGENT : Créer un vrai devis via l'API quotes
        try {
          console.log(`🧠 Fallback intelligent : récupération de l'opportunité ${id}...`);
          
          // Récupérer l'opportunité pour ses informations
          let opportunity: Opportunity;
          try {
            // Essayer d'abord via l'API
            const apiData = await opportunitiesApi.getOpportunity(id);
            opportunity = this.transformOpportunity(apiData);
          } catch (opportunityApiError) {
            console.warn('⚠️ API opportunité failed, utilisation du mock pour l\'opportunité...', opportunityApiError);
            // Fallback vers le mock pour l'opportunité
            const mockOpportunity = mockAPI.getOpportunityById(id);
            if (!mockOpportunity) throw new Error(`Opportunité ${id} introuvable`);
            opportunity = mockOpportunity;
          }
          
          console.log(`✅ Opportunité récupérée:`, opportunity);
          
          // Créer un vrai devis via l'API quotes avec les données de l'opportunité
          const quoteData = {
            tier: opportunity.tierId,
            project_name: data?.title || `Projet ${opportunity.name}`,
            project_address: '', // Pourrait être récupéré depuis le tier si nécessaire
            validity_period: 30, // 30 jours par défaut
            notes: data?.description || opportunity.description || '',
            conditions: 'Conditions générales standard' // Pourrait être configuré
          };
          
          console.log(`📄 Création du devis via API quotes avec:`, quoteData);
          const createdQuote = await quotesApi.createQuote(quoteData);
          
          console.log(`✅ Devis créé avec succès via fallback intelligent:`, createdQuote);
          
          return {
            quote_id: createdQuote.id,
            quote: createdQuote
          };
          
        } catch (fallbackError) {
          console.error('❌ Fallback intelligent failed, utilisation du mock en dernier recours...', fallbackError);
          
          // En dernier recours, utiliser le mock (mais avec un warning)
          const result = mockAPI.createQuoteFromOpportunity(id);
          console.warn(`⚠️ ATTENTION : Utilisation du mock ID fictif ${result.quoteId}. Cela causera une erreur 404 !`);
          
          return { 
            quote_id: result.quoteId, 
            quote: { id: result.quoteId } 
          };
        }
      }
    }

    // Mode mock complet (quand l'API est désactivée)
    console.log(`🔧 Mode mock complet - création fictive de devis pour opportunité ${id}`);
    const result = mockAPI.createQuoteFromOpportunity(id);
    console.warn(`⚠️ ATTENTION : Mode mock - ID fictif ${result.quoteId} utilisé. Cela causera une erreur 404 !`);
    
    return { 
      quote_id: result.quoteId, 
      quote: { id: result.quoteId } 
    };
  }

  async getStats(): Promise<OpportunityStats> {
    const cacheKey = 'opportunity_stats';
    const cached = this.getCached<OpportunityStats>(cacheKey);
    if (cached) return cached;

    if (this.config.useAPI) {
      try {
        const apiData = await this.withMetrics(opportunitiesApi.getOpportunityStats, 'getStats')();
        const transformed = this.transformStats(apiData);
        this.setCache(cacheKey, transformed, 'api');
        return transformed;
      } catch (error) {
        if (!this.config.enableFallback) throw error;
        
        console.warn('🔄 API failed, falling back to mocks', error);
        this.metrics.mockFallbacks++;
      }
    }

    // Fallback mock
    const result = mockAPI.getOpportunityStats();
    this.setCache(cacheKey, result, 'mock');
    return result;
  }

  // 🚀 Méthodes de gestion et monitoring

  enableAPI(enabled: boolean = true): void {
    this.config.useAPI = enabled;
    if (enabled) {
      logger.info('🚀 API mode enabled');
    } else {
      logger.info('🔧 Mock mode enabled');
    }
  }

  getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  clearCache(): void {
    this.cache.clear();
    logger.info('🗑️ Cache cleared');
  }

  getConfig(): ServiceConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('⚙️ Config updated:', updates);
  }
  
  // 🚀 Nouvelle méthode : Health check du service
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }> {
    try {
      const start = Date.now();
      await this.getStats();
      const duration = Date.now() - start;
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      // Déterminer le statut selon les métriques
      if (this.metrics.apiFailures > 10 || duration > 3000) {
        status = 'unhealthy';
      } else if (this.metrics.mockFallbacks > 5 || duration > 1000) {
        status = 'degraded';
      }
      
      const health = {
        status,
        details: {
          responseTime: duration,
          metrics: this.metrics,
          config: this.config,
          environment: isProduction() ? 'production' : 'development',
          fallbacksUsed: this.metrics.mockFallbacks > 0,
        }
      };
      
      return health;
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }
}

// Instance singleton
export const opportunityService = new OpportunityService();
export default opportunityService; 