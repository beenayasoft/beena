import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TierForm } from "./TierForm";
import { Tier, TierFormValues } from "./types";

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
  // Préparer les valeurs initiales si on édite un tiers existant
  const initialValues = tier
    ? {
        name: tier.name,
        types: tier.type,
        contact: tier.contact,
        email: tier.email,
        phone: tier.phone,
        address: tier.address,
        siret: tier.siret,
        status: tier.status as "active" | "inactive",
      }
    : undefined;

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
        <TierForm
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          initialValues={initialValues}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
} 