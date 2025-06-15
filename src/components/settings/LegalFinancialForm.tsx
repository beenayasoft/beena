import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LegalFinancialFormProps {
  legalData: {
    legalForm: string;
    siret: string;
    vatNumber: string;
    iban: string;
    bic: string;
    bankName: string;
  };
  onChange: (data: any) => void;
}

export function LegalFinancialForm({ legalData, onChange }: LegalFinancialFormProps) {
  const handleInputChange = (field: string, value: string) => {
    onChange({ ...legalData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Legal Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Informations légales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="legalForm">Forme juridique</Label>
            <Select 
              value={legalData.legalForm} 
              onValueChange={(value) => handleInputChange("legalForm", value)}
            >
              <SelectTrigger className="benaya-input">
                <SelectValue placeholder="Sélectionner une forme juridique" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SARL">SARL</SelectItem>
                <SelectItem value="EURL">EURL</SelectItem>
                <SelectItem value="SAS">SAS</SelectItem>
                <SelectItem value="SASU">SASU</SelectItem>
                <SelectItem value="SA">SA</SelectItem>
                <SelectItem value="EI">Entreprise Individuelle</SelectItem>
                <SelectItem value="EIRL">EIRL</SelectItem>
                <SelectItem value="SNC">SNC</SelectItem>
                <SelectItem value="SCI">SCI</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siret">SIRET</Label>
            <Input
              id="siret"
              value={legalData.siret}
              onChange={(e) => handleInputChange("siret", e.target.value)}
              placeholder="12345678901234"
              className="benaya-input"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="vatNumber">Numéro de TVA intracommunautaire</Label>
            <Input
              id="vatNumber"
              value={legalData.vatNumber}
              onChange={(e) => handleInputChange("vatNumber", e.target.value)}
              placeholder="FR12345678901"
              className="benaya-input"
            />
          </div>
        </div>
      </div>

      {/* Bank Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Coordonnées bancaires
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input
              id="iban"
              value={legalData.iban}
              onChange={(e) => handleInputChange("iban", e.target.value)}
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              className="benaya-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bic">BIC / SWIFT</Label>
            <Input
              id="bic"
              value={legalData.bic}
              onChange={(e) => handleInputChange("bic", e.target.value)}
              placeholder="ABCDEFGHIJK"
              className="benaya-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bankName">Nom de la banque</Label>
            <Input
              id="bankName"
              value={legalData.bankName}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
              placeholder="Nom de votre banque"
              className="benaya-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}