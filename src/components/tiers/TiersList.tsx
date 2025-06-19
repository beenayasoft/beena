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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tier, useTierUtils } from "./index";
import { MouseEvent, useState, useMemo } from "react";

interface TiersListProps {
  tiers: Tier[];
  onView?: (tier: Tier) => void;
  onEdit?: (tier: Tier) => void;
  onDelete?: (tier: Tier) => void;
  onCall?: (tier: Tier) => void;
  onEmail?: (tier: Tier) => void;
  itemsPerPage?: number;
}

export function TiersList({ 
  tiers,
  onView,
  onEdit,
  onDelete,
  onCall,
  onEmail,
  itemsPerPage = 10
}: TiersListProps) {
  const { getTypeBadge, getStatusBadge } = useTierUtils();
  const [currentPage, setCurrentPage] = useState(1);

  // Calcul de la pagination
  const totalPages = Math.ceil(tiers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTiers = useMemo(() => 
    tiers.slice(startIndex, endIndex),
    [tiers, startIndex, endIndex]
  );

  // Réinitialiser la page courante si elle dépasse le nombre de pages
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

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

  // Génération des liens de pagination
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 3) {
        items.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        items.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return items;
  };

  return (
    <div className="space-y-4">
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
          {currentTiers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                {tiers.length === 0 ? "Aucun résultat trouvé." : "Aucun élément sur cette page."}
              </TableCell>
            </TableRow>
          ) : (
            currentTiers.map((tier) => (
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

    {/* Pagination */}
    {totalPages > 1 && (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Affichage de {startIndex + 1} à {Math.min(endIndex, tiers.length)} sur {tiers.length} résultats
        </div>
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
            
            {generatePaginationItems().map((item, index) => (
              <PaginationItem key={index}>
                {item === '...' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => setCurrentPage(item as number)}
                    isActive={currentPage === item}
                    className="cursor-pointer"
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    )}
  </div>
  );
} 