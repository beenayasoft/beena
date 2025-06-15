import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VatRate {
  id: string;
  label: string;
  rate: number;
  isDefault?: boolean;
}

interface VatRatesManagementProps {
  vatRates: VatRate[];
  onChange: (vatRates: VatRate[]) => void;
}

export function VatRatesManagement({ vatRates, onChange }: VatRatesManagementProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRate, setNewRate] = useState<Partial<VatRate>>({ label: "", rate: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setErrors({});
  };

  const handleDelete = (id: string) => {
    // Check if it's a default rate
    const rateToDelete = vatRates.find(rate => rate.id === id);
    if (rateToDelete?.isDefault) {
      alert("Vous ne pouvez pas supprimer un taux de TVA par défaut.");
      return;
    }

    // Confirm before deleting
    if (confirm("Êtes-vous sûr de vouloir supprimer ce taux de TVA ?")) {
      const updatedRates = vatRates.filter(rate => rate.id !== id);
      onChange(updatedRates);
    }
  };

  const validateRate = (rate: Partial<VatRate>): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!rate.label) {
      newErrors.label = "Le libellé est requis";
    }
    
    if (rate.rate === undefined || rate.rate < 0 || rate.rate > 100) {
      newErrors.rate = "Le taux doit être entre 0 et 100";
    }
    
    return newErrors;
  };

  const handleSaveEdit = (id: string) => {
    const rateToUpdate = vatRates.find(rate => rate.id === id);
    if (!rateToUpdate) return;
    
    const validationErrors = validateRate(rateToUpdate);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setEditingId(null);
    setErrors({});
    onChange([...vatRates]);
  };

  const handleRateChange = (id: string, field: keyof VatRate, value: string | number) => {
    const updatedRates = vatRates.map(rate => {
      if (rate.id === id) {
        return { ...rate, [field]: value };
      }
      return rate;
    });
    onChange(updatedRates);
  };

  const handleNewRateChange = (field: keyof VatRate, value: string | number) => {
    setNewRate(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddRate = () => {
    const validationErrors = validateRate(newRate);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const newVatRate: VatRate = {
      id: `vat-${Date.now()}`,
      label: newRate.label || "",
      rate: newRate.rate || 0,
      isDefault: false,
    };
    
    onChange([...vatRates, newVatRate]);
    setNewRate({ label: "", rate: 0 });
    setShowAddForm(false);
    setErrors({});
  };

  return (
    <div className="space-y-4">
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Libellé</TableHead>
              <TableHead>Taux (%)</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vatRates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-neutral-500">
                  Aucun taux de TVA configuré
                </TableCell>
              </TableRow>
            ) : (
              vatRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>
                    {editingId === rate.id ? (
                      <div className="space-y-1">
                        <Input
                          value={rate.label}
                          onChange={(e) => handleRateChange(rate.id, "label", e.target.value)}
                          className={`benaya-input ${errors.label ? "border-red-500" : ""}`}
                        />
                        {errors.label && (
                          <p className="text-xs text-red-500 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.label}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {rate.label}
                        {rate.isDefault && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                            Par défaut
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === rate.id ? (
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={rate.rate}
                          onChange={(e) => handleRateChange(rate.id, "rate", parseFloat(e.target.value))}
                          className={`benaya-input ${errors.rate ? "border-red-500" : ""}`}
                        />
                        {errors.rate && (
                          <p className="text-xs text-red-500 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.rate}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="font-medium">{rate.rate}%</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {editingId === rate.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveEdit(rate.id)}
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancelEdit}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(rate.id)}
                            className="h-8 w-8"
                            disabled={rate.isDefault}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(rate.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            disabled={rate.isDefault}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add New Rate Form */}
      {showAddForm ? (
        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 space-y-4">
          <h4 className="font-medium">Ajouter un taux de TVA</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newLabel" className={errors.label ? "text-red-500" : ""}>
                Libellé <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newLabel"
                value={newRate.label}
                onChange={(e) => handleNewRateChange("label", e.target.value)}
                placeholder="Ex: Taux réduit"
                className={`benaya-input ${errors.label ? "border-red-500" : ""}`}
              />
              {errors.label && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.label}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newRate" className={errors.rate ? "text-red-500" : ""}>
                Taux (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newRate.rate}
                onChange={(e) => handleNewRateChange("rate", parseFloat(e.target.value))}
                placeholder="Ex: 5.5"
                className={`benaya-input ${errors.rate ? "border-red-500" : ""}`}
              />
              {errors.rate && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.rate}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewRate({ label: "", rate: 0 });
                setErrors({});
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleAddRate}>
              Ajouter
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un taux de TVA
        </Button>
      )}
    </div>
  );
}