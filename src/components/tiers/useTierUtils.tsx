import { Badge } from "@/components/ui/badge";
import { Tier } from "./types";

export function useTierUtils() {
  // Générer un badge pour le type de tiers
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "client":
        return <Badge className="benaya-badge-primary">Client</Badge>;
      case "fournisseur":
        return <Badge className="benaya-badge-warning">Fournisseur</Badge>;
      case "partenaire":
        return <Badge className="benaya-badge-success">Partenaire</Badge>;
      case "sous-traitant":
        return <Badge className="benaya-badge-info">Sous-traitant</Badge>;
      case "prospect":
        return <Badge className="benaya-badge-neutral">Prospect</Badge>;
      default:
        return <Badge className="benaya-badge-neutral">—</Badge>;
    }
  };

  // Générer un badge pour le statut du tiers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="benaya-badge-success">Actif</Badge>;
      case "inactive":
        return <Badge className="benaya-badge-neutral">Inactif</Badge>;
      default:
        return <Badge className="benaya-badge-neutral">—</Badge>;
    }
  };

  // Compter les tiers par type
  const countTiersByType = (tiers: Tier[]) => {
    return {
      tous: tiers.length,
      clients: tiers.filter((t) => t.type.includes("client")).length,
      fournisseurs: tiers.filter((t) => t.type.includes("fournisseur")).length,
      partenaires: tiers.filter((t) => t.type.includes("partenaire")).length,
      "sous-traitants": tiers.filter((t) => t.type.includes("sous-traitant")).length,
      prospects: tiers.filter((t) => t.type.includes("prospect")).length,
    };
  };

  // Filtrer les tiers par type et recherche
  const filterTiers = (tiers: Tier[], activeTab: string, searchQuery: string) => {
    return tiers.filter((tier) => {
      // Filtre par onglet
      if (activeTab !== "tous" && !tier.type.includes(activeTab.slice(0, -1))) {
        return false;
      }

      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          tier.name.toLowerCase().includes(query) ||
          tier.contact.toLowerCase().includes(query) ||
          tier.email.toLowerCase().includes(query) ||
          tier.phone.toLowerCase().includes(query) ||
          tier.siret.toLowerCase().includes(query)
        );
      }

      return true;
    });
  };

  // Générer les onglets avec les compteurs
  const generateTabs = (countByType: Record<string, number>) => {
    return [
      { id: "tous", label: "Tous", count: countByType.tous },
      { id: "clients", label: "Clients", count: countByType.clients },
      { id: "fournisseurs", label: "Fournisseurs", count: countByType.fournisseurs },
      { id: "partenaires", label: "Partenaires", count: countByType.partenaires },
      { id: "sous-traitants", label: "Sous-traitants", count: countByType["sous-traitants"] },
      { id: "prospects", label: "Prospects", count: countByType.prospects },
    ];
  };

  return {
    getTypeBadge,
    getStatusBadge,
    countTiersByType,
    filterTiers,
    generateTabs,
  };
} 