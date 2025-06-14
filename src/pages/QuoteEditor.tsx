import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save,
  Download, 
  Eye,
  Printer,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  User,
  Building,
  Calendar,
  CreditCard,
  Pencil,
  Check,
  X,
  MoveVertical,
  ChevronDown,
  ChevronRight,
  Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Quote, QuoteItem, VATRate, QuoteStatus } from "@/lib/types/quote";
import { getQuoteById } from "@/lib/mock/quotes";
import { initialTiers } from "@/components/tiers";
import { formatCurrency } from "@/lib/utils";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DraggableQuoteItem } from "@/components/quotes/editor/DraggableQuoteItem";
import { QuoteItemForm } from "@/components/quotes/editor/QuoteItemForm";
import { SectionForm } from "@/components/quotes/editor/SectionForm";
import { DiscountForm } from "@/components/quotes/editor/DiscountForm";

export default function QuoteEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewQuote = id === "new";
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(!isNewQuote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showTaxIncluded, setShowTaxIncluded] = useState(true);

  // Modals
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [sectionFormOpen, setSectionFormOpen] = useState(false);
  const [discountFormOpen, setDiscountFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null);

  // Quote state
  const [quote, setQuote] = useState<Partial<Quote>>({
    clientId: "",
    clientName: "",
    clientAddress: "",
    projectId: "",
    projectName: "",
    projectAddress: "",
    issueDate: new Date().toISOString().split("T")[0],
    validityPeriod: 30,
    items: [],
    notes: "",
    termsAndConditions: "Acompte de 30% à la signature. Solde à la fin des travaux.",
    totalHT: 0,
    totalVAT: 0,
    totalTTC: 0,
    status: "draft" as QuoteStatus,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load quote data if editing
  useEffect(() => {
    if (!isNewQuote && id) {
      try {
        const quoteData = getQuoteById(id);
        if (quoteData) {
          setQuote(quoteData);
        } else {
          setError("Devis non trouvé");
        }
      } catch (err) {
        setError("Erreur lors du chargement du devis");
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [id, isNewQuote]);

  // Mark form as dirty when changes are made
  useEffect(() => {
    if (!loading) {
      setIsDirty(true);
    }
  }, [quote, loading]);

  // Recalculate totals when items change
  useEffect(() => {
    if (quote.items && quote.items.length > 0) {
      // Calculate totals
      let totalHT = 0;
      let totalVAT = 0;
      
      quote.items.forEach(item => {
        if (item.type !== 'chapter' && item.type !== 'section') {
          totalHT += item.totalHT;
          totalVAT += item.totalHT * (item.vatRate / 100);
        }
      });
      
      const totalTTC = totalHT + totalVAT;
      
      setQuote(prev => ({
        ...prev,
        totalHT,
        totalVAT,
        totalTTC,
      }));
    } else {
      setQuote(prev => ({
        ...prev,
        totalHT: 0,
        totalVAT: 0,
        totalTTC: 0,
      }));
    }
  }, [quote.items]);

  // Calculate expiry date when issue date or validity period changes
  useEffect(() => {
    if (quote.issueDate && quote.validityPeriod) {
      const issueDate = new Date(quote.issueDate);
      const expiryDate = new Date(issueDate);
      expiryDate.setDate(issueDate.getDate() + quote.validityPeriod);
      
      setQuote(prev => ({
        ...prev,
        expiryDate: expiryDate.toISOString().split("T")[0],
      }));
    }
  }, [quote.issueDate, quote.validityPeriod]);

  // Clients and projects data
  const clients = initialTiers;
  const projects = [
    { id: '1', name: 'Villa Moderne', address: '123 Rue de la Paix, Casablanca', clientId: '1' },
    { id: '2', name: 'Rénovation appartement', address: '45 Avenue Hassan II, Rabat', clientId: '2' },
    { id: '3', name: 'Extension maison', address: '78 Boulevard Zerktouni, Marrakech', clientId: '3' },
    { id: '4', name: 'Rénovation cuisine', address: '25 Boulevard Central, 33000 Bordeaux', clientId: '4' },
  ];

  // Update client selection
  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      setQuote(prev => ({
        ...prev,
        clientId,
        clientName: selectedClient.name,
        clientAddress: selectedClient.address,
      }));
      setErrors(prev => ({ ...prev, clientId: "" }));
      
      // Check if there's a project for this client
      const clientProjects = projects.filter(p => p.clientId === clientId);
      if (clientProjects.length === 1) {
        // If only one project, select it automatically
        handleProjectChange(clientProjects[0].id);
      } else if (quote.projectId) {
        // Check if current project belongs to this client
        const currentProject = projects.find(p => p.id === quote.projectId);
        if (currentProject && currentProject.clientId !== clientId) {
          // Reset project if it doesn't belong to the client
          setQuote(prev => ({
            ...prev,
            projectId: "",
            projectName: "",
            projectAddress: "",
          }));
        }
      }
    }
  };

  // Update project selection
  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects.find(project => project.id === projectId);
    if (selectedProject) {
      setQuote(prev => ({
        ...prev,
        projectId,
        projectName: selectedProject.name,
        projectAddress: selectedProject.address,
      }));
      
      // If client is not already selected, select the project's client
      if (!quote.clientId) {
        const projectClient = clients.find(client => client.id === selectedProject.clientId);
        if (projectClient) {
          setQuote(prev => ({
            ...prev,
            clientId: projectClient.id,
            clientName: projectClient.name,
            clientAddress: projectClient.address,
          }));
          setErrors(prev => ({ ...prev, clientId: "" }));
        }
      }
    }
  };

  // Update dates and terms
  const handleInputChange = (field: string, value: string | number) => {
    setQuote(prev => ({
      ...prev,
      [field]: value,
    }));
    
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // Add a new item to the quote
  const handleAddItem = (item: QuoteItem) => {
    // Set position to the end of the list
    item.position = (quote.items?.length || 0) + 1;
    
    const updatedItems = [...(quote.items || []), item];
    
    setQuote(prev => ({
      ...prev,
      items: updatedItems,
    }));
    
    setErrors(prev => ({ ...prev, items: "" }));
  };

  // Update an existing item
  const handleUpdateItem = (updatedItem: QuoteItem) => {
    if (!quote.items) return;
    
    const updatedItems = quote.items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    setQuote(prev => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Remove an item from the quote
  const handleRemoveItem = (itemId: string) => {
    if (!quote.items) return;
    
    const updatedItems = quote.items.filter(item => item.id !== itemId);
    
    // Update positions
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
    
    setQuote(prev => ({
      ...prev,
      items: reorderedItems,
    }));
  };

  // Handle drag end event for reordering items
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setQuote(prev => {
        const items = prev.items || [];
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        // Update positions after reordering
        const reorderedItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          position: index + 1,
        }));
        
        return {
          ...prev,
          items: reorderedItems,
        };
      });
    }
  };

  // Open item form for editing
  const handleEditItem = (item: QuoteItem) => {
    setEditingItem(item);
    
    if (item.type === 'chapter' || item.type === 'section') {
      setSectionFormOpen(true);
    } else if (item.type === 'discount') {
      setDiscountFormOpen(true);
    } else {
      setItemFormOpen(true);
    }
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!quote.clientId) {
      newErrors.clientId = "Le client est requis";
    }
    
    if (!quote.issueDate) {
      newErrors.issueDate = "La date d'émission est requise";
    }
    
    if (!(quote.items && quote.items.length > 0)) {
      newErrors.items = "Au moins un élément est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save the quote
  const handleSave = async () => {
    if (validateForm()) {
      setSaving(true);
      try {
        // In a real app, this would be an API call
        console.log("Saving quote:", quote);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate back to quote list
        navigate("/devis");
      } catch (err) {
        console.error("Error saving quote:", err);
        setError("Erreur lors de l'enregistrement du devis");
      } finally {
        setSaving(false);
      }
    }
  };

  // Validate and send the quote
  const handleValidateAndSend = async () => {
    if (validateForm()) {
      setSaving(true);
      try {
        // In a real app, this would be an API call
        console.log("Validating and sending quote:", quote);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate back to quote list
        navigate("/devis");
      } catch (err) {
        console.error("Error validating quote:", err);
        setError("Erreur lors de la validation du devis");
      } finally {
        setSaving(false);
      }
    }
  };

  // Open preview in a new tab/window
  const handleOpenPreview = () => {
    // Store the current quote data in sessionStorage
    sessionStorage.setItem('previewQuote', JSON.stringify(quote));
    
    // Open the preview page
    navigate(`/devis/preview/${quote.id || 'preview'}`);
  };

  // Add a global discount
  const handleAddGlobalDiscount = (discountItem: QuoteItem) => {
    // Add the discount item to the end of the list
    handleAddItem(discountItem);
  };

  // Get filtered projects based on selected client
  const getFilteredProjects = () => {
    if (!quote.clientId) return projects;
    return projects.filter(project => project.clientId === quote.clientId);
  };

  // Get section items for hierarchical display
  const getSectionItems = (parentId?: string) => {
    if (!quote.items) return [];
    return quote.items.filter(item => item.parentId === parentId);
  };

  // Get root level items (no parent)
  const getRootItems = () => {
    if (!quote.items) return [];
    return quote.items.filter(item => !item.parentId);
  };

  // Calculate section total
  const getSectionTotal = (sectionId: string) => {
    if (!quote.items) return { totalHT: 0, totalTTC: 0 };
    
    let totalHT = 0;
    let totalTTC = 0;
    
    // Get all items in this section
    const sectionItems = quote.items.filter(item => item.parentId === sectionId);
    
    // Sum up the totals
    sectionItems.forEach(item => {
      if (item.type !== 'chapter' && item.type !== 'section') {
        totalHT += item.totalHT;
        totalTTC += item.totalTTC;
      }
    });
    
    return { totalHT, totalTTC };
  };

  // Toggle tax included/excluded view
  const handleToggleTaxIncluded = () => {
    setShowTaxIncluded(!showTaxIncluded);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-benaya-600 mx-auto"></div>
          <p className="mt-4">Chargement du devis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">{error}</h2>
          <Button onClick={() => navigate("/devis")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  // Render hierarchical items
  const renderItems = (items: QuoteItem[], level = 0) => {
    return items.map((item) => {
      // For chapters and sections, render with their children
      if (item.type === 'chapter' || item.type === 'section') {
        const { totalHT, totalTTC } = getSectionTotal(item.id);
        const childItems = getSectionItems(item.id);
        const hasChildren = childItems.length > 0;
        
        return (
          <React.Fragment key={item.id}>
            <TableRow className="bg-neutral-50 dark:bg-neutral-800/50">
              <TableCell 
                colSpan={showTaxIncluded ? 6 : 5} 
                className="font-semibold"
                style={{ paddingLeft: `${level * 20 + 16}px` }}
              >
                <div className="flex items-center">
                  {hasChildren ? (
                    <ChevronDown className="w-4 h-4 mr-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-2" />
                  )}
                  {item.designation}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(totalHT)} MAD
              </TableCell>
              {showTaxIncluded && (
                <TableCell className="text-right font-semibold">
                  {formatCurrency(totalTTC)} MAD
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditItem(item)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            
            {/* Render child items */}
            {hasChildren && renderItems(childItems, level + 1)}
          </React.Fragment>
        );
      }
      
      // For regular items
      return (
        <DraggableQuoteItem 
          key={item.id} 
          item={item} 
          onRemove={handleRemoveItem}
          onEdit={() => handleEditItem(item)}
          indentLevel={level}
          showTaxIncluded={showTaxIncluded}
        />
      );
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 hover:bg-white/20"
              onClick={() => navigate("/devis")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {isNewQuote ? "Nouveau devis" : quote.number}
                </h1>
                {!isNewQuote && (
                  <Badge className="benaya-badge-neutral gap-1 bg-white/20 text-white border-white/30">
                    Brouillon
                  </Badge>
                )}
              </div>
              <p className="text-benaya-100 mt-1">
                {isNewQuote 
                  ? "Créez un nouveau devis" 
                  : `Client: ${quote.clientName} ${quote.projectName ? `- Projet: ${quote.projectName}` : ""}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={handleOpenPreview}
            >
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={handleSave}
              disabled={saving || !isDirty}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
            
            <Button 
              className="bg-white text-benaya-900 hover:bg-white/90"
              onClick={handleValidateAndSend}
              disabled={saving}
            >
              <Send className="w-4 h-4 mr-2" />
              Valider et envoyer
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="details">
              <FileText className="w-4 h-4 mr-2" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="items">
              <FileText className="w-4 h-4 mr-2" />
              Éléments
            </TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Client and Project */}
            <div className="benaya-card">
              <h3 className="font-medium text-lg mb-4">Informations client et projet</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client" className={errors.clientId ? "text-red-500" : ""}>
                      Client <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={quote.clientId} 
                      onValueChange={handleClientChange}
                    >
                      <SelectTrigger className={`benaya-input ${errors.clientId ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.clientId && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.clientId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientAddress">Adresse client</Label>
                    <Textarea
                      id="clientAddress"
                      value={quote.clientAddress}
                      onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                      className="benaya-input resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Projet (optionnel)</Label>
                    <Select 
                      value={quote.projectId} 
                      onValueChange={handleProjectChange}
                    >
                      <SelectTrigger className="benaya-input">
                        <SelectValue placeholder="Sélectionner un projet" />
                      </SelectTrigger>
                      <SelectContent>
                        {getFilteredProjects().map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectAddress">Adresse du projet</Label>
                    <Textarea
                      id="projectAddress"
                      value={quote.projectAddress}
                      onChange={(e) => handleInputChange("projectAddress", e.target.value)}
                      className="benaya-input resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dates and Terms */}
            <div className="benaya-card">
              <h3 className="font-medium text-lg mb-4">Dates et conditions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="issueDate" className={errors.issueDate ? "text-red-500" : ""}>
                    Date d'émission <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={quote.issueDate}
                    onChange={(e) => handleInputChange("issueDate", e.target.value)}
                    className={`benaya-input ${errors.issueDate ? "border-red-500" : ""}`}
                  />
                  {errors.issueDate && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.issueDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validityPeriod">Durée de validité (jours)</Label>
                  <Select 
                    value={quote.validityPeriod?.toString()} 
                    onValueChange={(value) => handleInputChange("validityPeriod", parseInt(value))}
                  >
                    <SelectTrigger className="benaya-input">
                      <SelectValue placeholder="Durée de validité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="45">45 jours</SelectItem>
                      <SelectItem value="60">60 jours</SelectItem>
                      <SelectItem value="90">90 jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Date d'expiration</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={quote.expiryDate}
                    className="benaya-input"
                    readOnly
                  />
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <Label htmlFor="termsAndConditions">Conditions de paiement</Label>
                <Textarea
                  id="termsAndConditions"
                  value={quote.termsAndConditions}
                  onChange={(e) => handleInputChange("termsAndConditions", e.target.value)}
                  className="benaya-input resize-none"
                  rows={3}
                  placeholder="Conditions de paiement, modalités d'exécution, etc."
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Items Tab */}
          <TabsContent value="items" className="space-y-6 mt-6">
            <div className="benaya-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-lg">Éléments du devis</h3>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">HT</span>
                    <div 
                      className="relative w-12 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full cursor-pointer"
                      onClick={handleToggleTaxIncluded}
                    >
                      <div 
                        className={`absolute top-0 w-6 h-6 bg-white dark:bg-neutral-400 rounded-full shadow-sm transition-transform ${
                          showTaxIncluded ? "right-0" : "left-0"
                        }`}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${showTaxIncluded ? "text-neutral-900 dark:text-white" : "text-neutral-600 dark:text-neutral-400"}`}>
                      TTC
                    </span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingItem(null);
                      setSectionFormOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une section
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingItem(null);
                      setItemFormOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un élément
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingItem(null);
                      setDiscountFormOpen(true);
                    }}
                  >
                    <Percent className="w-4 h-4 mr-2" />
                    Ajouter une remise
                  </Button>
                </div>
              </div>
              
              {errors.items && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.items}
                </div>
              )}
              
              {/* Existing Items */}
              {quote.items && quote.items.length > 0 ? (
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden mb-6">
                  <DndContext 
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Désignation</TableHead>
                          <TableHead>Quantité</TableHead>
                          <TableHead>Prix unitaire</TableHead>
                          <TableHead>TVA</TableHead>
                          <TableHead>Remise</TableHead>
                          <TableHead>Total HT</TableHead>
                          {showTaxIncluded && <TableHead>Total TTC</TableHead>}
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <SortableContext 
                        items={quote.items.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <TableBody>
                          {renderItems(getRootItems())}
                        </TableBody>
                      </SortableContext>
                    </Table>
                  </DndContext>
                </div>
              ) : (
                <div className="border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center mb-6">
                  <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Aucun élément ajouté
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    Ajoutez des éléments à votre devis en utilisant les boutons ci-dessus
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingItem(null);
                        setSectionFormOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une section
                    </Button>
                    <Button 
                      onClick={() => {
                        setEditingItem(null);
                        setItemFormOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un élément
                    </Button>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="flex justify-end mt-6">
                <div className="w-full md:w-1/3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total HT:</span>
                    <span className="font-medium">{formatCurrency(quote.totalHT || 0)} MAD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total TVA:</span>
                    <span className="font-medium">{formatCurrency(quote.totalVAT || 0)} MAD</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-neutral-200 dark:border-neutral-700 pt-2">
                    <span>Total TTC:</span>
                    <span>{formatCurrency(quote.totalTTC || 0)} MAD</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate("/devis")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Annuler
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleOpenPreview}
          >
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
          
          <Button 
            className="benaya-button-primary"
            onClick={handleValidateAndSend}
            disabled={saving}
          >
            <Send className="w-4 h-4 mr-2" />
            Valider et envoyer
          </Button>
        </div>
      </div>

      {/* Modals */}
      <QuoteItemForm
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
        item={editingItem || undefined}
        isEditing={!!editingItem}
      />
      
      <SectionForm
        open={sectionFormOpen}
        onOpenChange={setSectionFormOpen}
        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
        item={editingItem || undefined}
        isEditing={!!editingItem}
      />
      
      <DiscountForm
        open={discountFormOpen}
        onOpenChange={setDiscountFormOpen}
        onSubmit={editingItem ? handleUpdateItem : handleAddGlobalDiscount}
        item={editingItem || undefined}
        isEditing={!!editingItem}
        quoteTotal={quote.totalHT || 0}
      />
    </div>
  );
}