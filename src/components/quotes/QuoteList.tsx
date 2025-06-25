import { Eye, Edit, Trash2, Send, CheckCircle, XCircle, Copy, Download, AlertCircle, Clock } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Quote, QuotesPaginationInfo } from "@/lib/api/quotes";

interface QuoteListProps {
  quotes: Quote[];
  onView?: (quote: Quote) => void;
  onEdit?: (quote: Quote) => void;
  onDelete?: (quote: Quote) => void;
  onSend?: (quote: Quote) => void;
  onAccept?: (quote: Quote) => void;
  onReject?: (quote: Quote) => void;
  onDuplicate?: (quote: Quote) => void;
  onDownload?: (quote: Quote) => void;
  loading?: boolean;
  // 🚀 NOUVEAUX: Propriétés de pagination optimisée
  pagination?: QuotesPaginationInfo;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function QuoteList({
  quotes,
  onView,
  onEdit,
  onDelete,
  onSend,
  onAccept,
  onReject,
  onDuplicate,
  onDownload,
  loading = false,
  // 🚀 PAGINATION OPTIMISÉE
  pagination,
  onPageChange,
  onPageSizeChange,
}: QuoteListProps) {
  const getStatusBadge = (status: string, statusDisplay: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="benaya-badge-neutral gap-1">
            <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
            Brouillon
          </Badge>
        );
      case "sent":
        return (
          <Badge className="benaya-badge-primary gap-1">
            <Send className="w-3 h-3" />
            Envoyé
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="benaya-badge-success gap-1">
            <CheckCircle className="w-3 h-3" />
            Accepté
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="benaya-badge-error gap-1">
            <XCircle className="w-3 h-3" />
            Refusé
          </Badge>
        );
      case "expired":
        return (
          <Badge className="benaya-badge-warning gap-1">
            <AlertCircle className="w-3 h-3" />
            Expiré
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="benaya-badge-neutral gap-1">
            <XCircle className="w-3 h-3" />
            Annulé
          </Badge>
        );
      default:
        return <Badge className="benaya-badge-neutral">{statusDisplay || "—"}</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // 🚀 LOGIQUE DE PAGINATION (similaire à TiersList)
  const generatePaginationItems = () => {
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

  // 🔄 Pagination externe activée si fournie
  const showExternalPagination = pagination && pagination.num_pages > 1;
  
  if (loading) {
    return (
      <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <Table className="benaya-table">
          <TableHeader>
            <TableRow>
              <TableHead>STATUT</TableHead>
              <TableHead>NUMÉRO</TableHead>
              <TableHead>CLIENT</TableHead>
              <TableHead>PROJET</TableHead>
              <TableHead>DATE ÉMISSION</TableHead>
              <TableHead>DATE EXPIRATION</TableHead>
              <TableHead>TOTAL TTC</TableHead>
              <TableHead>ÉLÉMENTS</TableHead>
              <TableHead className="w-[100px]">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-benaya-600"></div>
                </div>
                <div className="mt-2 text-sm text-neutral-500">Chargement des devis...</div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <Table className="benaya-table">
        <TableHeader>
          <TableRow>
            <TableHead>STATUT</TableHead>
            <TableHead>NUMÉRO</TableHead>
            <TableHead>CLIENT</TableHead>
            <TableHead>PROJET</TableHead>
            <TableHead>DATE ÉMISSION</TableHead>
            <TableHead>DATE EXPIRATION</TableHead>
            <TableHead>TOTAL TTC</TableHead>
            <TableHead>ÉLÉMENTS</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-neutral-500">
                Aucun devis trouvé
              </TableCell>
            </TableRow>
          ) : (
            quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>{getStatusBadge(quote.status, quote.status_display)}</TableCell>
                <TableCell className="font-medium">{quote.number}</TableCell>
                <TableCell>
                  <Badge className="benaya-badge-primary text-xs">
                    {quote.client_name}
                  </Badge>
                </TableCell>
                <TableCell>{quote.project_name || "—"}</TableCell>
                <TableCell>{quote.issue_date_formatted}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {quote.expiry_date_formatted}
                    {quote.status === "expired" && (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  {formatAmount(quote.total_ttc)} MAD
                </TableCell>
                <TableCell>
                  <div className="text-sm text-neutral-600">
                    {quote.items_count} élément(s)
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">Actions</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="benaya-glass">
                      <DropdownMenuItem onClick={() => onView && onView(quote)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </DropdownMenuItem>
                      
                      {quote.status === "draft" && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit && onEdit(quote)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSend && onSend(quote)}>
                            <Send className="mr-2 h-4 w-4" />
                            Envoyer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => onDelete && onDelete(quote)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {quote.status === "sent" && (
                        <>
                          <DropdownMenuItem onClick={() => onAccept && onAccept(quote)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accepter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReject && onReject(quote)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Refuser
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      <DropdownMenuItem onClick={() => onDuplicate && onDuplicate(quote)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Dupliquer
                      </DropdownMenuItem>
                      
                      {quote.status !== "draft" && (
                        <DropdownMenuItem onClick={() => onDownload && onDownload(quote)}>
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger PDF
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* 🚀 PAGINATION OPTIMISÉE */}
      {pagination && pagination.num_pages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-sm text-muted-foreground">
            Affichage de {((pagination.current_page - 1) * pagination.page_size) + 1} à {Math.min(pagination.current_page * pagination.page_size, pagination.count)} sur {pagination.count} devis
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
              
              {generatePaginationItems().map((item, index) => (
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
    </div>
  );
} 