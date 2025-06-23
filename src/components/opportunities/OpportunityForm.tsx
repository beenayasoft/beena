import { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import { Opportunity, OpportunityStatus, OpportunitySource } from "@/lib/types/opportunity";
import { initialTiers } from "@/lib/mock/tiers";
import { formatCurrency } from "@/lib/utils";

interface OpportunityFormProps {
  opportunity?: Partial<Opportunity>;
  onSubmit: (values: Partial<Opportunity>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function OpportunityForm({
  opportunity,
  onSubmit,
  onCancel,
  isEditing = false,
}: OpportunityFormProps) {
  const [formData, setFormData] = useState<Partial<Opportunity>>(
    opportunity || {
      name: "",
      tierId: "",
      tierName: "",
      tierType: [],
      stage: "new",
      estimatedAmount: 0,
      probability: 20,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      source: "website",
      description: "",
      assignedTo: "",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mettre à jour le formulaire si l'opportunité change
  useEffect(() => {
    if (opportunity) {
      setFormData(opportunity);
    }
  }, [opportunity]);

  // Gérer les changements de champs
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Gérer le changement de client/prospect
  const handleTierChange = (tierId: string) => {
    const selectedTier = initialTiers.find((tier) => tier.id === tierId);
    if (selectedTier) {
      setFormData((prev) => ({
        ...prev,
        tierId,
        tierName: selectedTier.name,
        tierType: selectedTier.type,
      }));
      
      // Effacer l'erreur pour ce champ
      if (errors.tierId) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.tierId;
          return newErrors;
        });
      }
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = "Le nom est requis";
    }
    
    if (!formData.tierId) {
      newErrors.tierId = "Le client/prospect est requis";
    }
    
    if (!formData.stage) {
      newErrors.stage = "Le statut est requis";
    }
    
    if (!formData.estimatedAmount && formData.estimatedAmount !== 0) {
      newErrors.estimatedAmount = "Le montant estimé est requis";
    } else if (formData.estimatedAmount < 0) {
      newErrors.estimatedAmount = "Le montant estimé doit être positif";
    }
    
    if (!formData.probability && formData.probability !== 0) {
      newErrors.probability = "La probabilité est requise";
    } else if (formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = "La probabilité doit être entre 0 et 100";
    }
    
    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = "La date de clôture prévue est requise";
    }
    
    if (!formData.source) {
      newErrors.source = "La source est requise";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informations de base</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
              Nom de l'opportunité <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`benaya-input ${errors.name ? "border-red-500" : ""}`}
              placeholder="Ex: Rénovation Villa Dupont"
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.name}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tierId" className={errors.tierId ? "text-red-500" : ""}>
              Client/Prospect <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.tierId}
              onValueChange={handleTierChange}
            >
              <SelectTrigger className={`benaya-input ${errors.tierId ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Sélectionner un client/prospect" />
              </SelectTrigger>
              <SelectContent>
                {initialTiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id}>
                    {tier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tierId && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.tierId}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="benaya-input resize-none"
            placeholder="Description du projet"
            rows={3}
          />
        </div>
      </div>

      {/* Détails de l'opportunité */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Détails de l'opportunité</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stage" className={errors.stage ? "text-red-500" : ""}>
              Étape <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.stage}
              onValueChange={(value) => handleInputChange("stage", value)}
            >
              <SelectTrigger className={`benaya-input ${errors.stage ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Sélectionner une étape" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Nouvelle</SelectItem>
                <SelectItem value="needs_analysis">Analyse des besoins</SelectItem>
                <SelectItem value="negotiation">Négociation</SelectItem>
                <SelectItem value="won">Gagnée</SelectItem>
                <SelectItem value="lost">Perdue</SelectItem>
              </SelectContent>
            </Select>
            {errors.stage && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.stage}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="source" className={errors.source ? "text-red-500" : ""}>
              Source <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.source}
              onValueChange={(value) => handleInputChange("source", value as OpportunitySource)}
            >
              <SelectTrigger className={`benaya-input ${errors.source ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Sélectionner une source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Site web</SelectItem>
                <SelectItem value="referral">Recommandation</SelectItem>
                <SelectItem value="cold_call">Démarchage téléphonique</SelectItem>
                <SelectItem value="exhibition">Salon/Exposition</SelectItem>
                <SelectItem value="partner">Partenaire</SelectItem>
                <SelectItem value="social_media">Réseaux sociaux</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            {errors.source && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.source}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignedTo">
              Responsable
            </Label>
            <Select
              value={formData.assignedTo || ""}
              onValueChange={(value) => handleInputChange("assignedTo", value)}
            >
              <SelectTrigger className="benaya-input">
                <SelectValue placeholder="Sélectionner un responsable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jean Martin">Jean Martin</SelectItem>
                <SelectItem value="Sophie Dubois">Sophie Dubois</SelectItem>
                <SelectItem value="Ahmed Benali">Ahmed Benali</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estimatedAmount" className={errors.estimatedAmount ? "text-red-500" : ""}>
              Montant estimé (MAD) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="estimatedAmount"
              type="number"
              min="0"
              step="1000"
              value={formData.estimatedAmount || ""}
              onChange={(e) => handleInputChange("estimatedAmount", parseFloat(e.target.value))}
              className={`benaya-input ${errors.estimatedAmount ? "border-red-500" : ""}`}
              placeholder="0"
            />
            {errors.estimatedAmount && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.estimatedAmount}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="probability" className={errors.probability ? "text-red-500" : ""}>
              Probabilité (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="probability"
              type="number"
              min="0"
              max="100"
              value={formData.probability || ""}
              onChange={(e) => handleInputChange("probability", parseFloat(e.target.value))}
              className={`benaya-input ${errors.probability ? "border-red-500" : ""}`}
              placeholder="20"
            />
            {errors.probability && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.probability}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expectedCloseDate" className={errors.expectedCloseDate ? "text-red-500" : ""}>
              Date de clôture prévue <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expectedCloseDate"
              type="date"
              value={formData.expectedCloseDate || ""}
              onChange={(e) => handleInputChange("expectedCloseDate", e.target.value)}
              className={`benaya-input ${errors.expectedCloseDate ? "border-red-500" : ""}`}
            />
            {errors.expectedCloseDate && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.expectedCloseDate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Raison de perte (si applicable) */}
      {formData.stage === 'lost' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Raison de la perte</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lossReason" className={errors.lossReason ? "text-red-500" : ""}>
                Raison <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.lossReason || ""}
                onValueChange={(value) => handleInputChange("lossReason", value)}
              >
                <SelectTrigger className={`benaya-input ${errors.lossReason ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Sélectionner une raison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Prix trop élevé</SelectItem>
                  <SelectItem value="competitor">Concurrent choisi</SelectItem>
                  <SelectItem value="timing">Mauvais timing</SelectItem>
                  <SelectItem value="no_budget">Pas de budget</SelectItem>
                  <SelectItem value="no_need">Pas de besoin réel</SelectItem>
                  <SelectItem value="no_decision">Pas de décision prise</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
              {errors.lossReason && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.lossReason}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lossDescription">
                Description
              </Label>
              <Textarea
                id="lossDescription"
                value={formData.lossDescription || ""}
                onChange={(e) => handleInputChange("lossDescription", e.target.value)}
                className="benaya-input resize-none"
                placeholder="Détails sur la raison de la perte"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Montant pondéré */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-neutral-700 dark:text-neutral-300">Montant pondéré:</span>
          <span className="font-semibold text-lg">
            {formatCurrency((formData.estimatedAmount || 0) * (formData.probability || 0) / 100)} MAD
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Le montant pondéré est calculé en multipliant le montant estimé par la probabilité de succès.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="benaya-button-primary">
          <Check className="mr-2 h-4 w-4" />
          {isEditing ? "Mettre à jour" : "Créer l'opportunité"}
        </Button>
      </DialogFooter>
    </form>
  );
}