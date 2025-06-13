// Types pour le module de devis

// Statuts possibles pour un devis
export type QuoteStatus = 
  | 'draft'      // Brouillon
  | 'sent'       // Envoyé
  | 'accepted'   // Accepté
  | 'rejected'   // Refusé
  | 'expired'    // Expiré
  | 'cancelled'; // Annulé

// Type de TVA
export type VATRate = 0 | 7 | 10 | 14 | 20;

// Interface pour un élément de devis (ligne)
export interface QuoteItem {
  id: string;
  type: 'product' | 'service' | 'work' | 'chapter' | 'section';
  parentId?: string; // Pour les éléments hiérarchiques
  position: number;
  reference?: string;
  designation: string;
  description?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discount?: number; // Remise en pourcentage
  vatRate: VATRate;
  margin?: number; // Marge en pourcentage
  totalHT: number;
  totalTTC: number;
  // Champs pour les ouvrages
  workId?: string;
  materials?: QuoteItemMaterial[];
  labor?: QuoteItemLabor[];
}

// Matériaux associés à un ouvrage
export interface QuoteItemMaterial {
  id: string;
  reference?: string;
  designation: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Main d'œuvre associée à un ouvrage
export interface QuoteItemLabor {
  id: string;
  designation: string;
  unit: string; // Généralement en heures
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Interface pour un devis complet
export interface Quote {
  id: string;
  number: string;
  status: QuoteStatus;
  clientId: string;
  clientName: string;
  clientAddress?: string;
  projectId?: string;
  projectName?: string;
  projectAddress?: string;
  issueDate?: string;
  expiryDate?: string;
  validityPeriod: number; // Durée de validité en jours
  items: QuoteItem[];
  notes?: string;
  termsAndConditions?: string;
  
  // Montants calculés
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Interface pour les filtres de recherche de devis
export interface QuoteFilters {
  query?: string;
  status?: QuoteStatus[];
  clientId?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'issueDate' | 'expiryDate' | 'totalTTC' | 'clientName' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Statistiques des devis
export interface QuoteStats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  cancelled: number;
  totalAmount: number;
  acceptanceRate: number;
} 