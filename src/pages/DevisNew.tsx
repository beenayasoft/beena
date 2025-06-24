import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteStats, QuoteTabs, QuoteFilters, QuoteList, QuoteAlerts } from "@/components/quotes";
import { quotesApi, Quote, QuoteStats as QuoteStatsType } from "@/lib/api/quotes";
import { toast } from "sonner";

export default function DevisNew() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<QuoteStatsType>({
    total: 0,
    draft: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
    expired: 0,
    cancelled: 0,
    total_amount: 0,
    acceptance_rate: 0,
  });
  const [loading, setLoading] = useState(false);

  // Charger les données
  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const statsData = await quotesApi.getStats();
      setStats(statsData);

      // Charger les devis avec filtres
      const filters: any = {};
      if (activeTab !== "all") {
        filters.status = activeTab;
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const quotesData = await quotesApi.getQuotes(filters);
      setQuotes(quotesData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Erreur lors du chargement des devis");
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et quand les filtres changent
  useEffect(() => {
    refreshData();
  }, [activeTab, searchQuery]);

  // Actions sur les devis
  const handleViewQuote = (quote: Quote) => {
    navigate(`/devis/${quote.id}`);
  };

  const handleEditQuote = (quote: Quote) => {
    navigate(`/devis/edit/${quote.id}`);
  };

  const handleDeleteQuote = async (quote: Quote) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le devis ${quote.number} ?`)) {
      try {
        await quotesApi.deleteQuote(quote.id);
        toast.success("Devis supprimé avec succès");
        refreshData();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression du devis");
      }
    }
  };

  const handleSendQuote = async (quote: Quote) => {
    try {
      await quotesApi.markAsSent(quote.id);
      toast.success("Devis envoyé avec succès");
      refreshData();
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur lors de l'envoi du devis");
    }
  };

  const handleAcceptQuote = async (quote: Quote) => {
    try {
      await quotesApi.markAsAccepted(quote.id);
      toast.success("Devis accepté avec succès");
      refreshData();
    } catch (error) {
      console.error("Erreur lors de l'acceptation:", error);
      toast.error("Erreur lors de l'acceptation du devis");
    }
  };

  const handleRejectQuote = async (quote: Quote) => {
    try {
      await quotesApi.markAsRejected(quote.id);
      toast.success("Devis refusé");
      refreshData();
    } catch (error) {
      console.error("Erreur lors du refus:", error);
      toast.error("Erreur lors du refus du devis");
    }
  };

  const handleDuplicateQuote = async (quote: Quote) => {
    try {
      await quotesApi.duplicateQuote(quote.id, {});
      toast.success("Devis dupliqué avec succès");
      refreshData();
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
      toast.error("Erreur lors de la duplication du devis");
    }
  };

  const handleCreateQuote = () => {
    navigate("/devis/nouveau");
  };

  const handleDownloadQuote = (quote: Quote) => {
    // TODO: Implémenter le téléchargement PDF
    toast.info(`Téléchargement du devis ${quote.number} à implémenter`);
  };

  const handleExport = () => {
    // TODO: Implémenter l'export
    toast.info("Export des devis à implémenter");
  };

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    // TODO: Implémenter le tri
    toast.info("Tri des devis à implémenter");
  };

  const handleDateRangeChange = (from: string, to: string) => {
    // TODO: Implémenter le filtre par date
    toast.info("Filtre par date à implémenter");
  };

  const handleStatusFilterChange = (status: string[]) => {
    // TODO: Implémenter le filtre par statut
    toast.info("Filtre par statut à implémenter");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Devis</h1>
            <p className="text-benaya-100 mt-1">
              Gérez vos devis et suivez les acceptations
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
      <QuoteStats stats={stats} />

      {/* Alerts */}
      <QuoteAlerts stats={stats} />

      {/* Filters */}
      <QuoteFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onDateRangeChange={handleDateRangeChange}
        onStatusFilterChange={handleStatusFilterChange}
        onExport={handleExport}
        onSortChange={handleSortChange}
      />

      {/* Main Content */}
      <div className="benaya-card">
        {/* Tabs et Liste */}
        <QuoteTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          counts={{
            all: stats.total,
            draft: stats.draft,
            sent: stats.sent,
            accepted: stats.accepted,
            rejected: stats.rejected,
            expired: stats.expired,
            cancelled: stats.cancelled,
          }}
        >
          {/* Table */}
          <QuoteList
            quotes={quotes}
            loading={loading}
            onView={handleViewQuote}
            onEdit={handleEditQuote}
            onDelete={handleDeleteQuote}
            onSend={handleSendQuote}
            onAccept={handleAcceptQuote}
            onReject={handleRejectQuote}
            onDuplicate={handleDuplicateQuote}
            onDownload={handleDownloadQuote}
          />
        </QuoteTabs>
      </div>
    </div>
  );
} 