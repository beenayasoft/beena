import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building, Upload, X } from "lucide-react";

interface CompanyIdentityFormProps {
  companyData: {
    name: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    logo?: string;
  };
  onChange: (data: any) => void;
}

export function CompanyIdentityForm({ companyData, onChange }: CompanyIdentityFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(companyData.logo || null);

  const handleInputChange = (field: string, value: string) => {
    onChange({ ...companyData, [field]: value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
      alert('Format de fichier non supporté. Veuillez utiliser JPG, PNG ou SVG.');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. La taille maximale est de 2MB.');
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoPreview(result);
      onChange({ ...companyData, logo: result });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    onChange({ ...companyData, logo: undefined });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="companyName">Nom de la société <span className="text-red-500">*</span></Label>
          <Input
            id="companyName"
            value={companyData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Nom de votre entreprise"
            className="benaya-input"
            required
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2 md:col-span-2">
          <Label>Logo de l'entreprise</Label>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-4 text-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="logo"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.svg"
                  onChange={handleLogoChange}
                />
                <label htmlFor="logo" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Cliquez pour télécharger votre logo
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    JPG, PNG ou SVG. Max 2MB.
                  </p>
                </label>
              </div>
            </div>

            {logoPreview && (
              <div className="relative">
                <div className="w-24 h-24 border border-neutral-200 dark:border-neutral-700 rounded-lg flex items-center justify-center bg-white dark:bg-neutral-800 overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                  onClick={removeLogo}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Adresse</Label>
          <Textarea
            id="address"
            value={companyData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Adresse de l'entreprise"
            className="benaya-input resize-none"
            rows={2}
          />
        </div>

        {/* Postal Code, City, Country */}
        <div className="space-y-2">
          <Label htmlFor="postalCode">Code postal</Label>
          <Input
            id="postalCode"
            value={companyData.postalCode}
            onChange={(e) => handleInputChange("postalCode", e.target.value)}
            placeholder="Code postal"
            className="benaya-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            value={companyData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="Ville"
            className="benaya-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Input
            id="country"
            value={companyData.country}
            onChange={(e) => handleInputChange("country", e.target.value)}
            placeholder="Pays"
            className="benaya-input"
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={companyData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="Numéro de téléphone"
            className="benaya-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={companyData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Email de contact"
            className="benaya-input"
          />
        </div>
      </div>
    </div>
  );
}