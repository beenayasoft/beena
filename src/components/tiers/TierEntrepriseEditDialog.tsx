import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntrepriseForm } from "./EntrepriseForm";
import { EntrepriseFormValues } from "./types/entreprise";
import { useState, useEffect } from "react";
import { tiersApi } from "@/lib/api/tiers";
import { transformEntrepriseToTier, validateBeforeTransform } from "./utils/adaptateurs";
import { Tier } from "./types";

interface TierEntrepriseEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  tier: Tier; // Tier existant à éditer
}

export function TierEntrepriseEditDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  tier
}: TierEntrepriseEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<EntrepriseFormValues | undefined>(undefined);

  // Préparer les valeurs initiales depuis les données du tier
  useEffect(() => {
    if (tier && open) {
      console.log("TierEntrepriseEditDialog: Préparation des valeurs initiales pour:", tier);
      
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
          console.log("TierEntrepriseEditDialog: Données complètes reçues:", data);
          
          // Extraire les contacts et adresses de la structure onglets si nécessaire
          let contacts = data.contacts || [];
          let adresses = data.adresses || [];
          
          // Si les données sont dans la structure 'onglets', les extraire
          if (data.onglets) {
            console.log("Structure avec onglets détectée, extraction des données...");
            if (data.onglets.contacts) {
              contacts = data.onglets.contacts;
            }
            if (data.onglets.infos && data.onglets.infos.adresses) {
              adresses = data.onglets.infos.adresses;
            }
          }
          
          console.log("Contacts extraits:", contacts);
          console.log("Adresses extraites:", adresses);
          
          // Transformer les données en format EntrepriseFormValues
          const formValues: EntrepriseFormValues = {
            raisonSociale: data.nom || '',
            formeJuridique: '', // Non disponible dans l'API actuelle
            siret: data.siret || '',
            numeroTVA: data.tva || '',

            flags: data.flags || [],
            status: data.is_deleted ? 'inactive' : 'active',
            
            // Transformer les contacts
            contacts: contacts.map((contact: any) => ({
              id: contact.id,
              prenom: contact.prenom || '',
              nom: contact.nom || '',
              fonction: contact.fonction || '',
              email: contact.email || '',
              telephone: contact.telephone || '',
              contactPrincipalDevis: contact.contact_principal_devis || false,
              contactPrincipalFacture: contact.contact_principal_facture || false,
            })),
            
            // Transformer les adresses
            adresses: adresses.map((adresse: any) => ({
              id: adresse.id,
              libelle: adresse.libelle || '',
              rue: adresse.rue || '',
              ville: adresse.ville || '',
              codePostal: adresse.code_postal || '',
              pays: adresse.pays || 'France',
              facturation: adresse.facturation || false,
            })),
          };
          
          console.log("TierEntrepriseEditDialog: Valeurs transformées:", formValues);
          setInitialValues(formValues);
        } catch (err) {
          console.error("TierEntrepriseEditDialog: Erreur lors du chargement des données:", err);
          setError("Erreur lors du chargement des données de l'entreprise");
        }
      };
      
      fetchCompleteData();
    }
  }, [tier, open]);

  const handleSubmit = async (values: EntrepriseFormValues) => {
    console.log("TierEntrepriseEditDialog: Modification entreprise avec valeurs:", values);
    
    // Validation avant transformation
    const validation = validateBeforeTransform(values, 'entreprise');
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Transformer les données du formulaire vers le format Tier
      const tierData = transformEntrepriseToTier(values, tier.id);
      
      // Mettre à jour le tier via l'API
      await tiersApi.updateTier(tier.id, tierData);
      console.log("TierEntrepriseEditDialog: Entreprise modifiée avec succès");
      
      // Fermer le dialogue et notifier le succès
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("TierEntrepriseEditDialog: Erreur lors de la modification:", err);
      
      let errorMessage = "Une erreur est survenue lors de la modification de l'entreprise";
      if (err instanceof Error) {
        if (err.message.includes('SIRET')) {
          errorMessage = "Erreur avec le numéro SIRET. Vérifiez qu'il soit valide et unique.";
        } else if (err.message.includes('raison sociale')) {
          errorMessage = "Cette raison sociale existe déjà. Choisissez un nom différent.";
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
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            🏢 Modifier l'entreprise
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'entreprise "{tier.name}"
          </DialogDescription>
        </DialogHeader>
        
        {initialValues ? (
          <EntrepriseForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            error={error}
            initialValues={initialValues}
            isEditing={true}
          />
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Chargement des données...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 