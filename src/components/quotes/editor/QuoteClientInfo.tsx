import { useState } from "react";
import { Edit2, User, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Quote } from "@/lib/types/quote";

interface QuoteClientInfoProps {
  quote: Quote;
  onUpdate: (updates: Partial<Quote>) => void;
  isEditable?: boolean;
}

export function QuoteClientInfo({
  quote,
  onUpdate,
  isEditable = true,
}: QuoteClientInfoProps) {
  const [isEditing, setIsEditing] = useState(false);

  // État local pour les modifications
  const [clientInfo, setClientInfo] = useState({
    clientId: quote.clientId,
    clientName: quote.clientName,
    clientAddress: quote.clientAddress || "",
    projectId: quote.projectId || "",
    projectName: quote.projectName || "",
    projectAddress: quote.projectAddress || "",
    issueDate: quote.issueDate || "",
    expiryDate: quote.expiryDate || "",
    validityPeriod: quote.validityPeriod,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onUpdate(clientInfo);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Réinitialiser les valeurs
    setClientInfo({
      clientId: quote.clientId,
      clientName: quote.clientName,
      clientAddress: quote.clientAddress || "",
      projectId: quote.projectId || "",
      projectName: quote.projectName || "",
      projectAddress: quote.projectAddress || "",
      issueDate: quote.issueDate || "",
      expiryDate: quote.expiryDate || "",
      validityPeriod: quote.validityPeriod,
    });
    setIsEditing(false);
  };

  return (
    <div className="benaya-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Informations du devis</h3>
        {isEditable && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="text-benaya-600 hover:text-benaya-700"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Client
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="clientName">Nom du client</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={clientInfo.clientName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="clientAddress">Adresse</Label>
                <Input
                  id="clientAddress"
                  name="clientAddress"
                  value={clientInfo.clientAddress}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Projet
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="projectName">Nom du projet</Label>
                <Input
                  id="projectName"
                  name="projectName"
                  value={clientInfo.projectName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="projectAddress">Adresse du projet</Label>
                <Input
                  id="projectAddress"
                  name="projectAddress"
                  value={clientInfo.projectAddress}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dates
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="issueDate">Date d'émission</Label>
                <Input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={clientInfo.issueDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="validityPeriod">Validité (jours)</Label>
                <Input
                  id="validityPeriod"
                  name="validityPeriod"
                  type="number"
                  value={clientInfo.validityPeriod}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 md:col-span-2">
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Client
            </h4>
            <div className="space-y-1">
              <div className="font-medium">{quote.clientName}</div>
              {quote.clientAddress && (
                <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {quote.clientAddress}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Projet
            </h4>
            <div className="space-y-1">
              <div className="font-medium">
                {quote.projectName || "—"}
              </div>
              {quote.projectAddress && (
                <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {quote.projectAddress}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 col-span-1 md:col-span-2">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dates
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Date d'émission
                </div>
                <div className="font-medium">{quote.issueDate || "—"}</div>
              </div>
              <div>
                <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Date d'expiration
                </div>
                <div className="font-medium">{quote.expiryDate || "—"}</div>
              </div>
              <div>
                <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Durée de validité
                </div>
                <div className="font-medium">{quote.validityPeriod} jours</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 