import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  TiersList,
  TiersStats,
  TiersSearch,
  TiersTabs,
  useTierUtils,
  Tier,
  TierFormValues,
  initialTiers,
  DeleteConfirmDialog
} from "@/components/tiers";
import { TierDialog } from "@/components/tiers/TierDialog";
import { tiersApi } from "@/lib/api/tiers";
import { TierCreateFlow } from "@/components/tiers/TierCreateFlow";

export default function Tiers() {
  const navigate = useNavigate();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tierToDelete, setTierToDelete] = useState<Tier | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0); // État pour forcer le rafraîchissement
  const [createOpen, setCreateOpen] = useState(false); // Pour le workflow de création

  const { countTiersByType, filterTiers, generateTabs } = useTierUtils();

  // Compter les tiers par type
  const countByType = countTiersByType(tiers);

  // Générer les onglets avec les compteurs
  const tabs = generateTabs(countByType);

  // Filtrer les tiers en fonction de l'onglet actif et de la recherche
  const filteredTiers = filterTiers(tiers, activeTab, searchQuery);

  // Fonction pour charger les tiers depuis l'API
  const loadTiers = async () => {
    try {
      setLoading(true);
      console.log("Tiers.tsx: Chargement des tiers...");
      
      // Utiliser l'endpoint spécialement conçu pour le frontend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tiers/tiers/frontend_format/`, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      const data = await response.json();
      console.log("Tiers.tsx: Données reçues de l'API frontend_format", data);
      
      // Les données sont peut-être dans results si c'est paginé
      const tiersData = data.results || data;
      
      if (!tiersData || !Array.isArray(tiersData) || tiersData.length === 0) {
        console.log("Tiers.tsx: Aucun tier trouvé");
        setTiers([]);
        return;
      }
      
      // Adapter les données pour la nouvelle structure avec relation -> type
      const adaptedTiers = tiersData.map((tier: any) => ({
        ...tier,
        type: tier.relation ? [tier.relation] : tier.type || [] // Convertir relation string vers type array
      }));
      
      setTiers(adaptedTiers);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des tiers");
      console.error("Tiers.tsx: Erreur critique", err);
    } finally {
      setLoading(false);
    }
  };

  // Forcer le rafraîchissement de la page après les actions
  useEffect(() => {
    // Ce useEffect sera déclenché chaque fois que forceUpdate change
    // Il ne fait rien directement, mais force React à re-rendre le composant
  }, [forceUpdate]);

  // Charger les tiers au montage du composant
  useEffect(() => {
    loadTiers();
  }, []);

  // Gérer la soumission du formulaire d'ajout/édition


  // Gérer la fermeture de la modale d'édition
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Fermer la modale
      setDialogOpen(false);
      // Attendre que l'animation de fermeture soit terminée avant de réinitialiser
      setTimeout(() => {
        setEditingTier(undefined);
        // Forcer le rafraîchissement
        setForceUpdate(prev => prev + 1);
      }, 100);
    } else {
      setDialogOpen(true);
    }
  };

  // Gérer la suppression d'un tiers
  const handleDelete = (tier: Tier) => {
    setTierToDelete({...tier});
    setDeleteDialogOpen(true);
  };

  // Confirmer la suppression d'un tiers
  const confirmDelete = async () => {
    if (tierToDelete) {
      try {
        setLoading(true);
        await tiersApi.deleteTier(tierToDelete.id);
        setTiers(prev => prev.filter(t => t.id !== tierToDelete.id));
        setDeleteDialogOpen(false);
        setTierToDelete(null);
      } catch (err) {
        setError("Erreur lors de la suppression du tier");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Gérer la fermeture de la modale de suppression
  const handleDeleteDialogClose = (open: boolean) => {
    if (!open) {
      setDeleteDialogOpen(false);
      // Attendre que l'animation de fermeture soit terminée avant de réinitialiser
      setTimeout(() => {
        setTierToDelete(null);
        // Forcer le rafraîchissement
        setForceUpdate(prev => prev + 1);
      }, 100);
    } else {
      setDeleteDialogOpen(true);
    }
  };

  // Gérer l'édition d'un tiers
  const handleEdit = (tier: Tier) => {
    // Définir d'abord le tier à éditer avec une copie profonde
    setEditingTier({...tier});
    // Attendre que le state soit mis à jour avant d'ouvrir la modale
    setTimeout(() => {
      setDialogOpen(true);
    }, 50);
  };

  // Gérer la vue détaillée d'un tiers
  const handleView = (tier: Tier) => {
    navigate(`/tiers/${tier.id}`);
  };

  // Gérer l'appel téléphonique (conservé pour référence)
  const handleCall = (tier: Tier) => {
    window.open(`tel:${tier.phone.replace(/\s/g, "")}`);
  };

  // Gérer l'envoi d'email (conservé pour référence)
  const handleEmail = (tier: Tier) => {
    window.open(`mailto:${tier.email}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Tiers</h1>
            <p className="text-benaya-100 mt-1">
              Gérez vos clients, fournisseurs, prospects et sous-traitants
            </p>
          </div>
          <Button 
            className="gap-2 bg-white text-benaya-900 hover:bg-white/90"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Nouveau tiers
          </Button>
        </div>
      </div>

      {/* Modale de création de tiers (workflow) */}
      <TierCreateFlow
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          // Recharger la liste des tiers après création
          loadTiers();
        }}
      />

      {/* Stats */}
      <TiersStats counts={countByType} />

      {/* Filters */}
      <TiersSearch 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />

      {/* Main Content */}
      <div className="benaya-card">
        {/* Tabs */}
        <TiersTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Table */}
        <TiersList 
          tiers={filteredTiers}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCall={handleCall}
          onEmail={handleEmail}
        />
      </div>

      {/* Dialog for adding/editing tiers */}
      <TierDialog
        key={`dialog-${editingTier?.id || 'new'}-${forceUpdate}`}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={() => {
          // Recharger la liste des tiers après modification
          loadTiers();
        }}
        tier={editingTier}
        isEditing={!!editingTier}
      />

      {/* Confirmation dialog for deleting tiers */}
      <DeleteConfirmDialog
        key={`delete-${tierToDelete?.id || 'none'}-${forceUpdate}`}
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
        onConfirm={confirmDelete}
        tier={tierToDelete}
      />
    </div>
  );
} 