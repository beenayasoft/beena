import { useState } from "react";
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
  initialTiers
} from "@/components/tiers";

export default function Tiers() {
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const [activeTab, setActiveTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | undefined>(undefined);

  const { countTiersByType, filterTiers, generateTabs } = useTierUtils();

  // Compter les tiers par type
  const countByType = countTiersByType(tiers);

  // Générer les onglets avec les compteurs
  const tabs = generateTabs(countByType);

  // Filtrer les tiers en fonction de l'onglet actif et de la recherche
  const filteredTiers = filterTiers(tiers, activeTab, searchQuery);

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
      setEditingTier(undefined);
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
  };

  // Gérer la suppression d'un tiers
  const handleDelete = (tier: Tier) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${tier.name} ?`)) {
      setTiers(tiers.filter((t) => t.id !== tier.id));
    }
  };

  // Gérer l'édition d'un tiers
  const handleEdit = (tier: Tier) => {
    setEditingTier(tier);
    setDialogOpen(true);
  };

  // Gérer l'appel téléphonique
  const handleCall = (tier: Tier) => {
    window.open(`tel:${tier.phone.replace(/\s/g, "")}`);
  };

  // Gérer l'envoi d'email
  const handleEmail = (tier: Tier) => {
    window.open(`mailto:${tier.email}`);
  };

  // Gérer la vue détaillée d'un tiers
  const handleView = (tier: Tier) => {
    // Implémentation future : afficher une vue détaillée du tiers
    alert(`Vue détaillée de ${tier.name} à implémenter`);
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
              setDialogOpen(true);
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
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        tier={editingTier}
        isEditing={!!editingTier}
      />
    </div>
  );
} 