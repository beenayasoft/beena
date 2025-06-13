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
  MoveVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

export default function InvoiceEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewInvoice = id === "new";
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(!isNewInvoice);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

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

  // New item state
  const [newItem, setNewItem] = useState<Partial<InvoiceItem>>({
    designation: "",
    description: "",
    unit: "unité",
    quantity: 1,
    unitPrice: 0,
    vatRate: 20,
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

  // Clients and projects data
  const clients = initialTiers;
  const projects = [
    { id: '1', name: 'Villa Moderne' },
    { id: '2', name: 'Rénovation appartement' },
    { id: '3', name: 'Extension maison' },
    { id: '4', name: 'Rénovation cuisine' },
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
        // In a real app, we would also set projectAddress
      }));
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

  // Handle changes in new item form
  const handleNewItemChange = (field: string, value: string | number) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add a new item to the invoice
  const addItem = () => {
    if (!newItem.designation) {
      setErrors(prev => ({ ...prev, newItemDesignation: "La désignation est requise" }));
      return;
    }
    
    const quantity = Number(newItem.quantity) || 0;
    const unitPrice = Number(newItem.unitPrice) || 0;
    const vatRate = Number(newItem.vatRate) || 0;
    
    const totalHT = quantity * unitPrice;
    const totalTTC = totalHT * (1 + vatRate / 100);
    
    const item: InvoiceItem = {
      id: `item-${Date.now()}`,
      type: 'product',
      position: (invoice.items?.length || 0) + 1,
      designation: newItem.designation || "",
      description: newItem.description || "",
      unit: newItem.unit || "unité",
      quantity,
      unitPrice,
      vatRate: newItem.vatRate as VATRate,
      totalHT,
      totalTTC,
    };
    
    const updatedItems = [...(invoice.items || []), item];
    
    // Recalculate totals
    const newTotalHT = updatedItems.reduce((sum, item) => sum + item.totalHT, 0);
    const newTotalVAT = updatedItems.reduce((sum, item) => sum + (item.totalHT * item.vatRate / 100), 0);
    const newTotalTTC = newTotalHT + newTotalVAT;
    
    setInvoice(prev => ({
      ...prev,
      items: updatedItems,
      totalHT: newTotalHT,
      totalVAT: newTotalVAT,
      totalTTC: newTotalTTC,
      remainingAmount: newTotalTTC,
    }));
    
    // Reset new item form
    setNewItem({
      designation: "",
      description: "",
      unit: "unité",
      quantity: 1,
      unitPrice: 0,
      vatRate: 20,
    });
    
    setErrors(prev => ({ ...prev, newItemDesignation: "", items: "" }));
  };

  // Remove an item from the invoice
  const removeItem = (itemId: string) => {
    const updatedItems = (invoice.items || []).filter(item => item.id !== itemId);
    
    // Recalculate totals
    const newTotalHT = updatedItems.reduce((sum, item) => sum + item.totalHT, 0);
    const newTotalVAT = updatedItems.reduce((sum, item) => sum + (item.totalHT * item.vatRate / 100), 0);
    const newTotalTTC = newTotalHT + newTotalVAT;
    
    setInvoice(prev => ({
      ...prev,
      items: updatedItems,
      totalHT: newTotalHT,
      totalVAT: newTotalVAT,
      totalTTC: newTotalTTC,
      remainingAmount: newTotalTTC,
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

  // Add a chapter/section
  const addChapter = () => {
    const item: InvoiceItem = {
      id: `chapter-${Date.now()}`,
      type: 'chapter',
      position: (invoice.items?.length || 0) + 1,
      designation: "Nouvelle section",
      quantity: 1,
      unitPrice: 0,
      vatRate: 20 as VATRate,
      totalHT: 0,
      totalTTC: 0,
    };
    
    setInvoice(prev => ({
      ...prev,
      items: [...(prev.items || []), item],
    }));
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
                        {projects.map(project => (
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                    <Input
                      id="paymentTerms"
                      type="number"
                      value={invoice.paymentTerms}
                      onChange={(e) => handleInputChange("paymentTerms", parseInt(e.target.value))}
                      className="benaya-input"
                    />
                  </div>
                </div>

                <div className="space-y-4">
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
            </div>
          </TabsContent>
          
          {/* Items Tab */}
          <TabsContent value="items" className="space-y-6 mt-6">
            <div className="benaya-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-lg">Éléments de la facture</h3>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addChapter}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une section
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
              {invoice.items && invoice.items.length > 0 && (
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
                          <TableHead>Total HT</TableHead>
                          <TableHead>Total TTC</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <SortableContext 
                        items={invoice.items.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <TableBody>
                          {invoice.items.map((item) => (
                            <DraggableInvoiceItem 
                              key={item.id} 
                              item={item} 
                              onRemove={removeItem} 
                            />
                          ))}
                        </TableBody>
                      </SortableContext>
                    </Table>
                  </DndContext>
                </div>
              )}

              {/* Add New Item Form */}
              <div className="space-y-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <h4 className="font-medium">Ajouter un élément</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="designation" className={errors.newItemDesignation ? "text-red-500" : ""}>
                      Désignation <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="designation"
                      value={newItem.designation}
                      onChange={(e) => handleNewItemChange("designation", e.target.value)}
                      className={`benaya-input ${errors.newItemDesignation ? "border-red-500" : ""}`}
                      placeholder="Nom de l'article ou service"
                    />
                    {errors.newItemDesignation && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.newItemDesignation}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <Input
                      id="description"
                      value={newItem.description}
                      onChange={(e) => handleNewItemChange("description", e.target.value)}
                      className="benaya-input"
                      placeholder="Description détaillée"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantité</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.quantity}
                      onChange={(e) => handleNewItemChange("quantity", parseFloat(e.target.value))}
                      className="benaya-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unité</Label>
                    <Select 
                      value={newItem.unit} 
                      onValueChange={(value) => handleNewItemChange("unit", value)}
                    >
                      <SelectTrigger className="benaya-input">
                        <SelectValue placeholder="Unité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unité">unité</SelectItem>
                        <SelectItem value="h">heure</SelectItem>
                        <SelectItem value="jour">jour</SelectItem>
                        <SelectItem value="m²">m²</SelectItem>
                        <SelectItem value="m³">m³</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="forfait">forfait</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Prix unitaire (MAD)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.unitPrice}
                      onChange={(e) => handleNewItemChange("unitPrice", parseFloat(e.target.value))}
                      className="benaya-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatRate">TVA (%)</Label>
                    <Select 
                      value={newItem.vatRate?.toString()} 
                      onValueChange={(value) => handleNewItemChange("vatRate", parseInt(value))}
                    >
                      <SelectTrigger className="benaya-input">
                        <SelectValue placeholder="Taux de TVA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="7">7%</SelectItem>
                        <SelectItem value="10">10%</SelectItem>
                        <SelectItem value="14">14%</SelectItem>
                        <SelectItem value="20">20%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={addItem}
                  className="w-full benaya-button-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter cet élément
                </Button>
              </div>

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
    </div>
  );
}