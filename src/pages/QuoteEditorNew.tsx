import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Download, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { QuoteTableProvider } from "@/components/quotes/editor/QuoteTableContext";
import { EnhancedQuoteEditor } from "@/components/quotes/editor/EnhancedQuoteEditor";
import { LiveQuotePreview } from "@/components/quotes/editor/LiveQuotePreview";
import { quotesApi, QuoteDetail, EditorQuoteItem, BulkQuoteData } from "@/lib/api/quotes";
import { tiersApi } from "@/lib/api/tiers";

export default function QuoteEditorNew() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewQuote = id === "new" || id === "nouveau";
  
  const [loading, setLoading] = useState(!isNewQuote);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Charger le devis existant
  useEffect(() => {
    const loadQuote = async () => {
      if (!isNewQuote && id) {
        try {
          setLoading(true);
          const quoteData = await quotesApi.getQuote(id);
          setQuote(quoteData);
        } catch (error) {
          console.error("Erreur lors du chargement du devis:", error);
          toast.error("Erreur lors du chargement du devis");
          navigate("/devis");
        } finally {
          setLoading(false);
        }
      } else {
        // Nouveau devis - créer une structure vide
        setQuote({
          id: '',
          number: '',
          status: 'draft',
          status_display: 'Brouillon',
          tier: '',
          client_name: '',
          client_type: '',
          client_address: '',
          project_name: '',
          project_address: '',
          issue_date: new Date().toISOString().split('T')[0],
          expiry_date: '',
          issue_date_formatted: '',
          expiry_date_formatted: '',
          validity_period: 30,
          notes: '',
          conditions: 'Acompte de 30% à la signature. Solde à la fin des travaux.',
          total_ht: 0,
          total_tva: 0,
          total_ttc: 0,
          items_count: 0,
          created_at: '',
          updated_at: '',
          tier_details: null,
          items: [],
          items_stats: {
            total_items: 0,
            chapters: 0,
            sections: 0,
            products: 0,
            services: 0,
            works: 0,
            discounts: 0,
          },
          vat_breakdown: [],
        });
        setLoading(false);
      }
    };

    loadQuote();
  }, [id, isNewQuote, navigate]);

  // Sauvegarder le devis
  const handleSave = async (quoteData: BulkQuoteData) => {
    try {
      setSaving(true);
      
      if (isNewQuote) {
        // Créer un nouveau devis
        const newQuote = await quotesApi.bulkCreateQuote(quoteData);
        setQuote(newQuote);
        toast.success("Devis créé avec succès");
        // Rediriger vers l'édition du nouveau devis
        navigate(`/devis/edit/${newQuote.id}`, { replace: true });
      } else if (quote?.id) {
        // Mettre à jour le devis existant
        const updatedQuote = await quotesApi.bulkUpdateQuote(quote.id, quoteData);
        setQuote(updatedQuote);
        toast.success("Devis mis à jour avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // Actions sur le devis
  const handleMarkAsSent = async () => {
    if (!quote?.id) return;
    
    try {
      const updatedQuote = await quotesApi.markAsSent(quote.id);
      setQuote(prev => prev ? { ...prev, ...updatedQuote } : null);
      toast.success("Devis marqué comme envoyé");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' = 'pdf') => {
    if (!quote?.id) return;
    
    try {
      const result = await quotesApi.exportQuote(quote.id, format);
      toast.success(`Export ${format.toUpperCase()} généré`);
      // Ouvrir le lien de téléchargement
      window.open(result.download_url, '_blank');
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Erreur lors de l'export");
    }
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du devis...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Devis introuvable</p>
          <Button onClick={() => navigate("/devis")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux devis
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/devis")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNewQuote ? "Nouveau Devis" : `Devis ${quote.number}`}
            </h1>
            {!isNewQuote && (
              <p className="text-gray-600">
                Client: {quote.client_name} • Projet: {quote.project_name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? "Masquer" : "Aperçu"}
          </Button>
          
          {!isNewQuote && quote.status === 'draft' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAsSent}
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer
            </Button>
          )}
          
          {!isNewQuote && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          )}
          
          <Button
            size="sm"
            disabled={saving}
            onClick={() => {
              // Le save sera déclenché via le context
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className={`grid gap-6 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Éditeur */}
        <div className="space-y-6">
          <QuoteTableProvider
            initialQuote={quote}
            onSave={handleSave}
            saving={saving}
          >
            <EnhancedQuoteEditor />
          </QuoteTableProvider>
        </div>

        {/* Aperçu en temps réel */}
        {showPreview && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Aperçu en temps réel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuoteTableProvider
                  initialQuote={quote}
                  onSave={handleSave}
                  saving={saving}
                >
                  <LiveQuotePreview />
                </QuoteTableProvider>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 