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
import { useTierUtils } from "./index";
import { Tier } from "./types";
import { PaginationInfo } from "@/lib/api/tiers";
import { MouseEvent, useState, useMemo } from "react";

interface TiersListProps {
  tiers: Tier[];
  onView?: (tier: Tier) => void;
  onEdit?: (tier: Tier) => void;
  onDelete?: (tier: Tier) => void;
  onCall?: (tier: Tier) => void;
  onEmail?: (tier: Tier) => void;
  itemsPerPage?: number;
  // 🚀 NOUVEAU: Flag pour désactiver la pagination interne (quand on utilise la pagination backend)
  disableInternalPagination?: boolean;
  // 🚀 NOUVEAU: Pagination externe
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
}

export function TiersList({ 
  tiers,
  onView,
  onEdit,
  onDelete,
  onCall,
  onEmail,
  itemsPerPage = 10,
  disableInternalPagination = false,
  // 🚀 NOUVEAU: Pagination externe
  pagination,
  onPageChange
}: TiersListProps) {
  const { getTypeBadge, getStatusBadge } = useTierUtils();
  const [currentPage, setCurrentPage] = useState(1);

  // 🎯 NOUVELLE LOGIQUE: Utiliser pagination interne SEULEMENT si pas de pagination externe
  const shouldUsePagination = !disableInternalPagination;
  
  // Calcul de la pagination (seulement si pagination interne activée)
  const totalPages = shouldUsePagination ? Math.ceil(tiers.length / itemsPerPage) : 1;
  const startIndex = shouldUsePagination ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = shouldUsePagination ? startIndex + itemsPerPage : tiers.length;
  
  const currentTiers = useMemo(() => 
    shouldUsePagination ? tiers.slice(startIndex, endIndex) : tiers,
    [tiers, startIndex, endIndex, shouldUsePagination]
  );

  // Réinitialiser la page courante si elle dépasse le nombre de pages (seulement si pagination interne)
  useMemo(() => {
    if (shouldUsePagination && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages, shouldUsePagination]);

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

  // Génération des liens de pagination interne
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

  // 🚀 NOUVEAU: Génération des liens pour la pagination externe  
  const generateExternalPaginationItems = () => {
    if (!pagination) return [];
    
    const items: (number | string)[] = [];
    const currentPage = pagination.current_page;
    const totalPages = pagination.num_pages;
    
    // Toujours afficher la première page
    if (totalPages > 0) {
      items.push(1);
    }
    
    // Pages autour de la page courante
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    // Ajouter des ellipses si nécessaire
    if (start > 2) {
      items.push('...');
    }
    
    // Pages du milieu
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        items.push(i);
      }
    }
    
    // Ajouter des ellipses si nécessaire
    if (end < totalPages - 1) {
      items.push('...');
    }
    
    // Toujours afficher la dernière page (si différente de la première)
    if (totalPages > 1) {
      items.push(totalPages);
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

    {/* 🚀 PAGINATION EXTERNE (nouvelle logique) */}
    {pagination && pagination.num_pages > 1 && (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-sm text-muted-foreground">
          Affichage de {((pagination.current_page - 1) * pagination.page_size) + 1} à {Math.min(pagination.current_page * pagination.page_size, pagination.count)} sur {pagination.count} tiers
        </div>
        <Pagination>
          <PaginationContent>
            {pagination.has_previous && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange && onPageChange(pagination.previous_page!)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
            
            {generateExternalPaginationItems().map((item, index) => (
              <PaginationItem key={index}>
                {item === '...' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => onPageChange && onPageChange(item as number)}
                    isActive={pagination.current_page === item}
                    className="cursor-pointer"
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            {pagination.has_next && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange && onPageChange(pagination.next_page!)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    )}

    {/* Pagination interne (legacy, seulement si pagination interne activée) */}
    {shouldUsePagination && totalPages > 1 && !pagination && (
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