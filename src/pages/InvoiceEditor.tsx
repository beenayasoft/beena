import { useState, useEffect } from "react";
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
import { Invoice, InvoiceItem, VATRate, InvoiceStatus } from "@/lib/types/invoice";
import { getInvoiceById, validateInvoice } from "@/lib/mock/invoices";
import { initialTiers } from "@/components/tiers";
import { formatCurrency } from "@/lib/utils";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DraggableInvoiceItem } from "@/components/invoices/DraggableInvoiceItem";
import { InvoiceItemForm } from "@/components/invoices/InvoiceItemForm";
import { SectionForm } from "@/components/invoices/SectionForm";
import { DiscountForm } from "@/components/invoices/DiscountForm";

export default function InvoiceEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewInvoice = id === "new";
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(!isNewInvoice);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showTaxIncluded, setShowTaxIncluded] = useState(true);

  // Modals
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [sectionFormOpen, setSectionFormOpen] = useState(false);
  const [discountFormOpen, setDiscountFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);

  // Invoice state
  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    clientId: "",
    clientName: "",
    clientAddress: "",
    projectId: "",
    projectName: "",
    projectAddress: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentTerms: 30,
    items: [],
    notes: "",
    termsAndConditions: "Paiement à 30 jours.",
    totalHT: 0,
    totalVAT: 0,
    totalTTC: 0,
    paidAmount: 0,
    remainingAmount: 0,
    payments: [],
    status: "draft" as InvoiceStatus,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load invoice data if editing
  useEffect(() => {
    if (!isNewInvoice && id) {
      try {
        const invoiceData = getInvoiceById(id);
        if (invoiceData) {
          setInvoice(invoiceData);
        } else {
          setError("Facture non trouvée");
        }
      } catch (err) {
        setError("Erreur lors du chargement de la facture");
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [id, isNewInvoice]);

  // Mark form as dirty when changes are made
  useEffect(() => {
    if (!loading) {
      setIsDirty(true);
    }
  }, [invoice, loading]);

  // Recalculate totals when items change
  useEffect(() => {
    if (invoice.items && invoice.items.length > 0) {
      // Calculate totals
      let totalHT = 0;
      let totalVAT = 0;
      
      invoice.items.forEach(item => {
        if (item.type !== 'chapter' && item.type !== 'section') {
          totalHT += item.totalHT;
          totalVAT += item.totalHT * (item.vatRate / 100);
        }
      });
      
      const totalTTC = totalHT + totalVAT;
      
      setInvoice(prev => ({
        ...prev,
        totalHT,
        totalVAT,
        totalTTC,
        remainingAmount: totalTTC,
      }));
    } else {
      setInvoice(prev => ({
        ...prev,
        totalHT: 0,
        totalVAT: 0,
        totalTTC: 0,
        remainingAmount: 0,
      }));
    }
  }, [invoice.items]);

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
      setInvoice(prev => ({
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
      } else if (invoice.projectId) {
        // Check if current project belongs to this client
        const currentProject = projects.find(p => p.id === invoice.projectId);
        if (currentProject && currentProject.clientId !== clientId) {
          // Reset project if it doesn't belong to the client
          setInvoice(prev => ({
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
      setInvoice(prev => ({
        ...prev,
        projectId,
        projectName: selectedProject.name,
        projectAddress: selectedProject.address,
      }));
      
      // If client is not already selected, select the project's client
      if (!invoice.clientId) {
        const projectClient = clients.find(client => client.id === selectedProject.clientId);
        if (projectClient) {
          setInvoice(prev => ({
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
    setInvoice(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Update due date if payment terms change
    if (field === 'paymentTerms' && typeof value === 'number') {
      const issueDate = new Date(invoice.issueDate || new Date());
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + value);
      setInvoice(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split("T")[0],
      }));
    }
    
    // Update due date if issue date changes
    if (field === 'issueDate' && typeof value === 'string') {
      const issueDate = new Date(value);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + (invoice.paymentTerms || 30));
      setInvoice(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split("T")[0],
      }));
    }
    
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // Add a new item to the invoice
  const handleAddItem = (item: InvoiceItem) => {
    // Set position to the end of the list
    item.position = (invoice.items?.length || 0) + 1;
    
    const updatedItems = [...(invoice.items || []), item];
    
    setInvoice(prev => ({
      ...prev,
      items: updatedItems,
    }));
    
    setErrors(prev => ({ ...prev, items: "" }));
  };

  // Update an existing item
  const handleUpdateItem = (updatedItem: InvoiceItem) => {
    if (!invoice.items) return;
    
    const updatedItems = invoice.items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    setInvoice(prev => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Remove an item from the invoice
  const handleRemoveItem = (itemId: string) => {
    if (!invoice.items) return;
    
    const updatedItems = invoice.items.filter(item => item.id !== itemId);
    
    // Update positions
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
    
    setInvoice(prev => ({
      ...prev,
      items: reorderedItems,
    }));
  };

  // Handle drag end event for reordering items
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setInvoice(prev => {
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
  const handleEditItem = (item: InvoiceItem) => {
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
    
    if (!invoice.clientId) {
      newErrors.clientId = "Le client est requis";
    }
    
    if (!invoice.issueDate) {
      newErrors.issueDate = "La date d'émission est requise";
    }
    
    if (!invoice.dueDate) {
      newErrors.dueDate = "La date d'échéance est requise";
    }
    
    if (!(invoice.items && invoice.items.length > 0)) {
      newErrors.items = "Au moins un élément est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save the invoice
  const handleSave = async () => {
    if (validateForm()) {
      setSaving(true);
      try {
        // In a real app, this would be an API call
        console.log("Saving invoice:", invoice);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate back to invoice list
        navigate("/factures");
      } catch (err) {
        console.error("Error saving invoice:", err);
        setError("Erreur lors de l'enregistrement de la facture");
      } finally {
        setSaving(false);
      }
    }
  };

  // Validate and send the invoice
  const handleValidateAndSend = async () => {
    if (validateForm()) {
      setSaving(true);
      try {
        // In a real app, this would be an API call
        console.log("Validating and sending invoice:", invoice);
        
        if (invoice.id) {
          const validatedInvoice = validateInvoice(invoice.id);
          if (validatedInvoice) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Navigate back to invoice list
            navigate("/factures");
          }
        }
      } catch (err) {
        console.error("Error validating invoice:", err);
        setError("Erreur lors de la validation de la facture");
      } finally {
        setSaving(false);
      }
    }
  };

  // Open preview in a new tab/window
  const handleOpenPreview = () => {
    // Store the current invoice data in sessionStorage
    sessionStorage.setItem('previewInvoice', JSON.stringify(invoice));
    
    // Open the preview page
    navigate(`/factures/preview/${invoice.id || 'preview'}`);
  };

  // Add a global discount
  const handleAddGlobalDiscount = (discountItem: InvoiceItem) => {
    // Add the discount item to the end of the list
    handleAddItem(discountItem);
  };

  // Get filtered projects based on selected client
  const getFilteredProjects = () => {
    if (!invoice.clientId) return projects;
    return projects.filter(project => project.clientId === invoice.clientId);
  };

  // Get section items for hierarchical display
  const getSectionItems = (parentId?: string) => {
    if (!invoice.items) return [];
    return invoice.items.filter(item => item.parentId === parentId);
  };

  // Get root level items (no parent)
  const getRootItems = () => {
    if (!invoice.items) return [];
    return invoice.items.filter(item => !item.parentId);
  };

  // Calculate section total
  const getSectionTotal = (sectionId: string) => {
    if (!invoice.items) return { totalHT: 0, totalTTC: 0 };
    
    let totalHT = 0;
    let totalTTC = 0;
    
    // Get all items in this section
    const sectionItems = invoice.items.filter(item => item.parentId === sectionId);
    
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
          <p className="mt-4">Chargement de la facture...</p>
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
          <Button onClick={() => navigate("/factures")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  // Render hierarchical items
  const renderItems = (items: InvoiceItem[], level = 0) => {
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
        <DraggableInvoiceItem 
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
              onClick={() => navigate("/factures")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {isNewInvoice ? "Nouvelle facture" : invoice.number}
                </h1>
                {!isNewInvoice && (
                  <Badge className="benaya-badge-neutral gap-1 bg-white/20 text-white border-white/30">
                    Brouillon
                  </Badge>
                )}
              </div>
              <p className="text-benaya-100 mt-1">
                {isNewInvoice 
                  ? "Créez une nouvelle facture" 
                  : `Client: ${invoice.clientName} ${invoice.projectName ? `- Projet: ${invoice.projectName}` : ""}`
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
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="details">
              <FileText className="w-4 h-4 mr-2" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="items">
              <FileText className="w-4 h-4 mr-2" />
              Éléments
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="w-4 h-4 mr-2" />
              Paiement
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
                      value={invoice.clientId} 
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
                      value={invoice.clientAddress}
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
                      value={invoice.projectId} 
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
                      value={invoice.projectAddress}
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
                    value={invoice.issueDate}
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
                  <Label htmlFor="paymentTerms">Délai de paiement (jours)</Label>
                  <Select 
                    value={invoice.paymentTerms?.toString()} 
                    onValueChange={(value) => handleInputChange("paymentTerms", parseInt(value))}
                  >
                    <SelectTrigger className="benaya-input">
                      <SelectValue placeholder="Délai de paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Paiement immédiat</SelectItem>
                      <SelectItem value="7">7 jours</SelectItem>
                      <SelectItem value="15">15 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="45">45 jours</SelectItem>
                      <SelectItem value="60">60 jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className={errors.dueDate ? "text-red-500" : ""}>
                    Date d'échéance <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    className={`benaya-input ${errors.dueDate ? "border-red-500" : ""}`}
                    readOnly
                  />
                  {errors.dueDate && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.dueDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Items Tab */}
          <TabsContent value="items" className="space-y-6 mt-6">
            <div className="benaya-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-lg">Éléments de la facture</h3>
                
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
              {invoice.items && invoice.items.length > 0 ? (
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
                        items={invoice.items.map(item => item.id)}
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
                    Ajoutez des éléments à votre facture en utilisant les boutons ci-dessus
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
                    <span className="font-medium">{formatCurrency(invoice.totalHT || 0)} MAD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total TVA:</span>
                    <span className="font-medium">{formatCurrency(invoice.totalVAT || 0)} MAD</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-neutral-200 dark:border-neutral-700 pt-2">
                    <span>Total TTC:</span>
                    <span>{formatCurrency(invoice.totalTTC || 0)} MAD</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6 mt-6">
            <div className="benaya-card">
              <h3 className="font-medium text-lg mb-4">Conditions de paiement</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={invoice.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="benaya-input min-h-[100px]"
                    placeholder="Notes additionnelles pour le client"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termsAndConditions">Conditions de paiement</Label>
                  <Textarea
                    id="termsAndConditions"
                    value={invoice.termsAndConditions}
                    onChange={(e) => handleInputChange("termsAndConditions", e.target.value)}
                    className="benaya-input min-h-[100px]"
                    placeholder="Conditions de paiement, coordonnées bancaires, etc."
                  />
                </div>
              </div>
            </div>

            <div className="benaya-card">
              <h3 className="font-medium text-lg mb-4">Moyens de paiement</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <CreditCard className="w-5 h-5 text-benaya-600" />
                  <div className="flex-1">
                    <div className="font-medium">Virement bancaire</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      IBAN: FR76 1234 5678 9012 3456 7890 123
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un moyen de paiement
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate("/factures")}
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
      <InvoiceItemForm
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
        invoiceTotal={invoice.totalHT || 0}
      />
    </div>
  );
}