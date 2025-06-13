import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tier, TierFormValues, tierFormSchema, tierTypes } from "./types";
import { useEffect } from "react";

interface TierFormProps {
  onSubmit: (values: TierFormValues) => void;
  onCancel: () => void;
  initialValues?: Partial<TierFormValues>;
  isEditing?: boolean;
}

export function TierForm({ 
  onSubmit, 
  onCancel, 
  initialValues,
  isEditing = false 
}: TierFormProps) {
  console.log("TierForm rendering with initialValues:", initialValues);
  
  const form = useForm<TierFormValues>({
    resolver: zodResolver(tierFormSchema),
    defaultValues: {
      name: "",
      types: [],
      contact: "",
      email: "",
      phone: "",
      address: "",
      siret: "",
      status: "active",
    },
  });

  // Mettre à jour les valeurs du formulaire lorsque initialValues change
  useEffect(() => {
    if (initialValues) {
      console.log("Resetting form with values:", initialValues);
      // Réinitialiser le formulaire avec les nouvelles valeurs
      form.reset({
        name: initialValues.name || "",
        types: initialValues.types || [],
        contact: initialValues.contact || "",
        email: initialValues.email || "",
        phone: initialValues.phone || "",
        address: initialValues.address || "",
        siret: initialValues.siret || "",
        status: initialValues.status || "active",
      });
    }
  }, [form, initialValues]);

  const handleFormSubmit = (values: TierFormValues) => {
    console.log("Form submitted with values:", values);
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Nom de l'entreprise" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact principal */}
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact principal</FormLabel>
                <FormControl>
                  <Input placeholder="Nom et prénom" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemple.fr" type="email" {...field} />
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
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="06 12 34 56 78" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SIRET */}
          <FormField
            control={form.control}
            name="siret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SIRET (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="123 456 789 00012" {...field} />
                </FormControl>
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
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Adresse */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="Adresse complète" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Types */}
        <FormField
          control={form.control}
          name="types"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Type de tiers</FormLabel>
                <FormDescription>
                  Sélectionnez au moins un type
                </FormDescription>
              </div>
              <div className="flex flex-wrap gap-4">
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" className="benaya-button-primary">
            <Check className="mr-2 h-4 w-4" />
            {isEditing ? "Modifier le tiers" : "Créer le tiers"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
} 