import { useState, useEffect } from "react";
import { X, AlertCircle, Search, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditorQuoteItem } from "@/lib/api/quotes";
import { formatCurrency } from "@/lib/utils";
import { Work, Material, Labor } from "@/lib/types/workLibrary";
import { libraryApi } from "@/lib/api/library";
import { toast } from "sonner";

// Interface pour la version complète avec Dialog
interface QuoteItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: EditorQuoteItem) => void;
  item?: Partial<EditorQuoteItem>;
  isEditing?: boolean;
}

// Interface pour la version sans Dialog (pour l'intégration directe)
interface QuoteItemFormInlineProps {
  onSave: (item: EditorQuoteItem) => void;
  onCancel: () => void;
  initialData?: Partial<EditorQuoteItem>;
}

// Composant de contenu partagé entre les deux versions du formulaire
interface QuoteItemFormContentProps {
  formData: Partial<EditorQuoteItem>;
  errors: Record<string, string>;
  handleInputChange: (field: string, value: string | number) => void;
  isEditing: boolean;
  showLibrary: boolean;
  setShowLibrary: (show: boolean) => void;
  libraryLoading: boolean;
  loadLibraryItems: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getFilteredLibraryItems: () => (Work | Material | Labor)[];
  getItemType: (item: Work | Material | Labor) => string;
  handleSelectLibraryItem: (item: Work | Material | Labor) => void;
  selectedLibraryItem: Work | Material | Labor | null;
  setSelectedLibraryItem: (item: Work | Material | Labor | null) => void;
  libraryItems: (Work | Material | Labor)[];
}

// Version complète avec son propre Dialog
export function QuoteItemForm({
  open,
  onOpenChange,
  onSubmit,
  item,
  isEditing = false,
}: QuoteItemFormProps) {
  const [formData, setFormData] = useState<Partial<EditorQuoteItem>>(
    item || {
    designation: "",
    description: "",
    unit: "unité",
    quantity: 1,
    unitPrice: 0,
    vat_rate: "20",
    discount: 0,
    type: "product",
    margin: 20,
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<Work | Material | Labor | null>(null);
  
  // Charger les données de la bibliothèque
  const [libraryItems, setLibraryItems] = useState<(Work | Material | Labor)[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  
  // Charger la bibliothèque depuis l'API
  const loadLibraryItems = async () => {
    try {
      setLibraryLoading(true);
      const allItems = await libraryApi.getAllLibraryItems();
      setLibraryItems(allItems);
    } catch (error) {
      console.error("Erreur lors du chargement de la bibliothèque:", error);
      toast.error("Erreur lors du chargement de la bibliothèque");
    } finally {
      setLibraryLoading(false);
    }
  };
  
  useEffect(() => {
    // Charger la bibliothèque seulement quand la modale s'ouvre et qu'on affiche la bibliothèque
    if (open && showLibrary && libraryItems.length === 0) {
      loadLibraryItems();
    }
  }, [open, showLibrary]);
  
  // Réinitialiser le formulaire quand la modale s'ouvre
  useEffect(() => {
    if (open) {
      if (item && isEditing) {
        setFormData({
          ...item,
        });
      } else {
        setFormData({
          designation: "",
          description: "",
          unit: "unité",
          quantity: 1,
          unitPrice: 0,
          vat_rate: "20",
          discount: 0,
          type: "product",
          margin: 20,
        });
      }
      setErrors({});
      setShowLibrary(false);
      setSearchQuery("");
      setSelectedLibraryItem(null);
    }
  }, [open, item, isEditing]);
  
  // Calculer les totaux lorsque les valeurs changent (avec protection NaN)
  useEffect(() => {
    if (formData.quantity !== undefined && formData.unitPrice !== undefined && formData.vat_rate !== undefined) {
      const quantity = Number(formData.quantity) || 0;
      const unitPrice = Number(formData.unitPrice) || 0;
      const vatRate = parseFloat(formData.vat_rate) || 0;
      const discount = Number(formData.discount) || 0;
      
      // 🛡️ VÉRIFICATION : S'assurer qu'aucune valeur n'est NaN
      if (isNaN(quantity) || isNaN(unitPrice) || isNaN(vatRate) || isNaN(discount)) {
        console.warn('🚨 Valeur NaN détectée dans les calculs, utilisation de 0');
        return;
      }
      
      // Calculer le prix après remise
      const discountedUnitPrice = unitPrice * (1 - discount / 100);
      
      // Calculer les totaux
      const totalHt = quantity * discountedUnitPrice;
      const totalTtc = totalHt * (1 + vatRate / 100);
      
      // ✅ VÉRIFICATION FINALE avant sauvegarde
      if (!isNaN(totalHt) && !isNaN(totalTtc)) {
        setFormData(prev => ({
          ...prev,
          totalHt,
          totalTtc,
        }));
      }
    }
  }, [formData.quantity, formData.unitPrice, formData.vat_rate, formData.discount]);
  
  // Gérer les changements de champs avec protection contre NaN
  const handleInputChange = (field: string, value: string | number) => {
    // 🛡️ PROTECTION CONTRE NaN pour les champs numériques
    let safeValue = value;
    if (typeof value === 'number' && isNaN(value)) {
      safeValue = 0; // Valeur par défaut sécurisée au lieu de NaN
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: safeValue,
    }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };
  
  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.designation) {
      newErrors.designation = "La désignation est requise";
    }
    
    if (formData.quantity === undefined || formData.quantity <= 0) {
      newErrors.quantity = "La quantité doit être supérieure à 0";
    }
    
    if (formData.unitPrice === undefined) {
      newErrors.unitPrice = "Le prix unitaire est requis";
    }
    
    if (formData.vat_rate === undefined) {
      newErrors.vat_rate = "Le taux de TVA est requis";
    }
    
    if (formData.discount !== undefined && (formData.discount < 0 || formData.discount > 100)) {
      newErrors.discount = "La remise doit être entre 0 et 100%";
    }
    
    if (formData.margin !== undefined && (formData.margin < 0 || formData.margin > 100)) {
      newErrors.margin = "La marge doit être entre 0 et 100%";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Soumettre le formulaire
  const handleSubmit = () => {
    if (validateForm()) {
      const newItem: EditorQuoteItem = {
        id: item?.id || `item-${Date.now()}`,
        type: formData.type as "product" | "service" | "work" | "chapter" | "section",
        position: item?.position || 0,
        designation: formData.designation || "",
        description: formData.description || "",
        unit: formData.unit || "unité",
        quantity: formData.quantity || 0,
        unitPrice: formData.unitPrice || 0,
        discount: formData.discount || 0,
        vat_rate: formData.vat_rate || "20",
        margin: formData.margin,
        totalHt: formData.totalHt || 0,
        totalTtc: formData.totalTtc || 0,
        work_id: formData.work_id,
        parent: formData.parent,
      };
      
      onSubmit(newItem);
      onOpenChange(false);
    }
  };
  
  // Sélectionner un élément de la bibliothèque
  const handleSelectLibraryItem = (libraryItem: Work | Material | Labor) => {
    setSelectedLibraryItem(libraryItem);
    
    let itemType: "product" | "service" | "work" = "product";
    let unitPrice = 0;
    let margin = 20;
    
    if ("components" in libraryItem) {
      // C'est un ouvrage
      itemType = "work";
      unitPrice = libraryItem.recommendedPrice;
      margin = libraryItem.margin;
    } else if ("vatRate" in libraryItem) {
      // C'est un matériau
      itemType = "product";
      unitPrice = libraryItem.unitPrice;
    } else {
      // C'est de la main d'œuvre
      itemType = "service";
      unitPrice = libraryItem.unitPrice;
    }
    
    setFormData(prev => ({
      ...prev,
      designation: libraryItem.name,
      description: libraryItem.description || "",
      unit: libraryItem.unit,
      unitPrice,
      type: itemType,
      margin,
      workId: "components" in libraryItem ? libraryItem.id : undefined,
    }));
    
    setShowLibrary(false);
  };
  
  // Filtrer les éléments de la bibliothèque
  const getFilteredLibraryItems = () => {
    if (!searchQuery) return libraryItems;
    
    const query = searchQuery.toLowerCase();
    return libraryItems.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(query);
      const descMatch = item.description?.toLowerCase().includes(query) || false;
      const refMatch = "reference" in item && item.reference ? item.reference.toLowerCase().includes(query) : false;
      return nameMatch || descMatch || refMatch;
    });
  };
  
  // Obtenir le type d'un élément de la bibliothèque
  const getItemType = (item: Work | Material | Labor): string => {
    if ("components" in item) return "Ouvrage";
    if ("vatRate" in item) return "Matériau";
    return "Main d'œuvre";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Modifier l'élément" : "Ajouter un élément"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifiez les informations de cet élément" 
              : "Ajoutez un nouvel élément au devis"
            }
          </DialogDescription>
        </DialogHeader>

        <QuoteItemFormContent 
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
          isEditing={isEditing}
          showLibrary={showLibrary}
          setShowLibrary={setShowLibrary}
          libraryLoading={libraryLoading}
          loadLibraryItems={loadLibraryItems}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          getFilteredLibraryItems={getFilteredLibraryItems}
          getItemType={getItemType}
          handleSelectLibraryItem={handleSelectLibraryItem}
          selectedLibraryItem={selectedLibraryItem}
          setSelectedLibraryItem={setSelectedLibraryItem}
          libraryItems={libraryItems}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {isEditing ? "Mettre à jour" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Version inline pour l'intégration directe dans d'autres composants
export function QuoteItemFormInline({
  onSave,
  onCancel,
  initialData
}: QuoteItemFormInlineProps) {
  const [formData, setFormData] = useState<Partial<EditorQuoteItem>>(
    initialData || {
      designation: "",
      description: "",
      unit: "unité",
      quantity: 1,
      unitPrice: 0,
      vat_rate: "20",
      discount: 0,
      type: "product",
      margin: 20,
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<Work | Material | Labor | null>(null);
  
  // Charger les données de la bibliothèque
  const [libraryItems, setLibraryItems] = useState<(Work | Material | Labor)[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  
  // Charger la bibliothèque depuis l'API
  const loadLibraryItems = async () => {
    try {
      setLibraryLoading(true);
      const allItems = await libraryApi.getAllLibraryItems();
      setLibraryItems(allItems);
    } catch (error) {
      console.error("Erreur lors du chargement de la bibliothèque:", error);
      toast.error("Erreur lors du chargement de la bibliothèque");
    } finally {
      setLibraryLoading(false);
    }
  };
  
  // Calculer les totaux lorsque les valeurs changent (avec protection NaN)
  useEffect(() => {
    if (formData.quantity !== undefined && formData.unitPrice !== undefined && formData.vat_rate !== undefined) {
      const quantity = Number(formData.quantity) || 0;
      const unitPrice = Number(formData.unitPrice) || 0;
      const vatRate = parseFloat(formData.vat_rate) || 0;
      const discount = Number(formData.discount) || 0;
      
      // 🛡️ VÉRIFICATION : S'assurer qu'aucune valeur n'est NaN
      if (isNaN(quantity) || isNaN(unitPrice) || isNaN(vatRate) || isNaN(discount)) {
        console.warn('🚨 Valeur NaN détectée dans les calculs, utilisation de 0');
        return;
      }
      
      // Calculer le prix après remise
      const discountedUnitPrice = unitPrice * (1 - discount / 100);
      
      // Calculer les totaux
      const totalHt = quantity * discountedUnitPrice;
      const totalTtc = totalHt * (1 + vatRate / 100);
      
      // ✅ VÉRIFICATION FINALE avant sauvegarde
      if (!isNaN(totalHt) && !isNaN(totalTtc)) {
        setFormData(prev => ({
          ...prev,
          totalHt,
          totalTtc,
        }));
      }
    }
  }, [formData.quantity, formData.unitPrice, formData.vat_rate, formData.discount]);
  
  // Gérer les changements de champs avec protection contre NaN
  const handleInputChange = (field: string, value: string | number) => {
    // 🛡️ PROTECTION CONTRE NaN pour les champs numériques
    let safeValue = value;
    if (typeof value === 'number' && isNaN(value)) {
      safeValue = 0; // Valeur par défaut sécurisée au lieu de NaN
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: safeValue,
    }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };
  
  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.designation) {
      newErrors.designation = "La désignation est requise";
    }
    
    if (formData.quantity === undefined || formData.quantity <= 0) {
      newErrors.quantity = "La quantité doit être supérieure à 0";
    }
    
    if (formData.unitPrice === undefined) {
      newErrors.unitPrice = "Le prix unitaire est requis";
    }
    
    if (formData.vat_rate === undefined) {
      newErrors.vat_rate = "Le taux de TVA est requis";
    }
    
    if (formData.discount !== undefined && (formData.discount < 0 || formData.discount > 100)) {
      newErrors.discount = "La remise doit être entre 0 et 100%";
    }
    
    if (formData.margin !== undefined && (formData.margin < 0 || formData.margin > 100)) {
      newErrors.margin = "La marge doit être entre 0 et 100%";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Soumettre le formulaire
  const handleSubmit = () => {
    if (validateForm()) {
      const newItem: EditorQuoteItem = {
        id: initialData?.id || `item-${Date.now()}`,
        type: formData.type as "product" | "service" | "work" | "chapter" | "section",
        position: initialData?.position || 0,
        designation: formData.designation || "",
        description: formData.description || "",
        unit: formData.unit || "unité",
        quantity: formData.quantity || 0,
        unitPrice: formData.unitPrice || 0,
        discount: formData.discount || 0,
        vat_rate: formData.vat_rate || "20",
        margin: formData.margin,
        totalHt: formData.totalHt || 0,
        totalTtc: formData.totalTtc || 0,
        work_id: formData.work_id,
        parent: formData.parent,
      };
      
      onSave(newItem);
    }
  };
  
  // Sélectionner un élément de la bibliothèque
  const handleSelectLibraryItem = (libraryItem: Work | Material | Labor) => {
    setSelectedLibraryItem(libraryItem);
    
    let itemType: "product" | "service" | "work" = "product";
    let unitPrice = 0;
    let margin = 20;
    
    if ("components" in libraryItem) {
      // C'est un ouvrage
      itemType = "work";
      unitPrice = libraryItem.recommendedPrice;
      margin = libraryItem.margin;
    } else if ("vatRate" in libraryItem) {
      // C'est un matériau
      itemType = "product";
      unitPrice = libraryItem.unitPrice;
    } else {
      // C'est de la main d'œuvre
      itemType = "service";
      unitPrice = libraryItem.unitPrice;
    }
    
    setFormData(prev => ({
      ...prev,
      designation: libraryItem.name,
      description: libraryItem.description || "",
      unit: libraryItem.unit,
      unitPrice,
      type: itemType,
      margin,
      workId: "components" in libraryItem ? libraryItem.id : undefined,
    }));
    
    setShowLibrary(false);
  };
  
  // Filtrer les éléments de la bibliothèque
  const getFilteredLibraryItems = () => {
    if (!searchQuery) return libraryItems;
    
    const query = searchQuery.toLowerCase();
    return libraryItems.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(query);
      const descMatch = item.description?.toLowerCase().includes(query) || false;
      const refMatch = "reference" in item && item.reference ? item.reference.toLowerCase().includes(query) : false;
      return nameMatch || descMatch || refMatch;
    });
  };
  
  // Obtenir le type d'un élément de la bibliothèque
  const getItemType = (item: Work | Material | Labor): string => {
    if ("components" in item) return "Ouvrage";
    if ("vatRate" in item) return "Matériau";
    return "Main d'œuvre";
  };

  return (
    <div>
      <QuoteItemFormContent 
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
        isEditing={!!initialData}
        showLibrary={showLibrary}
        setShowLibrary={setShowLibrary}
        libraryLoading={libraryLoading}
        loadLibraryItems={loadLibraryItems}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        getFilteredLibraryItems={getFilteredLibraryItems}
        getItemType={getItemType}
        handleSelectLibraryItem={handleSelectLibraryItem}
        selectedLibraryItem={selectedLibraryItem}
        setSelectedLibraryItem={setSelectedLibraryItem}
        libraryItems={libraryItems}
      />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="button" onClick={handleSubmit}>
          {initialData ? "Mettre à jour" : "Ajouter"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function QuoteItemFormContent({
  formData,
  errors,
  handleInputChange,
  isEditing,
  showLibrary,
  setShowLibrary,
  libraryLoading,
  loadLibraryItems,
  searchQuery,
  setSearchQuery,
  getFilteredLibraryItems,
  getItemType,
  handleSelectLibraryItem,
  selectedLibraryItem,
  setSelectedLibraryItem,
  libraryItems
}: QuoteItemFormContentProps) {
  return (
        <div className="space-y-6 py-4">
          {/* Sélection depuis la bibliothèque */}
          {!isEditing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sélectionner depuis la bibliothèque (optionnel)</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const newShowLibrary = !showLibrary;
                    setShowLibrary(newShowLibrary);
                    // Charger la bibliothèque si on l'affiche et qu'elle n'est pas encore chargée
                    if (newShowLibrary && libraryItems.length === 0) {
                      loadLibraryItems();
                    }
                  }}
                  disabled={libraryLoading}
                >
                  {libraryLoading ? "Chargement..." : showLibrary ? "Masquer" : "Afficher"} la bibliothèque
                </Button>
              </div>
              
              {showLibrary && (
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      placeholder="Rechercher dans la bibliothèque..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 benaya-input"
                    />
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {libraryLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-benaya-600 mx-auto mb-2"></div>
                        <p className="text-neutral-500 text-sm">Chargement de la bibliothèque...</p>
                      </div>
                    ) : getFilteredLibraryItems().length === 0 ? (
                      <p className="text-center text-neutral-500 py-4">
                        {libraryItems.length === 0 ? "Aucun élément dans la bibliothèque" : "Aucun résultat trouvé"}
                      </p>
                    ) : (
                      getFilteredLibraryItems().map((item, index) => (
                        <div
                          key={`${getItemType(item).toLowerCase()}-${item.id}-${index}`}
                          className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                          onClick={() => handleSelectLibraryItem(item)}
                        >
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                              <span>{getItemType(item)}</span>
                              <span>•</span>
                              <span>{item.unit}</span>
                              <span>•</span>
                              <span>
                                {formatCurrency("recommendedPrice" in item ? item.recommendedPrice : item.unitPrice)} MAD
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {selectedLibraryItem && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-800 dark:text-blue-200">
                        {selectedLibraryItem.name}
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        Élément sélectionné depuis la bibliothèque
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedLibraryItem(null)}
                      className="text-blue-800 dark:text-blue-200 hover:text-blue-900 hover:bg-blue-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Informations de base */}
          <div className="space-y-4">
        <h3 className="text-lg font-medium">Informations de base</h3>
        
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designation" className={errors.designation ? "text-red-500" : ""}>
                  Désignation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="designation"
              value={formData.designation || ""}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  className={`benaya-input ${errors.designation ? "border-red-500" : ""}`}
              placeholder="Ex: Installation électrique"
                />
                {errors.designation && (
              <p className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.designation}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
            <Label htmlFor="type">
              Type d'élément
            </Label>
                <Select 
              value={formData.type || "product"}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger className="benaya-input">
                <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Produit</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="work">Ouvrage</SelectItem>
                <SelectItem value="chapter">Chapitre</SelectItem>
                <SelectItem value="section">Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
          <Label htmlFor="description">
            Description
          </Label>
              <Textarea
                id="description"
            value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="benaya-input resize-none"
            placeholder="Description détaillée de l'élément"
                rows={3}
              />
            </div>
          </div>

      {/* Quantité et prix */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Quantité et prix</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className={errors.quantity ? "text-red-500" : ""}>
                Quantité <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
              value={formData.quantity || ""}
              onChange={(e) => handleInputChange("quantity", parseFloat(e.target.value))}
                className={`benaya-input ${errors.quantity ? "border-red-500" : ""}`}
              placeholder="1"
              />
              {errors.quantity && (
              <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.quantity}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
            <Label htmlFor="unit">
              Unité
            </Label>
              <Select 
              value={formData.unit || "unité"}
                onValueChange={(value) => handleInputChange("unit", value)}
              >
                <SelectTrigger className="benaya-input">
                <SelectValue placeholder="Sélectionner une unité" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="unité">Unité</SelectItem>
                <SelectItem value="m">Mètre (m)</SelectItem>
                <SelectItem value="m²">Mètre carré (m²)</SelectItem>
                <SelectItem value="m³">Mètre cube (m³)</SelectItem>
                <SelectItem value="kg">Kilogramme (kg)</SelectItem>
                <SelectItem value="h">Heure (h)</SelectItem>
                <SelectItem value="jour">Jour</SelectItem>
                <SelectItem value="forfait">Forfait</SelectItem>
                <SelectItem value="lot">Lot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitPrice" className={errors.unitPrice ? "text-red-500" : ""}>
                Prix unitaire (MAD) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
              value={formData.unitPrice || ""}
              onChange={(e) => handleInputChange("unitPrice", parseFloat(e.target.value))}
                className={`benaya-input ${errors.unitPrice ? "border-red-500" : ""}`}
              placeholder="0.00"
              />
              {errors.unitPrice && (
              <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.unitPrice}
                </p>
              )}
          </div>
            </div>
            
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vat_rate" className={errors.vat_rate ? "text-red-500" : ""}>
                TVA (%) <span className="text-red-500">*</span>
              </Label>
              <Select 
              value={formData.vat_rate || "20"}
                onValueChange={(value) => handleInputChange("vat_rate", value)}
              >
                <SelectTrigger className={`benaya-input ${errors.vat_rate ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Sélectionner un taux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5.5">5.5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
              {errors.vat_rate && (
              <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.vat_rate}
                </p>
              )}
          </div>

            <div className="space-y-2">
              <Label htmlFor="discount" className={errors.discount ? "text-red-500" : ""}>
                Remise (%)
              </Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
              value={formData.discount || ""}
              onChange={(e) => handleInputChange("discount", parseFloat(e.target.value))}
                className={`benaya-input ${errors.discount ? "border-red-500" : ""}`}
              placeholder="0"
              />
              {errors.discount && (
              <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.discount}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="margin" className={errors.margin ? "text-red-500" : ""}>
                Marge (%)
              </Label>
              <Input
                id="margin"
                type="number"
                min="0"
                max="100"
              value={formData.margin || ""}
              onChange={(e) => handleInputChange("margin", parseFloat(e.target.value))}
                className={`benaya-input ${errors.margin ? "border-red-500" : ""}`}
              placeholder="20"
              />
              {errors.margin && (
              <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.margin}
                </p>
              )}
          </div>
            </div>
          </div>

          {/* Totaux calculés */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Total HT</div>
            <div className="font-semibold">{formatCurrency(formData.totalHt || 0)} MAD</div>
            </div>
          <div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Total TTC</div>
            <div className="font-semibold">{formatCurrency(formData.totalTtc || 0)} MAD</div>
          </div>
        </div>
      </div>
    </div>
  );
}