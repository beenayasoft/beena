import { useState, useEffect } from "react";
import { X, Plus, Trash2, AlertCircle } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Invoice, InvoiceItem, VATRate } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (invoice: Partial<Invoice>) => void;
  initialInvoice?: Partial<Invoice>;
  clients: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
}

export function CreateInvoiceModal({
  open,
  onOpenChange,
  onSubmit,
  initialInvoice,
  clients,
  projects,
}: CreateInvoiceModalProps) {
  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    clientId: "",
    clientName: "",
    projectId: "",
    projectName: "",
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
  });

  const [newItem, setNewItem] = useState<Partial<InvoiceItem>>({
    designation: "",
    description: "",
    unit: "unité",
    quantity: 1,
    unitPrice: 0,
    vatRate: 20,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser avec les données existantes si disponibles
  useEffect(() => {
    if (initialInvoice) {
      setInvoice({
        ...initialInvoice,
        items: initialInvoice.items || [],
      });
    } else {
      // Réinitialiser pour une nouvelle facture
      setInvoice({
        clientId: "",
        clientName: "",
        projectId: "",
        projectName: "",
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
      });
    }
  }, [initialInvoice, open]);

  // Mettre à jour le client sélectionné
  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      setInvoice(prev => ({
        ...prev,
        clientId,
        clientName: selectedClient.name,
      }));
      setErrors(prev => ({ ...prev, clientId: "" }));
    }
  };

  // Mettre à jour le projet sélectionné
  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects?.find(project => project.id === projectId);
    if (selectedProject) {
      setInvoice(prev => ({
        ...prev,
        projectId,
        projectName: selectedProject.name,
      }));
    }
  };

  // Mettre à jour les dates et conditions
  const handleInputChange = (field: string, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Mettre à jour la date d'échéance si les termes de paiement changent
    if (field === 'paymentTerms' && typeof value === 'number') {
      const issueDate = new Date(invoice.issueDate || new Date());
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + value);
      setInvoice(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split("T")[0],
      }));
    }
    
    // Mettre à jour la date d'échéance si la date d'émission change
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

  // Gérer les changements dans le nouvel élément
  const handleNewItemChange = (field: string, value: string | number) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Ajouter un nouvel élément
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
    
    // Recalculer les totaux
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
    
    // Réinitialiser le formulaire d'ajout d'élément
    setNewItem({
      designation: "",
      description: "",
      unit: "unité",
      quantity: 1,
      unitPrice: 0,
      vatRate: 20,
    });
    
    setErrors(prev => ({ ...prev, newItemDesignation: "" }));
  };

  // Supprimer un élément
  const removeItem = (itemId: string) => {
    const updatedItems = (invoice.items || []).filter(item => item.id !== itemId);
    
    // Recalculer les totaux
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

  // Valider le formulaire
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

  // Soumettre le formulaire
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(invoice);
      onOpenChange(false);
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl">
          {initialInvoice ? "Modifier la facture" : "Créer une nouvelle facture"}
        </DialogTitle>
        <DialogDescription>
          {initialInvoice 
            ? "Modifiez les informations de la facture ci-dessous."
            : "Remplissez les informations pour créer une nouvelle facture."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        {/* Informations client et projet */}
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
              <p className="text-xs text-red-500 mt-1">{errors.clientId}</p>
            )}
          </div>

          {projects && (
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
          )}
        </div>

        {/* Dates et conditions */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                <p className="text-xs text-red-500 mt-1">{errors.issueDate}</p>
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
              <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Éléments de la facture */}
      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <Label className={errors.items ? "text-red-500" : ""}>
            Éléments de la facture <span className="text-red-500">*</span>
          </Label>
          {errors.items && (
            <div className="flex items-center text-xs text-red-500">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.items}
            </div>
          )}
        </div>

        {/* Tableau des éléments existants */}
        {invoice.items && invoice.items.length > 0 && (
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
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
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.designation}</div>
                        {item.description && (
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)} MAD</TableCell>
                    <TableCell>{item.vatRate}%</TableCell>
                    <TableCell>{formatCurrency(item.totalHT)} MAD</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(item.totalTTC)} MAD</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Formulaire d'ajout d'élément */}
        <div className="space-y-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
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
                <p className="text-xs text-red-500 mt-1">{errors.newItemDesignation}</p>
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

        {/* Totaux */}
        <div className="flex justify-end">
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

      {/* Notes et conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
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

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} className="benaya-button-primary">
          {initialInvoice ? "Mettre à jour" : "Créer la facture"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}