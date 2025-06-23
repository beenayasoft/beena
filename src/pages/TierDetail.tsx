import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Building, User, Tag, Activity, Users, Home, Plus, BarChart3 } from "lucide-react";
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
import { getOpportunities } from "@/lib/mock/opportunities";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { initialTiers } from "@/lib/mock/tiers";

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
        
        // Charger les opportunités liées à ce tiers (si besoin)
        const tierOpportunities = getOpportunities({ tierId: id });
        setOpportunities(tierOpportunities);
      } catch (err) {
        console.error("Erreur lors du chargement du tier:", err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchTierData();
  }, [id]);

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
  const handleFormSubmit = (formData: Partial<Opportunity>) => {
    // Dans une application réelle, vous feriez un appel API ici
    console.log("Nouvelle opportunité:", formData);
    
    // Afficher une notification
    toast({
      title: "Opportunité créée",
      description: "L'opportunité a été créée avec succès",
    });
    
    // Fermer le formulaire
    setFormDialogOpen(false);
    
    // Rediriger vers la page des opportunités
    navigate("/opportunities");
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

            {/* Actions et résumé */}
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

            {/* Opportunités */}
            {tierData && (
              <Card className="benaya-card mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Opportunités</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCreateOpportunity}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle opportunité
                  </Button>
                </CardHeader>
                <CardContent>
                  {opportunities.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {opportunities.map(opportunity => (
                        <OpportunityCard
                          key={opportunity.id}
                          opportunity={opportunity}
                          onView={() => navigate(`/opportunities/${opportunity.id}`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                      <p className="mb-4">Aucune opportunité pour ce tiers</p>
                      <Button 
                        onClick={handleCreateOpportunity}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Créer une opportunité
                      </Button>
                    </div>
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
          />
        </DialogContent>
      </Dialog>

    </>
  );
}