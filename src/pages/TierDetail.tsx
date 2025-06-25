import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Building, User, Tag, Activity, Users, Home, Plus, BarChart3, Eye, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTierUtils } from "@/components/tiers";
import { tiersApi } from "@/lib/api/tiers";
import { TierEntrepriseEditDialog } from "@/components/tiers/TierEntrepriseEditDialog";
import { TierParticulierEditDialog } from "@/components/tiers/TierParticulierEditDialog";
import type { Tier } from "@/components/tiers/types";
import { Opportunity } from "@/lib/types/opportunity";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { OpportunityForm } from "@/components/opportunities/OpportunityForm";
import { toast } from "@/hooks/use-toast";
import { opportunityService } from "@/lib/services/opportunityService";

// Types pour les données détaillées du backend
interface TierDetailData {
  id: string;
  nom: string;
  type: string[];
  siret?: string;
  tva?: string;
  flags: string[];
  is_deleted: boolean;
  date_creation: string;
  date_modification: string;
  contacts?: Array<{
    id: string;
    prenom: string;
    nom: string;
    fonction?: string;
    email?: string;
    telephone?: string;
    contact_principal_devis: boolean;
    contact_principal_facture: boolean;
  }>;
  adresses?: Array<{
    id: string;
    libelle: string;
    rue: string;
    ville: string;
    code_postal: string;
    pays?: string;
    facturation: boolean;
  }>;
}

export default function TierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTypeBadge, getStatusBadge } = useTierUtils();
  
  // Fonctions utilitaires pour les badges et l'affichage
  const getBadgeVariant = (flag: string) => {
    switch (flag) {
      case "client":
        return "default";
      case "fournisseur":
        return "secondary";
      case "sous_traitant":
        return "outline";
      case "prospect":
        return "destructive";
      default:
        return "secondary";
    }
  };
  
  const getDisplayName = (flag: string) => {
    switch (flag) {
      case "client":
        return "Client";
      case "fournisseur":
        return "Fournisseur";
      case "sous_traitant":
        return "Sous-traitant";
      case "prospect":
        return "Prospect";
      default:
        return flag.charAt(0).toUpperCase() + flag.slice(1);
    }
  };
  
  const [tierData, setTierData] = useState<TierDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  
  // 🚀 Idée de génie #2 : États pour chargement progressif et métriques
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  const [opportunityMetrics, setOpportunityMetrics] = useState<{
    total: number;
    byStage: Record<string, number>;
    totalAmount: number;
    avgAmount: number;
  } | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'mock' | null>(null);

  // États pour les modales d'édition spécialisées
  const [editEntrepriseDialogOpen, setEditEntrepriseDialogOpen] = useState(false);
  const [editParticulierDialogOpen, setEditParticulierDialogOpen] = useState(false);

  // Déterminer le type d'entité (entreprise vs particulier)
  const entityType = tierData?.siret && tierData.siret.trim().length > 0 ? 'entreprise' : 'particulier';
  const isEntreprise = entityType === 'entreprise';

  // Créer un objet Tier compatible pour les modales d'édition
  const tierForEdit: Tier | null = tierData ? {
    id: tierData.id,
    name: tierData.nom,
    type: tierData.flags,
    siret: tierData.siret || '',
    contact: '', // Sera recalculé par la modale
    email: '', // Sera recalculé par la modale
    phone: '', // Sera recalculé par la modale
    address: '', // Sera recalculé par la modale
    status: tierData.is_deleted ? 'inactive' : 'active'
  } : null;

  useEffect(() => {
    if (!id) {
      setError("ID du tier manquant");
      setLoading(false);
      return;
    }

    const fetchTierData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Tentative de récupération du tier avec ID:", id);
        const response = await fetch(`http://localhost:8000/api/tiers/tiers/${id}/vue_360/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Données tier reçues:", data);
        console.log("Structure de l'API:", {
          onglets: data.onglets ? "Présent" : "Absent",
          contacts: Array.isArray(data.contacts) 
            ? `Présent directement (${data.contacts.length} contacts)` 
            : (data.onglets?.contacts ? `Présent dans onglets (${data.onglets.contacts.length} contacts)` : "Absent"),
          adresses: Array.isArray(data.adresses) 
            ? `Présent directement (${data.adresses.length} adresses)` 
            : (data.onglets?.infos?.adresses ? `Présent dans onglets.infos (${data.onglets.infos.adresses.length} adresses)` : "Absent"),
        });

        // Si les données sont dans la structure 'onglets', les remettre à plat
        if (data.onglets) {
          console.log("Restructuration des données des onglets");
          if (data.onglets.contacts) {
            data.contacts = data.onglets.contacts;
          }
          if (data.onglets.infos && data.onglets.infos.adresses) {
            data.adresses = data.onglets.infos.adresses;
          }
          if (data.onglets.activites) {
            data.activites = data.onglets.activites;
          }
          delete data.onglets;
        }

        console.log("Données tier après restructuration:", data);
        setTierData(data);
        
        // 🚀 Idée de génie #2 : Chargement progressif intelligent des opportunités
        if (id) {
          loadOpportunitiesProgressively(id);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du tier:", err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchTierData();
  }, [id]);

  // 🚀 Idée de génie #2 : Fonction de chargement progressif des opportunités
  const loadOpportunitiesProgressively = async (tierId: string) => {
    console.log('🔍 [TierDetail] loadOpportunitiesProgressively - tierId reçu:', tierId);
    
    setOpportunitiesLoading(true);
    setOpportunitiesError(null);
    
    try {
      console.log('🔄 [TierDetail] Appel de opportunityService.getOpportunitiesByTier avec tierId:', tierId);
      
      const result = await opportunityService.getOpportunitiesByTier(tierId, {
        progressive: true,
        includeMetrics: true,
      });
      
      console.log('✅ [TierDetail] Résultat reçu:', {
        count: result.opportunities.length,
        source: result.source,
        tierIdFilter: tierId,
        opportunities: result.opportunities.map(opp => ({
          id: opp.id,
          name: opp.name,
          tierId: opp.tierId,
          tierName: opp.tierName
        }))
      });
      
      // Vérifier que toutes les opportunités correspondent bien au tier
      const filteredOpportunities = result.opportunities.filter(opp => opp.tierId === tierId);
      console.log('🔍 [TierDetail] Opportunités après filtrage local:', {
        avant: result.opportunities.length,
        après: filteredOpportunities.length,
        tierIdRecherché: tierId
      });

      // Utiliser le filtrage local au cas où l'API/mock ne filtre pas correctement
      setOpportunities(filteredOpportunities);
      setOpportunityMetrics(result.metrics || null);
      setDataSource(result.source);
      
    } catch (error) {
      console.error('❌ [TierDetail] Erreur lors du chargement des opportunités:', error);
      setOpportunitiesError(error instanceof Error ? error.message : 'Erreur de chargement');
      setOpportunities([]);
      setOpportunityMetrics(null);
    } finally {
      setOpportunitiesLoading(false);
    }
  };

  // Gestionnaire pour l'édition selon le type
  const handleEdit = () => {
    if (!tierData) return;
    
    if (isEntreprise) {
      setEditEntrepriseDialogOpen(true);
    } else {
      setEditParticulierDialogOpen(true);
    }
  };

  // Gestionnaire de succès après édition
  const handleEditSuccess = async () => {
    // Recharger les données après modification
    if (id) {
      const response = await fetch(`http://localhost:8000/api/tiers/tiers/${id}/vue_360/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTierData(data);
      }
    }
  };

  // Créer une nouvelle opportunité pour ce tiers
  const handleCreateOpportunity = () => {
    setFormDialogOpen(true);
  };

  // Gérer la soumission du formulaire d'opportunité
  const handleFormSubmit = async (formData: Partial<Opportunity>) => {
    try {
      console.log("🚀 Phase 3 : Création d'opportunité via service intelligent:", formData);
      
      // Créer l'opportunité via le service intelligent
      const createdOpportunity = await opportunityService.createOpportunity(formData);
      
      console.log("✅ Opportunité créée avec succès:", createdOpportunity);
      
      // Afficher une notification de succès
      toast({
        title: "Opportunité créée",
        description: `L'opportunité "${createdOpportunity.name}" a été créée avec succès`,
      });
      
      // Fermer le formulaire
      setFormDialogOpen(false);
      
      // 🚀 Phase 3 : Navigation automatique vers la fiche détail de l'opportunité créée
      navigate(`/opportunities/${createdOpportunity.id}`);
      
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'opportunité:", error);
      
      // Afficher une notification d'erreur
      toast({
        title: "Erreur de création",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création",
        variant: "destructive",
      });
      
      // Ne pas fermer le formulaire pour permettre à l'utilisateur de corriger
    }
  };

  // Si en cours de chargement, afficher un spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/tiers')}
              className="mt-4"
            >
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tierData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Tier non trouvé</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/tiers')}
              className="mt-4"
            >
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* En-tête adaptatif style ancien - Full width */}
        <div className="mb-6">
          {/* En-tête principal avec style benaya */}
          <div className={`benaya-card text-white ${isEntreprise ? 'benaya-gradient' : 'bg-gradient-to-r from-green-600 to-green-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon" 
                    className="text-white hover:bg-white/20"
                    onClick={() => navigate("/tiers")}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-2">
                    {isEntreprise ? (
                      <Building className="h-6 w-6" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                    <h1 className="text-2xl font-bold">{tierData.nom}</h1>
                  </div>
                </div>
                <div className="ml-12 mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {isEntreprise ? 'Entreprise' : 'Particulier'}
                  </Badge>
                  {tierData.flags && tierData.flags.map(flag => (
                    <Badge key={flag} variant="secondary" className="bg-white/20 text-white border-white/30">
                      {getDisplayName(flag)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 ml-6">
                <Button 
                  className="gap-2 bg-white text-benaya-900 hover:bg-white/90 px-8"
                  onClick={handleEdit}
                >
                  Modifier
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {/* Onglets avec actions rapides */}
            <Tabs defaultValue="identity" className="w-full">
              <div className="flex items-start justify-between gap-6 mb-6">
                <TabsList className="grid grid-cols-4 flex-1">
                  <TabsTrigger value="identity" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Identité
                  </TabsTrigger>
                  <TabsTrigger value="contacts" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Contacts
                  </TabsTrigger>
                  <TabsTrigger value="addresses" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Adresses
                  </TabsTrigger>
                  <TabsTrigger value="relations" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Relations
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Contenu des onglets */}
              <TabsContent value="identity" className="mt-6">
                <Card className="benaya-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {isEntreprise ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      Informations d'identité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {isEntreprise ? 'Raison sociale' : 'Nom'}
                        </div>
                        <div className="font-medium text-lg">{tierData.nom || 'Non renseigné'}</div>
                      </div>
                      
                      {isEntreprise && (
                        <>
                          <div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">SIRET</div>
                            <div className="font-medium">{tierData.siret || "Non renseigné"}</div>
                          </div>
                          <div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">N° TVA</div>
                            <div className="font-medium">{tierData.tva || "Non renseigné"}</div>
                          </div>
                        </>
                      )}
                      
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">Type d'entité</div>
                        <div className="font-medium">
                          <Badge variant={isEntreprise ? "default" : "secondary"}>
                            {isEntreprise ? '🏢 Entreprise' : '👤 Particulier'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">Date de création</div>
                        <div className="font-medium">
                          {new Date(tierData.date_creation).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contacts" className="mt-6">
                <Card className="benaya-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Contacts ({tierData.contacts?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tierData.contacts && tierData.contacts.length > 0 ? (
                      <div className="space-y-4">
                        {tierData.contacts.map((contact, index) => (
                          <div key={contact.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">
                                  {contact.prenom} {contact.nom}
                                </h4>
                                {contact.contact_principal_devis && (
                                  <Badge variant="default" className="text-xs">Principal</Badge>
                                )}
                                {contact.contact_principal_facture && (
                                  <Badge variant="outline" className="text-xs">Facturation</Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              {contact.fonction && (
                                <div>
                                  <span className="text-neutral-500">Fonction:</span>
                                  <div className="font-medium">{contact.fonction}</div>
                                </div>
                              )}
                              {contact.email && (
                                <div>
                                  <span className="text-neutral-500">Email:</span>
                                  <div className="font-medium">
                                    <a href={`mailto:${contact.email}`} className="text-benaya-600 hover:underline">
                                      {contact.email}
                                    </a>
                                  </div>
                                </div>
                              )}
                              {contact.telephone && (
                                <div>
                                  <span className="text-neutral-500">Téléphone:</span>
                                  <div className="font-medium">
                                    <a href={`tel:${contact.telephone.replace(/\s/g, "")}`} className="text-benaya-600 hover:underline">
                                      {contact.telephone}
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun contact enregistré</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses" className="mt-6">
                <Card className="benaya-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Adresses ({tierData.adresses?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tierData.adresses && tierData.adresses.length > 0 ? (
                      <div className="space-y-4">
                        {tierData.adresses.map((adresse, index) => (
                          <div key={adresse.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold">{adresse.libelle}</h4>
                              {adresse.facturation && (
                                <Badge variant="default" className="text-xs">Facturation</Badge>
                              )}
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              <div className="font-medium">{adresse.rue}</div>
                              <div>{adresse.code_postal} {adresse.ville}</div>
                              <div className="text-neutral-500">{adresse.pays}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune adresse enregistrée</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="relations" className="mt-6">
                <Card className="benaya-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Relations et activité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Types/Flags */}
                    <div>
                      <h4 className="font-semibold mb-3">Types de relation</h4>
                      <div className="flex flex-wrap gap-2">
                        {tierData.flags && tierData.flags.length > 0 ? (
                          tierData.flags.map(flag => (
                            <div key={flag}>{getTypeBadge(flag)}</div>
                          ))
                        ) : (
                          <div className="text-neutral-500">Aucun type défini</div>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Informations de suivi */}
                    <div>
                      <h4 className="font-semibold mb-3">Suivi</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-500">Créé le:</span>
                          <div className="font-medium">
                            {new Date(tierData.date_creation).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div>
                          <span className="text-neutral-500">Modifié le:</span>
                          <div className="font-medium">
                            {new Date(tierData.date_modification).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 🚀 SECTION : Opportunités du client (intégrée dans la grille) */}
            <div className="mt-6">
              <Card className="benaya-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Opportunités de {tierData.nom}
                  </CardTitle>
                  <p className="text-sm text-neutral-500 mt-1">
                    Gérez les opportunités commerciales liées à ce client
                  </p>
                </CardHeader>
                
                <CardContent>
                  {/* Métriques rapides */}
                  {opportunityMetrics && opportunities.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{opportunityMetrics.total}</div>
                        <div className="text-sm text-neutral-500">Opportunités</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {opportunityMetrics.totalAmount.toLocaleString('fr-FR')}€
                        </div>
                        <div className="text-sm text-neutral-500">Montant total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {opportunityMetrics.avgAmount.toLocaleString('fr-FR')}€
                        </div>
                        <div className="text-sm text-neutral-500">Montant moyen</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round(
                            Object.values(opportunityMetrics.byStage).reduce((acc: number, count: number) => acc + count, 0) > 0
                              ? (opportunities.filter(opp => opp.stage === 'won').length / opportunityMetrics.total) * 100
                              : 0
                          )}%
                        </div>
                        <div className="text-sm text-neutral-500">Taux de succès</div>
                      </div>
                    </div>
                  )}

                  {/* État de chargement */}
                  {opportunitiesLoading && (
                    <div className="flex items-center justify-center py-12 text-neutral-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                      <span>Chargement des opportunités...</span>
                    </div>
                  )}
                  
                  {/* Gestion d'erreurs */}
                  {opportunitiesError && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        <span>⚠️ {opportunitiesError}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => id && loadOpportunitiesProgressively(id)}
                          className="ml-auto"
                        >
                          Réessayer
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Tableau des opportunités */}
                  {!opportunitiesLoading && !opportunitiesError && (
                    <>
                      {opportunities.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-neutral-50 dark:bg-neutral-800">
                                <tr>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Nom de l'opportunité
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Statut
                                  </th>
                                  <th className="px-4 py-3 text-right text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Montant estimé
                                  </th>
                                  <th className="px-4 py-3 text-center text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Probabilité
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Date de clôture
                                  </th>
                                  <th className="px-4 py-3 text-center text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {opportunities.map((opportunity) => (
                                  <tr key={opportunity.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                        {opportunity.name}
                                      </div>
                                      {opportunity.description && (
                                        <div className="text-sm text-neutral-500 truncate max-w-xs">
                                          {opportunity.description}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      <Badge 
                                        variant={
                                          opportunity.stage === 'won' ? 'default' : 
                                          opportunity.stage === 'lost' ? 'destructive' : 
                                          opportunity.stage === 'negotiation' ? 'secondary' :
                                          'outline'
                                        }
                                        className="text-xs"
                                      >
                                        {opportunity.stage === 'new' ? 'Nouvelle' :
                                         opportunity.stage === 'needs_analysis' ? 'Analyse' :
                                         opportunity.stage === 'negotiation' ? 'Négociation' :
                                         opportunity.stage === 'won' ? 'Gagnée' :
                                         opportunity.stage === 'lost' ? 'Perdue' :
                                         opportunity.stage}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="font-medium">
                                        {opportunity.estimatedAmount?.toLocaleString('fr-FR')}€
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="font-medium">
                                        {opportunity.probability}%
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      {opportunity.expectedCloseDate && (
                                        <div className="text-sm">
                                          {new Date(opportunity.expectedCloseDate).toLocaleDateString('fr-FR')}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center justify-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => navigate(`/devis/edit/${opportunity.id}`)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <FileText className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-neutral-500">
                          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-medium mb-2">Aucune opportunité</h3>
                          <p className="text-sm mb-4">
                            Ce client n'a pas encore d'opportunités enregistrées.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Panneau latéral - Résumé */}
          <div className="lg:col-span-1">
            <Card className="benaya-card sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Résumé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Type:</span>
                    <span className="font-medium">
                      {isEntreprise ? 'Entreprise' : 'Particulier'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Contacts:</span>
                    <span className="font-medium">{tierData.contacts?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Adresses:</span>
                    <span className="font-medium">{tierData.adresses?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Relations:</span>
                    <span className="font-medium">{tierData.flags?.length || 0}</span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <div>
                        <span className="text-neutral-500 text-xs">Créé le:</span>
                        <div className="font-medium text-sm">
                          {new Date(tierData.date_creation).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs">Modifié le:</span>
                        <div className="font-medium text-sm">
                          {new Date(tierData.date_modification).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            {tierData && (
              <Card className="benaya-card mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full gap-2 benaya-button-primary" 
                    onClick={handleCreateOpportunity}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Créer une opportunité
                  </Button>
                  {tierData.contacts && tierData.contacts[0] && (
                    <>
                      {tierData.contacts[0].telephone && (
                        <Button className="w-full gap-2" variant="outline" onClick={() => window.open(`tel:${tierData.contacts[0].telephone.replace(/\s/g, "")}`)}>
                          <Phone className="h-4 w-4" />
                          Appeler
                        </Button>
                      )}
                      {tierData.contacts[0].email && (
                        <Button className="w-full gap-2" variant="outline" onClick={() => window.open(`mailto:${tierData.contacts[0].email}`)}>
                          <Mail className="h-4 w-4" />
                          Envoyer un email
                        </Button>
                      )}
                    </>
                  )}
                  {tierData.adresses && tierData.adresses[0] && (
                    <Button className="w-full gap-2" variant="outline" onClick={() => {
                      const adresse = tierData.adresses![0];
                      const adresseComplete = `${adresse.rue}, ${adresse.code_postal} ${adresse.ville}, ${adresse.pays || 'France'}`;
                      window.open(`https://maps.google.com/?q=${encodeURIComponent(adresseComplete)}`);
                    }}>
                      <MapPin className="h-4 w-4" />
                      Voir sur la carte
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Modales d'édition spécialisées */}
      {tierForEdit && (
        <>
          <TierEntrepriseEditDialog
            open={editEntrepriseDialogOpen}
            onOpenChange={setEditEntrepriseDialogOpen}
            onSuccess={handleEditSuccess}
            tier={tierForEdit}
          />
          
          <TierParticulierEditDialog
            open={editParticulierDialogOpen}
            onOpenChange={setEditParticulierDialogOpen}
            onSuccess={handleEditSuccess}
            tier={tierForEdit}
          />
        </>
      )}

      {/* Formulaire de création d'opportunité */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nouvelle opportunité</DialogTitle>
            <DialogDescription>
              Créez une nouvelle opportunité pour {tierData.nom}
            </DialogDescription>
          </DialogHeader>
          
          <OpportunityForm
            opportunity={{
              tierId: tierData.id,
              tierName: tierData.nom,
              tierType: tierData.flags,
            }}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormDialogOpen(false)}
            isEditing={false}
            preselectedTierId={tierData.id}
          />
        </DialogContent>
      </Dialog>

    </>
  );
}