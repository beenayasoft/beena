import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Send,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Quote } from "@/lib/types/quote";
import { quotesApi, QuoteDetail } from "@/lib/api/quotes";
import { QuotePreview } from "@/components/quotes/QuotePreview";
import { toast } from "sonner";

export default function QuotePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load quote data
  useEffect(() => {
    const loadQuoteData = async () => {
      if (!id || id === 'preview') {
        // Essayer de récupérer depuis sessionStorage pour les aperçus temporaires
        const storedQuote = sessionStorage.getItem('previewQuote');
        
        if (storedQuote) {
          try {
            setQuote(JSON.parse(storedQuote));
            setLoading(false);
            return;
          } catch (err) {
            console.error("Erreur lors du parsing de l'aperçu:", err);
            setError("Erreur lors du chargement des données d'aperçu");
          }
        } else {
          setError("Aucune donnée d'aperçu disponible");
        }
        setLoading(false);
        return;
      }

      // Charger depuis l'API pour les devis existants
      try {
        setLoading(true);
        const quoteData = await quotesApi.getQuote(id);
        
        // Adapter les données de l'API au format Quote local
        const adaptedQuote: Quote = {
          id: quoteData.id,
          number: quoteData.number,
          clientId: quoteData.tier,
          clientName: quoteData.client_name,
          clientAddress: quoteData.client_address,
          projectId: "", // TODO: ajouter project_id dans l'API
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
          status: quoteData.status as any,
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
        };
        
        setQuote(adaptedQuote);
      } catch (err) {
        console.error("Erreur lors du chargement du devis:", err);
        setError("Erreur lors du chargement du devis");
      } finally {
        setLoading(false);
      }
    };

    loadQuoteData();
  }, [id]);

  // Print the quote
  const handlePrint = () => {
    window.print();
  };

  // Download as PDF using API
  const handleDownload = async () => {
    if (!id || id === 'preview') {
      toast.error("Impossible de télécharger un aperçu temporaire");
      return;
    }

    try {
      toast.info("Génération du PDF en cours...");
      const exportResult = await quotesApi.exportQuote(id, 'pdf', {
        include_details: true,
        language: 'fr'
      });
      
      if (exportResult.download_url) {
        // Ouvrir dans un nouvel onglet ou télécharger
        window.open(exportResult.download_url, '_blank');
        toast.success("PDF généré avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  // Send by email (TODO: implémenter l'envoi par email)
  const handleSendEmail = () => {
    toast.info("Fonctionnalité d'envoi par email à implémenter");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-benaya-600 mx-auto"></div>
          <p className="mt-4">Chargement de l'aperçu...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">{error || "Devis non trouvé"}</h2>
          <Button onClick={() => navigate("/devis")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold">
                Aperçu du devis
              </h1>
              <p className="text-benaya-100 mt-1">
                {quote.number || "Brouillon"} - {quote.clientName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
            </Button>
            
            <Button 
              className="bg-white text-benaya-900 hover:bg-white/90"
              onClick={handleSendEmail}
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer par email
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mx-auto print:shadow-none print:rounded-none print:m-0 print:p-0" style={{ maxWidth: "210mm" }}>
        <QuotePreview quote={quote} />
      </div>
    </div>
  );
}