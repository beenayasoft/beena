import { useState, useEffect } from "react";
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
import { Opportunity, OpportunityStatus, LossReason } from "@/lib/types/opportunity";
import { getOpportunities, getOpportunityStats, updateOpportunity, createOpportunity, deleteOpportunity, createQuoteFromOpportunity } from "@/lib/mock/opportunities";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "@/hooks/use-toast";

// Définition des colonnes du Kanban
const kanbanColumns = [
  { id: "new", title: "Nouvelles", status: "new" as OpportunityStatus },
  { id: "qualifying", title: "Qualification", status: "qualifying" as OpportunityStatus },
  { id: "needs_analysis", title: "Analyse des besoins", status: "needs_analysis" as OpportunityStatus },
  { id: "proposal", title: "Proposition", status: "proposal" as OpportunityStatus },
  { id: "negotiation", title: "Négociation", status: "negotiation" as OpportunityStatus },
  { id: "won", title: "Gagnées", status: "won" as OpportunityStatus },
  { id: "lost", title: "Perdues", status: "lost" as OpportunityStatus },
];

export default function Opportunities() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState(getOpportunityStats());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [lossFormOpen, setLossFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>(undefined);
  const [opportunityToLose, setOpportunityToLose] = useState<Opportunity | undefined>(undefined);

  // Configuration des capteurs pour le drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Charger les opportunités
  useEffect(() => {
    const loadedOpportunities = getOpportunities();
    setOpportunities(loadedOpportunities);
    setStats(getOpportunityStats());
  }, []);

  // Filtrer les opportunités par statut
  const getOpportunitiesByStatus = (status: OpportunityStatus) => {
    return opportunities.filter(opportunity => opportunity.stage === status);
  };

  // Gérer le début du glisser-déposer
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
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
    }
    
    // Mettre à jour le statut de l'opportunité si nécessaire
    if (newStatus !== activeOpportunity.stage) {
      // Si on déplace vers "perdu", ouvrir le formulaire de raison de perte
      if (newStatus === 'lost') {
        setOpportunityToLose(activeOpportunity);
        setLossFormOpen(true);
      } else {
        // Sinon, mettre à jour directement
        handleStageChange(activeOpportunity, newStatus);
      }
    }
    
    setActiveId(null);
  };

  // Gérer le changement de statut d'une opportunité
  const handleStageChange = (opportunity: Opportunity, newStage: OpportunityStatus) => {
    const updatedOpportunity = updateOpportunity(opportunity.id, { stage: newStage });
    if (updatedOpportunity) {
      // Mettre à jour la liste des opportunités
      setOpportunities(opportunities.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ));
      
      // Mettre à jour les statistiques
      setStats(getOpportunityStats());
      
      // Afficher une notification
      toast({
        title: "Opportunité mise à jour",
        description: `L'opportunité a été déplacée vers "${
          newStage === 'new' ? 'Nouvelles' :
          newStage === 'qualifying' ? 'Qualification' :
          newStage === 'needs_analysis' ? 'Analyse des besoins' :
          newStage === 'proposal' ? 'Proposition' :
          newStage === 'negotiation' ? 'Négociation' :
          newStage === 'won' ? 'Gagnées' :
          newStage === 'lost' ? 'Perdues' :
          newStage === 'cancelled' ? 'Annulées' : 'En attente'
        }"`,
      });
    }
  };

  // Gérer la vue détaillée d'une opportunité
  const handleViewOpportunity = (opportunity: Opportunity) => {
    navigate(`/opportunities/${opportunity.id}`);
  };

  // Gérer l'édition d'une opportunité
  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setFormDialogOpen(true);
  };

  // Gérer la suppression d'une opportunité
  const handleDeleteOpportunity = (opportunity: Opportunity) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'opportunité "${opportunity.name}" ?`)) {
      const success = deleteOpportunity(opportunity.id);
      if (success) {
        // Mettre à jour la liste des opportunités
        setOpportunities(opportunities.filter(opp => opp.id !== opportunity.id));
        
        // Mettre à jour les statistiques
        setStats(getOpportunityStats());
        
        // Afficher une notification
        toast({
          title: "Opportunité supprimée",
          description: "L'opportunité a été supprimée avec succès",
        });
      }
    }
  };

  // Gérer la création d'un devis à partir d'une opportunité
  const handleCreateQuote = (opportunity: Opportunity) => {
    const result = createQuoteFromOpportunity(opportunity.id);
    if (result.success) {
      // Rediriger vers l'éditeur de devis
      navigate(`/devis/edit/${result.quoteId}`);
    }
  };

  // Marquer une opportunité comme gagnée
  const handleMarkAsWon = (opportunity: Opportunity) => {
    const updatedOpportunity = updateOpportunity(opportunity.id, { 
      stage: 'won',
      probability: 100,
    });
    
    if (updatedOpportunity) {
      // Mettre à jour la liste des opportunités
      setOpportunities(opportunities.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ));
      
      // Mettre à jour les statistiques
      setStats(getOpportunityStats());
      
      // Afficher une notification
      toast({
        title: "Opportunité gagnée",
        description: "L'opportunité a été marquée comme gagnée",
      });
    }
  };

  // Marquer une opportunité comme perdue
  const handleMarkAsLost = (opportunity: Opportunity) => {
    setOpportunityToLose(opportunity);
    setLossFormOpen(true);
  };

  // Confirmer la perte d'une opportunité
  const handleConfirmLoss = (data: { lossReason: LossReason; lossDescription?: string }) => {
    if (!opportunityToLose) return;
    
    const updatedOpportunity = updateOpportunity(opportunityToLose.id, {
      stage: 'lost',
      probability: 0,
      lossReason: data.lossReason,
      lossDescription: data.lossDescription,
    });
    
    if (updatedOpportunity) {
      // Mettre à jour la liste des opportunités
      setOpportunities(opportunities.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ));
      
      // Mettre à jour les statistiques
      setStats(getOpportunityStats());
      
      // Afficher une notification
      toast({
        title: "Opportunité perdue",
        description: "L'opportunité a été marquée comme perdue",
      });
    }
    
    setOpportunityToLose(undefined);
  };

  // Gérer la soumission du formulaire d'opportunité
  const handleFormSubmit = (formData: Partial<Opportunity>) => {
    if (editingOpportunity) {
      // Mode édition
      const updatedOpportunity = updateOpportunity(editingOpportunity.id, formData);
      if (updatedOpportunity) {
        // Mettre à jour la liste des opportunités
        setOpportunities(opportunities.map(opp => 
          opp.id === updatedOpportunity.id ? updatedOpportunity : opp
        ));
        
        // Afficher une notification
        toast({
          title: "Opportunité mise à jour",
          description: "L'opportunité a été mise à jour avec succès",
        });
      }
    } else {
      // Mode création
      const newOpportunity = createOpportunity(formData as Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>);
      
      // Ajouter la nouvelle opportunité à la liste
      setOpportunities([...opportunities, newOpportunity]);
      
      // Afficher une notification
      toast({
        title: "Opportunité créée",
        description: "L'opportunité a été créée avec succès",
      });
    }
    
    // Mettre à jour les statistiques
    setStats(getOpportunityStats());
    
    // Fermer le formulaire
    setFormDialogOpen(false);
    setEditingOpportunity(undefined);
  };

  // Créer une nouvelle opportunité
  const handleAddNew = (stage?: OpportunityStatus) => {
    setEditingOpportunity(undefined);
    setFormDialogOpen(true);
  };

  // Obtenir l'opportunité active pour l'overlay de glisser-déposer
  const activeOpportunity = activeId ? opportunities.find(opp => opp.id === activeId) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Opportunités</h1>
            <p className="text-benaya-100 mt-1">
              Gérez votre pipeline commercial et suivez vos affaires
            </p>
          </div>
          <Button 
            className="gap-2 bg-white text-benaya-900 hover:bg-white/90"
            onClick={() => handleAddNew()}
          >
            <Plus className="w-4 h-4" />
            Nouvelle opportunité
          </Button>
        </div>
      </div>

      {/* Stats */}
      <OpportunityStats stats={stats} />

      {/* Filters */}
      <OpportunityFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 gap-6 overflow-x-auto pb-6">
          {kanbanColumns.map((column) => (
            <OpportunityKanbanColumn
              key={column.id}
              title={column.title}
              stage={column.status}
              opportunities={getOpportunitiesByStatus(column.status)}
              count={getOpportunitiesByStatus(column.status).length}
              onView={handleViewOpportunity}
              onEdit={handleEditOpportunity}
              onDelete={handleDeleteOpportunity}
              onStageChange={handleStageChange}
              onCreateQuote={handleCreateQuote}
              onMarkAsWon={handleMarkAsWon}
              onMarkAsLost={handleMarkAsLost}
              onAddNew={handleAddNew}
              activeId={activeId}
            />
          ))}
        </div>
      </DndContext>

      {/* Opportunity Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
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
            onCancel={() => {
              setFormDialogOpen(false);
              setEditingOpportunity(undefined);
            }}
            isEditing={!!editingOpportunity}
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