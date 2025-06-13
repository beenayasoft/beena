// Types pour la bibliothèque d'ouvrages

// Catégorie d'ouvrage
export interface WorkCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string; // Pour les sous-catégories
  position: number;
}

// Type de matériau ou produit
export interface Material {
  id: string;
  reference?: string;
  name: string;
  description?: string;
  unit: string;
  unitPrice: number;
  vatRate: number;
  supplier?: string;
  category?: string;
  // Lien avec le stock si applicable
  stockId?: string;
  stockQuantity?: number;
}

// Type de main d'œuvre
export interface Labor {
  id: string;
  name: string;
  description?: string;
  unit: string; // Généralement en heures
  unitPrice: number;
  category?: string;
}

// Composant d'un ouvrage (matériau ou main d'œuvre)
export interface WorkComponent {
  id: string;
  type: 'material' | 'labor';
  referenceId: string; // ID du matériau ou de la main d'œuvre
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Ouvrage complet
export interface Work {
  id: string;
  reference?: string;
  name: string;
  description?: string;
  categoryId: string;
  unit: string;
  // Composants
  components: WorkComponent[];
  // Prix calculés
  laborCost: number;
  materialCost: number;
  totalCost: number;
  recommendedPrice: number;
  margin: number; // Marge en pourcentage
  // Métadonnées
  createdAt: string;
  updatedAt: string;
  isCustom: boolean; // Si l'ouvrage est personnalisé ou standard
}

// Interface pour les filtres de recherche d'ouvrages
export interface WorkFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'reference' | 'totalCost' | 'recommendedPrice';
  sortOrder?: 'asc' | 'desc';
} 