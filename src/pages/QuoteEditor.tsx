import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { quotesApi, QuoteDetail, CreateQuoteData, CreateQuoteItemData, BulkQuoteData, EditorQuoteItem } from "@/lib/api/quotes";
import { tiersApi } from "@/lib/api/tiers";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DraggableQuoteItem } from "@/components/quotes/editor/DraggableQuoteItem";
import { QuoteItemFormInline } from "@/components/quotes/editor/QuoteItemForm";
import { SectionForm } from "@/components/quotes/editor/SectionForm";
import { DiscountForm } from "@/components/quotes/editor/DiscountForm";
import { opportunityService } from "@/lib/services/opportunityService";
import { Opportunity } from "@/lib/types/opportunity";
import { OpportunityForm } from "@/components/opportunities/OpportunityForm";

// Types locaux simplifiés
type VATRate = 0 | 5.5 | 10 | 20;
type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled';

export default function QuoteEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🎯 DÉTECTION FIABLE DU MODE NOUVEAU
  const isNewQuote = id === "new" || id === "nouveau" || location.pathname.includes("/nouveau");
  
  console.log("🎯 QuoteEditor unifié:", { id, isNewQuote, currentURL: window.location.pathname });
  
  const [activeTab, setActiveTab] = useState<"details" | "items">("details");
  const [loading, setLoading] = useState(!isNewQuote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🎯 STATE UNIFIÉ - TOUT VIA EditorQuoteItem
  const [quoteData, setQuoteData] = useState({
    tier: "",

    validity_period: 30,
    notes: "",
    conditions: "Acompte de 30% à la signature. Solde à la fin des travaux.",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    opportunity: "", // ID de l'opportunité associée
  });
  
  const [items, setItems] = useState<EditorQuoteItem[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);

  // Modals
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditorQuoteItem | null>(null);
  const [opportunityFormOpen, setOpportunityFormOpen] = useState(false);
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);

  // 📊 CHARGEMENT DES DONNÉES
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingClients(true);
        // Charger les clients
        const response = await tiersApi.getTiers({ page_size: 1000 });
        setClients(response.results || []);
        
        // Charger le devis si en mode édition
      if (!isNewQuote && id) {
          setLoading(true);
          const quoteDetail = await quotesApi.getQuote(id);
          
          // Mapper vers le format unifié
          setQuoteData({
            tier: quoteDetail.tier,
            
            validity_period: quoteDetail.validity_period,
            notes: quoteDetail.notes || "",
            conditions: quoteDetail.conditions || "",
            issueDate: quoteDetail.issue_date || new Date().toISOString().split("T")[0],
            expiryDate: quoteDetail.expiry_date || "",
            opportunity: quoteDetail.opportunity || "",
          });
          
          // Si un client est sélectionné, charger ses opportunités
          if (quoteDetail.tier) {
            loadOpportunities(quoteDetail.tier);
          }
          
          // Mapper les éléments vers EditorQuoteItem
          const mappedItems: EditorQuoteItem[] = quoteDetail.items?.map(item => ({
              id: item.id,
              designation: item.designation,
              description: item.description,
              quantity: item.quantity,
            unit: item.unit,
              unitPrice: item.unit_price,
              discount: item.discount,
            vat_rate: item.vat_rate,
            type: item.type,
            reference: item.reference,
            position: item.position,
            parent: item.parent,
              margin: item.margin,
            work_id: item.work_id,
          })) || [];
          
          setItems(mappedItems);
        }
        } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError("Erreur lors du chargement des données");
        } finally {
          setLoading(false);
        setLoadingClients(false);
      }
    };

    loadData();
  }, [id, isNewQuote]);

  // Fonction pour charger les opportunités d'un client
  const loadOpportunities = async (tierId: string) => {
    if (!tierId) return;
    
    try {
      setLoadingOpportunities(true);
      console.log(`🔍 Chargement des opportunités pour le client ${tierId}...`);
      
      const result = await opportunityService.getOpportunitiesByTier(tierId);
      
      // Filtrer pour ne garder que les opportunités en phase d'analyse ou de négociation
      // qui sont les plus pertinentes pour associer à un devis
      const filteredOpportunities = result.opportunities.filter(opp => 
        opp.stage === 'needs_analysis' || opp.stage === 'negotiation' || opp.stage === 'new'
      );
      
      setOpportunities(filteredOpportunities);
      
      console.log(`✅ ${filteredOpportunities.length} opportunités actives chargées pour le client ${tierId}`);
    } catch (error) {
      console.error(`❌ Erreur lors du chargement des opportunités:`, error);
      toast.error("Impossible de charger les opportunités du client");
    } finally {
      setLoadingOpportunities(false);
    }
  };
  
  // Gérer le changement de client
  const handleClientChange = (tierId: string) => {
    setQuoteData(prev => ({ ...prev, tier: tierId, opportunity: "" }));
    setOpportunities([]); // Réinitialiser les opportunités
    
    if (tierId) {
      loadOpportunities(tierId);
    }
  };

  // Gérer la création d'une opportunité
  const handleCreateOpportunity = async (formData: Partial<Opportunity>) => {
    try {
      setIsCreatingOpportunity(true);
      
      // Ajouter le client sélectionné aux données du formulaire
      const opportunityData = {
        ...formData,
        tierId: quoteData.tier,
      };
      
      console.log("🆕 Création d'une opportunité depuis le devis:", opportunityData);
      
      // Créer l'opportunité via le service
      const newOpportunity = await opportunityService.createOpportunity(opportunityData);
      
      // Associer l'opportunité au devis
      setQuoteData(prev => ({ ...prev, opportunity: newOpportunity.id }));
      
      // Ajouter la nouvelle opportunité à la liste locale sans avoir à recharger
      setOpportunities(prevOpportunities => {
        // Vérifier si l'opportunité existe déjà dans la liste
        const exists = prevOpportunities.some(opp => opp.id === newOpportunity.id);
        if (exists) {
          // Si elle existe déjà, mettre à jour l'opportunité existante
          return prevOpportunities.map(opp => 
            opp.id === newOpportunity.id ? newOpportunity : opp
          );
        } else {
          // Sinon, ajouter la nouvelle opportunité à la liste
          return [...prevOpportunities, newOpportunity];
        }
      });
      
      console.log("✅ Opportunité ajoutée à la liste locale:", newOpportunity);
      
      // Fermer la modale et afficher un message de succès
      setOpportunityFormOpen(false);
      toast.success("Opportunité créée et associée au devis");
      
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'opportunité:", error);
      toast.error("Impossible de créer l'opportunité");
    } finally {
      setIsCreatingOpportunity(false);
    }
  };

  // 📅 CALCUL AUTOMATIQUE DE LA DATE D'EXPIRATION
  useEffect(() => {
    if (quoteData.issueDate && quoteData.validity_period) {
      const issueDate = new Date(quoteData.issueDate);
      const expiryDate = new Date(issueDate);
      expiryDate.setDate(expiryDate.getDate() + quoteData.validity_period);
      
      const formattedExpiryDate = expiryDate.toISOString().split('T')[0];
      
      // Mettre à jour seulement si la date a changé pour éviter les boucles infinies
      if (formattedExpiryDate !== quoteData.expiryDate) {
        console.log(`📅 Calcul automatique date d'expiration: ${quoteData.issueDate} + ${quoteData.validity_period} jours = ${formattedExpiryDate}`);
        setQuoteData(prev => ({
        ...prev,
          expiryDate: formattedExpiryDate
          }));
        }
      }
  }, [quoteData.issueDate, quoteData.validity_period]);

  //  VALIDATION SIMPLE
  const validateForm = () => {
    if (!quoteData.tier) {
      toast.error("Veuillez sélectionner un client");
      return false;
    }
    if (items.length === 0) {
      toast.error("Veuillez ajouter au moins un élément au devis");
      return false;
    }
    return true;
  };

  // 🚀 SAUVEGARDE UNIFIÉE - UN SEUL MODE AVEC LOGS DÉTAILLÉS
  const handleSave = async () => {
    console.log("🚀 Sauvegarde unifiée:", { quoteData, items });
    
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      // 🎯 CONSTRUCTION DU PAYLOAD AVEC LOGS DÉTAILLÉS
      const bulkData: BulkQuoteData = {
        quote: {
          tier: quoteData.tier,
          
          validity_period: quoteData.validity_period,
          notes: quoteData.notes,
          conditions: quoteData.conditions,
          opportunity: quoteData.opportunity || undefined,
        },
        items: items.map(item => ({
          ...item,
          type: 'service' // Valeur par défaut sûre
        }))
      };
      
      console.log("📋 === PAYLOAD DÉTAILLÉ AVANT ENVOI ===");
      console.log("🔷 Mode:", isNewQuote ? "NOUVEAU DEVIS" : `MODIFICATION DEVIS ${id}`);
      console.log("🔷 Quote Data:", JSON.stringify(bulkData.quote, null, 2));
      console.log("🔷 Items Count:", bulkData.items.length);
      console.log("🔷 Items Details:", JSON.stringify(bulkData.items, null, 2));
      console.log("🔷 Client sélectionné:", selectedClient);
      console.log("🔷 Opportunité associée:", selectedOpportunity);
      console.log("🔷 Totaux calculés:", totals);
      console.log("📋 === FIN PAYLOAD ===");
      
      if (isNewQuote) {
        console.log("🆕 === CRÉATION NOUVEAU DEVIS ===");
        console.log("🆕 URL cible: /quotes/bulk_create/");
        const result = await quotesApi.bulkCreateQuote(bulkData);
        console.log("✅ Résultat création:", result);
        toast.success("Devis créé avec succès");
        navigate("/devis");
    } else {
        console.log("📝 === MISE À JOUR DEVIS EXISTANT ===");
        console.log(`📝 URL cible: /quotes/${id}/bulk_update/`);
        const result = await quotesApi.bulkUpdateQuote(id!, bulkData);
        console.log("✅ Résultat mise à jour:", result);
        toast.success("Devis mis à jour avec succès");
        navigate(`/devis/${id}`);
      }
    } catch (error: any) {
      console.error("❌ === ERREUR DÉTAILLÉE SAUVEGARDE ===");
      console.error("❌ Type d'erreur:", error.constructor.name);
      console.error("❌ Message:", error.message);
      console.error("❌ Stack:", error.stack);
      console.error("❌ Response status:", error.response?.status);
      console.error("❌ Response data:", error.response?.data);
      console.error("❌ Request config:", error.config);
      console.error("❌ === FIN ERREUR ===");
      toast.error("Erreur lors de la sauvegarde: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  // 🔧 GESTION DES ÉLÉMENTS SIMPLIFIÉE
  const handleAddItem = (newItem: EditorQuoteItem) => {
    const itemWithPosition = {
      ...newItem,
      id: crypto.randomUUID(),
      position: items.length + 1,
    };
    setItems(prev => [...prev, itemWithPosition]);
    setItemFormOpen(false);
  };

  const handleUpdateItem = (updatedItem: EditorQuoteItem) => {
    setItems(prev => prev.map(item => 
        item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingItem(null);
    setItemFormOpen(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  // 🔄 DRAG & DROP POUR RÉORGANISER LES ÉLÉMENTS
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems(prev => {
        const oldIndex = prev.findIndex(item => item.id === active.id);
        const newIndex = prev.findIndex(item => item.id === over.id);
        
        // Réorganiser et mettre à jour les positions
        const reorderedItems = arrayMove(prev, oldIndex, newIndex).map((item, index) => ({
          ...item,
          position: index + 1,
        }));
        
        return reorderedItems;
      });
    }
  };

  // 🎯 HANDLER POUR LES TABS
  const handleTabChange = (value: string) => {
    setActiveTab(value as "details" | "items");
  };

  // 📊 CALCULS SIMPLIFIÉS
  const totals = useMemo(() => {
    let totalHT = 0;
    let totalTVA = 0;
    
    items.forEach(item => {
      if (item.type !== 'chapter' && item.type !== 'section') {
        const itemHT = item.quantity * item.unitPrice * (1 - item.discount / 100);
        const itemTVA = itemHT * (parseFloat(item.vat_rate) / 100);
        
        totalHT += itemHT;
        totalTVA += itemTVA;
      }
    });
    
    return {
      totalHT: Math.round(totalHT * 100) / 100,
      totalTVA: Math.round(totalTVA * 100) / 100,
      totalTTC: Math.round((totalHT + totalTVA) * 100) / 100,
    };
  }, [items]);

  // Obtenir le client sélectionné
  const selectedClient = clients.find(client => client.id === quoteData.tier);
  
  // Obtenir l'opportunité sélectionnée
  const selectedOpportunity = opportunities.find(opp => opp.id === quoteData.opportunity);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
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
              onClick={() => navigate("/devis")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {isNewQuote ? "Nouveau devis" : `Devis ${quoteData.number || ""}`}
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
                  : `Client: ${selectedClient?.nom || selectedClient?.name}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
              <h3 className="font-medium text-lg mb-4">Informations client et opportunité</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client" className={error ? "text-red-500" : ""}>
                      Client <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={quoteData.tier} 
                      onValueChange={(value) => handleClientChange(value)}
                    >
                      <SelectTrigger className={`benaya-input ${error ? "border-red-500" : ""}`}>
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
                    {error && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opportunity">Opportunité associée</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select 
                          value={quoteData.opportunity} 
                          onValueChange={(value) => setQuoteData(prev => ({ ...prev, opportunity: value }))}
                          disabled={loadingOpportunities || opportunities.length === 0 || !quoteData.tier}
                        >
                          <SelectTrigger className="benaya-input">
                            <SelectValue placeholder={loadingOpportunities ? "Chargement..." : opportunities.length === 0 ? "Aucune opportunité disponible" : "Sélectionner une opportunité"} />
                          </SelectTrigger>
                          <SelectContent>
                            {opportunities.map(opportunity => (
                              <SelectItem key={opportunity.id} value={opportunity.id}>
                                {opportunity.name} - {opportunity.stage === 'needs_analysis' ? 'Analyse des besoins' : 
                                  opportunity.stage === 'negotiation' ? 'Négociation' : 
                                  opportunity.stage === 'new' ? 'Nouvelle' : 
                                  opportunity.stage} ({formatCurrency(opportunity.estimatedAmount)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        disabled={!quoteData.tier}
                        onClick={() => setOpportunityFormOpen(true)}
                        title="Créer une nouvelle opportunité"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {quoteData.tier && opportunities.length === 0 && !loadingOpportunities && (
                      <p className="text-xs text-amber-500 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Ce client n'a pas d'opportunités actives
                      </p>
                    )}
                    {selectedOpportunity && (
                      <p className="text-xs text-green-600 mt-1">
                        Associer ce devis à l'opportunité permettra de mettre à jour automatiquement son statut
                      </p>
                    )}
                  </div>


                </div>
              </div>
            </div>

            {/* Dates and Terms */}
            <div className="benaya-card">
              <h3 className="font-medium text-lg mb-4">Dates et conditions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="issueDate" className={error ? "text-red-500" : ""}>
                    Date d'émission <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={quoteData.issueDate}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, issueDate: e.target.value }))}
                    className={`benaya-input ${error ? "border-red-500" : ""}`}
                  />
                  {error && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {error}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validityPeriod">Durée de validité (jours)</Label>
                  <Select 
                    value={quoteData.validity_period?.toString()} 
                    onValueChange={(value) => setQuoteData(prev => ({ ...prev, validity_period: parseInt(value) }))}
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
                    value={quoteData.expiryDate}
                    className="benaya-input bg-gray-50 text-gray-600 cursor-not-allowed"
                    readOnly
                    title="Calculée automatiquement : Date d'émission + Durée de validité"
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>🔄</span>
                    Calculée automatiquement
                  </p>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <Label htmlFor="termsAndConditions">Conditions de paiement</Label>
                <Textarea
                  id="termsAndConditions"
                  value={quoteData.conditions}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, conditions: e.target.value }))}
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
                </div>
              </div>
              
              {/* Existing Items */}
              {items.length > 0 ? (
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
                          <TableHead>Total TTC</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <SortableContext 
                        items={items.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <TableBody>
                          {items.map((item) => (
                            <DraggableQuoteItem 
                              key={item.id} 
                              item={item} 
                              onRemove={handleRemoveItem}
                              onEdit={() => {
                                setEditingItem(item);
                                setItemFormOpen(true);
                              }}
                            />
                          ))}
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
                    Ajoutez des éléments à votre devis en utilisant le bouton ci-dessus
                  </p>
                </div>
              )}

              {/* Totals */}
              <div className="flex justify-end mt-6">
                <div className="w-full md:w-1/3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total HT:</span>
                    <span className="font-medium">{formatCurrency(totals.totalHT)} MAD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total TVA:</span>
                    <span className="font-medium">{formatCurrency(totals.totalTVA)} MAD</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-neutral-200 dark:border-neutral-700 pt-2">
                    <span>Total TTC:</span>
                    <span>{formatCurrency(totals.totalTTC)} MAD</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <Dialog open={itemFormOpen} onOpenChange={setItemFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier l'élément" : "Ajouter un élément"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Modifiez les détails de cet élément" : "Ajoutez un nouvel élément au devis"}
            </DialogDescription>
          </DialogHeader>
          
          <QuoteItemFormInline
            onSave={editingItem ? handleUpdateItem : handleAddItem}
            onCancel={() => setItemFormOpen(false)}
            initialData={editingItem || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Modal pour créer une opportunité */}
      <Dialog open={opportunityFormOpen} onOpenChange={setOpportunityFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer une opportunité</DialogTitle>
            <DialogDescription>
              Créez une nouvelle opportunité qui sera automatiquement associée à ce devis
            </DialogDescription>
          </DialogHeader>
          
          <OpportunityForm 
            onSubmit={handleCreateOpportunity}
            onCancel={() => setOpportunityFormOpen(false)}
            preselectedTierId={quoteData.tier}
            disableTierSelection={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}