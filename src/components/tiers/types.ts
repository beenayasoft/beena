import { z } from "zod";

// Type pour un tiers
export type Tier = {
  id: string;
  name: string;
  type: string[];
  contact: string;
  email: string;
  phone: string;
  address: string;
  siret: string;
  status: string;
};

// Types de tiers disponibles
export const tierTypes = [
  { id: "client", label: "Client" },
  { id: "fournisseur", label: "Fournisseur" },
  { id: "sous-traitant", label: "Sous-traitant" },
  { id: "prospect", label: "Prospect" },
  { id: "particulier", label: "Particulier" },
];

export type EntityType = "entreprise" | "particulier";

// Schéma de base pour le formulaire de tiers
const baseTierFormSchema = z.object({
  // Informations générales
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  types: z.array(z.string()).min(1, "Sélectionnez au moins un type"),
  status: z.enum(["active", "inactive"]),
  entityType: z.enum(["entreprise", "particulier"]),
  
  // Contact (divisé en prénom et nom)
  contactPrenom: z.string().optional(),
  contactNom: z.string().min(1, "Le nom du contact est obligatoire"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  fonction: z.string().optional(),
  
  // Adresse (divisée en rue, code postal, ville)
  adresseRue: z.string().min(2, "La rue doit contenir au moins 2 caractères"),
  adresseCodePostal: z.string().min(5, "Le code postal doit contenir au moins 5 caractères"),
  adresseVille: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
  pays: z.string().optional(),
  
  // SIRET optionnel par défaut
  siret: z.string().optional(),
  
  // Champs reconstitués pour compatibilité (définis au moment de l'envoi)
  contact: z.string().optional(),
  address: z.string().optional(),
});

// Schéma de validation conditionnel selon le type d'entité
export const tierFormSchema = baseTierFormSchema.refine(
  (data) => {
    // Pour une entreprise, le SIRET est obligatoire
    if (data.entityType === "entreprise") {
      return data.siret && data.siret.length > 0;
    }
    return true;
  },
  {
    message: "Le SIRET est obligatoire pour une entreprise",
    path: ["siret"],
  }
).refine(
  (data) => {
    // Pour un particulier, le prénom est plus pertinent
    if (data.entityType === "particulier") {
      return data.contactPrenom && data.contactPrenom.length > 0;
    }
    return true;
  },
  {
    message: "Le prénom est obligatoire pour un particulier",
    path: ["contactPrenom"],
  }
);

// Type pour le formulaire de tiers
export type TierFormValues = z.infer<typeof tierFormSchema>;

// Fonction utilitaire pour obtenir les champs obligatoires selon le type
export const getRequiredFieldsByType = (entityType: EntityType) => {
  const base = ["name", "types", "contactNom", "email", "phone", "adresseRue", "adresseCodePostal", "adresseVille"];
  
  if (entityType === "entreprise") {
    return [...base, "siret"];
  } else {
    return [...base, "contactPrenom"];
  }
};

// Fonction utilitaire pour obtenir les champs visibles selon le type
export const getVisibleFieldsByType = (entityType: EntityType) => {
  const base = ["name", "types", "status", "contactNom", "email", "phone", "adresseRue", "adresseCodePostal", "adresseVille", "pays"];
  
  if (entityType === "entreprise") {
    return [...base, "siret", "fonction"];
  } else {
    return [...base, "contactPrenom"];
  }
};

// Fonction utilitaire pour valider la cohérence des données selon le type
export const validateFormDataConsistency = (
  values: TierFormValues, 
  entityType: EntityType
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validation pour entreprise
  if (entityType === 'entreprise') {
    if (!values.siret || values.siret.trim().length === 0) {
      errors.push('Le SIRET est obligatoire pour une entreprise');
    }
  }
  
  // Validation pour particulier
  if (entityType === 'particulier') {
    if (!values.contactPrenom || values.contactPrenom.trim().length === 0) {
      errors.push('Le prénom est obligatoire pour un particulier');
    }
  }
  
  // Validations communes
  if (!values.name || values.name.trim().length === 0) {
    errors.push('Le nom est obligatoire');
  }
  
  if (!values.contactNom || values.contactNom.trim().length === 0) {
    errors.push('Le nom du contact est obligatoire');
  }
  
  if (!values.email || values.email.trim().length === 0) {
    errors.push('L\'email est obligatoire');
  }
  
  if (!values.phone || values.phone.trim().length === 0) {
    errors.push('Le téléphone est obligatoire');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Données initiales pour les tiers (mock)
export const initialTiers: Tier[] = [
  {
    id: "1",
    name: "Dupont Construction",
    type: ["client", "fournisseur"],
    contact: "Jean Dupont",
    email: "contact@dupontconstruction.fr",
    phone: "06 12 34 56 78",
    address: "15 rue des Bâtisseurs, 75001 Paris",
    siret: "123 456 789 00012",
    status: "active",
  },
  {
    id: "2",
    name: "Architectes Associés",
    type: ["prospect"],
    contact: "Marie Lambert",
    email: "m.lambert@architectes-associes.fr",
    phone: "07 23 45 67 89",
    address: "8 avenue des Arts, 75008 Paris",
    siret: "234 567 891 00023",
    status: "active",
  },
  {
    id: "3",
    name: "Matériaux Express",
    type: ["fournisseur"],
    contact: "Pierre Martin",
    email: "p.martin@materiaux-express.fr",
    phone: "06 34 56 78 90",
    address: "42 rue de l'Industrie, 93100 Montreuil",
    siret: "345 678 912 00034",
    status: "active",
  },
  {
    id: "4",
    name: "Résidences Modernes",
    type: ["client", "prospect"],
    contact: "Sophie Dubois",
    email: "s.dubois@residences-modernes.fr",
    phone: "07 45 67 89 01",
    address: "27 boulevard Haussmann, 75009 Paris",
    siret: "456 789 123 00045",
    status: "inactive",
  },
  {
    id: "5",
    name: "Plomberie Générale",
    type: ["sous-traitant"],
    contact: "Lucas Bernard",
    email: "l.bernard@plomberie-generale.fr",
    phone: "06 56 78 90 12",
    address: "3 rue des Artisans, 94200 Ivry-sur-Seine",
    siret: "567 891 234 00056",
    status: "active",
  },
]; 