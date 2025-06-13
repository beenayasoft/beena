import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Quote } from "@/lib/types/quote";
import { formatCurrency } from "@/lib/utils";

interface CreateInvoiceFromQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote;
  onSubmit: (quoteId: string, type: 'advance' | 'total', advancePercentage?: number) => void;
}

export function CreateInvoiceFromQuoteModal({
  open,
  onOpenChange,
  quote,
  onSubmit,
}: CreateInvoiceFromQuoteModalProps) {
  const [invoiceType, setInvoiceType] = useState<'advance' | 'total'>('total');
  const [advancePercentage, setAdvancePercentage] = useState<number>(30);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculer le montant de l'acompte
  const calculateAdvanceAmount = () => {
    return (quote.totalTTC * advancePercentage) / 100;
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (invoiceType === 'advance') {
      if (!advancePercentage) {
        newErrors.advancePercentage = "Le pourcentage est requis";
      } else if (advancePercentage <= 0 || advancePercentage >= 100) {
        newErrors.advancePercentage = "Le pourcentage doit être entre 1 et 99";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(
        quote.id, 
        invoiceType, 
        invoiceType === 'advance' ? advancePercentage : undefined
      );
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Créer une facture</DialogTitle>
          <DialogDescription>
            À partir du devis {quote.number} - {quote.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations sur le devis */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Devis:</span>
              <span className="font-medium">{quote.number}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Client:</span>
              <span className="font-medium">{quote.clientName}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-neutral-200 dark:border-neutral-700 pt-2">
              <span>Montant total:</span>
              <span className="text-benaya-900 dark:text-benaya-200">{formatCurrency(quote.totalTTC)} MAD</span>
            </div>
          </div>

          {/* Type de facture */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">Type de facture</Label>
            <RadioGroup 
              value={invoiceType} 
              onValueChange={(value) => setInvoiceType(value as 'advance' | 'total')}
              className="space-y-4"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="advance" id="advance" />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="advance"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Facture d'acompte
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Facturer un pourcentage du montant total
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="total" id="total" />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="total"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Facture totale
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Facturer le montant total du devis
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Pourcentage d'acompte (si facture d'acompte) */}
          {invoiceType === 'advance' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="advancePercentage" className={errors.advancePercentage ? "text-red-500" : ""}>
                  Pourcentage d'acompte (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="advancePercentage"
                  type="number"
                  min="1"
                  max="99"
                  value={advancePercentage}
                  onChange={(e) => setAdvancePercentage(parseInt(e.target.value))}
                  className={`benaya-input ${errors.advancePercentage ? "border-red-500" : ""}`}
                />
                {errors.advancePercentage && (
                  <div className="flex items-center text-xs text-red-500">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.advancePercentage}
                  </div>
                )}
              </div>

              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="flex justify-between font-semibold">
                  <span>Montant de l'acompte:</span>
                  <span className="text-benaya-900 dark:text-benaya-200">
                    {formatCurrency(calculateAdvanceAmount())} MAD
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="benaya-button-primary gap-2">
            <Check className="w-4 h-4" />
            Créer la facture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}