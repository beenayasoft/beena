import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TierForm } from "./TierForm";
import { Tier, TierFormValues, EntityType } from "./types";
import { useState, useMemo } from "react";
import { tiersApi } from "@/lib/api/tiers";
import { transformTierToFormValues, transformFormValuesToTier } from "./utils/transformations";

interface TierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  tier?: Tier;
  isEditing?: boolean;
}

export function TierDialog({
  open,
  onOpenChange,
  onSuccess,
  tier,
  isEditing = false,
}: TierDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Déterminer le type d'entité depuis le tier existant ou par défaut
  const entityType: EntityType = useMemo(() => {
    if (tier && isEditing) {
      // Pour l'édition, déterminer le type selon certains critères
      // Par exemple, présence d'un SIRET => entreprise
      return tier.siret && tier.siret.trim().length > 0 ? "entreprise" : "particulier";
    }
    // Pour création, par défaut entreprise (mais ce dialogue devrait rarement être utilisé pour création)
    return "entreprise";
  }, [tier, isEditing]);

  // Transformer les données du tier vers le format formulaire
  const initialFormValues = useMemo(() => {
    if (tier && isEditing) {
      return transformTierToFormValues(tier, entityType);
    }
    return undefined;
  }, [tier, isEditing, entityType]);

  const handleSubmit = async (values: TierFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("TierDialog: Submitting values:", values);
      
      // Transformer les données du formulaire vers le format Tier
      const tierData = transformFormValuesToTier(values, entityType);
      
      if (isEditing && tier?.id) {
        // Mise à jour
        await tiersApi.updateTier(tier.id, tierData);
        console.log("TierDialog: Tier updated successfully");
      } else {
        // Création (rare dans ce contexte)
        await tiersApi.createTier(tierData);
        console.log("TierDialog: Tier created successfully");
      }
      
      // Fermer le dialogue et notifier le succès
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("TierDialog: Error:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : `Une erreur est survenue lors de la ${isEditing ? 'modification' : 'création'} du tier`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      setError(null);
      onOpenChange(false);
    }
  };

  // Titre et description dynamiques
  const getTitle = () => {
    if (isEditing) {
      return entityType === "entreprise" ? "🏢 Modifier l'entreprise" : "👤 Modifier le particulier";
    } else {
      return entityType === "entreprise" ? "🏢 Nouvelle entreprise" : "👤 Nouveau particulier";
    }
  };

  const getDescription = () => {
    if (isEditing) {
      return `Modifiez les informations de ${entityType === "entreprise" ? "l'entreprise" : "ce particulier"}.`;
    } else {
      return `Créez ${entityType === "entreprise" ? "une nouvelle entreprise" : "un nouveau particulier"}.`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        
        <TierForm
          key={isEditing ? `edit-${tier?.id}-${entityType}` : `new-${entityType}`}
          entityType={entityType}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialValues={initialFormValues}
          isEditing={isEditing}
          loading={loading}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
} 