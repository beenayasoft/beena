import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Building, User, Tag, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tier, initialTiers } from "@/components/tiers";
import { Badge } from "@/components/ui/badge";
import { useTierUtils } from "@/components/tiers";

export default function TierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tier, setTier] = useState<Tier | null>(null);
  const { getTypeBadge, getStatusBadge } = useTierUtils();
  
  useEffect(() => {
    // Dans une application réelle, vous feriez un appel API ici
    // Pour l'instant, on utilise les données mockées
    const foundTier = initialTiers.find(t => t.id === id);
    if (foundTier) {
      setTier(foundTier);
    }
  }, [id]);

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

        {/* Ici, vous pourriez ajouter d'autres sections comme:
           - Historique des interactions
           - Liste des projets associés
           - Documents liés
           - etc.
        */}
      </div>
    </div>
  );
} 