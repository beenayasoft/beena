import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Trash2, 
  Pencil, 
  ChevronDown, 
  ChevronRight,
  Percent 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { EditorQuoteItem, quotesApi } from '@/lib/api/quotes';
import { formatCurrency } from '@/lib/utils';
import { useQuoteTable } from './QuoteTableContext';

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  required?: boolean;
  width?: string;
}

interface FlexibleQuoteRowProps {
  item: EditorQuoteItem;
  visibleColumns: ColumnConfig[];
  showVAT: boolean;
  showDiscount: boolean;
  readonly?: boolean;
  onEdit: (item: EditorQuoteItem) => void;
  onRemove: (itemId: string) => void;
  level?: number;
}

export function FlexibleQuoteRow({
  item,
  visibleColumns,
  showVAT,
  showDiscount,
  readonly = false,
  onEdit,
  onRemove,
  level = 0
}: FlexibleQuoteRowProps) {
  const { helpers } = useQuoteTable();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id || '', disabled: readonly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const isChapter = item.type === 'chapter' || item.type === 'section';
  const isDiscount = item.type === 'discount';
  const hasChildren = item.id ? helpers.hasChildren(item.id) : false;
  const childItems = item.id ? helpers.getChildItems(item.id) : [];

  // Calcul des totaux de section
  const sectionTotals = isChapter && item.id ? helpers.getSectionTotal(item.id) : null;

  // Vérifier si l'élément a une TVA
  const hasVAT = parseFloat(item.tvaRate) > 0;
  
  // Vérifier si l'élément a une remise
  const hasItemDiscount = item.discountPercentage > 0;

  // Calculer les totaux de l'élément avec la nouvelle API
  const itemTotalHT = item.totalHt ?? quotesApi.calculateItemTotal(item);
  const itemTotalTTC = item.totalTtc ?? quotesApi.calculateItemTotalTTC(item);

  // Rendu d'une cellule selon sa configuration
  const renderCell = (columnId: string) => {
    switch (columnId) {
      case 'designation':
        return (
          <TableCell 
            className="font-medium"
            style={{ paddingLeft: `${level * 20 + 16}px` }}
          >
            <div className="flex items-center gap-2">
              {!readonly && (
                <div 
                  {...attributes} 
                  {...listeners} 
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                >
                  <GripVertical className="w-4 h-4 text-neutral-400" />
                </div>
              )}
              
              {isChapter && (
                hasChildren ? (
                  <ChevronDown className="w-4 h-4 text-neutral-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                )
              )}
              
              <div className="flex-1">
                <div className={`${isChapter ? "font-semibold text-blue-600 dark:text-blue-400" : ""} ${isDiscount ? "text-red-600 font-medium" : ""}`}>
                  {item.designation}
                  {item.reference && (
                    <span className="text-xs text-neutral-500 ml-2">
                      [{item.reference}]
                    </span>
                  )}
                </div>
                {item.description && (
                  <div className="text-xs text-neutral-600 mt-1">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        );

      case 'quantity':
        if (isChapter) {
          return <TableCell></TableCell>;
        }
        return (
          <TableCell className="text-right">
            {item.quantity}
          </TableCell>
        );

      case 'unit':
        if (isChapter) {
          return <TableCell></TableCell>;
        }
        return (
          <TableCell className="text-center text-sm text-neutral-600">
            {item.unit || '—'}
          </TableCell>
        );

      case 'unitPrice':
        if (isChapter) {
          return <TableCell></TableCell>;
        }
        return (
          <TableCell className="text-right">
            {formatCurrency(Math.abs(item.unitPrice))} MAD
          </TableCell>
        );

      case 'vat':
        if (isChapter) {
          return showVAT ? <TableCell></TableCell> : null;
        }
        if (!showVAT) return null;
        
        return (
          <TableCell className="text-center">
            {hasVAT ? (
              <Badge variant="secondary" className="text-xs">
                {item.tvaRate}%
              </Badge>
            ) : (
              <span className="text-neutral-400 text-xs">—</span>
            )}
          </TableCell>
        );

      case 'discount':
        if (isChapter) {
          return showDiscount ? <TableCell></TableCell> : null;
        }
        if (!showDiscount) return null;
        
        return (
          <TableCell className="text-center">
            {hasItemDiscount ? (
              <Badge variant="outline" className="text-xs text-orange-600">
                <Percent className="w-3 h-3 mr-1" />
                {item.discountPercentage}%
              </Badge>
            ) : (
              <span className="text-neutral-400 text-xs">—</span>
            )}
          </TableCell>
        );

      case 'totalHT':
        return (
          <TableCell className="text-right font-medium">
            {isChapter ? (
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {formatCurrency(sectionTotals?.totalHT || 0)} MAD
              </span>
            ) : (
              <span className={isDiscount ? "text-red-600" : ""}>
                {formatCurrency(Math.abs(itemTotalHT))} {isDiscount && "−"} MAD
              </span>
            )}
          </TableCell>
        );

      case 'totalTTC':
        return (
          <TableCell className="text-right font-semibold">
            {isChapter ? (
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {formatCurrency(sectionTotals?.totalTTC || 0)} MAD
              </span>
            ) : (
              <span className={isDiscount ? "text-red-600" : ""}>
                {formatCurrency(Math.abs(itemTotalTTC))} {isDiscount && "−"} MAD
              </span>
            )}
          </TableCell>
        );

      case 'actions':
        return (
          <TableCell>
            {!readonly && (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item)}
                  className="h-8 w-8"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => item.id && onRemove(item.id)}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </TableCell>
        );

      default:
        return <TableCell></TableCell>;
    }
  };

  return (
    <React.Fragment>
      {/* Ligne principale */}
      <TableRow 
        ref={setNodeRef} 
        style={style}
        className={`
          ${isChapter ? "bg-neutral-50 dark:bg-neutral-800/50 border-l-4 border-l-blue-500" : ""} 
          ${isDiscount ? "bg-red-50 dark:bg-red-900/10" : ""} 
          ${isDragging ? "bg-blue-50 dark:bg-blue-900/20" : ""}
          hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30
        `}
      >
        {/* Colonne de drag (uniquement si pas readonly) */}
        {!readonly && (
          <TableCell className="w-[40px]">
            {/* Le grip est déjà dans la cellule designation */}
          </TableCell>
        )}

        {/* Colonnes configurables */}
        {visibleColumns.map((column) => {
          // Masquer colonne TVA si pas nécessaire
          if (column.id === 'vat' && !showVAT) return null;
          
          // Masquer colonne remise si pas nécessaire
          if (column.id === 'discount' && !showDiscount) return null;

          return (
            <React.Fragment key={column.id}>
              {renderCell(column.id)}
            </React.Fragment>
          );
        })}
      </TableRow>

      {/* Lignes enfants (pour chapitres et sections) */}
      {isChapter && hasChildren && childItems.map((childItem) => (
        <FlexibleQuoteRow
          key={childItem.id}
          item={childItem}
          visibleColumns={visibleColumns}
          showVAT={showVAT}
          showDiscount={showDiscount}
          readonly={readonly}
          onEdit={onEdit}
          onRemove={onRemove}
          level={level + 1}
        />
      ))}
    </React.Fragment>
  );
} 