import { useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Send,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
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

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

type Invoice = {
  id: string;
  number: string;
  client: string;
  project: string;
  amount: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentMethod?: string;
};

const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "FAC-2025-001",
    client: "M. Dupont",
    project: "Villa Moderne",
    amount: "125,500 MAD",
    issueDate: "15/01/2025",
    dueDate: "15/02/2025",
    status: "sent",
  },
  {
    id: "2",
    number: "FAC-2025-002",
    client: "Mme Lambert",
    project: "Rénovation appartement",
    amount: "45,300 MAD",
    issueDate: "20/01/2025",
    dueDate: "20/02/2025",
    status: "paid",
    paymentMethod: "Virement",
  },
  {
    id: "3",
    number: "FAC-2024-089",
    client: "M. Martin",
    project: "Extension maison",
    amount: "67,800 MAD",
    issueDate: "15/12/2024",
    dueDate: "15/01/2025",
    status: "overdue",
  },
  {
    id: "4",
    number: "Brouillon",
    client: "STE ABC",
    project: "Bureaux entreprise",
    amount: "0,00 MAD",
    issueDate: "—",
    dueDate: "—",
    status: "draft",
  },
];

const tabs = [
  { id: "tous", label: "Toutes", count: mockInvoices.length },
  { id: "brouillons", label: "Brouillons", count: 1 },
  { id: "envoyees", label: "Envoyées", count: 1 },
  { id: "payees", label: "Payées", count: 1 },
  { id: "en_retard", label: "En retard", count: 1 },
];

export default function Factures() {
  const [activeTab, setActiveTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: InvoiceStatus) => {
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
            Envoyée
          </Badge>
        );
      case "paid":
        return (
          <Badge className="benaya-badge-success gap-1">
            <CheckCircle className="w-3 h-3" />
            Payée
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="benaya-badge-error gap-1">
            <AlertCircle className="w-3 h-3" />
            En retard
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="benaya-badge-neutral gap-1">
            <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
            Annulée
          </Badge>
        );
      default:
        return <Badge className="benaya-badge-neutral">—</Badge>;
    }
  };

  const getTotalByStatus = (status: InvoiceStatus) => {
    return mockInvoices
      .filter((invoice) => invoice.status === status)
      .reduce((total, invoice) => {
        const amount = parseFloat(
          invoice.amount.replace(/[^\d,]/g, "").replace(",", "."),
        );
        return total + (isNaN(amount) ? 0 : amount);
      }, 0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Factures</h1>
            <p className="text-benaya-100 mt-1">
              Gérez vos factures et suivez les paiements
            </p>
          </div>
          <Button className="gap-2 bg-white text-benaya-900 hover:bg-white/90">
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
            {mockInvoices.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Total factures
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-green-600">
            {getTotalByStatus("paid").toLocaleString("fr-FR")} MAD
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Payées
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {getTotalByStatus("sent").toLocaleString("fr-FR")} MAD
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            En attente
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-red-600">
            {getTotalByStatus("overdue").toLocaleString("fr-FR")} MAD
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            En retard
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
                placeholder="Rechercher une facture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 benaya-input"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              Période
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="benaya-card">
        {/* Tabs */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:inline-flex">
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
                <TableHead>CLIENT</TableHead>
                <TableHead>PROJET</TableHead>
                <TableHead>MONTANT</TableHead>
                <TableHead>DATE ÉMISSION</TableHead>
                <TableHead>DATE ÉCHÉANCE</TableHead>
                <TableHead className="w-[100px]">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="font-medium">
                    {invoice.number}
                  </TableCell>
                  <TableCell>
                    <Badge className="benaya-badge-primary text-xs">
                      {invoice.client}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.project}</TableCell>
                  <TableCell className="font-semibold">
                    {invoice.amount}
                  </TableCell>
                  <TableCell>{invoice.issueDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {invoice.dueDate}
                      {invoice.status === "overdue" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
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
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {invoice.status === "draft" && (
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Envoyer
                          </DropdownMenuItem>
                        )}
                        {invoice.status === "sent" && (
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marquer comme payée
                          </DropdownMenuItem>
                        )}
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

        {/* Empty state */}
        {mockInvoices.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Aucune facture trouvée
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Commencez par créer votre première facture
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Créer une facture
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
