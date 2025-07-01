import { opportunitiesApi } from '@/lib/api/opportunities';
import { Opportunity, OpportunityFilters, OpportunityStats } from '@/lib/types/opportunity';
import { syncService } from './syncService';

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
    useAPI: true,              // ✅ FORCER l'API
    enableFallback: false,     // ❌ DÉSACTIVER les mocks
    enableMetrics: true,
    cacheEnabled: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
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
        console.debug(`✅ ${name}: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.metrics.apiFailures++;
      this.metrics.lastError = error instanceof Error ? error.message : String(error);
      
      if (this.config.enableMetrics) {
        console.error(`❌ ${name}: ${duration}ms - ${this.metrics.lastError}`);
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
      console.debug(`📦 Cache hit: ${key} (${entry.source})`);
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
    // Vérifier si déjà transformé (avec tous les champs frontend)
    if (apiData.tierId && typeof apiData.estimatedAmount === 'number') {
      return apiData; // Déjà au format frontend
    }
    
    return {
      id: apiData.id,
      name: apiData.name,
      tierId: apiData.tierId || apiData.tier, // ✅ CORRECTION: Utiliser tierId en priorité
      tierName: apiData.tierName || apiData.tier_name,
      tierType: apiData.tierType || (apiData.tier_type ? [apiData.tier_type] : []),
      stage: apiData.stage,
      estimatedAmount: parseFloat(apiData.estimatedAmount || apiData.estimated_amount || '0'),
      probability: apiData.probability,
      expectedCloseDate: apiData.expectedCloseDate || apiData.expected_close_date,
      source: apiData.source,
      description: apiData.description,
      assignedTo: apiData.assignedTo || apiData.assigned_to,
      createdAt: apiData.createdAt || apiData.created_at,
      updatedAt: apiData.updatedAt || apiData.updated_at,
      closedAt: apiData.closedAt || apiData.closed_at,
      lossReason: apiData.lossReason || apiData.loss_reason,
      lossDescription: apiData.lossDescription || apiData.loss_description,
      // ✅ CORRECTION : Récupérer les devis depuis l'API
      quoteIds: apiData.quoteIds || apiData.quote_ids || [],
      quotes: apiData.quotes || [], // Nouvelles données détaillées
      quotes_count: apiData.quotes_count || 0,
    };
  };

  // 🚀 Transformation des statistiques API → Frontend
  private transformStats = (apiData: any): OpportunityStats => {
    console.log('🔧 Transformation des stats API vers Frontend:', apiData);
    
    if (apiData.byStage) {
      console.log('✅ Données déjà au format frontend');
      return apiData; // Déjà au format frontend
    }
    
    // Transformation de la structure backend vers frontend
    const byStage: Record<string, number> = {};
    let wonAmount = 0;
    let lostAmount = 0;
    
    // Transformer by_stage du format backend vers frontend
    if (apiData.by_stage) {
      console.log('🔧 Transformation by_stage:', apiData.by_stage);
      Object.keys(apiData.by_stage).forEach(stage => {
        const stageData = apiData.by_stage[stage];
        
        // ✅ CORRECTION: Extraire le count depuis l'objet complexe
        if (typeof stageData === 'object' && stageData.count !== undefined) {
          byStage[stage] = stageData.count;
          
          // Calculer les montants spéciaux
          if (stage === 'won') {
            wonAmount = stageData.total_amount || 0;
          } else if (stage === 'lost') {
            lostAmount = stageData.total_amount || 0;
          }
        } else if (typeof stageData === 'number') {
          // Fallback si c'est juste un nombre
          byStage[stage] = stageData;
        } else {
          console.warn(`⚠️ Format inattendu pour ${stage}:`, stageData);
          byStage[stage] = 0;
        }
      });
    }
    
    const transformedStats = {
      total: apiData.total || 0,
      byStage: byStage as any, // Cast pour satisfaire TypeScript
      totalAmount: apiData.total_estimated_amount || 0,
      weightedAmount: apiData.weighted_pipeline || 0,
      wonAmount: wonAmount,
      lostAmount: lostAmount,
      conversionRate: apiData.conversion_rate || 0,
    };
    
    console.log('✅ Stats transformées:', transformedStats);
    return transformedStats;
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

    try {
      console.log('🔍 [API-ONLY] Récupération de toutes les opportunités...', filters);
      const apiData = await this.withMetrics(opportunitiesApi.getOpportunities, 'getOpportunities')(filters);
      const transformed = apiData.map(this.transformOpportunity);
      this.setCache(cacheKey, transformed, 'api');
      console.log(`✅ [API-ONLY] ${transformed.length} opportunités récupérées`);
      return transformed;
    } catch (error) {
      console.error('❌ [API-ONLY] Erreur lors de la récupération des opportunités:', error);
      throw new Error(`Impossible de récupérer les opportunités: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
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
        console.debug(`📦 Cache hit pour tier ${tierId}: ${cached.opportunities.length} opportunités`);
      }
      return cached;
    }

    let opportunities: Opportunity[] = [];
    let source: 'api' | 'mock' = 'api';

    try {
      console.log(`🔍 [API-ONLY] Récupération opportunités pour tier ${tierId}...`);
      
      // ✅ CORRECTION: Utiliser 'tier' au lieu de 'tierId' pour l'API Django
      const filters: OpportunityFilters = { tier: tierId };
      const apiData = await this.withMetrics(opportunitiesApi.getOpportunities, 'getOpportunitiesByTier')(filters);
      opportunities = apiData.map(this.transformOpportunity);
      source = 'api';
      
      if (this.config.enableMetrics) {
        console.info(`✅ API: ${opportunities.length} opportunités trouvées pour tier ${tierId}`);
      }
    } catch (error) {
      console.error(`❌ [API-ONLY] Erreur API pour tier ${tierId}:`, error);
      throw new Error(`Impossible de récupérer les opportunités: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
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
        console.debug(`📊 Métriques tier ${tierId}:`, metrics);
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

    try {
      console.log(`🔍 [API-ONLY] Récupération opportunité ${id}...`);
      const apiData = await this.withMetrics(opportunitiesApi.getOpportunity, 'getOpportunity')(id);
      const transformed = this.transformOpportunity(apiData);
      this.setCache(cacheKey, transformed, 'api');
      console.log(`✅ [API-ONLY] Opportunité ${id} récupérée`);
      return transformed;
    } catch (error) {
      console.error(`❌ [API-ONLY] Erreur lors de la récupération de l'opportunité ${id}:`, error);
      throw new Error(`Opportunité ${id} introuvable: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async createOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
    console.log('🔧 [API-ONLY] === DÉBUT CRÉATION OPPORTUNITÉ ===');
    console.log('🔧 [API-ONLY] Données frontend reçues:', data);

    try {
      console.log('🚀 [API-ONLY] Création via API...');
      
      const apiData = this.transformToAPI(data);
      console.log('🔧 [API-ONLY] Données transformées pour API:', apiData);
      
      // Validation rapide des champs obligatoires
      const validationErrors = [];
      if (!apiData.tier) {
        validationErrors.push(`❌ Champ tier manquant! (tierId: ${data.tierId})`);
      }
      if (!apiData.name) {
        validationErrors.push(`❌ Champ name manquant! (name: ${data.name})`);
      }
      if (apiData.estimated_amount === undefined || apiData.estimated_amount === null) {
        validationErrors.push(`❌ Champ estimated_amount manquant! (estimatedAmount: ${data.estimatedAmount})`);
      }
      if (!apiData.expected_close_date) {
        validationErrors.push(`❌ Champ expected_close_date manquant! (expectedCloseDate: ${data.expectedCloseDate})`);
      }
      
      if (validationErrors.length > 0) {
        console.error('❌ [API-ONLY] Erreurs de validation:', validationErrors);
        throw new Error(`Données invalides: ${validationErrors.join(', ')}`);
      }
      
      console.log('✅ [API-ONLY] Validation des champs obligatoires passée');
      
      console.log('📡 [API-ONLY] Envoi vers API...');
      const result = await this.withMetrics(opportunitiesApi.createOpportunity, 'createOpportunity')(apiData);
      console.log('✅ [API-ONLY] Réponse API reçue:', result);
      
      const transformed = this.transformOpportunity(result);
      console.log('✅ [API-ONLY] Données transformées vers frontend:', transformed);
      
      // Invalider le cache des listes
      this.cache.forEach((_, key) => {
        if (key.startsWith('opportunities_') || key.startsWith('tier_opportunities_')) {
          this.cache.delete(key);
        }
      });
      
      console.log('🎉 [API-ONLY] Opportunité créée avec succès via API !');
      return transformed;
    } catch (error) {
      console.error('❌ [API-ONLY] Erreur détaillée API:', {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        config: error?.config
      });
      
      throw new Error(`Impossible de créer l'opportunité: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async updateOpportunity(id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    try {
      console.log(`🔍 [API-ONLY] Mise à jour opportunité ${id}...`, data);
      const apiData = this.transformToAPI(data);
      const result = await this.withMetrics(opportunitiesApi.updateOpportunity, 'updateOpportunity')(id, apiData);
      const transformed = this.transformOpportunity(result);
      
      // Mettre à jour le cache
      this.setCache(`opportunity_${id}`, transformed, 'api');
      console.log(`✅ [API-ONLY] Opportunité ${id} mise à jour`);
      
      // ✅ SYNCHRONISATION AUTOMATIQUE : Notifier les changements
      syncService.notifyOpportunityUpdated(id, transformed, transformed.quoteIds);
      
      return transformed;
    } catch (error) {
      console.error(`❌ [API-ONLY] Erreur lors de la mise à jour de l'opportunité ${id}:`, error);
      throw new Error(`Impossible de mettre à jour l'opportunité: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async deleteOpportunity(id: string): Promise<boolean> {
    try {
      console.log(`🔍 [API-ONLY] Suppression opportunité ${id}...`);
      await this.withMetrics(opportunitiesApi.deleteOpportunity, 'deleteOpportunity')(id);
      
      // Nettoyer le cache
      this.cache.delete(`opportunity_${id}`);
      this.cache.forEach((_, key) => {
        if (key.startsWith('opportunities_') || key.startsWith('tier_opportunities_')) {
          this.cache.delete(key);
        }
      });
      
      console.log(`✅ [API-ONLY] Opportunité ${id} supprimée`);
      return true;
    } catch (error) {
      console.error(`❌ [API-ONLY] Erreur lors de la suppression de l'opportunité ${id}:`, error);
      throw new Error(`Impossible de supprimer l'opportunité: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async updateStage(id: string, stage: string): Promise<Opportunity> {
    try {
      console.log(`🔍 [API-ONLY] Mise à jour étape opportunité ${id} vers ${stage}...`);
      const result = await this.withMetrics(opportunitiesApi.updateOpportunityStage, 'updateStage')(id, stage);
      const transformed = this.transformOpportunity(result);
      this.setCache(`opportunity_${id}`, transformed, 'api');
      console.log(`✅ [API-ONLY] Étape opportunité ${id} mise à jour vers ${stage}`);
      return transformed;
    } catch (error) {
      console.error(`❌ [API-ONLY] Erreur lors de la mise à jour de l'étape pour l'opportunité ${id}:`, error);
      
      // Préserver l'erreur originale pour les validations métier
      if (error?.response?.status === 400) {
        console.log('🔍 Erreur de validation métier détectée, transmission de l\'erreur originale');
        throw error; // Transmettre l'erreur axios originale avec response.data
      }
      
      // Pour les autres erreurs, transformer en erreur générique
      throw new Error(`Impossible de mettre à jour l'étape: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async markAsWon(id: string, data?: { project_id?: string }): Promise<Opportunity> {
    try {
      console.log(`🔍 [API-ONLY] Marquage opportunité ${id} comme gagnée...`);
      const result = await this.withMetrics(opportunitiesApi.markAsWon, 'markAsWon')(id, data);
      const transformed = this.transformOpportunity(result);
      this.setCache(`opportunity_${id}`, transformed, 'api');
      console.log(`✅ [API-ONLY] Opportunité ${id} marquée comme gagnée`);
      
      // ✅ SYNCHRONISATION AUTOMATIQUE : Notifier les changements
      syncService.notifyOpportunityUpdated(id, transformed, transformed.quoteIds);
      
      return transformed;
    } catch (error) {
      console.error(`❌ [API-ONLY] Erreur lors du marquage de l'opportunité ${id} comme gagnée:`, error);
      throw new Error(`Impossible de marquer l'opportunité comme gagnée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async markAsLost(id: string, data: { loss_reason: string; loss_description?: string }): Promise<Opportunity> {
    try {
      console.log(`🔍 [API-ONLY] Marquage opportunité ${id} comme perdue...`);
      const result = await this.withMetrics(opportunitiesApi.markAsLost, 'markAsLost')(id, data);
      const transformed = this.transformOpportunity(result);
      this.setCache(`opportunity_${id}`, transformed, 'api');
      console.log(`✅ [API-ONLY] Opportunité ${id} marquée comme perdue`);
      
      // ✅ SYNCHRONISATION AUTOMATIQUE : Notifier les changements
      syncService.notifyOpportunityUpdated(id, transformed, transformed.quoteIds);
      
      return transformed;
    } catch (error) {
      console.error(`❌ [API-ONLY] Erreur lors du marquage de l'opportunité ${id} comme perdue:`, error);
      throw new Error(`Impossible de marquer l'opportunité comme perdue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async createQuote(id: string, data?: { title?: string; description?: string }): Promise<{ quote_id: string; quote: any }> {
    try {
      console.log(`🔍 [API-ONLY] Création devis depuis opportunité ${id}...`);
      const result = await this.withMetrics(opportunitiesApi.createQuoteFromOpportunity, 'createQuote')(id, data);
      console.log(`✅ [API-ONLY] Devis créé depuis opportunité ${id}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ [API-ONLY] Erreur lors de la création de devis depuis l'opportunité ${id}:`, error);
      
      // Préserver l'erreur originale pour les validations métier
      if (error?.response?.status === 400) {
        console.log('🔍 Erreur de validation métier détectée, transmission de l\'erreur originale');
        throw error; // Transmettre l'erreur axios originale avec response.data
      }
      
      // Pour les autres erreurs, transformer en erreur générique
      throw new Error(`Impossible de créer le devis: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async getStats(): Promise<OpportunityStats> {
    const cacheKey = 'opportunity_stats';
    const cached = this.getCached<OpportunityStats>(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔍 [API-ONLY] Récupération des statistiques...');
      const apiData = await this.withMetrics(opportunitiesApi.getOpportunityStats, 'getStats')();
      const transformed = this.transformStats(apiData);
      this.setCache(cacheKey, transformed, 'api');
      console.log('✅ [API-ONLY] Statistiques récupérées:', transformed);
      return transformed;
    } catch (error) {
      console.error('❌ [API-ONLY] Erreur lors de la récupération des statistiques:', error);
      throw new Error(`Impossible de récupérer les statistiques: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // 🚀 Méthodes de gestion et monitoring

  enableAPI(enabled: boolean = true): void {
    this.config.useAPI = enabled;
    if (enabled) {
      console.info('🚀 API mode enabled');
    } else {
      console.info('🔧 Mock mode enabled');
    }
  }

  getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  clearCache(): void {
    this.cache.clear();
    console.info('🗑️ Cache cleared');
  }

  getConfig(): ServiceConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...updates };
    console.info('⚙️ Config updated:', updates);
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
          environment: process.env.NODE_ENV || 'development',
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