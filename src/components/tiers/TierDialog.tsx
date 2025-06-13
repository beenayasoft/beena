import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { TierForm } from "./TierForm";
import { Tier, TierFormValues } from "./types";
import { useEffect, useState } from "react";

interface TierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TierFormValues) => void;
  tier?: Tier;
  isEditing?: boolean;
}

export function TierDialog({
  open,
  onOpenChange,
  onSubmit,
  tier,
  isEditing = false,
}: TierDialogProps) {
  // État local pour stocker les valeurs initiales
  const [initialFormValues, setInitialFormValues] = useState<TierFormValues | undefined>(undefined);
  
  // Mettre à jour les valeurs initiales lorsque le tier change
  useEffect(() => {
    console.log("TierDialog useEffect - tier changed:", tier);
    
    if (tier && isEditing) {
      const values = {
        name: tier.name,
        types: tier.type,
        contact: tier.contact,
        email: tier.email,
        phone: tier.phone,
        address: tier.address,
        siret: tier.siret,
        status: tier.status as "active" | "inactive",
      };
      console.log("Setting initial form values:", values);
      setInitialFormValues(values);
    } else {
      // Réinitialiser les valeurs pour un nouveau tier
      setInitialFormValues(undefined);
    }
  }, [tier, isEditing]);

  const handleSubmit = (values: TierFormValues) => {
    onSubmit(values);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Utiliser un portail personnalisé pour éviter les problèmes d'accessibilité
  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] benaya-glass">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Modifier un tiers" : "Ajouter un nouveau tiers"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du tiers ci-dessous."
              : "Remplissez les informations du tiers ci-dessous."}
          </DialogDescription>
        </DialogHeader>
        {/* Utiliser une clé unique pour forcer la reconstruction du formulaire */}
        <TierForm
          key={isEditing ? `edit-${tier?.id}` : 'new'}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialValues={initialFormValues}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
} 