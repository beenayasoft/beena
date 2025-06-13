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
              <TableRow key={tier.id}>
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
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="benaya-glass">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(tier)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(tier)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                      )}
                      {onCall && (
                        <DropdownMenuItem onClick={() => onCall(tier)}>
                          <Phone className="mr-2 h-4 w-4" />
                          Appeler
                        </DropdownMenuItem>
                      )}
                      {onEmail && (
                        <DropdownMenuItem onClick={() => onEmail(tier)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Envoyer un email
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(tier)}
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