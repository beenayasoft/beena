import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ParticulierForm } from "./ParticulierForm";
import { ParticulierFormValues } from "./types/particulier";
import { useState, useEffect } from "react";
import { tiersApi } from "@/lib/api/tiers";
import { transformParticulierToTier, validateBeforeTransform } from "./utils/adaptateurs";
import { Tier } from "./types";

interface TierParticulierEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  tier: Tier; // Tier existant à éditer
}

export function TierParticulierEditDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  tier
}: TierParticulierEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<ParticulierFormValues | undefined>(undefined);

  // Préparer les valeurs initiales depuis les données du tier
  useEffect(() => {
    if (tier && open) {
      console.log("TierParticulierEditDialog: Préparation des valeurs initiales pour:", tier);
      
      // Récupérer les données complètes depuis l'API pour avoir tous les contacts et adresses
      const fetchCompleteData = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/tiers/tiers/${tier.id}/vue_360/`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log("TierParticulierEditDialog: Données complètes reçues:", data);
          
          // Pour un particulier, le nom principal est dans le champ "nom"
          // Mais nous devons aussi récupérer le contact principal pour prenom/nom
          const contactPrincipal = data.contacts?.find((c: any) => c.contact_principal_devis) || data.contacts?.[0];
          
          // Transformer les données en format ParticulierFormValues
          const formValues: ParticulierFormValues = {
            nom: data.nom || '',
            prenom: contactPrincipal?.prenom || '',
            email: contactPrincipal?.email || '',
            telephone: contactPrincipal?.telephone || '',
            flags: data.flags || [],
            status: data.is_deleted ? 'inactive' : 'active',
            
            // Transformer les adresses
            adresses: (data.adresses || []).map((adresse: any) => ({
              id: adresse.id,
              libelle: adresse.libelle || '',
              rue: adresse.rue || '',
              ville: adresse.ville || '',
              codePostal: adresse.code_postal || '',
              pays: adresse.pays || 'France',
              facturation: adresse.facturation || false,
            })),
          };
          
          console.log("TierParticulierEditDialog: Valeurs transformées:", formValues);
          setInitialValues(formValues);
        } catch (err) {
          console.error("TierParticulierEditDialog: Erreur lors du chargement des données:", err);
          setError("Erreur lors du chargement des données du particulier");
        }
      };
      
      fetchCompleteData();
    }
  }, [tier, open]);

  const handleSubmit = async (values: ParticulierFormValues) => {
    console.log("TierParticulierEditDialog: Modification particulier avec valeurs:", values);
    
    // Validation avant transformation
    const validation = validateBeforeTransform(values, 'particulier');
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Transformer les données du formulaire vers le format Tier
      const tierData = transformParticulierToTier(values, tier.id);
      
      // Mettre à jour le tier via l'API
      await tiersApi.updateTier(tier.id, tierData);
      console.log("TierParticulierEditDialog: Particulier modifié avec succès");
      
      // Fermer le dialogue et notifier le succès
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("TierParticulierEditDialog: Erreur lors de la modification:", err);
      
      let errorMessage = "Une erreur est survenue lors de la modification du particulier";
      if (err instanceof Error) {
        if (err.message.includes('email')) {
          errorMessage = "Cette adresse email est déjà utilisée par un autre tiers.";
        } else if (err.message.includes('nom')) {
          errorMessage = "Ce nom est déjà utilisé. Vérifiez les informations saisies.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            👤 Modifier le particulier
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations du particulier "{tier.name}"
          </DialogDescription>
        </DialogHeader>
        
        {initialValues ? (
          <ParticulierForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            error={error}
            initialValues={initialValues}
            isEditing={true}
          />
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3">Chargement des données...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 