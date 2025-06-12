import { useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  Settings,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const quotes = [
  {
    id: "Brouillon",
    number: "Brouillon",
    amount: "0,00 MAD",
    client: "Brouillon",
    project: "—",
    issueDate: "—",
    expiryDate: "—",
    status: "draft",
  },
  {
    id: "Brouillon2",
    number: "Brouillon",
    amount: "0,00 MAD",
    client: "Brouillon",
    project: "—",
    issueDate: "—",
    expiryDate: "—",
    status: "draft",
  },
  {
    id: "Brouillon3",
    number: "Brouillon",
    amount: "0,00 MAD",
    client: "Brouillon",
    project: "—",
    issueDate: "—",
    expiryDate: "—",
    status: "draft",
  },
  {
    id: "Brouillon4",
    number: "Brouillon",
    amount: "0,00 MAD",
    client: "Brouillon",
    project: "—",
    issueDate: "—",
    expiryDate: "—",
    status: "draft",
  },
  {
    id: "Brouillon5",
    number: "Brouillon",
    amount: "0,00 MAD",
    client: "Brouillon",
    project: "—",
    issueDate: "—",
    expiryDate: "—",
    status: "draft",
  },
  {
    id: "Brouillon6",
    number: "Brouillon",
    amount: "0,00 MAD",
    client: "Brouillon",
    project: "—",
    issueDate: "—",
    expiryDate: "—",
    status: "draft",
  },
];

const tabs = [
  { id: "tous", label: "Tous", count: quotes.length },
  { id: "brouillons", label: "Brouillons", count: quotes.length },
  { id: "finalises", label: "Finalisés", count: 0 },
  { id: "envoyes", label: "Envoyés", count: 0 },
  { id: "a-facturer", label: "À facturer", count: 0 },
  { id: "factures", label: "Facturés", count: 0 },
  { id: "perdus", label: "Perdus", count: 0 },
];

export default function Devis() {
  const [activeTab, setActiveTab] = useState("tous");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="neo-badge neo-badge-gray">Brouillon</Badge>;
      case "sent":
        return <Badge className="neo-badge neo-badge-blue">Envoyé</Badge>;
      case "accepted":
        return <Badge className="neo-badge neo-badge-green">Accepté</Badge>;
      case "rejected":
        return <Badge className="neo-badge neo-badge-red">Refusé</Badge>;
      default:
        return <Badge className="neo-badge neo-badge-gray">—</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neo-gray-900 dark:text-white">
            Devis
          </h1>
          <p className="text-neo-gray-600 dark:text-neo-gray-400">
            Gérez vos devis et suivez leur progression
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>

          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau devis
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neo-gray-400" />
            <Input
              placeholder="Rechercher un devis par numéro, client, chantier..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            Date d'émission
          </Button>

          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-none lg:inline-flex">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="neo-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NUMÉRO</TableHead>
                  <TableHead>MONTANT TTC</TableHead>
                  <TableHead>CLIENT</TableHead>
                  <TableHead>CHANTIER</TableHead>
                  <TableHead>DATE D'ÉMISSION</TableHead>
                  <TableHead>DATE D'EXPIRATION</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">
                      {getStatusBadge(quote.status)}
                    </TableCell>
                    <TableCell>{quote.amount}</TableCell>
                    <TableCell>
                      <Badge className="neo-badge neo-badge-blue">
                        {quote.client}
                      </Badge>
                    </TableCell>
                    <TableCell>{quote.project}</TableCell>
                    <TableCell>{quote.issueDate}</TableCell>
                    <TableCell>{quote.expiryDate}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Voir</DropdownMenuItem>
                          <DropdownMenuItem>Modifier</DropdownMenuItem>
                          <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                          <DropdownMenuItem>Envoyer</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
