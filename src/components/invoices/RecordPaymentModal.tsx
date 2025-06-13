import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Invoice, Payment, PaymentMethod } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";

interface RecordPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onSubmit: (invoiceId: string, payment: Omit<Payment, "id">) => void;
}

export function RecordPaymentModal({
  open,
  onOpenChange,
  invoice,
  onSubmit,
}: RecordPaymentModalProps) {
  const [payment, setPayment] = useState<Omit<Payment, "id">>({
    date: new Date().toISOString().split("T")[0],
    amount: invoice.remainingAmount,
    method: "bank_transfer",
    reference: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Réinitialiser le formulaire quand la modale s'ouvre
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setPayment({
        date: new Date().toISOString().split("T")[0],
        amount: invoice.remainingAmount,
        method: "bank_transfer",
        reference: "",
        notes: "",
      });
      setErrors({});
    }
    onOpenChange(open);
  };

  // Mettre à jour les champs du paiement
  const handleInputChange = (field: string, value: string | number) => {
    setPayment(prev => ({
      ...prev,
      [field]: value,
    }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!payment.date) {
      newErrors.date = "La date est requise";
    }
    
    if (!payment.amount) {
      newErrors.amount = "Le montant est requis";
    } else if (payment.amount <= 0) {
      newErrors.amount = "Le montant doit être supérieur à 0";
    } else if (payment.amount > invoice.remainingAmount) {
      newErrors.amount = `Le montant ne peut pas dépasser le restant dû (${formatCurrency(invoice.remainingAmount)} MAD)`;
    }
    
    if (!payment.method) {
      newErrors.method = "Le mode de paiement est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(invoice.id, payment);
      onOpenChange(false);
    }
  };

  // Obtenir le libellé du mode de paiement
  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case "bank_transfer": return "Virement bancaire";
      case "check": return "Chèque";
      case "cash": return "Espèces";
      case "card": return "Carte bancaire";
      case "other": return "Autre";
      default: return method;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Enregistrer un paiement</DialogTitle>
          <DialogDescription>
            Facture {invoice.number} - {invoice.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informations sur la facture */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Total TTC:</span>
              <span className="font-medium">{formatCurrency(invoice.totalTTC)} MAD</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Déjà payé:</span>
              <span className="font-medium">{formatCurrency(invoice.paidAmount)} MAD</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-neutral-200 dark:border-neutral-700 pt-2">
              <span>Restant dû:</span>
              <span className="text-benaya-900 dark:text-benaya-200">{formatCurrency(invoice.remainingAmount)} MAD</span>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date" className={errors.date ? "text-red-500" : ""}>
                Date du paiement <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={payment.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className={`benaya-input ${errors.date ? "border-red-500" : ""}`}
              />
              {errors.date && (
                <div className="flex items-center text-xs text-red-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.date}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className={errors.amount ? "text-red-500" : ""}>
                Montant (MAD) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={payment.amount}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value))}
                className={`benaya-input ${errors.amount ? "border-red-500" : ""}`}
              />
              {errors.amount && (
                <div className="flex items-center text-xs text-red-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.amount}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="method" className={errors.method ? "text-red-500" : ""}>
                Mode de paiement <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={payment.method} 
                onValueChange={(value) => handleInputChange("method", value as PaymentMethod)}
              >
                <SelectTrigger className={`benaya-input ${errors.method ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Sélectionner un mode de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="card">Carte bancaire</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
              {errors.method && (
                <div className="flex items-center text-xs text-red-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.method}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Référence (optionnel)</Label>
              <Input
                id="reference"
                value={payment.reference}
                onChange={(e) => handleInputChange("reference", e.target.value)}
                className="benaya-input"
                placeholder="N° de chèque, référence de virement..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={payment.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="benaya-input"
                placeholder="Informations complémentaires..."
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="benaya-button-primary gap-2">
            <Check className="w-4 h-4" />
            Enregistrer le paiement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}