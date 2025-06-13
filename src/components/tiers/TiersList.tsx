import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tier, useTierUtils } from "./index";
import { MouseEvent } from "react";

interface TiersListProps {
  tiers: Tier[];
  onView?: (tier: Tier) => void;
  onEdit?: (tier: Tier) => void;
  onDelete?: (tier: Tier) => void;
  onCall?: (tier: Tier) => void;
  onEmail?: (tier: Tier) => void;
}

export function TiersList({ 
  tiers,
  onView,
  onEdit,
  onDelete,
  onCall,
  onEmail
}: TiersListProps) {
  const { getTypeBadge, getStatusBadge } = useTierUtils();

  // Gestionnaire sécurisé pour les actions
  const handleAction = (
    e: MouseEvent, 
    action: (tier: Tier) => void, 
    tier: Tier
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Utiliser un setTimeout pour éviter les problèmes de rendu
    setTimeout(() => {
      action(tier);
    }, 10);
  };

  // Gestionnaire pour le clic sur une ligne
  const handleRowClick = (tier: Tier) => {
    if (onView) {
      onView(tier);
    }
  };

  return (
    <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <Table className="benaya-table">
        <TableHeader>
          <TableRow>
            <TableHead>NOM</TableHead>
            <TableHead>TYPE</TableHead>
            <TableHead>CONTACT</TableHead>
            <TableHead>EMAIL</TableHead>
            <TableHead>TÉLÉPHONE</TableHead>
            <TableHead>SIRET</TableHead>
            <TableHead>STATUT</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Aucun résultat trouvé.
              </TableCell>
            </TableRow>
          ) : (
            tiers.map((tier) => (
              <TableRow 
                key={tier.id} 
                className={onView ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50" : ""}
                onClick={onView ? () => handleRowClick(tier) : undefined}
              >
                <TableCell className="font-medium">{tier.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {tier.type.map((t) => (
                      <div key={t}>{getTypeBadge(t)}</div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{tier.contact}</TableCell>
                <TableCell>{tier.email}</TableCell>
                <TableCell>{tier.phone}</TableCell>
                <TableCell>{tier.siret}</TableCell>
                <TableCell>{getStatusBadge(tier.status)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="benaya-glass">
                      {onView && (
                        <DropdownMenuItem 
                          onSelect={(e) => e.preventDefault()}
                          onClick={(e) => handleAction(e, onView, tier)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem 
                          onSelect={(e) => e.preventDefault()}
                          onClick={(e) => handleAction(e, onEdit, tier)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                      )}
                      {onCall && (
                        <DropdownMenuItem 
                          onSelect={(e) => e.preventDefault()}
                          onClick={(e) => handleAction(e, onCall, tier)}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Appeler
                        </DropdownMenuItem>
                      )}
                      {onEmail && (
                        <DropdownMenuItem 
                          onSelect={(e) => e.preventDefault()}
                          onClick={(e) => handleAction(e, onEmail, tier)}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Envoyer un email
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onSelect={(e) => e.preventDefault()}
                            onClick={(e) => handleAction(e, onDelete, tier)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 