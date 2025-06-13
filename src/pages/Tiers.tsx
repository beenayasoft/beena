import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  TierDialog,
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

export default function Tiers() {
  const navigate = useNavigate();
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const [activeTab, setActiveTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tierToDelete, setTierToDelete] = useState<Tier | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0); // État pour forcer le rafraîchissement

  const { countTiersByType, filterTiers, generateTabs } = useTierUtils();

  // Compter les tiers par type
  const countByType = countTiersByType(tiers);

  // Générer les onglets avec les compteurs
  const tabs = generateTabs(countByType);

  // Filtrer les tiers en fonction de l'onglet actif et de la recherche
  const filteredTiers = filterTiers(tiers, activeTab, searchQuery);

  // Forcer le rafraîchissement de la page après les actions
  useEffect(() => {
    // Ce useEffect sera déclenché chaque fois que forceUpdate change
    // Il ne fait rien directement, mais force React à re-rendre le composant
  }, [forceUpdate]);

  // Gérer la soumission du formulaire d'ajout/édition
  const handleSubmit = (values: TierFormValues) => {
    if (editingTier) {
      // Mode édition
      const updatedTiers = tiers.map((tier) => {
        if (tier.id === editingTier.id) {
          return {
            ...tier,
            name: values.name,
            type: values.types,
            contact: values.contact,
            email: values.email,
            phone: values.phone,
            address: values.address,
            siret: values.siret || "",
            status: values.status,
          };
        }
        return tier;
      });
      setTiers(updatedTiers);
    } else {
      // Mode création
      const newTier: Tier = {
        id: (tiers.length + 1).toString(),
        name: values.name,
        type: values.types,
        contact: values.contact,
        email: values.email,
        phone: values.phone,
        address: values.address,
        siret: values.siret || "",
        status: values.status,
      };
      setTiers([...tiers, newTier]);
    }
    
    // Fermer la modale
    setDialogOpen(false);
    // Réinitialiser l'état d'édition
    setTimeout(() => {
      setEditingTier(undefined);
      // Forcer le rafraîchissement
      setForceUpdate(prev => prev + 1);
    }, 100);
  };

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
    setTimeout(() => {
      setDeleteDialogOpen(true);
    }, 50);
  };

  // Confirmer la suppression d'un tiers
  const confirmDelete = () => {
    if (tierToDelete) {
      setTiers(tiers.filter((t) => t.id !== tierToDelete.id));
    }
    // Fermer la modale et réinitialiser l'état
    setDeleteDialogOpen(false);
    setTimeout(() => {
      setTierToDelete(null);
      // Forcer le rafraîchissement
      setForceUpdate(prev => prev + 1);
    }, 100);
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
              Gérez vos clients, fournisseurs, partenaires et sous-traitants
            </p>
          </div>
          <Button 
            className="gap-2 bg-white text-benaya-900 hover:bg-white/90"
            onClick={() => {
              setEditingTier(undefined);
              setTimeout(() => {
                setDialogOpen(true);
              }, 50);
            }}
          >
            <Plus className="w-4 h-4" />
            Nouveau tiers
          </Button>
        </div>
      </div>

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
        onSubmit={handleSubmit}
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