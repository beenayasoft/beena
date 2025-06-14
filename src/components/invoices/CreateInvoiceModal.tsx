import { useState, useEffect } from "react";
import { Check, AlertCircle, Plus, Search } from "lucide-react";
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
import { initialTiers } from "@/components/tiers";
import { formatCurrency } from "@/lib/utils";

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (invoiceData: any) => void;
}

export function CreateInvoiceModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateInvoiceModalProps) {
  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    clientAddress: "",
    projectId: "",
    projectName: "",
    projectAddress: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentTerms: 30,
    notes: "",
    termsAndConditions: "Paiement à 30 jours.",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Liste des clients et projets (simulée)
  const clients = initialTiers.filter(tier => tier.type.includes("client"));
  const projects = [
    { id: '1', name: 'Villa Moderne', address: '123 Rue de la Paix, Casablanca', clientId: '1' },
    { id: '2', name: 'Rénovation appartement', address: '45 Avenue Hassan II, Rabat', clientId: '2' },
    { id: '3', name: 'Extension maison', address: '78 Boulevard Zerktouni, Marrakech', clientId: '3' },
    { id: '4', name: 'Rénovation cuisine', address: '25 Boulevard Central, 33000 Bordeaux', clientId: '4' },
  ];
  
  // Réinitialiser le formulaire quand la modale s'ouvre
  useEffect(() => {
    if (open) {
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + 30);
      
      setFormData({
        clientId: "",
        clientName: "",
        clientAddress: "",
        projectId: "",
        projectName: "",
        projectAddress: "",
        issueDate: today.toISOString().split("T")[0],
        dueDate: dueDate.toISOString().split("T")[0],
        paymentTerms: 30,
        notes: "",
        termsAndConditions: "Paiement à 30 jours.",
      });
      setErrors({});
    }
  }, [open]);
  
  // Mettre à jour la date d'échéance lorsque les termes de paiement changent
  useEffect(() => {
    if (formData.issueDate && formData.paymentTerms) {
      const issueDate = new Date(formData.issueDate);
      const dueDate = new Date(issueDate);
      dueDate.setDate(issueDate.getDate() + formData.paymentTerms);
      setFormData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split("T")[0]
      }));
    }
  }, [formData.issueDate, formData.paymentTerms]);
  
  // Gérer la sélection d'un client
  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        clientId,
        clientName: selectedClient.name,
        clientAddress: selectedClient.address,
      }));
      
      // Filtrer les projets du client sélectionné
      const clientProjects = projects.filter(project => project.clientId === clientId);
      if (clientProjects.length === 1) {
        // Si un seul projet, le sélectionner automatiquement
        handleProjectChange(clientProjects[0].id);
      } else if (formData.projectId) {
        // Vérifier si le projet actuel appartient au client
        const currentProject = projects.find(p => p.id === formData.projectId);
        if (currentProject && currentProject.clientId !== clientId) {
          // Réinitialiser le projet s'il n'appartient pas au client
          setFormData(prev => ({
            ...prev,
            projectId: "",
            projectName: "",
            projectAddress: "",
          }));
        }
      }
      
      setErrors(prev => ({ ...prev, clientId: "" }));
    }
  };
  
  // Gérer la sélection d'un projet
  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects.find(project => project.id === projectId);
    if (selectedProject) {
      setFormData(prev => ({
        ...prev,
        projectId,
        projectName: selectedProject.name,
        projectAddress: selectedProject.address,
      }));
      
      // Si le client n'est pas déjà sélectionné, le sélectionner automatiquement
      if (!formData.clientId) {
        const projectClient = clients.find(client => client.id === selectedProject.clientId);
        if (projectClient) {
          setFormData(prev => ({
            ...prev,
            clientId: projectClient.id,
            clientName: projectClient.name,
            clientAddress: projectClient.address,
          }));
        }
      }
    }
  };
  
  // Gérer les changements de champs
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };
  
  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.clientId) {
      newErrors.clientId = "Le client est requis";
    }
    
    if (!formData.issueDate) {
      newErrors.issueDate = "La date d'émission est requise";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "La date d'échéance est requise";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Soumettre le formulaire
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      onOpenChange(false);
    }
  };
  
  // Filtrer les projets par client
  const getFilteredProjects = () => {
    if (!formData.clientId) return projects;
    return projects.filter(project => project.clientId === formData.clientId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Créer une nouvelle facture</DialogTitle>
          <DialogDescription>
            Remplissez les informations de base pour créer une facture
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client et Projet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client" className={errors.clientId ? "text-red-500" : ""}>
                Client <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.clientId} 
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
              <Label htmlFor="project">Projet (optionnel)</Label>
              <Select 
                value={formData.projectId} 
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
          </div>

          {/* Adresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Adresse client</Label>
              <Textarea
                id="clientAddress"
                value={formData.clientAddress}
                onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                className="benaya-input resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectAddress">Adresse du projet</Label>
              <Textarea
                id="projectAddress"
                value={formData.projectAddress}
                onChange={(e) => handleInputChange("projectAddress", e.target.value)}
                className="benaya-input resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate" className={errors.issueDate ? "text-red-500" : ""}>
                Date d'émission <span className="text-red-500">*</span>
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
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
                value={formData.paymentTerms.toString()} 
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
                value={formData.dueDate}
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

          {/* Notes et conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="benaya-input resize-none"
                rows={3}
                placeholder="Notes additionnelles pour le client"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">Conditions de paiement</Label>
              <Textarea
                id="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={(e) => handleInputChange("termsAndConditions", e.target.value)}
                className="benaya-input resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="benaya-button-primary gap-2">
            <Check className="w-4 h-4" />
            Créer la facture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}