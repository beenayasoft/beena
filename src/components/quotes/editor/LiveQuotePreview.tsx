import React, { useMemo } from 'react';
import { Eye, FileText, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { useQuoteTable } from './QuoteTableContext';
import { QuoteItem, Quote } from '@/lib/types/quote';

interface LiveQuotePreviewProps {
  quote: Partial<Quote>;
  onPrint?: () => void;
  onExport?: () => void;
  className?: string;
}

export function LiveQuotePreview({ 
  quote, 
  onPrint, 
  onExport, 
  className = "" 
}: LiveQuotePreviewProps) {
  const { state, helpers } = useQuoteTable();

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Render items hierarchically
  const renderPreviewItems = (items: QuoteItem[], level = 0) => {
    return items.map((item) => {
      if (item.type === 'chapter' || item.type === 'section') {
        const childItems = helpers.getChildItems(item.id);
        const sectionTotals = helpers.getSectionTotal(item.id);
        
        return (
          <div key={item.id} className={`mb-4 ${level > 0 ? 'ml-4' : ''}`}>
            {/* Section header */}
            <div className="bg-benaya-50 dark:bg-benaya-900/20 p-3 rounded-lg border-l-4 border-l-benaya-500">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-benaya-700 dark:text-benaya-300">
                    {item.designation}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-benaya-700 dark:text-benaya-300">
                    {formatCurrency(sectionTotals.totalHT)} MAD HT
                  </div>
                  {state.showTaxIncluded && (
                    <div className="text-sm font-bold text-benaya-800 dark:text-benaya-200">
                      {formatCurrency(sectionTotals.totalTTC)} MAD TTC
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Section items */}
            {childItems.length > 0 && (
              <div className="mt-2 ml-4 space-y-2">
                {renderPreviewItems(childItems, level + 1)}
              </div>
            )}
          </div>
        );
      }

      // Regular item
      return (
        <div 
          key={item.id} 
          className={`flex justify-between items-start py-2 px-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 rounded ${
            item.type === 'discount' ? 'bg-red-50 dark:bg-red-900/10 border-l-2 border-l-red-400' : ''
          } ${level > 0 ? 'ml-4' : ''}`}
        >
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className={`font-medium ${item.type === 'discount' ? 'text-red-600' : ''}`}>
                  {item.designation}
                  {item.reference && (
                    <span className="text-xs text-neutral-500 ml-2">
                      [{item.reference}]
                    </span>
                  )}
                </div>
                {item.description && (
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    {item.description}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  <span>{item.quantity} {item.unit || 'unité'}</span>
                  <span>× {formatCurrency(item.unitPrice)} MAD</span>
                  {item.vatRate > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      TVA {item.vatRate}%
                    </Badge>
                  )}
                  {item.discount && item.discount > 0 && (
                    <Badge variant="outline" className="text-xs text-orange-600">
                      -{item.discount}%
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className={`font-semibold ${item.type === 'discount' ? 'text-red-600' : ''}`}>
                  {formatCurrency(Math.abs(item.totalHT))} {item.type === 'discount' && "−"} MAD
                </div>
                {state.showTaxIncluded && (
                  <div className={`text-sm font-bold ${item.type === 'discount' ? 'text-red-600' : ''}`}>
                    {formatCurrency(Math.abs(item.totalTTC))} {item.type === 'discount' && "−"} MAD TTC
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  // VAT breakdown for preview
  const vatBreakdownDisplay = useMemo(() => {
    if (state.calculations.vatBreakdown.length === 0) return null;
    
    return (
      <div className="space-y-1">
        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Détail TVA :
        </div>
        {state.calculations.vatBreakdown.map((vat) => (
          <div key={vat.rate} className="flex justify-between text-sm">
            <span>Base HT {vat.rate}% :</span>
            <span>{formatCurrency(vat.baseHT)} MAD</span>
          </div>
        ))}
        {state.calculations.vatBreakdown.map((vat) => (
          <div key={`vat-${vat.rate}`} className="flex justify-between text-sm">
            <span>TVA {vat.rate}% :</span>
            <span>{formatCurrency(vat.vatAmount)} MAD</span>
          </div>
        ))}
      </div>
    );
  }, [state.calculations.vatBreakdown]);

  return (
    <div className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-benaya-600" />
            <h3 className="text-lg font-semibold">Aperçu en temps réel</h3>
          </div>
          <div className="flex gap-2">
            {onPrint && (
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            )}
          </div>
        </div>

        {/* Quote header info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-benaya-700 dark:text-benaya-300 mb-2">
              DEVIS {quote.number || 'NOUVEAU'}
            </h2>
            <div className="space-y-1 text-sm">
              <div><strong>Client :</strong> {quote.clientName || '—'}</div>
              <div><strong>Projet :</strong> {quote.projectName || '—'}</div>
              {quote.projectAddress && (
                <div><strong>Adresse :</strong> {quote.projectAddress}</div>
              )}
            </div>
          </div>
          
          <div className="text-sm space-y-1">
            <div><strong>Date d'émission :</strong> {formatDate(quote.issueDate)}</div>
            <div><strong>Date d'expiration :</strong> {formatDate(quote.expiryDate)}</div>
            <div><strong>Validité :</strong> {quote.validityPeriod || 30} jours</div>
            <div className="mt-2">
              <Badge 
                variant={quote.status === 'draft' ? 'secondary' : 'default'}
                className="text-xs"
              >
                {quote.status === 'draft' ? 'Brouillon' : 
                 quote.status === 'sent' ? 'Envoyé' :
                 quote.status === 'accepted' ? 'Accepté' :
                 quote.status === 'rejected' ? 'Refusé' : 
                 'Inconnu'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-6">
        <h4 className="font-semibold mb-4 text-benaya-700 dark:text-benaya-300">
          Détail des prestations
        </h4>
        
        {state.items.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucun élément ajouté au devis</p>
            <p className="text-xs mt-1">Ajoutez des éléments pour voir l'aperçu</p>
          </div>
        ) : (
          <div className="space-y-2">
            {renderPreviewItems(helpers.getRootItems())}
          </div>
        )}
      </div>

      {/* Totals */}
      {state.items.length > 0 && (
        <>
          <Separator />
          <div className="p-6">
            <div className="flex justify-end">
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg border min-w-[300px]">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Total HT :</span>
                    <span className="font-semibold">
                      {formatCurrency(state.calculations.totalHT)} MAD
                    </span>
                  </div>
                  
                  {vatBreakdownDisplay}
                  
                  {state.calculations.totalVAT > 0 && (
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total TVA :</span>
                      <span className="font-semibold">
                        {formatCurrency(state.calculations.totalVAT)} MAD
                      </span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-xl font-bold text-benaya-700 dark:text-benaya-300">
                    <span>Total TTC :</span>
                    <span>{formatCurrency(state.calculations.totalTTC)} MAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      {quote.notes && (
        <>
          <Separator />
          <div className="p-6">
            <h4 className="font-semibold mb-2 text-benaya-700 dark:text-benaya-300">
              Notes
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
              {quote.notes}
            </p>
          </div>
        </>
      )}

      {/* Terms and conditions */}
      {quote.termsAndConditions && (
        <>
          <Separator />
          <div className="p-6">
            <h4 className="font-semibold mb-2 text-benaya-700 dark:text-benaya-300">
              Conditions générales
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
              {quote.termsAndConditions}
            </p>
          </div>
        </>
      )}
    </div>
  );
} 