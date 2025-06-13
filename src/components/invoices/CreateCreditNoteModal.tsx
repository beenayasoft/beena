import { useState, useEffect } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Invoice, InvoiceItem } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";

interface CreateCreditNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onSubmit: (invoiceId: string, isFullCreditNote: boolean, selectedItems?: string[]) => void;
}

export function CreateCreditNoteModal({
  open,
  onOpenChange,
  invoice,
  onSubmit,
}: CreateCreditNoteModalProps) {
  const [isFullCreditNote, setIsFullCreditNote] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>(`Avoir pour la facture N°${invoice.number}`);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Réinitialiser le formulaire quand la modale s'ouvre
  useEffect(() => {
    if (open) {
      setIsFullCreditNote(true);
      setSelectedItems([]);
      setNotes(`Avoir pour la facture N°${invoice.number}`);
      setErrors({});
    }
  }, [open, invoice.number]);

  // Gérer la sélection d'un élément
  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
    setErrors(prev => ({ ...prev, selectedItems: "" }));
  };

  // Calculer le montant total de l'avoir
  const calculateCreditNoteAmount = () => {
    if (isFullCreditNote) {
      return invoice.totalTTC;
    } else {
      return invoice.items
        .filter(item => selectedItems.includes(item.id))
        .reduce((sum, item) => sum + item.totalTTC, 0);
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!isFullCreditNote && selectedItems.length === 0) {
      newErrors.selectedItems = "Veuillez sélectionner au moins un élément";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(
        invoice.id, 
        isFullCreditNote, 
        isFullCreditNote ? undefined : selectedItems
      );
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Créer un avoir</DialogTitle>
          <DialogDescription>
            Facture {invoice.number} - {invoice.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Type d'avoir */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">Type d'avoir</Label>
            <div className="flex flex-col gap-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="fullCreditNote"
                  checked={isFullCreditNote}
                  onCheckedChange={(checked) => {
                    setIsFullCreditNote(checked as boolean);
                    if (checked) {
                      setSelectedItems([]);
                    }
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="fullCreditNote"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Avoir total
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Annule complètement la facture avec tous ses éléments
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="partialCreditNote"
                  checked={!isFullCreditNote}
                  onCheckedChange={(checked) => {
                    setIsFullCreditNote(!(checked as boolean));
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="partialCreditNote"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Avoir partiel
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez les éléments spécifiques à annuler
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Éléments de la facture */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className={errors.selectedItems ? "text-red-500" : ""}>
                Éléments de la facture
              </Label>
              {errors.selectedItems && (
                <div className="flex items-center text-xs text-red-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.selectedItems}
                </div>
              )}
            </div>

            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {!isFullCreditNote && <TableHead className="w-[50px]"></TableHead>}
                    <TableHead>Désignation</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>TVA</TableHead>
                    <TableHead>Total HT</TableHead>
                    <TableHead>Total TTC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items
                    .filter(item => item.type !== 'chapter' && item.type !== 'section')
                    .map((item) => (
                    <TableRow key={item.id}>
                      {!isFullCreditNote && (
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => 
                              handleItemSelection(item.id, checked as boolean)
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.designation}</div>
                          {item.description && (
                            <div className="text-xs text-neutral-600 dark:text-neutral-400">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)} MAD</TableCell>
                      <TableCell>{item.vatRate}%</TableCell>
                      <TableCell>{formatCurrency(item.totalHT)} MAD</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(item.totalTTC)} MAD</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Montant de l'avoir */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div className="flex justify-between font-semibold text-lg">
              <span>Montant total de l'avoir:</span>
              <span className="text-red-600 dark:text-red-400">
                -{formatCurrency(calculateCreditNoteAmount())} MAD
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="benaya-input min-h-[100px]"
              placeholder="Motif de l'avoir..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="benaya-button-primary gap-2">
            <Check className="w-4 h-4" />
            Créer l'avoir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}