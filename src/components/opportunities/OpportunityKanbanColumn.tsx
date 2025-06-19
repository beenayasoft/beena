import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpportunityCard } from "./OpportunityCard";
import { Opportunity, OpportunityStatus } from "@/lib/types/opportunity";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface OpportunityKanbanColumnProps {
  title: string;
  stage: OpportunityStatus;
  opportunities: Opportunity[];
  count: number;
  onView?: (opportunity: Opportunity) => void;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunity: Opportunity) => void;
  onStageChange?: (opportunity: Opportunity, newStage: OpportunityStatus) => void;
  onCreateQuote?: (opportunity: Opportunity) => void;
  onMarkAsWon?: (opportunity: Opportunity) => void;
  onMarkAsLost?: (opportunity: Opportunity) => void;
  onAddNew?: (stage: OpportunityStatus) => void;
  activeId?: string | null;
}

export function OpportunityKanbanColumn({
  title,
  stage,
  opportunities,
  count,
  onView,
  onEdit,
  onDelete,
  onStageChange,
  onCreateQuote,
  onMarkAsWon,
  onMarkAsLost,
  onAddNew,
  activeId,
}: OpportunityKanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage,
  });

  // Obtenir la couleur de l'en-tête en fonction du statut
  const getHeaderColor = (stage: OpportunityStatus) => {
    switch (stage) {
      case 'new':
      case 'qualifying':
      case 'needs_analysis':
        return "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700";
      case 'proposal':
      case 'negotiation':
        return "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700";
      case 'won':
        return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700";
      case 'lost':
      case 'cancelled':
        return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700";
      case 'on_hold':
        return "bg-neutral-100 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700";
      default:
        return "bg-neutral-100 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div 
        className={cn(
          "p-4 rounded-xl border mb-4",
          getHeaderColor(stage)
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-neutral-900 dark:text-white">{title}</h3>
            <Badge className="bg-white/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300">
              {count}
            </Badge>
          </div>
          {onAddNew && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => onAddNew(stage)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Column Content */}
      <div 
        ref={setNodeRef}
        className="flex-1 space-y-4 min-h-[200px] overflow-y-auto max-h-[calc(100vh-300px)] p-1"
      >
        <SortableContext 
          items={opportunities.map(o => o.id)} 
          strategy={verticalListSortingStrategy}
        >
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onStageChange={onStageChange}
              onCreateQuote={onCreateQuote}
              onMarkAsWon={onMarkAsWon}
              onMarkAsLost={onMarkAsLost}
              isDragging={activeId === opportunity.id}
            />
          ))}
        </SortableContext>

        {opportunities.length === 0 && (
          <div className="flex items-center justify-center h-20 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
            <p className="text-sm text-neutral-500">Aucune opportunité</p>
          </div>
        )}

        {/* Add new opportunity button */}
        {onAddNew && (
          <Button 
            variant="outline" 
            className="w-full border-dashed"
            onClick={() => onAddNew(stage)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une opportunité
          </Button>
        )}
      </div>
    </div>
  );
}