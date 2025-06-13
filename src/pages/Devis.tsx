import { useState, useEffect } from "react";
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
import { QuotesList } from "@/components/quotes/list/QuotesList";
import { QuotesStats } from "@/components/quotes/QuotesStats";
import { QuotesFilters } from "@/components/quotes/QuotesFilters";
import { QuotesTabs } from "@/components/quotes/list/QuotesTabs";
import { getQuotes, getQuotesStats } from "@/lib/mock/quotes";
import { Quote, QuoteStatus } from "@/lib/types/quote";

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
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState({
    all: 0,
    draft: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
    expired: 0,
    cancelled: 0,
  });

  // Charger les devis et statistiques
  useEffect(() => {
    const quoteStats = getQuotesStats();
    setStats({
      all: quoteStats.total,
      draft: quoteStats.draft,
      sent: quoteStats.sent,
      accepted: quoteStats.accepted,
      rejected: quoteStats.rejected,
      expired: quoteStats.expired,
      cancelled: quoteStats.cancelled,
    });

    // Filtrer les devis selon l'onglet actif
    let statusFilter: QuoteStatus | undefined;
    if (activeTab !== "all") {
      statusFilter = activeTab as QuoteStatus;
    }

    const filteredQuotes = getQuotes({
      status: statusFilter,
      search: searchQuery,
    });
    setQuotes(filteredQuotes);
  }, [activeTab, searchQuery]);

  const handleViewQuote = (quote: Quote) => {
    // Implémenter la navigation vers la page de détail du devis
    console.log("Voir devis:", quote.id);
  };

  const handleEditQuote = (quote: Quote) => {
    // Implémenter la navigation vers l'éditeur de devis
    console.log("Modifier devis:", quote.id);
  };

  const handleDeleteQuote = (quote: Quote) => {
    // Implémenter la suppression du devis
    console.log("Supprimer devis:", quote.id);
  };

  const handleSendQuote = (quote: Quote) => {
    // Implémenter l'envoi du devis
    console.log("Envoyer devis:", quote.id);
  };

  const handleAcceptQuote = (quote: Quote) => {
    // Implémenter l'acceptation du devis
    console.log("Accepter devis:", quote.id);
  };

  const handleRejectQuote = (quote: Quote) => {
    // Implémenter le refus du devis
    console.log("Refuser devis:", quote.id);
  };

  const handleCreateQuote = () => {
    // Implémenter la création d'un nouveau devis
    console.log("Créer un nouveau devis");
  };

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
          <Button 
            className="gap-2 bg-white text-benaya-900 hover:bg-white/90"
            onClick={handleCreateQuote}
          >
            <Plus className="w-4 h-4" />
            Nouveau devis
          </Button>
        </div>
      </div>

      {/* Stats */}
      <QuotesStats />

      {/* Filters */}
      <QuotesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <div className="benaya-card">
        {/* Tabs */}
        <QuotesTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          counts={stats}
        />

        {/* Table */}
        <QuotesList
          quotes={quotes}
          onView={handleViewQuote}
          onEdit={handleEditQuote}
          onDelete={handleDeleteQuote}
          onSend={handleSendQuote}
          onAccept={handleAcceptQuote}
          onReject={handleRejectQuote}
        />
      </div>
    </div>
  );
}
