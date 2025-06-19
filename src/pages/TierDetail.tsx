import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Building, User, Tag, Activity, Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tier, initialTiers } from "@/components/tiers";
import { Badge } from "@/components/ui/badge";
import { useTierUtils } from "@/components/tiers";
import { Opportunity } from "@/lib/types/opportunity";
import { getOpportunities } from "@/lib/mock/opportunities";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { OpportunityForm } from "@/components/opportunities/OpportunityForm";
import { toast } from "@/hooks/use-toast";

export default function TierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tier, setTier] = useState<Tier | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const { getTypeBadge, getStatusBadge } = useTierUtils();
  
  useEffect(() => {
    // Dans une application réelle, vous feriez un appel API ici
    // Pour l'instant, on utilise les données mockées
    const foundTier = initialTiers.find(t => t.id === id);
    if (foundTier) {
      setTier(foundTier);
      
      // Charger les opportunités liées à ce tiers
      const tierOpportunities = getOpportunities({ tierId: foundTier.id });
      setOpportunities(tierOpportunities);
    }
  }, [id]);

  // Créer une nouvelle opportunité pour ce tiers
  const handleCreateOpportunity = () => {
    setFormDialogOpen(true);
  };

  // Gérer la soumission du formulaire d'opportunité
  const handleFormSubmit = (formData: Partial<Opportunity>) => {
    // Dans une application réelle, vous feriez un appel API ici
    // Pour l'instant, simulons la création
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

  if (!tier) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Tiers non trouvé</h2>
          <p className="mb-6">Le tiers que vous recherchez n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate("/tiers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => navigate("/tiers")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">{tier.name}</h1>
            </div>
            <p className="text-benaya-100 mt-1">
              {tier.type.map(t => {
                const typeObj = { id: t, label: t.charAt(0).toUpperCase() + t.slice(1) };
                return typeObj.label;
              }).join(", ")}
            </p>
          </div>
          <Button 
            className="gap-2 bg-white text-benaya-900 hover:bg-white/90"
            onClick={() => navigate(`/tiers/edit/${tier.id}`)}
          >
            Modifier
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="benaya-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Nom</div>
                <div className="font-medium">{tier.name}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Contact principal</div>
                <div className="font-medium">{tier.contact}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Email</div>
                <div className="font-medium">
                  <a href={`mailto:${tier.email}`} className="text-benaya-600 hover:underline">
                    {tier.email}
                  </a>
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Téléphone</div>
                <div className="font-medium">
                  <a href={`tel:${tier.phone.replace(/\s/g, "")}`} className="text-benaya-600 hover:underline">
                    {tier.phone}
                  </a>
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">SIRET</div>
                <div className="font-medium">{tier.siret || "Non renseigné"}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Statut</div>
                <div className="font-medium">{getStatusBadge(tier.status)}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Adresse</div>
                <div className="font-medium">{tier.address}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Types</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {tier.type.map(type => (
                    <div key={type}>{getTypeBadge(type)}</div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions et résumé */}
        <Card className="benaya-card">
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
            <Button className="w-full gap-2" variant="outline" onClick={() => window.open(`tel:${tier.phone.replace(/\s/g, "")}`)}>
              <Phone className="h-4 w-4" />
              Appeler
            </Button>
            <Button className="w-full gap-2" variant="outline" onClick={() => window.open(`mailto:${tier.email}`)}>
              <Mail className="h-4 w-4" />
              Envoyer un email
            </Button>
            <Button className="w-full gap-2" variant="outline" onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(tier.address)}`)}>
              <MapPin className="h-4 w-4" />
              Voir sur la carte
            </Button>
          </CardContent>
        </Card>

        {/* Opportunités */}
        <Card className="benaya-card md:col-span-3">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>

      {/* Formulaire de création d'opportunité */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nouvelle opportunité</DialogTitle>
            <DialogDescription>
              Créez une nouvelle opportunité pour {tier.name}
            </DialogDescription>
          </DialogHeader>
          
          <OpportunityForm
            opportunity={{
              tierId: tier.id,
              tierName: tier.name,
              tierType: tier.type,
            }}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormDialogOpen(false)}
            isEditing={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}