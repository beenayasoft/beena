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
  { id: "partenaire", label: "Partenaire" },
  { id: "sous-traitant", label: "Sous-traitant" },
  { id: "prospect", label: "Prospect" },
];

// Schéma de validation pour le formulaire de tiers
export const tierFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  types: z.array(z.string()).min(1, "Sélectionnez au moins un type"),
  contact: z.string().min(2, "Le nom du contact doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  address: z.string().min(5, "Adresse invalide"),
  siret: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

// Type pour le formulaire de tiers
export type TierFormValues = z.infer<typeof tierFormSchema>;

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
    type: ["partenaire"],
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