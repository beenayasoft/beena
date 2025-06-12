import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Building,
  Mail,
  Bell,
  Shield,
  Palette,
  Database,
  DollarSign,
  Calendar,
  FileText,
  Users,
  Printer,
  Cloud,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const settingsSections = [
  {
    id: "profile",
    label: "Profil",
    icon: User,
    description: "Informations personnelles et compte",
  },
  {
    id: "company",
    label: "Entreprise",
    icon: Building,
    description: "Paramètres de votre entreprise",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Préférences de notifications",
  },
  {
    id: "security",
    label: "Sécurité",
    icon: Shield,
    description: "Mot de passe et sécurité",
  },
  {
    id: "appearance",
    label: "Apparence",
    icon: Palette,
    description: "Thème et personnalisation",
  },
  {
    id: "billing",
    label: "Facturation",
    icon: DollarSign,
    description: "Modèles et paramètres de facturation",
  },
  {
    id: "integrations",
    label: "Intégrations",
    icon: Cloud,
    description: "Services tiers et API",
  },
  {
    id: "data",
    label: "Données",
    icon: Database,
    description: "Sauvegarde et exportation",
  },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);

  const SettingsCard = ({
    title,
    description,
    children,
  }: {
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div className="benaya-card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <Separator />
      <div className="space-y-4">{children}</div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Informations personnelles"
        description="Modifiez vos informations personnelles"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              defaultValue="Jean"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              defaultValue="Dupont"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue="jean@benaya.fr"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              defaultValue="+212 6 12 34 56 78"
              className="benaya-input"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Biographie</Label>
          <Textarea
            id="bio"
            placeholder="Quelques mots sur vous..."
            className="benaya-input min-h-[100px]"
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Photo de profil"
        description="Votre photo apparaîtra dans l'interface"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-benaya-900 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">J</span>
          </div>
          <div className="space-y-2">
            <Button variant="outline">Changer la photo</Button>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              PNG, JPG jusqu'à 2MB
            </p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Informations de l'entreprise"
        description="Paramètres généraux de votre entreprise"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nom de l'entreprise</Label>
            <Input
              id="companyName"
              defaultValue="Benaya Construction"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siret">SIRET</Label>
            <Input
              id="siret"
              defaultValue="12345678901234"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tva">N° TVA</Label>
            <Input
              id="tva"
              defaultValue="FR12345678901"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector">Secteur d'activité</Label>
            <Select defaultValue="construction">
              <SelectTrigger className="benaya-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="renovation">Rénovation</SelectItem>
                <SelectItem value="amenagement">Aménagement</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Textarea
            id="address"
            defaultValue="123 Rue de la Construction, 20000 Casablanca, Maroc"
            className="benaya-input"
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Logo de l'entreprise"
        description="Utilisé sur les devis, factures et documents"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-benaya-900 flex items-center justify-center">
            <div className="w-10 h-10 text-white">
              <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                <g fill="currentColor" opacity="0.9">
                  <path d="M20 2L27.32 6.5V15.5L20 20L12.68 15.5V6.5L20 2Z" />
                </g>
                <path
                  d="M15 20L18.5 23.5L25 17"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <Button variant="outline">Changer le logo</Button>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              PNG, SVG recommandé, jusqu'à 5MB
            </p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Notifications email"
        description="Choisissez quand recevoir des emails"
      >
        <div className="space-y-4">
          {[
            {
              title: "Nouveaux devis",
              description: "Quand un nouveau devis est créé",
              defaultChecked: true,
            },
            {
              title: "Factures payées",
              description: "Quand une facture est marquée comme payée",
              defaultChecked: true,
            },
            {
              title: "Échéances proches",
              description: "Rappels d'échéances dans 3 jours",
              defaultChecked: true,
            },
            {
              title: "Stock faible",
              description: "Quand un article atteint le stock minimum",
              defaultChecked: false,
            },
            {
              title: "Rapport hebdomadaire",
              description: "Résumé des activités de la semaine",
              defaultChecked: false,
            },
          ].map((notification) => (
            <div
              key={notification.title}
              className="flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <Label className="font-medium">{notification.title}</Label>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {notification.description}
                </p>
              </div>
              <Switch defaultChecked={notification.defaultChecked} />
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Notifications push"
        description="Notifications dans l'application"
      >
        <div className="space-y-4">
          {[
            {
              title: "Interventions urgentes",
              description: "Notifications pour les interventions urgentes",
              defaultChecked: true,
            },
            {
              title: "Messages clients",
              description: "Nouveaux messages de clients",
              defaultChecked: true,
            },
            {
              title: "Mises à jour système",
              description: "Nouvelles fonctionnalités et corrections",
              defaultChecked: false,
            },
          ].map((notification) => (
            <div
              key={notification.title}
              className="flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <Label className="font-medium">{notification.title}</Label>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {notification.description}
                </p>
              </div>
              <Switch defaultChecked={notification.defaultChecked} />
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Mot de passe"
        description="Modifiez votre mot de passe"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                className="benaya-input pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input id="newPassword" type="password" className="benaya-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              className="benaya-input"
            />
          </div>
          <Button className="benaya-button-primary">
            Mettre à jour le mot de passe
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Authentification à deux facteurs"
        description="Renforcez la sécurité de votre compte"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Activer 2FA</Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Utiliser une application d'authentification
              </p>
            </div>
            <Switch />
          </div>
          <Button variant="outline">Configurer l'authentificateur</Button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Sessions actives"
        description="Gérez vos sessions de connexion"
      >
        <div className="space-y-3">
          {[
            {
              device: "Chrome sur Windows",
              location: "Casablanca, Maroc",
              lastActive: "Maintenant",
              current: true,
            },
            {
              device: "Safari sur iPhone",
              location: "Rabat, Maroc",
              lastActive: "Il y a 2 heures",
              current: false,
            },
          ].map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg"
            >
              <div>
                <p className="font-medium text-sm">
                  {session.device}
                  {session.current && (
                    <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      Actuelle
                    </span>
                  )}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {session.location} • {session.lastActive}
                </p>
              </div>
              {!session.current && (
                <Button variant="outline" size="sm">
                  Déconnecter
                </Button>
              )}
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Thème"
        description="Personnalisez l'apparence de l'interface"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: "light", label: "Clair", preview: "bg-white border-2" },
              {
                id: "dark",
                label: "Sombre",
                preview: "bg-neutral-900 border-2",
              },
              {
                id: "system",
                label: "Système",
                preview: "bg-gradient-to-br from-white to-neutral-900 border-2",
              },
            ].map((theme) => (
              <div
                key={theme.id}
                className="cursor-pointer p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-benaya-500 transition-colors"
              >
                <div
                  className={cn(
                    "w-full h-20 rounded mb-2",
                    theme.preview,
                    theme.id === "system" && "border-benaya-500",
                  )}
                ></div>
                <p className="text-sm font-medium text-center">{theme.label}</p>
              </div>
            ))}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Langue"
        description="Choisissez votre langue préférée"
      >
        <Select defaultValue="fr">
          <SelectTrigger className="benaya-input w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">🇫🇷 Français</SelectItem>
            <SelectItem value="en">🇺🇸 English</SelectItem>
            <SelectItem value="ar">🇲🇦 العربية</SelectItem>
            <SelectItem value="es">🇪🇸 Español</SelectItem>
          </SelectContent>
        </Select>
      </SettingsCard>

      <SettingsCard
        title="Format"
        description="Formats d'affichage des données"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Format de date</Label>
            <Select defaultValue="dd/mm/yyyy">
              <SelectTrigger className="benaya-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Devise</Label>
            <Select defaultValue="mad">
              <SelectTrigger className="benaya-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mad">MAD (Dirham)</SelectItem>
                <SelectItem value="eur">EUR (Euro)</SelectItem>
                <SelectItem value="usd">USD (Dollar)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsCard>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Modèles de documents"
        description="Personnalisez vos devis et factures"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceTemplate">Modèle de facture</Label>
            <Select defaultValue="modern">
              <SelectTrigger className="benaya-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Moderne</SelectItem>
                <SelectItem value="classic">Classique</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quoteTemplate">Modèle de devis</Label>
            <Select defaultValue="professional">
              <SelectTrigger className="benaya-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professionnel</SelectItem>
                <SelectItem value="detailed">Détaillé</SelectItem>
                <SelectItem value="simple">Simple</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Numérotation automatique"
        description="Configuration des numéros de documents"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quotePrefix">Préfixe devis</Label>
            <Input
              id="quotePrefix"
              defaultValue="DEV-"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Préfixe facture</Label>
            <Input
              id="invoicePrefix"
              defaultValue="FAC-"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quoteCounter">Compteur devis</Label>
            <Input
              id="quoteCounter"
              defaultValue="001"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceCounter">Compteur facture</Label>
            <Input
              id="invoiceCounter"
              defaultValue="001"
              className="benaya-input"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Conditions de paiement"
        description="Paramètres par défaut"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Délai de paiement (jours)</Label>
            <Input
              id="paymentTerms"
              defaultValue="30"
              type="number"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethods">Modes de paiement acceptés</Label>
            <Textarea
              id="paymentMethods"
              defaultValue="Virement bancaire, Chèque, Espèces"
              className="benaya-input"
            />
          </div>
        </div>
      </SettingsCard>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Services de stockage"
        description="Synchronisez vos documents"
      >
        <div className="space-y-4">
          {[
            {
              name: "Google Drive",
              icon: "🗄️",
              connected: true,
              description: "Sauvegarde automatique des documents",
            },
            {
              name: "Dropbox",
              icon: "📦",
              connected: false,
              description: "Synchronisation des fichiers",
            },
            {
              name: "OneDrive",
              icon: "☁️",
              connected: false,
              description: "Stockage Microsoft",
            },
          ].map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{service.icon}</span>
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {service.description}
                  </p>
                </div>
              </div>
              <Button
                variant={service.connected ? "outline" : "default"}
                size="sm"
              >
                {service.connected ? "Déconnecter" : "Connecter"}
              </Button>
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        title="API et Webhooks"
        description="Intégrations personnalisées"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Clé API</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                defaultValue="bny_live_••••••••••••••••"
                className="benaya-input flex-1"
                disabled
              />
              <Button variant="outline">Régénérer</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">URL Webhook</Label>
            <Input
              id="webhookUrl"
              placeholder="https://votre-site.com/webhook"
              className="benaya-input"
            />
          </div>
        </div>
      </SettingsCard>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Sauvegarde automatique"
        description="Protection de vos données"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Sauvegarde quotidienne</Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Sauvegarde automatique tous les jours à 2h00
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="space-y-2">
            <Label>Dernière sauvegarde</Label>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              20/01/2025 à 02:00 (Succès)
            </p>
          </div>
          <Button variant="outline">Créer une sauvegarde maintenant</Button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Exportation de données"
        description="Téléchargez vos données"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Clients", description: "Liste complète des clients" },
              { label: "Devis", description: "Tous les devis créés" },
              { label: "Factures", description: "Historique des factures" },
              { label: "Stock", description: "Inventaire complet" },
            ].map((dataType) => (
              <div
                key={dataType.label}
                className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
              >
                <h4 className="font-medium">{dataType.label}</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {dataType.description}
                </p>
                <Button variant="outline" size="sm">
                  Exporter CSV
                </Button>
              </div>
            ))}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Suppression de compte"
        description="Attention : cette action est irréversible"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200">
              Supprimer définitivement mon compte
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Toutes vos données seront supprimées définitivement. Cette action
              ne peut pas être annulée.
            </p>
          </div>
          <Button variant="outline" className="text-red-600 border-red-300">
            Supprimer mon compte
          </Button>
        </div>
      </SettingsCard>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSettings();
      case "company":
        return renderCompanySettings();
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      case "appearance":
        return renderAppearanceSettings();
      case "billing":
        return renderBillingSettings();
      case "integrations":
        return renderIntegrationsSettings();
      case "data":
        return renderDataSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Paramètres</h1>
            <p className="text-benaya-100 mt-1">
              Configurez votre application Benaya
            </p>
          </div>
          <SettingsIcon className="w-8 h-8 text-white/80" />
        </div>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="benaya-card">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Configuration
            </h3>
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors",
                      activeSection === section.id
                        ? "bg-benaya-900 text-white"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{section.label}</div>
                      <div
                        className={cn(
                          "text-xs",
                          activeSection === section.id
                            ? "text-white/80"
                            : "text-neutral-500 dark:text-neutral-400",
                        )}
                      >
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {renderSectionContent()}

            {/* Save Button */}
            <div className="benaya-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    N'oubliez pas de sauvegarder vos modifications
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Annuler</Button>
                  <Button className="benaya-button-primary">Enregistrer</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
