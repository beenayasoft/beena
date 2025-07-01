import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  SortAsc,
  FileText,
  CheckCircle,
  XCircle,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OpportunityStats } from "@/components/opportunities/OpportunityStats";
import { OpportunityFilters } from "@/components/opportunities/OpportunityFilters";
import { OpportunityKanbanColumn } from "@/components/opportunities/OpportunityKanbanColumn";
import { OpportunitySortableItem } from "@/components/opportunities/OpportunitySortableItem";
import { OpportunityForm } from "@/components/opportunities/OpportunityForm";
import { OpportunityLossForm } from "@/components/opportunities/OpportunityLossForm";
import { OpportunityList } from "@/components/opportunities/OpportunityList";
import { Opportunity, OpportunityStatus, LossReason } from "@/lib/types/opportunity";
// 🚀 MIGRATION: Import du service intelligent au lieu des mocks
import { opportunityService } from "@/lib/services/opportunityService";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay, closestCorners } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "@/hooks/use-toast";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";

// Définition des colonnes du Kanban
const kanbanColumns = [
  { id: "new", title: "Nouvelles", status: "new" as OpportunityStatus },
  { id: "needs_analysis", title: "Analyse des besoins", status: "needs_analysis" as OpportunityStatus },
  { id: "negotiation", title: "Négociation", status: "negotiation" as OpportunityStatus },
  { id: "won", title: "Gagnées", status: "won" as OpportunityStatus },
  { id: "lost", title: "Perdues", status: "lost" as OpportunityStatus },
];

export default function Opportunities() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    byStage: {} as Record<OpportunityStatus, number>,
    totalAmount: 0,
    weightedAmount: 0,
    wonAmount: 0,
    lostAmount: 0,
    conversionRate: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [lossFormOpen, setLossFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>(undefined);
  const [opportunityToLose, setOpportunityToLose] = useState<Opportunity | undefined>(undefined);
  
  // 🚀 État pour le type de vue (kanban ou liste)
  const [viewType, setViewType] = useState<'kanban' | 'list'>('kanban');
  
  // 🚀 Protection contre les double-clics et états incohérents
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Configuration des capteurs pour le drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 🚀 Fonctions de nettoyage d'état pour éviter les écrans figés
  const resetFormState = useCallback(() => {
    setFormDialogOpen(false);
    setEditingOpportunity(undefined);
    setIsSubmitting(false);
    console.log('🧹 État formulaire réinitialisé');
  }, []);

  const resetLossFormState = useCallback(() => {
    setLossFormOpen(false);
    setOpportunityToLose(undefined);
    setIsProcessing(false);
    console.log('🧹 État formulaire de perte réinitialisé');
  }, []);

  const cleanupStates = useCallback(() => {
    resetFormState();
    resetLossFormState();
    setActiveId(null);
    setIsSubmitting(false);
    setIsProcessing(false);
    console.log('🧹 Tous les états modaux nettoyés');
  }, [resetFormState, resetLossFormState]);

  // 🚀 MIGRATION: Charger les opportunités via le service intelligent
  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        console.log('📥 Chargement des opportunités...');
        const loadedOpportunities = await opportunityService.getOpportunities();
        setOpportunities(loadedOpportunities);
        
        const statsData = await opportunityService.getStats();
        setStats(statsData);
        console.log(`✅ ${loadedOpportunities.length} opportunités chargées`);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des opportunités:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les opportunités. Utilisation des données de fallback.",
          variant: "destructive",
        });
        // Le service gère automatiquement le fallback vers les mocks
      }
    };
    
    loadOpportunities();
    
    // Vérifier si on vient de marquer un devis comme refusé
    const comesFromQuoteRejection = sessionStorage.getItem('quoteRejected');
    if (comesFromQuoteRejection) {
      // Supprimer l'indicateur pour ne pas recharger à chaque fois
      sessionStorage.removeItem('quoteRejected');
      
      // Attendre un court instant pour que l'API ait le temps de mettre à jour l'opportunité
      setTimeout(() => {
        loadOpportunities();
        toast({
          title: "Opportunités mises à jour",
          description: "Le statut des opportunités a été mis à jour suite au refus du devis",
        });
      }, 500);
    }
    
    // Vérifier si on vient de marquer un devis comme accepté
    const comesFromQuoteAcceptation = sessionStorage.getItem('quoteAccepted');
    if (comesFromQuoteAcceptation) {
      // Supprimer l'indicateur pour ne pas recharger à chaque fois
      sessionStorage.removeItem('quoteAccepted');
      
      // Attendre un court instant pour que l'API ait le temps de mettre à jour l'opportunité
      setTimeout(() => {
        loadOpportunities();
        toast({
          title: "Opportunités mises à jour",
          description: "Le statut des opportunités a été mis à jour suite à l'acceptation du devis",
        });
      }, 500);
    }
  }, []);

  // 🚀 Gestionnaire d'échappement clavier pour fermer les modales
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('⌨️ Échappement détecté - nettoyage des modales');
        cleanupStates();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [cleanupStates]);

  // 🚀 Nettoyage au démontage du composant
  useEffect(() => {
    return () => {
      console.log('🚪 Démontage du composant Opportunities - nettoyage final');
      cleanupStates();
    };
  }, [cleanupStates]);

  // Filtrer les opportunités par statut
  const getOpportunitiesByStatus = (status: OpportunityStatus) => {
    return opportunities.filter(opportunity => opportunity.stage === status);
  };

  // Gérer le début du glisser-déposer
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Gérer le survol pendant le glisser-déposer
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Nous n'avons pas besoin de faire des changements pendant le survol
    // mais cette fonction peut être utilisée pour des animations ou des effets visuels
  };

  // Gérer la fin du glisser-déposer
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Trouver l'opportunité active
    const activeOpportunity = opportunities.find(opp => opp.id === activeId);
    if (!activeOpportunity) return;
    
    // Déterminer le nouveau statut en fonction de l'endroit où elle a été déposée
    let newStatus: OpportunityStatus = activeOpportunity.stage;
    
    // Vérifier si elle a été déposée sur une colonne
    const targetColumn = kanbanColumns.find(col => col.id === overId);
    if (targetColumn) {
      newStatus = targetColumn.status;
    } else {
      // Si elle a été déposée sur une autre opportunité, trouver la colonne de cette opportunité
      const overOpportunity = opportunities.find(opp => opp.id === overId);
      if (overOpportunity) {
        newStatus = overOpportunity.stage;
      }
    }
    
    // Mettre à jour le statut de l'opportunité si nécessaire
    if (newStatus !== activeOpportunity.stage) {
      // Si on déplace vers "perdu", ouvrir le formulaire de raison de perte
      if (newStatus === 'lost') {
        handleMarkAsLostSecure(activeOpportunity);
      } else {
        // Sinon, mettre à jour directement
        handleStageChange(activeOpportunity, newStatus);
      }
    }
    
    setActiveId(null);
  };

  // 🚀 MIGRATION: Gérer le changement de statut via le service intelligent
  const handleStageChange = async (opportunity: Opportunity, newStage: OpportunityStatus) => {
    try {
      const updatedOpportunity = await opportunityService.updateStage(opportunity.id, newStage);
      
      // Mettre à jour la liste des opportunités
      setOpportunities(opportunities.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ));
      
      // Mettre à jour les statistiques
      const statsData = await opportunityService.getStats();
      setStats(statsData);
      
      // Afficher une notification de succès
      toast({
        title: "Opportunité mise à jour",
        description: `L'opportunité a été déplacée vers "${
          newStage === 'new' ? 'Nouvelles' :
          newStage === 'needs_analysis' ? 'Analyse des besoins' :
          newStage === 'negotiation' ? 'Négociation' :
          newStage === 'won' ? 'Gagnées' :
          newStage === 'lost' ? 'Perdues' : 'En attente'
        }"`,
      });
      
      // Vérifier si un prospect a été converti en client
      if (updatedOpportunity.tier_converted) {
        toast({
          title: "🎉 Prospect converti en client !",
          description: updatedOpportunity.tier_converted_message || `${opportunity.tierName} est maintenant un client.`,
          duration: 6000,
        });
      }
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      
      // Gérer les erreurs de validation métier
      if (error?.response?.status === 400 && error?.response?.data) {
        const errorData = error.response.data;
        toast({
          title: "Transition interdite",
          description: (
            <div className="space-y-2">
              <p className="font-medium">{errorData.detail}</p>
              {errorData.suggestion && (
                <p className="text-sm text-muted-foreground">{errorData.suggestion}</p>
              )}
            </div>
          ),
          variant: "destructive",
          duration: 8000, // Plus long pour laisser le temps de lire
        });
      } else {
        // Erreur générique
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour l'opportunité",
          variant: "destructive"
        });
      }
    }
  };

  // Gérer la vue détaillée d'une opportunité
  const handleViewOpportunity = (opportunity: Opportunity) => {
    navigate(`/opportunities/${opportunity.id}`);
  };

  // Gérer l'édition d'une opportunité
  const handleEditOpportunitySecure = useCallback((opportunity: Opportunity) => {
    console.log(`📝 Ouverture du formulaire d'édition pour l'opportunité ${opportunity.id}`);
    setEditingOpportunity(opportunity);
    setFormDialogOpen(true);
  }, []);

  // 🚀 MIGRATION: Gérer la suppression via le service intelligent
  const handleDeleteOpportunity = async (opportunity: Opportunity) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'opportunité "${opportunity.name}" ?`)) {
      try {
        const success = await opportunityService.deleteOpportunity(opportunity.id);
        if (success) {
          // Mettre à jour la liste des opportunités
          setOpportunities(opportunities.filter(opp => opp.id !== opportunity.id));
          
          // Mettre à jour les statistiques
          const statsData = await opportunityService.getStats();
          setStats(statsData);
          
          // Afficher une notification
          toast({
            title: "Opportunité supprimée",
            description: "L'opportunité a été supprimée avec succès",
          });
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'opportunité",
          variant: "destructive"
        });
      }
    }
  };

  // 🚀 MIGRATION: Gérer la création de devis via le service intelligent
  const handleCreateQuote = async (opportunity: Opportunity) => {
    try {
      const result = await opportunityService.createQuote(opportunity.id, {
        title: `Devis - ${opportunity.name}`,
        description: opportunity.description
      });
      
      // Rediriger vers l'éditeur de devis
      navigate(`/devis/edit/${result.quote_id}`);
      
      toast({
        title: "Devis créé",
        description: "Le devis a été créé avec succès depuis l'opportunité",
      });
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      
      // Gérer les erreurs de validation métier
      if (error?.response?.status === 400 && error?.response?.data) {
        const errorData = error.response.data;
        
        // Message détaillé pour l'utilisateur
        const detailMessage = errorData.detail || "Impossible de créer le devis";
        const reasonMessage = errorData.reason || "";
        const suggestionMessage = errorData.suggestion || "";
        const allowedStages = errorData.allowed_stages || [];
        
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
          title: "Erreur",
          description: "Impossible de créer le devis",
          variant: "destructive"
        });
      }
    }
  };

  // 🚀 MIGRATION: Marquer comme gagnée via le service intelligent
  const handleMarkAsWon = async (opportunity: Opportunity) => {
    try {
      const updatedOpportunity = await opportunityService.markAsWon(opportunity.id);
      
      // Mettre à jour la liste des opportunités
      setOpportunities(opportunities.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ));
      
      // Mettre à jour les statistiques
      const statsData = await opportunityService.getStats();
      setStats(statsData);
      
      // Afficher une notification
      toast({
        title: "Opportunité gagnée",
        description: "L'opportunité a été marquée comme gagnée",
      });
    } catch (error) {
      console.error('Erreur lors du marquage gagnée:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer l'opportunité comme gagnée",
        variant: "destructive"
      });
    }
  };

  // Marquer une opportunité comme perdue
  const handleMarkAsLostSecure = useCallback((opportunity: Opportunity) => {
    console.log(`❌ Ouverture du formulaire de perte pour l'opportunité ${opportunity.id}`);
    setOpportunityToLose(opportunity);
    setLossFormOpen(true);
  }, []);

  // 🚀 MIGRATION: Confirmer la perte via le service intelligent
  const handleConfirmLoss = useCallback(async (data: { lossReason: LossReason; lossDescription?: string }) => {
    if (!opportunityToLose || isProcessing) {
      console.warn('⚠️ Aucune opportunité sélectionnée pour la perte ou traitement en cours');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      console.log(`❌ Marquage de l'opportunité ${opportunityToLose.id} comme perdue...`);
      const updatedOpportunity = await opportunityService.markAsLost(opportunityToLose.id, {
        loss_reason: data.lossReason,
        loss_description: data.lossDescription,
      });
      
      // Mettre à jour la liste des opportunités
      setOpportunities(prev => prev.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ));
      
      // Mettre à jour les statistiques
      const statsData = await opportunityService.getStats();
      setStats(statsData);
      
      // Afficher une notification
      toast({
        title: "Opportunité perdue",
        description: "L'opportunité a été marquée comme perdue",
      });
      
      console.log(`✅ Opportunité ${opportunityToLose.id} marquée comme perdue`);
    } catch (error) {
      console.error('❌ Erreur lors du marquage perdue:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer l'opportunité comme perdue",
        variant: "destructive"
      });
    } finally {
      // 🚀 Nettoyage garanti même en cas d'erreur
      resetLossFormState();
    }
  }, [opportunityToLose, resetLossFormState, isProcessing]);

  // 🚀 MIGRATION: Gérer la soumission via le service intelligent
  const handleFormSubmit = useCallback(async (formData: Partial<Opportunity>) => {
    if (!formData || isSubmitting) {
      console.warn('⚠️ Données de formulaire manquantes ou soumission en cours');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (editingOpportunity) {
        // Mode édition
        console.log(`📝 Mise à jour de l'opportunité ${editingOpportunity.id}...`);
        const updatedOpportunity = await opportunityService.updateOpportunity(editingOpportunity.id, formData);
        
        // Mettre à jour la liste des opportunités
        setOpportunities(prev => prev.map(opp => 
          opp.id === updatedOpportunity.id ? updatedOpportunity : opp
        ));
        
        // Afficher une notification
        toast({
          title: "Opportunité mise à jour",
          description: "L'opportunité a été mise à jour avec succès",
        });
        
        console.log(`✅ Opportunité ${editingOpportunity.id} mise à jour`);
      } else {
        // Mode création
        console.log('🆕 Création d\'une nouvelle opportunité...');
        const newOpportunity = await opportunityService.createOpportunity(formData);
        
        // Ajouter la nouvelle opportunité à la liste
        setOpportunities(prev => [...prev, newOpportunity]);
        
        // Afficher une notification
        toast({
          title: "Opportunité créée",
          description: "L'opportunité a été créée avec succès",
        });
        
        console.log(`✅ Nouvelle opportunité ${newOpportunity.id} créée`);
      }
      
      // Mettre à jour les statistiques
      const statsData = await opportunityService.getStats();
      setStats(statsData);
      
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      toast({
        title: "Erreur",
        description: editingOpportunity ? "Impossible de mettre à jour l'opportunité" : "Impossible de créer l'opportunité",
        variant: "destructive"
      });
    } finally {
      // 🚀 Nettoyage garanti même en cas d'erreur
      resetFormState();
    }
  }, [editingOpportunity, resetFormState, isSubmitting]);

  // 🚀 Gérer l'ouverture sécurisée du formulaire de création
  const handleAddNewSecure = useCallback((stage?: OpportunityStatus) => {
    console.log('🆕 Ouverture du formulaire de création');
    setEditingOpportunity(undefined);
    setFormDialogOpen(true);
  }, []);

  // 🚀 Gestionnaires de fermeture sécurisés pour les modales
  const handleFormDialogClose = useCallback((open: boolean) => {
    if (!open) {
      console.log('🚪 Fermeture sécurisée du formulaire');
      resetFormState();
    } else {
      setFormDialogOpen(true);
    }
  }, [resetFormState]);

  const handleLossFormClose = useCallback((open: boolean) => {
    if (!open) {
      console.log('🚪 Fermeture sécurisée du formulaire de perte');
      resetLossFormState();
    } else {
      setLossFormOpen(true);
    }
  }, [resetLossFormState]);

  // 🚀 Gestionnaire d'annulation de formulaire sécurisé
  const handleFormCancel = useCallback(() => {
    console.log('❌ Annulation du formulaire');
    resetFormState();
  }, [resetFormState]);

  // Obtenir l'opportunité active pour l'overlay de glisser-déposer
  const activeOpportunity = activeId ? opportunities.find(opp => opp.id === activeId) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Opportunités</h1>
            <p className="text-benaya-100 text-sm mt-1">
              Gérez votre pipeline commercial
            </p>
          </div>
          <Button 
            className="gap-2 bg-white text-benaya-900 hover:bg-white/90 mt-3 sm:mt-0"
            onClick={() => handleAddNewSecure()}
          >
            <Plus className="w-4 h-4" />
            Nouvelle opportunité
          </Button>
        </div>
      </div>

      {/* Stats */}
      <OpportunityStats stats={stats} />

      {/* Filters and View Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <OpportunityFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          <Button
            variant={viewType === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 gap-2"
            onClick={() => setViewType('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </Button>
          <Button
            variant={viewType === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 gap-2"
            onClick={() => setViewType('list')}
          >
            <List className="h-4 w-4" />
            Liste
          </Button>
        </div>
      </div>

      {/* Content - Vue conditionnelle */}
      {viewType === 'kanban' ? (
        // Vue Kanban avec drag and drop
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex overflow-x-auto pb-6 gap-4">
            {kanbanColumns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-[300px] md:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[calc(20%-13px)]">
                <OpportunityKanbanColumn
                  title={column.title}
                  stage={column.status}
                  opportunities={getOpportunitiesByStatus(column.status)}
                  count={getOpportunitiesByStatus(column.status).length}
                  onView={handleViewOpportunity}
                  onEdit={handleEditOpportunitySecure}
                  onDelete={handleDeleteOpportunity}
                  onStageChange={handleStageChange}
                  onCreateQuote={handleCreateQuote}
                  onMarkAsWon={handleMarkAsWon}
                  onMarkAsLost={handleMarkAsLostSecure}
                  onAddNew={handleAddNewSecure}
                  activeId={activeId}
                />
              </div>
            ))}
          </div>
          
          {/* DragOverlay pour afficher l'élément en cours de déplacement */}
          {activeId && activeOpportunity ? (
            <DragOverlay>
              <OpportunityCard
                opportunity={activeOpportunity}
                isDragging={true}
              />
            </DragOverlay>
          ) : null}
        </DndContext>
      ) : (
        // Vue Liste
        <div className="space-y-4">
          <OpportunityList
            opportunities={opportunities.filter(opp => 
              opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (opp.tierName && opp.tierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (opp.description && opp.description.toLowerCase().includes(searchQuery.toLowerCase()))
            )}
            onView={handleViewOpportunity}
            onEdit={handleEditOpportunitySecure}
            onDelete={handleDeleteOpportunity}
            onCreateQuote={handleCreateQuote}
            onMarkAsWon={handleMarkAsWon}
            onMarkAsLost={handleMarkAsLostSecure}
          />
        </div>
      )}

      {/* Opportunity Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={handleFormDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingOpportunity ? "Modifier l'opportunité" : "Nouvelle opportunité"}</DialogTitle>
            <DialogDescription>
              {editingOpportunity 
                ? "Modifiez les informations de l'opportunité" 
                : "Créez une nouvelle opportunité commerciale"}
            </DialogDescription>
          </DialogHeader>
          
          <OpportunityForm
            opportunity={editingOpportunity}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isEditing={!!editingOpportunity}
          />
        </DialogContent>
      </Dialog>

      {/* Loss Reason Form Dialog */}
      <OpportunityLossForm
        open={lossFormOpen}
        onOpenChange={handleLossFormClose}
        onSubmit={handleConfirmLoss}
      />
    </div>
  );
}