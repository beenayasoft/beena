import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  User,
  Briefcase,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Mock data pour les tiers
const tiers = [
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

const tabs = [
  { id: "tous", label: "Tous", count: tiers.length },
  { id: "clients", label: "Clients", count: 2 },
  { id: "fournisseurs", label: "Fournisseurs", count: 2 },
  { id: "partenaires", label: "Partenaires", count: 1 },
  { id: "sous-traitants", label: "Sous-traitants", count: 1 },
  { id: "prospects", label: "Prospects", count: 1 },
];

export default function Tiers() {
  const [activeTab, setActiveTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");

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
          <Button className="gap-2 bg-white text-benaya-900 hover:bg-white/90">
            <Plus className="w-4 h-4" />
            Nouveau tiers
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
            {tiers.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Total tiers
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-blue-600">2</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Clients
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-amber-600">2</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Fournisseurs
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-green-600">1</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Partenaires
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-purple-600">1</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Sous-traitants
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="benaya-card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Rechercher un tiers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 benaya-input"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="benaya-card">
        {/* Tabs */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:inline-flex">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <Table className="benaya-table">
            <TableHeader>
              <TableRow>
                <TableHead>NOM</TableHead>
                <TableHead>TYPE</TableHead>
                <TableHead>CONTACT</TableHead>
                <TableHead>EMAIL</TableHead>
                <TableHead>TÉLÉPHONE</TableHead>
                <TableHead>SIRET</TableHead>
                <TableHead>STATUT</TableHead>
                <TableHead className="w-[100px]">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell className="font-medium">{tier.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tier.type.map((t) => (
                        <div key={t}>{getTypeBadge(t)}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{tier.contact}</TableCell>
                  <TableCell>{tier.email}</TableCell>
                  <TableCell>{tier.phone}</TableCell>
                  <TableCell>{tier.siret}</TableCell>
                  <TableCell>{getStatusBadge(tier.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="benaya-glass">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Appeler
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Envoyer un email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
} 