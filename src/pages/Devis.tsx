import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { QuotesList } from "@/components/quotes/list/QuotesList";
import { QuotesStats } from "@/components/quotes/QuotesStats";
import { QuotesFilters } from "@/components/quotes/QuotesFilters";
import { QuotesTabs } from "@/components/quotes/list/QuotesTabs";
import { getQuotes, getQuotesStats } from "@/lib/mock/quotes";
import { Quote, QuoteStatus } from "@/lib/types/quote";

export default function Devis() {
  const navigate = useNavigate();
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
    // Naviguer vers l'éditeur de devis
    navigate(`/devis/edit/${quote.id}`);
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
    // Naviguer vers la page de création de devis
    navigate("/devis/edit/new");
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