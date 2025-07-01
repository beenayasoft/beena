import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Building,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OpportunityForm } from "@/components/opportunities/OpportunityForm";
import { OpportunityLossForm } from "@/components/opportunities/OpportunityLossForm";
import { Opportunity, OpportunityStatus, LossReason } from "@/lib/types/opportunity";
import { opportunityService } from "@/lib/services/opportunityService";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { syncService, useSyncListener } from "@/lib/services/syncService";

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [lossFormOpen, setLossFormOpen] = useState(false);

  // ✅ NOUVELLE FONCTION : Rechargement de l'opportunité
  const reloadOpportunity = async () => {
    if (!id) return;

    try {
      console.log(`🔄 Rechargement de l'opportunité ${id}...`);
      const opportunityData = await opportunityService.getOpportunity(id);
      
      if (opportunityData) {
        setOpportunity(opportunityData);
        console.log(`✅ Opportunité ${id} rechargée avec succès:`, opportunityData);
      }
    } catch (err) {
      console.error(`❌ Erreur lors du rechargement de l'opportunité ${id}:`, err);
    }
  };

  // ✅ SYNCHRONISATION AUTOMATIQUE : Écouter tous les changements liés à cette opportunité
  useSyncListener('opportunity_updated', id || '', (event) => {
    console.log(`🔄 Synchronisation automatique opportunité ${id}:`, event);
    reloadOpportunity(); // Recharger silencieusement
    
    if (event.action === 'quote_sent') {
      toast({
        title: "Statut mis à jour",
        description: "L'opportunité est maintenant en négociation",
        duration: 3000
      });
    }
  }, [id, reloadOpportunity]);

  // ✅ ÉCOUTER LES CHANGEMENTS DE DEVIS ASSOCIÉS
  useSyncListener('quote_created', '*', (event) => {
    if (event.relatedEntityId === id) {
      console.log(`📄 Nouveau devis créé pour l'opportunité ${id}:`, event);
      reloadOpportunity(); // Recharger pour afficher le nouveau devis
      toast({
        title: "Nouveau devis",
        description: "Un devis a été créé pour cette opportunité",
        duration: 3000
      });
    }
  }, [id, reloadOpportunity]);

  useSyncListener('quote_status_changed', '*', (event) => {
    if (event.relatedEntityId === id) {
      console.log(`📄 Statut devis modifié pour l'opportunité ${id}:`, event);
      reloadOpportunity(); // Recharger pour afficher le nouveau statut
      
      const statusLabels = {
        'sent': 'envoyé',
        'accepted': 'accepté',
        'rejected': 'refusé',
        'cancelled': 'annulé'
      };
      
      const statusLabel = statusLabels[event.action as keyof typeof statusLabels] || event.action;
      toast({
        title: "Devis mis à jour",
        description: `Un devis associé a été ${statusLabel}`,
        duration: 3000
      });
    }
  }, [id, reloadOpportunity]);

  useSyncListener('quote_deleted', '*', (event) => {
    if (event.relatedEntityId === id) {
      console.log(`📄 Devis supprimé pour l'opportunité ${id}:`, event);
      reloadOpportunity(); // Recharger pour retirer le devis supprimé
      toast({
        title: "Devis supprimé",
        description: "Un devis associé a été supprimé",
        duration: 3000
      });
    }
  }, [id, reloadOpportunity]);

  // Charger les données de l'opportunité
  useEffect(() => {
    const loadOpportunity = async () => {
      if (!id) {
        setError("ID d'opportunité manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 Chargement de l'opportunité ${id}...`);
        const opportunityData = await opportunityService.getOpportunity(id);
        
        if (opportunityData) {
          setOpportunity(opportunityData);
          console.log(`✅ Opportunité ${id} chargée avec succès:`, opportunityData);
        } else {
          setError("Opportunité non trouvée");
        }
      } catch (err) {
        console.error(`❌ Erreur lors du chargement de l'opportunité ${id}:`, err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement de l'opportunité");
        
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les détails de l'opportunité. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadOpportunity();
  }, [id, toast]);

  // Formater une date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Obtenir le badge de statut
  const getStageBadge = (stage: OpportunityStatus) => {
    switch (stage) {
      case 'new':
        return <Badge className="benaya-badge-primary">Nouvelle</Badge>;
      case 'needs_analysis':
        return <Badge className="benaya-badge-primary">Analyse des besoins</Badge>;
      case 'negotiation':
        return <Badge className="benaya-badge-warning">Négociation</Badge>;
      case 'won':
        return <Badge className="benaya-badge-success">Gagnée</Badge>;
      case 'lost':
        return <Badge className="benaya-badge-error">Perdue</Badge>;
      default:
        return <Badge className="benaya-badge-neutral">—</Badge>;
    }
  };

  // Obtenir la couleur de probabilité
  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return "text-green-600 dark:text-green-400";
    if (probability >= 50) return "text-blue-600 dark:text-blue-400";
    if (probability >= 25) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  // Obtenir le libellé de la source
  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'website': return "Site web";
      case 'referral': return "Recommandation";
      case 'cold_call': return "Démarchage téléphonique";
      case 'exhibition': return "Salon/Exposition";
      case 'partner': return "Partenaire";
      case 'social_media': return "Réseaux sociaux";
      case 'other': return "Autre";
      default: return source;
    }
  };

  // Obtenir le libellé de la raison de perte
  const getLossReasonLabel = (reason?: string) => {
    if (!reason) return "";
    switch (reason) {
      case 'price': return "Prix trop élevé";
      case 'competitor': return "Concurrent choisi";
      case 'timing': return "Mauvais timing";
      case 'no_budget': return "Pas de budget";
      case 'no_need': return "Pas de besoin réel";
      case 'no_decision': return "Pas de décision prise";
      case 'other': return "Autre";
      default: return reason;
    }
  };

  // Gérer l'édition de l'opportunité
  const handleEdit = () => {
    setFormDialogOpen(true);
  };

  // Gérer la suppression de l'opportunité
  const handleDelete = async () => {
    if (!opportunity) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'opportunité "${opportunity.name}" ?`)) {
      try {
        console.log(`🗑️ Suppression de l'opportunité ${opportunity.id}...`);
        const success = await opportunityService.deleteOpportunity(opportunity.id);
        
        if (success) {
          toast({
            title: "Opportunité supprimée",
            description: "L'opportunité a été supprimée avec succès",
          });
          navigate("/opportunities");
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression de l'opportunité ${opportunity.id}:`, error);
        toast({
          title: "Erreur de suppression",
          description: error instanceof Error ? error.message : "Impossible de supprimer l'opportunité",
          variant: "destructive",
        });
      }
    }
  };

  // Gérer la création d'un devis
  const handleCreateQuote = async () => {
    if (!opportunity) return;
    
    try {
      console.log(`📄 Création d'un devis à partir de l'opportunité ${opportunity.id}...`);
      const result = await opportunityService.createQuote(opportunity.id, {
        title: `Devis pour ${opportunity.name}`,
        description: opportunity.description || "",
      });
      
      if (result && result.quote_id) {
        toast({
          title: "Devis créé",
          description: "Un nouveau devis a été créé à partir de cette opportunité",
        });
        console.log(`✅ Devis ${result.quote_id} créé avec succès`);
        
        // ✅ SYNCHRONISATION AUTOMATIQUE : Notifier la création du devis
        console.log(`🔄 Notification de création de devis pour l'opportunité ${opportunity.id}...`);
        syncService.notifyQuoteCreated(result.quote_id, opportunity.id, result.quote);
        
        // Rediriger vers l'édition du devis (la synchronisation se fera automatiquement)
        navigate(`/devis/edit/${result.quote_id}`);
      } else {
        throw new Error("Réponse invalide du serveur");
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la création du devis:`, error);
      
      // 🔍 LOG DE DEBUG - Voir le contenu exact de l'erreur
      console.log('🔍 DEBUG - error?.response?.status:', error?.response?.status);
      console.log('🔍 DEBUG - error?.response?.data:', error?.response?.data);
      console.log('🔍 DEBUG - error complet:', JSON.stringify(error, null, 2));
      
      // Gérer les erreurs de validation métier
      if (error?.response?.status === 400 && error?.response?.data) {
        const errorData = error.response.data;
        console.log('🔍 DEBUG - Structure complète errorData:', errorData);
        
        // 🔍 DEBUG SUPPLÉMENTAIRE - Voir le contenu du Array(1)
        if (errorData.description && Array.isArray(errorData.description)) {
          console.log('🔍 DEBUG - Contenu description array:', errorData.description);
          console.log('🔍 DEBUG - Premier élément:', errorData.description[0]);
        }
        
        // Gérer les erreurs de serializer Django (plusieurs formats possibles)
        let detailMessage, reasonMessage, suggestionMessage, allowedStages;
        
        if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          // Format d'erreur serializer Django global
          const firstError = errorData.non_field_errors[0];
          if (typeof firstError === 'object') {
            detailMessage = firstError.detail || "Impossible de créer le devis";
            reasonMessage = firstError.reason || "";
            suggestionMessage = firstError.suggestion || "";
            allowedStages = firstError.allowed_stages || [];
          } else {
            detailMessage = firstError || "Impossible de créer le devis";
            reasonMessage = "";
            suggestionMessage = "";
            allowedStages = [];
          }
        } else if (errorData.description && Array.isArray(errorData.description)) {
          // Format d'erreur serializer Django sur champ description
          const firstError = errorData.description[0];
          if (typeof firstError === 'object') {
            detailMessage = firstError.detail || "Impossible de créer le devis";
            reasonMessage = firstError.reason || "";
            suggestionMessage = firstError.suggestion || "";
            allowedStages = firstError.allowed_stages || [];
          } else {
            detailMessage = firstError || "Impossible de créer le devis";
            reasonMessage = "";
            suggestionMessage = "";
            allowedStages = [];
          }
        } else {
          // Format d'erreur view Django direct
          detailMessage = errorData.detail || "Impossible de créer le devis";
          reasonMessage = errorData.reason || "";
          suggestionMessage = errorData.suggestion || "";
          allowedStages = errorData.allowed_stages || [];
        }
        
        toast({
          title: "🚫 Création de devis impossible",
          description: (
            <div className="space-y-3">
              <p className="font-semibold text-sm">{detailMessage}</p>
              {reasonMessage && (
                <p className="text-sm">
                  <span className="font-medium">Raison :</span> {reasonMessage}
                </p>
              )}
              {suggestionMessage && (
                <p className="text-sm text-blue-600">
                  <span className="font-medium">💡 Suggestion :</span> {suggestionMessage}
                </p>
              )}
              {allowedStages.length > 0 && (
                <div className="text-xs bg-blue-50 p-2 rounded">
                  <span className="font-medium">Statuts autorisés :</span> {allowedStages.join(', ')}
                </div>
              )}
            </div>
          ),
          variant: "destructive",
          duration: 10000, // Plus long pour laisser le temps de lire
        });
      } else {
        // Erreur générique
        toast({
          title: "Erreur de création",
          description: error instanceof Error ? error.message : "Impossible de créer le devis",
          variant: "destructive",
        });
      }
    }
  };

  // Marquer comme gagnée
  const handleMarkAsWon = async () => {
    if (!opportunity) return;
    
    try {
      console.log(`🎉 Marquage de l'opportunité ${opportunity.id} comme gagnée...`);
      const updatedOpportunity = await opportunityService.markAsWon(opportunity.id);
      
      if (updatedOpportunity) {
        setOpportunity(updatedOpportunity);
        toast({
          title: "Opportunité gagnée",
          description: "L'opportunité a été marquée comme gagnée",
        });
        console.log(`✅ Opportunité ${opportunity.id} marquée comme gagnée`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors du marquage comme gagnée:`, error);
      toast({
        title: "Erreur de mise à jour",
        description: error instanceof Error ? error.message : "Impossible de marquer l'opportunité comme gagnée",
        variant: "destructive",
      });
    }
  };

  // Marquer comme perdue
  const handleMarkAsLost = () => {
    setLossFormOpen(true);
  };

  // Confirmer la perte
  const handleConfirmLoss = async (data: { lossReason: LossReason; lossDescription?: string }) => {
    if (!opportunity) return;
    
    try {
      console.log(`❌ Marquage de l'opportunité ${opportunity.id} comme perdue...`);
      const updatedOpportunity = await opportunityService.markAsLost(opportunity.id, {
        loss_reason: data.lossReason,
        loss_description: data.lossDescription,
      });
      
      if (updatedOpportunity) {
        setOpportunity(updatedOpportunity);
        setLossFormOpen(false);
        toast({
          title: "Opportunité perdue",
          description: "L'opportunité a été marquée comme perdue",
        });
        console.log(`✅ Opportunité ${opportunity.id} marquée comme perdue`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors du marquage comme perdue:`, error);
      toast({
        title: "Erreur de mise à jour",
        description: error instanceof Error ? error.message : "Impossible de marquer l'opportunité comme perdue",
        variant: "destructive",
      });
    }
  };

  // Gérer la soumission du formulaire
  const handleFormSubmit = async (formData: Partial<Opportunity>) => {
    if (!opportunity) return;
    
    try {
      console.log(`📝 Mise à jour de l'opportunité ${opportunity.id}...`);
      const updatedOpportunity = await opportunityService.updateOpportunity(opportunity.id, formData);
      
      if (updatedOpportunity) {
        setOpportunity(updatedOpportunity);
        setFormDialogOpen(false);
        toast({
          title: "Opportunité mise à jour",
          description: "Les informations de l'opportunité ont été mises à jour",
        });
        console.log(`✅ Opportunité ${opportunity.id} mise à jour avec succès`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de l'opportunité:`, error);
      toast({
        title: "Erreur de mise à jour",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour l'opportunité",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-benaya-600 mx-auto"></div>
          <p className="mt-4">Chargement de l'opportunité...</p>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">{error || "Opportunité non trouvée"}</h2>
          <Button onClick={() => navigate("/opportunities")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 hover:bg-white/20"
              onClick={() => navigate("/opportunities")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {opportunity.name}
                </h1>
                {getStageBadge(opportunity.stage)}
              </div>
              <p className="text-benaya-100 mt-1">
                Client: {opportunity.tierName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            
            {opportunity.stage !== 'won' && opportunity.stage !== 'lost' && (
              <Button 
                className="bg-white text-benaya-900 hover:bg-white/90"
                onClick={handleCreateQuote}
              >
                <FileText className="w-4 h-4 mr-2" />
                Créer un devis
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="benaya-card">
            <h3 className="font-medium text-lg mb-4">Informations générales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Nom</div>
                  <div className="font-medium text-lg">{opportunity.name}</div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Client/Prospect</div>
                  <div className="font-medium">{opportunity.tierName}</div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Responsable</div>
                  <div className="font-medium">{opportunity.assignedTo || "Non assigné"}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Statut</div>
                  <div className="font-medium">{getStageBadge(opportunity.stage)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Source</div>
                  <div className="font-medium">{getSourceLabel(opportunity.source)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Date de création</div>
                  <div className="font-medium">{formatDate(opportunity.createdAt)}</div>
                </div>
              </div>
            </div>
            
            {opportunity.description && (
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Description</div>
                <p className="whitespace-pre-line">{opportunity.description}</p>
              </div>
            )}
          </div>

          {/* Financial Information */}
          <div className="benaya-card">
            <h3 className="font-medium text-lg mb-4">Informations financières</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Montant estimé</div>
                <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
                  {formatCurrency(opportunity.estimatedAmount)} MAD
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Probabilité</div>
                <div className={`text-2xl font-bold ${getProbabilityColor(opportunity.probability)}`}>
                  {opportunity.probability}%
                </div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      opportunity.probability >= 75 ? "bg-green-500" :
                      opportunity.probability >= 50 ? "bg-blue-500" :
                      opportunity.probability >= 25 ? "bg-amber-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${opportunity.probability}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Montant pondéré</div>
                <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
                  {formatCurrency(opportunity.estimatedAmount * opportunity.probability / 100)} MAD
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Date de clôture prévue</div>
                  <div className="font-medium">{formatDate(opportunity.expectedCloseDate)}</div>
                </div>
                
                {opportunity.closedAt && (
                  <div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Date de clôture effective</div>
                    <div className="font-medium">{formatDate(opportunity.closedAt)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loss Information (if applicable) */}
          {opportunity.stage === 'lost' && opportunity.lossReason && (
            <div className="benaya-card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <h3 className="font-medium text-lg mb-4 text-red-800 dark:text-red-200">Informations sur la perte</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-red-700 dark:text-red-300">Raison de la perte</div>
                  <div className="font-medium text-red-800 dark:text-red-200">
                    {getLossReasonLabel(opportunity.lossReason)}
                  </div>
                </div>
                
                {opportunity.lossDescription && (
                  <div>
                    <div className="text-sm text-red-700 dark:text-red-300">Description</div>
                    <p className="text-red-800 dark:text-red-200 whitespace-pre-line">
                      {opportunity.lossDescription}
                    </p>
                  </div>
                )}
                
                <div>
                  <div className="text-sm text-red-700 dark:text-red-300">Date de perte</div>
                  <div className="font-medium text-red-800 dark:text-red-200">
                    {formatDate(opportunity.closedAt)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ AMÉLIORATION : Devis associés avec données réelles */}
          <div className="benaya-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                Devis associés
                {opportunity.quotes_count && opportunity.quotes_count > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {opportunity.quotes_count}
                  </Badge>
                )}
              </h3>
              
              {opportunity.stage !== 'won' && opportunity.stage !== 'lost' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCreateQuote}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un devis
                </Button>
              )}
            </div>
            
            {opportunity.quotes && opportunity.quotes.length > 0 ? (
              <div className="space-y-3">
                {opportunity.quotes.map((quote) => (
                  <div 
                    key={quote.id}
                    className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/devis/${quote.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-benaya-600" />
                        <div>
                          <span className="font-medium">{quote.number}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={
                                quote.status === 'draft' ? 'secondary' :
                                quote.status === 'sent' ? 'default' :
                                quote.status === 'accepted' ? 'default' :
                                quote.status === 'rejected' ? 'destructive' :
                                'secondary'
                              }
                              className={
                                quote.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-200' :
                                quote.status === 'sent' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                ''
                              }
                            >
                              {quote.status_display}
                            </Badge>
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              {formatCurrency(quote.total_ttc)} MAD
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {formatDate(quote.created_at)}
                        </div>
                        <Button variant="ghost" size="sm">
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <h4 className="font-medium mb-1">Aucun devis associé</h4>
                <p className="text-sm">
                  {opportunity.stage !== 'won' && opportunity.stage !== 'lost' 
                    ? "Créez un premier devis pour cette opportunité"
                    : "Aucun devis n'a été créé pour cette opportunité"
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Actions and Timeline */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="benaya-card">
            <h3 className="font-medium text-lg mb-4">Actions</h3>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleEdit}
              >
                <Edit className="w-4 h-4" />
                Modifier l'opportunité
              </Button>
              
              {opportunity.stage !== 'won' && opportunity.stage !== 'lost' && (
                <>
                  <Button 
                    className="w-full justify-start gap-2 benaya-button-primary"
                    onClick={handleCreateQuote}
                  >
                    <FileText className="w-4 h-4" />
                    Créer un devis
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                    onClick={handleMarkAsWon}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marquer comme gagnée
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                    onClick={handleMarkAsLost}
                  >
                    <XCircle className="w-4 h-4" />
                    Marquer comme perdue
                  </Button>
                </>
              )}
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </div>
          </div>

          {/* Project Information (if won) */}
          {opportunity.stage === 'won' && opportunity.projectId && (
            <div className="benaya-card border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <h3 className="font-medium text-lg mb-4 text-green-800 dark:text-green-200">Projet créé</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-green-700 dark:text-green-300">ID du projet</div>
                  <div className="font-medium text-green-800 dark:text-green-200">
                    {opportunity.projectId}
                  </div>
                </div>
                
                <Button 
                  className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => navigate(`/chantiers/${opportunity.projectId}`)}
                >
                  <Building className="w-4 h-4" />
                  Voir le projet
                </Button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="benaya-card">
            <h3 className="font-medium text-lg mb-4">Chronologie</h3>
            
            <div className="space-y-6">
              <div className="relative pl-6 pb-6 border-l-2 border-benaya-200 dark:border-benaya-800">
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-benaya-600"></div>
                <div className="space-y-1">
                  <div className="font-medium">Opportunité créée</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatDate(opportunity.createdAt)}
                  </div>
                </div>
              </div>
              
              {opportunity.stage === 'won' && opportunity.closedAt && (
                <div className="relative pl-6 pb-6 border-l-2 border-green-200 dark:border-green-800">
                  <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-green-600"></div>
                  <div className="space-y-1">
                    <div className="font-medium text-green-800 dark:text-green-200">Opportunité gagnée</div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      {formatDate(opportunity.closedAt)}
                    </div>
                  </div>
                </div>
              )}
              
              {opportunity.stage === 'lost' && opportunity.closedAt && (
                <div className="relative pl-6 pb-6 border-l-2 border-red-200 dark:border-red-800">
                  <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-red-600"></div>
                  <div className="space-y-1">
                    <div className="font-medium text-red-800 dark:text-red-200">Opportunité perdue</div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      {formatDate(opportunity.closedAt)}
                    </div>
                    {opportunity.lossReason && (
                      <div className="text-sm text-red-700 dark:text-red-300">
                        Raison: {getLossReasonLabel(opportunity.lossReason)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {opportunity.quoteIds && opportunity.quoteIds.length > 0 && (
                <div className="relative pl-6 pb-6 border-l-2 border-blue-200 dark:border-blue-800">
                  <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-600"></div>
                  <div className="space-y-1">
                    <div className="font-medium text-blue-800 dark:text-blue-200">Devis créé</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Devis #{opportunity.quoteIds[0]}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier l'opportunité</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'opportunité
            </DialogDescription>
          </DialogHeader>
          
          <OpportunityForm
            opportunity={opportunity}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormDialogOpen(false)}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>

      {/* Loss Reason Form Dialog */}
      <OpportunityLossForm
        open={lossFormOpen}
        onOpenChange={setLossFormOpen}
        onSubmit={handleConfirmLoss}
      />
    </div>
  );
}