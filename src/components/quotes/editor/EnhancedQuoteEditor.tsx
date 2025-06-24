import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, Eye, Send, ArrowLeft } from 'lucide-react';
import { QuoteTableProvider } from './QuoteTableContext';
import { FlexibleQuoteTable } from './FlexibleQuoteTable';
import { LiveQuotePreview } from './LiveQuotePreview';
import { QuoteClientInfo } from './QuoteClientInfo';
import { Quote, QuoteItem } from '@/lib/types/quote';
import { quotesApi } from '@/lib/api/quotes';
import { toast } from 'sonner';

interface EnhancedQuoteEditorProps {
  quoteId?: string;
  initialQuote?: Partial<Quote>;
  onSave?: (quote: Quote) => void;
  onBack?: () => void;
  onSend?: (quote: Quote) => void;
}

export function EnhancedQuoteEditor({
  quoteId,
  initialQuote,
  onSave,
  onBack,
  onSend
}: EnhancedQuoteEditorProps) {
  const [quote, setQuote] = useState<Partial<Quote>>(
    initialQuote || {
      number: '',
      clientName: '',
      projectName: '',
      issueDate: new Date().toISOString().split('T')[0],
      validityPeriod: 30,
      status: 'draft',
      notes: '',
      termsAndConditions: '',
      items: []
    }
  );
  
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Charger le devis si on a un ID
  useEffect(() => {
    if (quoteId && !initialQuote) {
      const loadQuote = async () => {
        setLoading(true);
        try {
          const quoteData = await quotesApi.getQuote(quoteId);
          
          // Adapter les données de l'API au format local
          const adaptedQuote: Quote = {
            id: quoteData.id,
            number: quoteData.number,
            status: quoteData.status as any,
            clientId: quoteData.tier,
            clientName: quoteData.client_name,
            clientAddress: quoteData.client_address,
            projectName: quoteData.project_name,
            projectAddress: quoteData.project_address,
            issueDate: quoteData.issue_date,
            expiryDate: quoteData.expiry_date,
            validityPeriod: quoteData.validity_period,
            notes: quoteData.notes,
            termsAndConditions: quoteData.terms_and_conditions,
            totalHT: quoteData.total_ht,
            totalVAT: quoteData.total_vat,
            totalTTC: quoteData.total_ttc,
            items: quoteData.items?.map(item => ({
              id: item.id,
              type: item.type as any,
              parentId: item.parent,
              position: item.position,
              reference: item.reference,
              designation: item.designation,
              description: item.description,
              unit: item.unit,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              discount: item.discount,
              vatRate: parseInt(item.vat_rate) as any,
              margin: item.margin,
              totalHT: item.total_ht,
              totalTTC: item.total_ttc,
              workId: item.work_id,
            })) || [],
            createdAt: quoteData.created_at,
            updatedAt: quoteData.updated_at,
          };
          
          setQuote(adaptedQuote);
        } catch (error) {
          console.error('Erreur lors du chargement du devis:', error);
          toast.error('Erreur lors du chargement du devis');
        } finally {
          setLoading(false);
        }
      };

      loadQuote();
    }
  }, [quoteId, initialQuote]);

  // Mettre à jour le devis quand les informations changent
  const handleQuoteUpdate = (updates: Partial<Quote>) => {
    setQuote(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  // Mettre à jour les éléments du devis
  const handleItemsChange = (items: QuoteItem[]) => {
    setQuote(prev => ({ ...prev, items }));
    setIsDirty(true);
  };

  // Sauvegarder le devis
  const handleSave = async () => {
    if (!quote.clientId || !quote.clientName) {
      toast.error('Veuillez sélectionner un client avant de sauvegarder');
      return;
    }

    setSaving(true);
    try {
      const quoteData = {
        tier: quote.clientId,
        project_name: quote.projectName || '',
        project_address: quote.projectAddress || '',
        issue_date: quote.issueDate,
        validity_period: quote.validityPeriod || 30,
        notes: quote.notes || '',
        terms_and_conditions: quote.termsAndConditions || '',
      };

      let savedQuote;
      if (quoteId) {
        // Mise à jour
        savedQuote = await quotesApi.updateQuote(quoteId, quoteData);
      } else {
        // Création
        savedQuote = await quotesApi.createQuote(quoteData);
        setQuote(prev => ({ ...prev, id: savedQuote.id, number: savedQuote.number }));
      }

      // Sauvegarder les éléments individuellement si nécessaire
      // Note: Dans un vrai système, on pourrait avoir un endpoint pour sauvegarder tout en une fois

      setIsDirty(false);
      toast.success('Devis sauvegardé avec succès');
      onSave?.(savedQuote as Quote);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du devis');
    } finally {
      setSaving(false);
    }
  };

  // Envoyer le devis
  const handleSend = async () => {
    if (!quote.id) {
      toast.error('Veuillez d\'abord sauvegarder le devis');
      return;
    }

    try {
      await quotesApi.markAsSent(quote.id);
      const updatedQuote = { ...quote, status: 'sent' as const };
      setQuote(updatedQuote);
      toast.success('Devis envoyé avec succès');
      onSend?.(updatedQuote as Quote);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error('Erreur lors de l\'envoi du devis');
    }
  };

  // Imprimer le devis
  const handlePrint = () => {
    window.print();
  };

  // Exporter le devis
  const handleExport = async () => {
    if (!quote.id) {
      toast.error('Veuillez d\'abord sauvegarder le devis');
      return;
    }

    try {
      // Ici on pourrait appeler un endpoint d'export PDF
      toast.info('Fonctionnalité d\'export en cours de développement');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur lors de l\'export du devis');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-benaya-600 mx-auto"></div>
          <div className="mt-2 text-sm text-neutral-500">Chargement du devis...</div>
        </div>
      </div>
    );
  }

  return (
    <QuoteTableProvider initialItems={quote.items || []}>
      <div className="flex flex-col h-full">
        {/* Header avec actions */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {quote.number ? `Devis ${quote.number}` : 'Nouveau devis'}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {quote.clientName || 'Aucun client sélectionné'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!isDirty || saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>

            {quote.id && quote.status === 'draft' && (
              <Button onClick={handleSend}>
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
            >
              <Eye className="w-4 h-4 mr-2" />
              {activeTab === 'edit' ? 'Aperçu' : 'Édition'}
            </Button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="h-full">
            <TabsList className="hidden">
              <TabsTrigger value="edit">Édition</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="h-full overflow-auto p-6 mt-0">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Informations du devis */}
                <Card className="p-6">
                  <QuoteClientInfo
                    quote={quote}
                    onUpdate={handleQuoteUpdate}
                    isEditable={true}
                  />
                </Card>

                {/* Tableau des éléments */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Lignes de prestation</h3>
                  <FlexibleQuoteTable
                    onItemsChange={handleItemsChange}
                    readonly={false}
                  />
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="h-full overflow-auto p-6 mt-0">
              <div className="max-w-4xl mx-auto">
                <LiveQuotePreview
                  quote={quote}
                  onPrint={handlePrint}
                  onExport={handleExport}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </QuoteTableProvider>
  );
} 