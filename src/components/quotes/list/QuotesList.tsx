import { useState } from "react";
import { Eye, Edit, Trash2, Send, CheckCircle, XCircle } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Quote, QuoteStatus } from "@/lib/types/quote";
import { formatCurrency } from "@/lib/utils";

interface QuotesListProps {
  quotes: Quote[];
  onView?: (quote: Quote) => void;
  onEdit?: (quote: Quote) => void;
  onDelete?: (quote: Quote) => void;
  onSend?: (quote: Quote) => void;
  onAccept?: (quote: Quote) => void;
  onReject?: (quote: Quote) => void;
}

export function QuotesList({
  quotes,
  onView,
  onEdit,
  onDelete,
  onSend,
  onAccept,
  onReject,
}: QuotesListProps) {
  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case "draft":
        return <Badge className="benaya-badge-neutral">Brouillon</Badge>;
      case "sent":
        return <Badge className="benaya-badge-primary">Envoyé</Badge>;
      case "accepted":
        return <Badge className="benaya-badge-success">Accepté</Badge>;
      case "rejected":
        return <Badge className="benaya-badge-error">Refusé</Badge>;
      case "expired":
        return <Badge className="benaya-badge-warning">Expiré</Badge>;
      case "cancelled":
        return <Badge className="benaya-badge-error">Annulé</Badge>;
      default:
        return <Badge className="benaya-badge-neutral">—</Badge>;
    }
  };

  return (
    <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <Table className="benaya-table">
        <TableHeader>
          <TableRow>
            <TableHead>STATUT</TableHead>
            <TableHead>NUMÉRO</TableHead>
            <TableHead>MONTANT</TableHead>
            <TableHead>CLIENT</TableHead>
            <TableHead>PROJET</TableHead>
            <TableHead>DATE ÉMISSION</TableHead>
            <TableHead>DATE EXPIRATION</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-neutral-500">
                Aucun devis trouvé
              </TableCell>
            </TableRow>
          ) : (
            quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>{getStatusBadge(quote.status)}</TableCell>
                <TableCell className="font-medium">{quote.number}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(quote.totalTTC)} MAD
                </TableCell>
                <TableCell>
                  <Badge className="benaya-badge-primary text-xs">
                    {quote.clientName}
                  </Badge>
                </TableCell>
                <TableCell>{quote.projectName || "—"}</TableCell>
                <TableCell>{quote.issueDate || "—"}</TableCell>
                <TableCell>{quote.expiryDate || "—"}</TableCell>
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
                        </>
                      )}
                      {quote.status === "sent" && (
                        <>
                          <DropdownMenuItem onClick={() => onAccept && onAccept(quote)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marquer comme accepté
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReject && onReject(quote)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Marquer comme refusé
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete && onDelete(quote)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
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