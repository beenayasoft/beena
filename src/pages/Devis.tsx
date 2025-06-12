import { useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const quotes = [
  {
    id: "1",
    number: "Brouillon",
    amount: "0,00 MAD",
    client: "Brouillon",
    project: "—",
    issueDate: "—",
    expiryDate: "—",
    status: "draft",
  },
  {
    id: "2",
    number: "DEV-2025-001",
    amount: "15,500 MAD",
    client: "Jean Dupont",
    project: "Rénovation appartement",
    issueDate: "15/06/2025",
    expiryDate: "15/07/2025",
    status: "sent",
  },
  {
    id: "3",
    number: "DEV-2025-002",
    amount: "25,300 MAD",
    client: "Marie Lambert",
    project: "Villa moderne",
    issueDate: "10/06/2025",
    expiryDate: "10/07/2025",
    status: "accepted",
  },
];

const tabs = [
  { id: "tous", label: "Tous", count: quotes.length },
  { id: "brouillons", label: "Brouillons", count: 1 },
  { id: "envoyes", label: "Envoyés", count: 1 },
  { id: "acceptes", label: "Acceptés", count: 1 },
];

export default function Devis() {
  const [activeTab, setActiveTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="benaya-badge-neutral">Brouillon</Badge>;
      case "sent":
        return <Badge className="benaya-badge-primary">Envoyé</Badge>;
      case "accepted":
        return <Badge className="benaya-badge-success">Accepté</Badge>;
      case "rejected":
        return <Badge className="benaya-badge-error">Refusé</Badge>;
      default:
        return <Badge className="benaya-badge-neutral">—</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Devis</h1>
            <p className="text-benaya-100 mt-1">
              Gérez vos devis et suivez leur progression
            </p>
          </div>
          <Button className="gap-2 bg-white text-benaya-900 hover:bg-white/90">
            <Plus className="w-4 h-4" />
            Nouveau devis
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
            3
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Total devis
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            1
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            En attente
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-green-600">1</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Acceptés
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
            40,800
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            MAD Total
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="benaya-card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Rechercher un devis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 benaya-input"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="benaya-card">
        {/* Tabs */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex">
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
          </Tabs>
        </div>

        {/* Table */}
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
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>{getStatusBadge(quote.status)}</TableCell>
                  <TableCell className="font-medium">{quote.number}</TableCell>
                  <TableCell className="font-semibold">
                    {quote.amount}
                  </TableCell>
                  <TableCell>
                    <Badge className="benaya-badge-primary text-xs">
                      {quote.client}
                    </Badge>
                  </TableCell>
                  <TableCell>{quote.project}</TableCell>
                  <TableCell>{quote.issueDate}</TableCell>
                  <TableCell>{quote.expiryDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="benaya-glass">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Envoyer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
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
      </div>
    </div>
  );
}
