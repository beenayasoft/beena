import { Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TierFormValues, 
  tierTypes, 
  EntityType,
} from "./types";
import { useTierForm } from "./hooks/useTierForm";

interface TierFormProps {
  onSubmit: (values: TierFormValues) => void | Promise<void>;
  onCancel: () => void;
  initialValues?: Partial<TierFormValues>;
  isEditing?: boolean;
  entityType: EntityType; // FIXÉ depuis l'extérieur
  loading?: boolean;
  error?: string | null;
}

export function TierForm({ 
  onSubmit, 
  onCancel, 
  initialValues,
  isEditing = false,
  entityType, // Type fixé depuis l'extérieur
  loading = false,
  error: externalError
}: TierFormProps) {
  console.log("TierForm rendering with:", { entityType, initialValues, isEditing });
  
  // Utiliser notre nouveau hook personnalisé
  const {
    form,
    isSubmitting,
    error: formError,
    visibleFields,
    handleSubmit: hookHandleSubmit,
    handleCancel: hookHandleCancel,
    clearError,
  } = useTierForm({
    entityType,
    initialValues,
    onSubmit,
    onCancel,
  });

  // Erreur à afficher (externe ou du formulaire)
  const displayError = externalError || formError?.message;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(hookHandleSubmit)} className="space-y-6 py-4">
        {/* Affichage des erreurs */}
        {displayError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {displayError}
              {formError && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0 text-destructive hover:text-destructive/80"
                  onClick={clearError}
                >
                  Ignorer
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" disabled={loading || isSubmitting}>
              Général
            </TabsTrigger>
            <TabsTrigger value="contact" disabled={loading || isSubmitting}>
              Contact
            </TabsTrigger>
            <TabsTrigger value="adresse" disabled={loading || isSubmitting}>
              Adresse
            </TabsTrigger>
          </TabsList>
          
          {/* Onglet Informations générales */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Affichage du type d'entité (lecture seule) */}
              <div className="p-3 bg-muted rounded-lg border">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Type de tier
                </div>
                <div className="text-base font-semibold">
                  {entityType === "entreprise" ? "🏢 Entreprise" : "👤 Particulier"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {entityType === "entreprise" 
                    ? "Société, SARL, SAS, association..." 
                    : "Personne physique"
                  }
                </div>
              </div>

              {/* Nom */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {entityType === "entreprise" ? "Nom de l'entreprise *" : "Nom ou raison sociale *"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={
                          entityType === "entreprise" 
                            ? "Ex: Dupont Construction SARL" 
                            : "Ex: Dupont (nom de famille) ou Auto-Entrepreneur Dupont"
                        } 
                        disabled={loading || isSubmitting}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* SIRET - uniquement pour les entreprises */}
              {visibleFields.includes("siret") && (
                <FormField
                  control={form.control}
                  name="siret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SIRET *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 456 789 00012" 
                          disabled={loading || isSubmitting}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Numéro SIRET obligatoire pour les entreprises (14 chiffres)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Type de tiers (checkboxes) */}
              <FormField
                control={form.control}
                name="types"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>Type de relation *</FormLabel>
                      <FormDescription>
                        Sélectionnez au moins un type de relation commerciale
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {tierTypes.map((type) => (
                        <FormField
                          key={type.id}
                          control={form.control}
                          name="types"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={type.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(type.id)}
                                    disabled={loading || isSubmitting}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, type.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== type.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {type.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Statut */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={loading || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          {/* Onglet Contact */}
          <TabsContent value="contact" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prénom du contact - obligatoire pour particulier */}
              {visibleFields.includes("contactPrenom") && (
                <FormField
                  control={form.control}
                  name="contactPrenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Prénom {entityType === "particulier" && "*"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            entityType === "particulier" 
                              ? "Ex: Jean" 
                              : "Ex: Jean (contact principal)"
                          } 
                          disabled={loading || isSubmitting}
                          {...field} 
                        />
                      </FormControl>
                      {entityType === "particulier" && (
                        <FormDescription>
                          Prénom de la personne (obligatoire)
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Nom du contact */}
              <FormField
                control={form.control}
                name="contactNom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {entityType === "particulier" ? "Nom de famille *" : "Nom du contact *"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={
                          entityType === "particulier" 
                            ? "Ex: Dupont" 
                            : "Ex: Dupont (nom du contact principal)"
                        } 
                        disabled={loading || isSubmitting}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@exemple.fr" 
                        type="email" 
                        disabled={loading || isSubmitting}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Téléphone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="06 12 34 56 78" 
                        disabled={loading || isSubmitting}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fonction - uniquement pour les entreprises */}
              {visibleFields.includes("fonction") && (
                <FormField
                  control={form.control}
                  name="fonction"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Fonction</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Directeur, Responsable achat, Chef de projet..." 
                          disabled={loading || isSubmitting}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Fonction du contact dans l'entreprise
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </TabsContent>
          
          {/* Onglet Adresse */}
          <TabsContent value="adresse" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Rue */}
              <FormField
                control={form.control}
                name="adresseRue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {entityType === "particulier" ? "Adresse *" : "Adresse de l'entreprise *"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 15 rue des Bâtisseurs" 
                        disabled={loading || isSubmitting}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code postal */}
                <FormField
                  control={form.control}
                  name="adresseCodePostal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="75001" 
                          disabled={loading || isSubmitting}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Ville */}
                <FormField
                  control={form.control}
                  name="adresseVille"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Paris" 
                          disabled={loading || isSubmitting}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pays */}
              <FormField
                control={form.control}
                name="pays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="France" 
                        disabled={loading || isSubmitting}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={hookHandleCancel}
            disabled={loading || isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            className="benaya-button-primary"
            disabled={loading || isSubmitting}
          >
            {(loading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Modifier" : `Créer ${entityType === "entreprise" ? "l'entreprise" : "le particulier"}`}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
} 