import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  TierFormValues, 
  tierFormSchema, 
  EntityType,
  getVisibleFieldsByType,
  validateFormDataConsistency
} from "../types";
import {
  TierFormError,
  createFormError,
  ERROR_CODES
} from "../types/errors";
import { 
  transformTierToFormValues,
  transformFormValuesToTier 
} from "../utils/transformations";

interface UseTierFormOptions {
  entityType: EntityType;
  initialValues?: Partial<TierFormValues>;
  onSubmit?: (values: TierFormValues) => void | Promise<void>;
  onCancel?: () => void;
}

interface UseTierFormReturn {
  // React Hook Form
  form: ReturnType<typeof useForm<TierFormValues>>;
  
  // État du formulaire
  isSubmitting: boolean;
  error: TierFormError | null;
  isDirty: boolean;
  isValid: boolean;
  
  // Configuration selon le type d'entité
  visibleFields: string[];
  entityType: EntityType;
  
  // Actions
  handleSubmit: (values: TierFormValues) => void;
  handleCancel: () => void;
  clearError: () => void;
  resetForm: () => void;
  
  // Validation
  validateField: (fieldName: keyof TierFormValues, value: any) => string | undefined;
  validateForm: () => { isValid: boolean; errors: string[] };
}

/**
 * Hook personnalisé pour gérer les formulaires de tiers
 */
export const useTierForm = ({
  entityType,
  initialValues,
  onSubmit,
  onCancel,
}: UseTierFormOptions): UseTierFormReturn => {
  
  // États locaux
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<TierFormError | null>(null);
  
  // Configuration des champs visibles selon le type d'entité
  const visibleFields = useMemo(() => getVisibleFieldsByType(entityType), [entityType]);
  
  // Valeurs par défaut du formulaire selon le type d'entité
  const defaultValues = useMemo((): TierFormValues => ({
    name: "",
    types: [],
    entityType,
    contactPrenom: "",
    contactNom: "",
    email: "",
    phone: "",
    fonction: "",
    adresseRue: "",
    adresseCodePostal: "",
    adresseVille: "",
    pays: "France",
    siret: "",
    status: "active",
    contact: "",
    address: "",
  }), [entityType]);
  
  // Initialisation du formulaire avec React Hook Form
  const form = useForm<TierFormValues>({
    resolver: zodResolver(tierFormSchema),
    defaultValues,
    mode: "onBlur", // Validation au blur pour une meilleure UX
  });
  
  // Réinitialiser le formulaire avec les valeurs initiales
  const resetFormWithValues = useCallback((values?: Partial<TierFormValues>) => {
    const finalValues = values ? { ...defaultValues, ...values } : defaultValues;
    form.reset(finalValues);
    setError(null);
  }, [form, defaultValues]);
  
  // Initialiser avec les valeurs fournies
  useMemo(() => {
    if (initialValues) {
      resetFormWithValues(initialValues);
    }
  }, [initialValues, resetFormWithValues]);
  
  // Validation d'un champ spécifique
  const validateField = useCallback((
    fieldName: keyof TierFormValues, 
    value: any
  ): string | undefined => {
    // Validation spécifique selon le type d'entité
    if (entityType === 'entreprise' && fieldName === 'siret') {
      if (!value || value.trim().length === 0) {
        return ERROR_CODES.SIRET_REQUIRED;
      }
    }
    
    if (entityType === 'particulier' && fieldName === 'contactPrenom') {
      if (!value || value.trim().length === 0) {
        return ERROR_CODES.PRENOM_REQUIRED;
      }
    }
    
    // Validations communes
    switch (fieldName) {
      case 'name':
        if (!value || value.trim().length === 0) {
          return ERROR_CODES.NAME_REQUIRED;
        }
        break;
        
      case 'email':
        if (!value || value.trim().length === 0) {
          return ERROR_CODES.EMAIL_REQUIRED;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return ERROR_CODES.EMAIL_INVALID;
        }
        break;
        
      case 'phone':
        if (!value || value.trim().length === 0) {
          return ERROR_CODES.PHONE_REQUIRED;
        }
        if (!/^[0-9\s\-\+\(\)\.]{8,}$/.test(value.replace(/\s/g, ''))) {
          return ERROR_CODES.PHONE_INVALID;
        }
        break;
        
      case 'contactNom':
        if (!value || value.trim().length === 0) {
          return ERROR_CODES.NAME_REQUIRED;
        }
        break;
    }
    
    return undefined;
  }, [entityType]);
  
  // Validation complète du formulaire
  const validateForm = useCallback((): { isValid: boolean; errors: string[] } => {
    const values = form.getValues();
    return validateFormDataConsistency(values, entityType);
  }, [form, entityType]);
  
  // Gestion de la soumission
  const handleSubmit = useCallback(async (values: TierFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validation finale
      const validation = validateForm();
      if (!validation.isValid) {
        setError(createFormError(
          ERROR_CODES.VALIDATION_FAILED,
          undefined,
          validation.errors.join(', ')
        ));
        return;
      }
      
      // Appeler le callback de soumission
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (err: any) {
      console.error("useTierForm: Error during submission", err);
      setError(createFormError(
        ERROR_CODES.UNKNOWN_ERROR,
        undefined,
        err.message || "Une erreur est survenue lors de la soumission"
      ));
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validateForm]);
  
  // Gestion de l'annulation
  const handleCancel = useCallback(() => {
    setError(null);
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);
  
  // Actions utilitaires
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const resetForm = useCallback(() => {
    resetFormWithValues();
  }, [resetFormWithValues]);
  
  // État dérivé
  const isDirty = form.formState.isDirty;
  const isValid = form.formState.isValid;
  
  return {
    // React Hook Form
    form,
    
    // État du formulaire
    isSubmitting,
    error,
    isDirty,
    isValid,
    
    // Configuration selon le type d'entité
    visibleFields,
    entityType,
    
    // Actions
    handleSubmit,
    handleCancel,
    clearError,
    resetForm,
    
    // Validation
    validateField,
    validateForm,
  };
};

/**
 * Hook pour créer un nouveau tiers
 */
export const useCreateTierForm = (
  entityType: EntityType,
  onSuccess?: (tier: any) => void,
  onCancel?: () => void
) => {
  return useTierForm({
    entityType,
    onSubmit: async (values) => {
      // Ici, l'appel API sera fait par le composant parent
      // Ce hook se contente de valider et formater les données
      const tierData = transformFormValuesToTier(values, entityType);
      onSuccess?.(tierData);
    },
    onCancel,
  });
};

/**
 * Hook pour éditer un tiers existant
 */
export const useEditTierForm = (
  tier: any,
  entityType: EntityType,
  onSuccess?: (tier: any) => void,
  onCancel?: () => void
) => {
  const initialValues = useMemo(() => {
    if (!tier) return undefined;
    return transformTierToFormValues(tier);
  }, [tier]);
  
  return useTierForm({
    entityType,
    initialValues,
    onSubmit: async (values) => {
      const tierData = transformFormValuesToTier(values, entityType, tier.id);
      onSuccess?.(tierData);
    },
    onCancel,
  });
}; 