import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { OpportunityCard } from "./OpportunityCard";
import { Opportunity, OpportunityStatus } from "@/lib/types/opportunity";

interface OpportunitySortableItemProps {
  opportunity: Opportunity;
  onView?: (opportunity: Opportunity) => void;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunity: Opportunity) => void;
  onStageChange?: (opportunity: Opportunity, newStage: OpportunityStatus) => void;
  onCreateQuote?: (opportunity: Opportunity) => void;
  onMarkAsWon?: (opportunity: Opportunity) => void;
  onMarkAsLost?: (opportunity: Opportunity) => void;
}

export function OpportunitySortableItem({
  opportunity,
  onView,
  onEdit,
  onDelete,
  onStageChange,
  onCreateQuote,
  onMarkAsWon,
  onMarkAsLost,
}: OpportunitySortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <OpportunityCard
        opportunity={opportunity}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onStageChange={onStageChange}
        onCreateQuote={onCreateQuote}
        onMarkAsWon={onMarkAsWon}
        onMarkAsLost={onMarkAsLost}
        isDragging={isDragging}
      />
    </div>
  );
}