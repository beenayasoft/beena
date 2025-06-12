import { useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  Settings,
  MoreHorizontal,
  Filter,
  Download,
  Eye,
  Edit,
  Copy,
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
import { PageHeader } from "@/components/common/PageHeader";
import { QuotesFilters } from "@/components/quotes/QuotesFilters";
import { QuotesStats } from "@/components/quotes/QuotesStats";

const quotes = [
  {
    id: "draft-1",
    number: "Brouillon",
    amount: "0,00 MAD",
    client: "Brouillon",
    project: "—",
    issueDate: "—",
    expiryDate: "—",
    status: "draft",
  },
  {
    id: "draft-2",
    number: "Brouillon",
    amount: "0,00 MAD",
    client: "Brouillon",
    project: "—",
    issueDate: "—",
    expiryDate: "—",
    status: "draft",
  },
  {
    id: "draft-3",
    number: "Brouillon",
    amount: "15,500 MAD",
    client: "Jean Dupont",
    project: "Rénovation appartement",
    issueDate: "15/06/2025",
    expiryDate: "15/07/2025",
    status: "draft",
  },
  {
    id: "sent-1",
    number: "DEV-2025-001",
    amount: "25,300 MAD",
    client: "Marie Lambert",
    project: "Villa moderne",
    issueDate: "10/06/2025",
    expiryDate: "10/07/2025",
    status: "sent",
  },
  {
    id: "accepted-1",
    number: "DEV-2025-002",
    amount: "18,750 MAD",
    client: "Pierre Martin",
    project: "Extension maison",
    issueDate: "08/06/2025",
    expiryDate: "08/07/2025",
    status: "accepted",
  },
];

const tabs = [
  { id: "tous", label: "Tous", count: quotes.length },
  { id: "brouillons", label: "Brouillons", count: 3 },
  { id: "finalises", label: "Finalisés", count: 2 },
  { id: "envoyes", label: "Envoyés", count: 1 },
  { id: "a-facturer", label: "À facturer", count: 1 },
  { id: "factures", label: "Facturés", count: 0 },
  { id: "perdus", label: "Perdus", count: 0 },
];

export default function Devis() {
  const [activeTab, setActiveTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="neo-badge-gray">
            <div className="w-2 h-2 bg-slate-400 rounded-full mr-2"></div>
            Brouillon
          </Badge>
        );
      case "sent":
        return (
          <Badge className="neo-badge-blue">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Envoyé
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="neo-badge-green">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Accepté
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="neo-badge-red">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Refusé
          </Badge>
        );
      default:
        return (
          <Badge className="neo-badge-gray">
            <div className="w-2 h-2 bg-slate-400 rounded-full mr-2"></div>—
          </Badge>
        );
    }
  };

  const getClientBadge = (client: string) => {
    if (client === "Brouillon") {
      return <Badge className="neo-badge-gray text-xs">{client}</Badge>;
    }
    return <Badge className="neo-badge-blue text-xs">{client}</Badge>;
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950/50 dark:via-blue-950/30 dark:to-indigo-950/50">
      <div className="relative p-6 space-y-8">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/3 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-500/10 rounded-full filter blur-3xl"></div>
        </div>

        {/* Page Header */}
        <div className="relative z-10">
          <PageHeader
            title="Devis"
            description="Gérez vos devis et suivez leur progression"
            primaryAction={{
              label: "Nouveau devis",
              icon: Plus,
              onClick: () => console.log("Nouveau devis"),
            }}
            secondaryActions={[
              {
                label: "Paramètres",
                icon: Settings,
                onClick: () => console.log("Paramètres"),
              },
            ]}
          />
        </div>

        {/* Stats Cards */}
        <div className="relative z-10">
          <QuotesStats />
        </div>

        {/* Filters */}
        <div className="relative z-10">
          <QuotesFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl",
              "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl",
              "border border-white/20 dark:border-slate-700/50",
              "shadow-lg shadow-slate-500/5 dark:shadow-slate-900/20",
            )}
          >
            {/* Tabs */}
            <div className="p-6 border-b border-white/10 dark:border-slate-700/30">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-none lg:inline-flex bg-white/30 dark:bg-slate-800/30">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="gap-2 data-[state=active]:bg-white/60 dark:data-[state=active]:bg-slate-700/60"
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-white/40 dark:bg-slate-600/40"
                        >
                          {tab.count}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Table */}
            <div className="overflow-hidden">
              <Table className="neo-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>STATUT</TableHead>
                    <TableHead>NUMÉRO</TableHead>
                    <TableHead>MONTANT TTC</TableHead>
                    <TableHead>CLIENT</TableHead>
                    <TableHead>CHANTIER</TableHead>
                    <TableHead>DATE D'ÉMISSION</TableHead>
                    <TableHead>DATE D'EXPIRATION</TableHead>
                    <TableHead className="w-[100px]">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow
                      key={quote.id}
                      className="group hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell className="font-medium">
                        {quote.number}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {quote.amount}
                      </TableCell>
                      <TableCell>{getClientBadge(quote.client)}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {quote.project}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {quote.issueDate}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {quote.expiryDate}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity glass-button"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/20 dark:border-slate-700/50"
                          >
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Dupliquer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Envoyer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Télécharger
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 dark:text-red-400">
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

            {/* Empty State for other tabs */}
            {quotes.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Aucun devis trouvé
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Commencez par créer votre premier devis
                </p>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Créer un devis
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
