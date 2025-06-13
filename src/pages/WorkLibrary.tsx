import { useState, useEffect } from "react";
import {
  Plus,
  Settings,
  Search,
  Filter,
  BarChart3,
  Package,
  Hammer,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { LibraryItemsList, LibraryFilters } from "@/components/quotes/library/LibraryItemsList";
import { LibraryItemForm } from "@/components/quotes/library/LibraryItemForm";
import { WorkCompositionForm } from "@/components/quotes/library/WorkCompositionForm";
import { LibraryItemDetail } from "@/components/quotes/library/LibraryItemDetail";
import { Work, Material, Labor } from "@/lib/types/workLibrary";
import { mockMaterials, mockLabor, mockWorks } from "@/lib/mock/workLibrary";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

// Fonction pour supprimer les doublons par ID
function removeDuplicatesById<T extends { id: string; name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) {
      console.warn(`Duplicate ID found and removed: ${item.id} - ${item.name}`);
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

export default function WorkLibrary() {
  // État pour les données - avec suppression des doublons
  const [materials, setMaterials] = useState<Material[]>(removeDuplicatesById(mockMaterials));
  const [labor, setLabor] = useState<Labor[]>(removeDuplicatesById(mockLabor));
  const [works, setWorks] = useState<Work[]>(removeDuplicatesById(mockWorks));

  // Vérifier les données au chargement initial
  useEffect(() => {
    console.log("Materials:", materials.length, "items");
    console.log("Labor:", labor.length, "items");
    console.log("Works:", works.length, "items");
    
    // Vérifier les types des éléments
    const invalidMaterials = materials.filter(mat => !("vatRate" in mat));
    if (invalidMaterials.length > 0) {
      console.error("Invalid materials (missing vatRate):", invalidMaterials);
    }
    
    const invalidLabor = labor.filter(lab => "vatRate" in lab as any);
    if (invalidLabor.length > 0) {
      console.error("Invalid labor (has vatRate):", invalidLabor);
    }
    
    // Vérifier que les tableaux ne contiennent pas de doublons
    const materialIds = new Set();
    const duplicateMaterials = materials.filter(mat => {
      if (materialIds.has(mat.id)) return true;
      materialIds.add(mat.id);
      return false;
    });
    if (duplicateMaterials.length > 0) {
      console.error("Duplicate materials:", duplicateMaterials);
    }
    
    const laborIds = new Set();
    const duplicateLabor = labor.filter(lab => {
      if (laborIds.has(lab.id)) return true;
      laborIds.add(lab.id);
      return false;
    });
    if (duplicateLabor.length > 0) {
      console.error("Duplicate labor:", duplicateLabor);
    }
  }, []);

  // État pour la pagination et le filtrage
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "material" | "labor" | "work">("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // État pour les dialogues
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [currentItemType, setCurrentItemType] = useState<"material" | "labor" | "work">("material");
  const [selectedItem, setSelectedItem] = useState<Work | Material | Labor | null>(null);

  // Filtrer et trier les éléments
  const filteredItems = () => {
    let items: (Work | Material | Labor)[] = [];

    console.log("Applying tab filter:", activeTab);

    // Appliquer le filtre d'onglet
    if (activeTab === "all") {
      items = [...materials, ...labor, ...works];
    } else if (activeTab === "material") {
      items = materials.filter(item => "vatRate" in item);
    } else if (activeTab === "labor") {
      items = labor.filter(item => !("vatRate" in item) && !("components" in item));
    } else if (activeTab === "work") {
      items = works.filter(item => "components" in item);
    }

    console.log("Filtered by tab:", activeTab, "Count:", items.length);

    // Appliquer la recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const descMatch = item.description?.toLowerCase().includes(query) || false;
        const refMatch = "reference" in item && item.reference ? item.reference.toLowerCase().includes(query) : false;
        return nameMatch || descMatch || refMatch;
      });
    }

    // Appliquer le tri
    items.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      // Déterminer les valeurs à comparer en fonction du champ de tri
      if (sortField === "unitPrice" || sortField === "recommendedPrice") {
        valueA = "recommendedPrice" in a ? a.recommendedPrice : a.unitPrice;
        valueB = "recommendedPrice" in b ? b.recommendedPrice : b.unitPrice;
      } else if (sortField === "reference") {
        valueA = "reference" in a ? a.reference || "" : "";
        valueB = "reference" in b ? b.reference || "" : "";
      } else {
        valueA = (a as any)[sortField] || "";
        valueB = (b as any)[sortField] || "";
      }

      // Comparer les valeurs
      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    return items;
  };

  const paginatedItems = () => {
    const items = filteredItems();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedResult = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    return paginatedResult;
  };

  // Gestionnaires d'événements
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Réinitialiser la pagination lors d'une nouvelle recherche
  };

  const handleTabChange = (tab: "all" | "material" | "labor" | "work") => {
    setActiveTab(tab);
    setCurrentPage(1); // Réinitialiser la pagination lors de la modification de l'onglet
  };

  const handleSort = (field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemClick = (item: Work | Material | Labor) => {
    setSelectedItem(item);
    
    if ("components" in item) {
      setCurrentItemType("work");
    } else if ("vatRate" in item) {
      setCurrentItemType("material");
    } else {
      setCurrentItemType("labor");
    }
    
    setShowItemDetail(true);
  };

  const handleAddItem = (type: "material" | "labor" | "work") => {
    setSelectedItem(null);
    setCurrentItemType(type);
    
    if (type === "work") {
      setShowWorkForm(true);
    } else {
      setShowItemForm(true);
    }
  };

  const handleEditItem = () => {
    if (!selectedItem) return;
    
    setShowItemDetail(false);
    
    if ("components" in selectedItem) {
      setShowWorkForm(true);
    } else {
      setShowItemForm(true);
    }
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;
    
    if ("components" in selectedItem) {
      setWorks(works.filter(w => w.id !== selectedItem.id));
    } else if ("vatRate" in selectedItem) {
      setMaterials(materials.filter(m => m.id !== selectedItem.id));
    } else {
      setLabor(labor.filter(l => l.id !== selectedItem.id));
    }
    
    setShowItemDetail(false);
    setSelectedItem(null);
  };

  const handleSaveItem = (item: Material | Labor | Work) => {
    if ("components" in item) {
      // C'est un ouvrage
      const workItem = item as Work;
      const existingIndex = works.findIndex(w => w.id === workItem.id);
      
      if (existingIndex >= 0) {
        // Mise à jour
        const updatedWorks = [...works];
        updatedWorks[existingIndex] = workItem;
        setWorks(updatedWorks);
      } else {
        // Ajout
        setWorks([...works, workItem]);
      }
      
      setShowWorkForm(false);
    } else if ("vatRate" in item) {
      // C'est un matériau
      const materialItem = item as Material;
      const existingIndex = materials.findIndex(m => m.id === materialItem.id);
      
      if (existingIndex >= 0) {
        // Mise à jour
        const updatedMaterials = [...materials];
        updatedMaterials[existingIndex] = materialItem;
        setMaterials(updatedMaterials);
      } else {
        // Ajout
        setMaterials([...materials, materialItem]);
      }
      
      setShowItemForm(false);
    } else {
      // C'est de la main d'œuvre
      const laborItem = item as Labor;
      const existingIndex = labor.findIndex(l => l.id === laborItem.id);
      
      if (existingIndex >= 0) {
        // Mise à jour
        const updatedLabor = [...labor];
        updatedLabor[existingIndex] = laborItem;
        setLabor(updatedLabor);
      } else {
        // Ajout
        setLabor([...labor, laborItem]);
      }
      
      setShowItemForm(false);
    }
    
    setSelectedItem(null);
  };

  // Fonctions pour les statistiques
  const getTotalItems = () => {
    return materials.length + labor.length + works.length;
  };

  const getTotalValue = () => {
    const materialsValue = materials.reduce((sum, item) => sum + item.unitPrice, 0);
    const laborValue = labor.reduce((sum, item) => sum + item.unitPrice, 0);
    const worksValue = works.reduce((sum, item) => sum + item.recommendedPrice, 0);
    return materialsValue + laborValue + worksValue;
  };

  const getRecentlyUpdated = () => {
    // Dans un cas réel, on utiliserait une date pour trier
    // Ici on retourne simplement un nombre fixe pour la maquette
    return 3;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bibliothèque d'ouvrages</h1>
            <p className="text-benaya-100 mt-1">
              Gérez vos ouvrages, matériaux et main d'œuvre
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <BarChart3 className="w-4 h-4" />
              Rapport
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-white text-benaya-900 hover:bg-white/90">
                  <Plus className="w-4 h-4" />
                  Ajouter un élément
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un élément</DialogTitle>
                  <DialogDescription>
                    Sélectionnez le type d'élément à ajouter
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4 py-4">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => handleAddItem("material")}
                  >
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <span>Matériau</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => handleAddItem("labor")}
                  >
                    <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span>Main d'œuvre</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => handleAddItem("work")}
                  >
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <Hammer className="w-5 h-5" />
                    </div>
                    <span>Ouvrage</span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
            {getTotalItems()}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Éléments total
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-green-600">
            {getTotalValue().toLocaleString("fr-FR")} MAD
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Valeur catalogue
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-amber-600">
            {getRecentlyUpdated()}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Mis à jour récemment
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
                placeholder="Rechercher un élément..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                className="pl-10 benaya-input"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="benaya-card">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <LibraryItemsList
              items={paginatedItems()}
              onSearch={handleSearch}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onSort={handleSort}
              onPageChange={handlePageChange}
              totalItems={filteredItems().length}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              showFilters={showAdvancedFilters}
              onToggleFilters={(show) => setShowAdvancedFilters(show)}
              allMaterials={materials}
              allLabor={labor}
              allWorks={works}
            />
          </div>
        </div>
      </div>

      {/* Dialogue de détail d'un élément */}
      <Dialog open={showItemDetail} onOpenChange={setShowItemDetail}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <LibraryItemDetail
              item={selectedItem}
              availableMaterials={materials}
              availableLabor={labor}
              availableWorks={works}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue de formulaire pour matériau/main d'œuvre */}
      <Dialog open={showItemForm} onOpenChange={setShowItemForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <LibraryItemForm
            item={selectedItem as Material | Labor}
            type={currentItemType as "material" | "labor"}
            onSave={handleSaveItem}
            onCancel={() => setShowItemForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogue de formulaire pour ouvrage */}
      <Dialog open={showWorkForm} onOpenChange={setShowWorkForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <WorkCompositionForm
            work={selectedItem as Work}
            availableMaterials={materials}
            availableLabor={labor}
            availableWorks={works.filter(w => !selectedItem || w.id !== selectedItem.id)} // Éviter les références circulaires
            onSave={handleSaveItem}
            onCancel={() => setShowWorkForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 