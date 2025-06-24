import React, { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Settings2, MoreVertical, Grip } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuoteTable } from './QuoteTableContext';
import { FlexibleQuoteRow } from './FlexibleQuoteRow';
import { QuoteItemForm } from './QuoteItemForm';
import { LibraryModal } from './LibraryModal';
import { EditorQuoteItem, quotesApi } from '@/lib/api/quotes';
import { formatCurrency } from '@/lib/utils';

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  required?: boolean;
  width?: string;
}

interface FlexibleQuoteTableProps {
  onItemsChange?: (items: EditorQuoteItem[]) => void;
  readonly?: boolean;
}

export function FlexibleQuoteTable({ onItemsChange, readonly = false }: FlexibleQuoteTableProps) {
  const { state, actions, helpers } = useQuoteTable();
  const [showItemForm, setShowItemForm] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState<EditorQuoteItem | null>(null);

  // Configuration des colonnes avec logique intelligente
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([
    { id: 'designation', label: 'Désignation', visible: true, required: true },
    { id: 'quantity', label: 'Quantité', visible: true, required: true },
    { id: 'unit', label: 'Unité', visible: true },
    { id: 'unitPrice', label: 'Prix unitaire', visible: true, required: true },
    { id: 'vat', label: 'TVA', visible: true },
    { id: 'discount', label: 'Remise', visible: true },
    { id: 'totalHT', label: 'Total HT', visible: true, required: true },
    { id: 'totalTTC', label: 'Total TTC', visible: state.showTaxIncluded },
    { id: 'actions', label: 'Actions', visible: true, required: true, width: '100px' }
  ]);

  // Mettre à jour la colonne TTC lors du changement d'affichage
  React.useEffect(() => {
    setColumnConfig(prev => 
      prev.map(col => 
        col.id === 'totalTTC' 
          ? { ...col, visible: state.showTaxIncluded }
          : col
      )
    );
  }, [state.showTaxIncluded]);

  // Colonnes visibles avec logique intelligente
  const visibleColumns = useMemo(() => {
    return columnConfig.filter(col => {
      if (!col.visible) return false;
      
      // Masquer colonne TVA si aucun élément n'a de TVA
      if (col.id === 'vat' && !state.showVatColumn) return false;
      
      // Masquer colonne Remise si aucun élément n'a de remise
      if (col.id === 'discount' && !state.showDiscountColumn) return false;
      
      return true;
    });
  }, [columnConfig, state.showVatColumn, state.showDiscountColumn]);

  // Gestion du drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = state.items.findIndex(item => item.id === active.id);
    const newIndex = state.items.findIndex(item => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      actions.reorderItems(oldIndex, newIndex);
    }
  };

  // Ajout d'un nouvel élément
  const handleAddItem = () => {
    setCurrentEditingItem(null);
    setShowItemForm(true);
  };

  // Ajout depuis la bibliothèque
  const handleAddFromLibrary = () => {
    setShowLibraryModal(true);
  };

  // Édition d'un élément
  const handleEditItem = (item: EditorQuoteItem) => {
    setCurrentEditingItem(item);
    setShowItemForm(true);
  };

  // Suppression d'un élément
  const handleRemoveItem = (itemId: string) => {
    actions.removeItem(itemId);
  };

  // Soumission du formulaire d'élément
  const handleItemSubmit = (itemData: EditorQuoteItem) => {
    if (currentEditingItem && currentEditingItem.id) {
      actions.updateItem(currentEditingItem.id, itemData);
    } else {
      const newItem: EditorQuoteItem = {
        ...itemData,
        id: crypto.randomUUID(),
        position: state.items.length + 1,
      };
      actions.addItem(newItem);
    }
    setShowItemForm(false);
    setCurrentEditingItem(null);
  };

  // Ajout d'un chapitre/section
  const handleAddSection = (type: 'chapter' | 'section') => {
    const newSection: EditorQuoteItem = {
      id: crypto.randomUUID(),
      type,
      position: state.items.length + 1,
      designation: type === 'chapter' ? 'Nouveau chapitre' : 'Nouvelle section',
      description: '',
      quantity: 1,
      unit: '',
      unitPrice: 0,
      discountPercentage: 0,
      tvaRate: '0',
    };
    actions.addItem(newSection);
  };

  // Ajout d'éléments depuis la bibliothèque
  const handleLibrarySelect = (items: EditorQuoteItem[]) => {
    items.forEach(item => {
      const newItem: EditorQuoteItem = {
        ...item,
        id: crypto.randomUUID(),
        position: state.items.length + 1,
      };
      actions.addItem(newItem);
    });
    setShowLibraryModal(false);
  };

  // Toggle visibilité des colonnes
  const toggleColumnVisibility = (columnId: string) => {
    setColumnConfig(prev =>
      prev.map(col =>
        col.id === columnId && !col.required
          ? { ...col, visible: !col.visible }
          : col
      )
    );
  };

  // Notifier les changements
  React.useEffect(() => {
    onItemsChange?.(state.items);
  }, [state.items, onItemsChange]);

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!readonly && (
            <>
              <Button onClick={handleAddItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une ligne
              </Button>
              
              <Button onClick={handleAddFromLibrary} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Depuis la bibliothèque
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Section
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleAddSection('chapter')}>
                    Ajouter un chapitre
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddSection('section')}>
                    Ajouter une section
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          
          {/* Indicateurs des colonnes intelligentes */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {state.showVatColumn && (
              <Badge variant="outline" className="text-xs">
                TVA active
              </Badge>
            )}
            {state.showDiscountColumn && (
              <Badge variant="outline" className="text-xs">
                Remises actives
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle affichage TTC */}
          <div className="flex items-center gap-2">
            <Label htmlFor="show-ttc" className="text-sm">
              Afficher TTC
            </Label>
            <Switch
              id="show-ttc"
              checked={state.showTaxIncluded}
              onCheckedChange={actions.toggleTaxDisplay}
            />
          </div>

          {/* Configuration des colonnes */}
          {!readonly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Colonnes
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {columnConfig.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.visible}
                    onCheckedChange={() => toggleColumnVisibility(column.id)}
                    disabled={column.required}
                  >
                    {column.label}
                    {column.required && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Requis
                      </Badge>
                    )}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <DndContext 
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {!readonly && (
                  <TableHead className="w-[40px]">
                    <Grip className="w-4 h-4 text-neutral-400" />
                  </TableHead>
                )}
                
                {visibleColumns.map((column) => (
                  <TableHead 
                    key={column.id}
                    className={column.width ? `w-[${column.width}]` : undefined}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            
            <SortableContext 
              items={state.items.map(item => item.id || '')}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {state.items.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={visibleColumns.length + (!readonly ? 1 : 0)}
                      className="text-center py-8 text-neutral-500"
                    >
                      Aucun élément dans ce devis
                      {!readonly && (
                        <div className="mt-2">
                          <Button 
                            onClick={handleAddItem} 
                            variant="outline" 
                            size="sm"
                          >
                            Ajouter le premier élément
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  helpers.getRootItems().map((item) => (
                    <FlexibleQuoteRow
                      key={item.id}
                      item={item}
                      visibleColumns={visibleColumns}
                      showVAT={state.showVatColumn}
                      showDiscount={state.showDiscountColumn}
                      readonly={readonly}
                      onEdit={handleEditItem}
                      onRemove={handleRemoveItem}
                      level={0}
                    />
                  ))
                )}
              </TableBody>
            </SortableContext>
          </Table>
        </DndContext>
      </div>

      {/* Totaux avec nouvelle API */}
      <div className="flex justify-end">
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg border space-y-2 min-w-[300px]">
          <div className="flex justify-between">
            <span>Total HT :</span>
            <span className="font-semibold">
              {formatCurrency(state.calculations.totalHT)} MAD
            </span>
          </div>
          
          {state.calculations.vatBreakdown.length > 0 && (
            <>
              {state.calculations.vatBreakdown.map((vat) => (
                <div key={vat.rate} className="flex justify-between text-sm">
                  <span>TVA {vat.rate}% :</span>
                  <span>{formatCurrency(vat.amount)} MAD</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between">
                <span>Total TVA :</span>
                <span className="font-semibold">
                  {formatCurrency(state.calculations.totalTVA)} MAD
                </span>
              </div>
            </>
          )}
          
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>Total TTC :</span>
            <span className="text-blue-600 dark:text-blue-400">
              {formatCurrency(state.calculations.totalTTC)} MAD
            </span>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showItemForm && (
        <QuoteItemForm
          open={showItemForm}
          onOpenChange={setShowItemForm}
          onSubmit={handleItemSubmit}
          item={currentEditingItem || undefined}
          isEditing={!!currentEditingItem}
        />
      )}

      {showLibraryModal && (
        <LibraryModal
          open={showLibraryModal}
          onOpenChange={setShowLibraryModal}
          onSelect={handleLibrarySelect}
        />
      )}
    </div>
  );
} 