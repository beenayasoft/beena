// Types de base
export type { 
  Tier, 
  TierFormValues, 
  EntityType
} from './types';

// Données initiales
export { initialTiers } from './types';

// Types spécialisés
export * from './types/errors';

// Utilitaires sans conflits
export { 
  transformTierToFormValues,
  transformFormValuesToTier
} from './utils';

// Hooks
export * from './hooks/useTierForm';
export * from './useTierUtils';

// Composants formulaires
export * from './TierForm';
export { EntrepriseForm } from './EntrepriseForm';
export { ParticulierForm } from './ParticulierForm';

// Composants listes et affichage
export * from './TiersList';
export * from './TiersStats';
export * from './TiersSearch';
export * from './TiersTabs';

// Modales et dialogues
export * from './DeleteConfirmDialog';
export * from './TierCreateFlow';
export * from './TierCreationDialog';
export * from './TierEntrepriseDialog';
export * from './TierParticulierDialog';
export * from './TierEntrepriseEditDialog';
export * from './TierParticulierEditDialog';
export * from './ModalTypeSelector';

// Hooks additionnels
export * from './hooks'; 