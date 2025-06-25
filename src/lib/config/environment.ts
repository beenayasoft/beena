// Configuration intelligente d'environnement
export interface EnvironmentConfig {
  API_BASE_URL: string;
  ENABLE_API_MODE: boolean;
  ENABLE_FALLBACK: boolean;
  ENABLE_CACHE: boolean;
  CACHE_TIMEOUT: number;
  ENABLE_METRICS: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

// Configuration par défaut selon l'environnement
const configs: Record<string, EnvironmentConfig> = {
  development: {
    API_BASE_URL: 'http://localhost:8000/api',
    ENABLE_API_MODE: true,
    ENABLE_FALLBACK: true,
    ENABLE_CACHE: true,
    CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
    ENABLE_METRICS: true,
    LOG_LEVEL: 'debug',
  },
  
  production: {
    API_BASE_URL: import.meta.env.VITE_API_URL || 'https://api.votre-domaine.com/api',
    ENABLE_API_MODE: true,
    ENABLE_FALLBACK: true, // Garder le fallback même en prod pour la résilience
    ENABLE_CACHE: true,
    CACHE_TIMEOUT: 10 * 60 * 1000, // 10 minutes en prod
    ENABLE_METRICS: false, // Désactiver les métriques en prod pour les performances
    LOG_LEVEL: 'warn',
  },
  
  test: {
    API_BASE_URL: 'http://localhost:8000/api',
    ENABLE_API_MODE: false, // Utiliser les mocks pour les tests
    ENABLE_FALLBACK: true,
    ENABLE_CACHE: false, // Pas de cache en test
    CACHE_TIMEOUT: 0,
    ENABLE_METRICS: false,
    LOG_LEVEL: 'error',
  },
};

// Détection automatique de l'environnement
const detectEnvironment = (): string => {
  if (import.meta.env.MODE === 'test') return 'test';
  if (import.meta.env.PROD) return 'production';
  return 'development';
};

// Configuration active
export const ENV = detectEnvironment();
export const config = configs[ENV];

// Utilitaires
export const isProduction = () => ENV === 'production';
export const isDevelopment = () => ENV === 'development';
export const isTest = () => ENV === 'test';

// Logger intelligent selon l'environnement
export const logger = {
  debug: (...args: any[]) => {
    if (config.LOG_LEVEL === 'debug') {
      console.log('🔍 [DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (['debug', 'info'].includes(config.LOG_LEVEL)) {
      console.info('ℹ️ [INFO]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(config.LOG_LEVEL)) {
      console.warn('⚠️ [WARN]', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('❌ [ERROR]', ...args);
  },
};

// Configuration du service intelligent
export const getServiceConfig = () => ({
  useAPI: config.ENABLE_API_MODE,
  enableFallback: config.ENABLE_FALLBACK,
  enableMetrics: config.ENABLE_METRICS,
  cacheEnabled: config.ENABLE_CACHE,
  cacheTimeout: config.CACHE_TIMEOUT,
});

// Messages d'information sur l'environnement
if (isDevelopment()) {
  logger.info('🚀 Mode développement activé');
  logger.info('📡 API URL:', config.API_BASE_URL);
  logger.info('🔧 Fallback:', config.ENABLE_FALLBACK ? 'Activé' : 'Désactivé');
  logger.info('📦 Cache:', config.ENABLE_CACHE ? 'Activé' : 'Désactivé');
}

export default config; 