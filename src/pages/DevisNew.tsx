import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteStats, QuoteTabs, QuoteFilters, QuoteList, QuoteAlerts } from "@/components/quotes";
import { quotesApi, Quote, QuoteStats as QuoteStatsType, QuoteFilters as QuoteFiltersType, QuotesPaginationInfo } from "@/lib/api/quotes";
import { PerformanceMonitor } from "@/components/common/PerformanceMonitor";
import { toast } from "sonner";

export default function DevisNew() {
  const navigate = useNavigate();
  
  // 📊 ÉTATS PRINCIPAUX
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // 📊 STATS GLOBALES
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

  // 🚀 PAGINATION OPTIMISÉE 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<QuotesPaginationInfo>({
    count: 0,
    num_pages: 0,
    current_page: 1,
    page_size: 10,
    has_next: false,
    has_previous: false,
    next_page: null,
    previous_page: null
  });

  // 🎯 CONVERSION DES STATS AU FORMAT ATTENDU PAR LES COMPOSANTS
  const countByStatus = {
    all: stats.total,
    draft: stats.draft,
    sent: stats.sent,
    accepted: stats.accepted,
    rejected: stats.rejected,
    expired: stats.expired,
    cancelled: stats.cancelled
  };

  // 🚀 FONCTION OPTIMISÉE pour charger les devis avec pagination (style tiers)
  const loadQuotes = async (page: number = currentPage, search: string = searchQuery, status: string = activeTab) => {
    const startTime = performance.now(); // 📊 DÉBUT MESURE
    try {
      setLoading(true);
      console.log("🚀 Devis: Chargement OPTIMISÉ des devis", { page, search, status, pageSize });
      
      // Construire les filtres pour l'API
      const filters: QuoteFiltersType = {
        page: page,
        page_size: pageSize,
      };
      
      // Ajouter le filtre de statut seulement si ce n'est pas "all"
      if (status && status !== "all") {
        filters.status = status;
      }
      
      // Ajouter la recherche si présente
      if (search && search.trim()) {
        filters.search = search.trim();
      }

      // Utiliser notre nouvelle API optimisée
      const response = await quotesApi.getQuotes(filters);
      console.log("📊 Devis: Réponse paginée reçue", response);
      
      // Mettre à jour les données et la pagination
      setQuotes(response.results);
      setPagination(response.pagination);
      setCurrentPage(response.pagination.current_page);
      setError(null);
      
      const endTime = performance.now(); // 📊 FIN MESURE
      const loadTime = endTime - startTime;
      console.log(`✅ ${response.results.length} devis chargés sur ${response.pagination.count} total`);
      console.log(`⚡ PERFORMANCE: Chargement terminé en ${loadTime.toFixed(2)}ms`);
    } catch (err) {
      const endTime = performance.now(); // 📊 FIN MESURE (même en cas d'erreur)
      const loadTime = endTime - startTime;
      setError("Erreur lors du chargement des devis");
      console.error("🚨 Devis: Erreur critique", err);
      console.log(`❌ PERFORMANCE: Échec après ${loadTime.toFixed(2)}ms`);
      toast.error("Erreur lors du chargement des devis");
      // En cas d'erreur, réinitialiser
      setQuotes([]);
      setPagination({
        count: 0,
        num_pages: 0,
        current_page: 1,
        page_size: pageSize,
        has_next: false,
        has_previous: false,
        next_page: null,
        previous_page: null
      });
    } finally {
      setLoading(false);
    }
  };

  // 📊 FONCTION pour charger les vraies stats globales (style tiers)
  const loadGlobalStats = async (search: string = searchQuery) => {
    const startTime = performance.now(); // 📊 DÉBUT MESURE STATS
    try {
      console.log("📊 Chargement des stats globales devis", { search });
      const statsData = await quotesApi.getStats(search);
      setStats(statsData);
      
      const endTime = performance.now(); // 📊 FIN MESURE STATS
      const loadTime = endTime - startTime;
      console.log("✅ Stats globales devis chargées:", statsData);
      console.log(`⚡ PERFORMANCE STATS: Chargées en ${loadTime.toFixed(2)}ms`);
    } catch (err) {
      const endTime = performance.now(); // 📊 FIN MESURE STATS (erreur)
      const loadTime = endTime - startTime;
      console.error("🚨 Erreur lors du chargement des stats globales devis:", err);
      console.log(`❌ PERFORMANCE STATS: Échec après ${loadTime.toFixed(2)}ms`);
      // Garder les stats précédentes en cas d'erreur
    }
  };

  // 🔄 GESTIONNAIRES POUR LES CHANGEMENTS (style tiers)
  const handleTabChange = (newTab: string) => {
    console.log("🔄 Changement d'onglet devis:", newTab);
    setActiveTab(newTab);
    setCurrentPage(1); // Remettre à la première page
    loadQuotes(1, searchQuery, newTab); // Recharger avec le nouveau filtre
    // Note: Les stats ne changent pas selon l'onglet (elles montrent le total global)
  };

  const handleSearchChange = (newSearch: string) => {
    console.log("🔍 Changement de recherche devis:", newSearch);
    setSearchQuery(newSearch);
    setCurrentPage(1); // Remettre à la première page
    // Le débounce est géré par useEffect, pas ici
  };

  const handlePageChange = (newPage: number) => {
    console.log("📄 Changement de page devis:", newPage);
    setCurrentPage(newPage);
    loadQuotes(newPage, searchQuery, activeTab);
    // Pas besoin de recharger les stats pour un changement de page
  };

  // Handler pour changement de taille de page
  const handlePageSizeChange = (newSize: number) => {
    console.log("📏 Changement de taille de page devis:", newSize);
    setPageSize(newSize);
    setCurrentPage(1);
    loadQuotes(1, searchQuery, activeTab);
  };

  // 🚀 Charger les devis ET les stats au montage du composant
  useEffect(() => {
    loadQuotes(1, "", "all"); // Charger la première page, sans recherche, tous les statuts
    loadGlobalStats(""); // Charger les stats globales
  }, []);

  // 🔄 Débounce pour la recherche (éviter trop d'appels API)
  useEffect(() => {
    if (searchQuery !== undefined) { // Vérifier !== undefined pour inclure les chaînes vides
      const timeoutId = setTimeout(() => {
        loadQuotes(1, searchQuery, activeTab);
        loadGlobalStats(searchQuery); // Recharger les stats avec la recherche
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

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
        // Recharger avec les paramètres actuels ET les stats
        await Promise.all([
          loadQuotes(currentPage, searchQuery, activeTab),
          loadGlobalStats(searchQuery)
        ]);
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
      // Recharger avec les paramètres actuels ET les stats
      await Promise.all([
        loadQuotes(currentPage, searchQuery, activeTab),
        loadGlobalStats(searchQuery)
      ]);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur lors de l'envoi du devis");
    }
  };

  const handleAcceptQuote = async (quote: Quote) => {
    try {
      await quotesApi.markAsAccepted(quote.id);
      toast.success("Devis accepté avec succès");
      // Recharger avec les paramètres actuels ET les stats
      await Promise.all([
        loadQuotes(currentPage, searchQuery, activeTab),
        loadGlobalStats(searchQuery)
      ]);
    } catch (error) {
      console.error("Erreur lors de l'acceptation:", error);
      toast.error("Erreur lors de l'acceptation du devis");
    }
  };

  const handleRejectQuote = async (quote: Quote) => {
    try {
      await quotesApi.markAsRejected(quote.id);
      toast.success("Devis refusé");
      
      // Recharger les données du devis pour vérifier s'il est lié à une opportunité
      const updatedQuote = await quotesApi.getQuote(quote.id);
      
      // Recharger avec les paramètres actuels ET les stats
      await Promise.all([
        loadQuotes(currentPage, searchQuery, activeTab),
        loadGlobalStats(searchQuery)
      ]);
      
      // Si le devis est associé à une opportunité, naviguer vers la page des opportunités
      if (updatedQuote.opportunity_id) {
        // Définir un indicateur dans sessionStorage pour indiquer que l'on vient de rejeter un devis
        sessionStorage.setItem('quoteRejected', 'true');
        
        // Attendre un court moment pour que l'API ait le temps de mettre à jour l'opportunité
        setTimeout(() => {
          navigate("/opportunities");
          toast.success("L'opportunité associée a été marquée comme perdue");
        }, 500);
      }
    } catch (error) {
      console.error("Erreur lors du refus:", error);
      toast.error("Erreur lors du refus du devis");
    }
  };

  const handleDuplicateQuote = async (quote: Quote) => {
    try {
      await quotesApi.duplicateQuote(quote.id, {});
      toast.success("Devis dupliqué avec succès");
      // Recharger avec les paramètres actuels ET les stats
      await Promise.all([
        loadQuotes(currentPage, searchQuery, activeTab),
        loadGlobalStats(searchQuery)
      ]);
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
        onSearchChange={handleSearchChange}
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
          onTabChange={handleTabChange} 
          counts={countByStatus}
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
            // 🚀 PAGINATION OPTIMISÉE
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </QuoteTabs>
      </div>

      {/* 📊 Performance Monitor */}
      <PerformanceMonitor enabled={true} position="bottom-right" />
    </div>
  );
} 