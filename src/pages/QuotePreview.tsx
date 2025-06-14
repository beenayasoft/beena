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
import { getQuoteById } from "@/lib/mock/quotes";
import { QuotePreview } from "@/components/quotes/QuotePreview";

export default function QuotePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load quote data
  useEffect(() => {
    // Essayer d'abord de récupérer depuis sessionStorage
    const storedQuote = sessionStorage.getItem('previewQuote');
    
    if (storedQuote) {
      try {
        setQuote(JSON.parse(storedQuote));
        setLoading(false);
        return;
      } catch (err) {
        console.error("Erreur lors du parsing de l'aperçu:", err);
        // Continue to try loading from API if parsing fails
      }
    }
    
    // Si pas de données dans sessionStorage ou erreur de parsing, essayer de charger depuis l'API
    if (id && id !== 'preview') {
      try {
        const quoteData = getQuoteById(id);
        if (quoteData) {
          setQuote(quoteData);
        } else {
          setError("Devis non trouvé");
        }
      } catch (err) {
        setError("Erreur lors du chargement du devis");
        console.error(err);
      }
    } else if (!storedQuote) {
      setError("Aucune donnée d'aperçu disponible");
    }
    
    setLoading(false);
  }, [id]);

  // Print the quote
  const handlePrint = () => {
    window.print();
  };

  // Download as PDF (placeholder)
  const handleDownload = () => {
    alert("Fonctionnalité de téléchargement PDF à implémenter");
  };

  // Send by email (placeholder)
  const handleSendEmail = () => {
    alert("Fonctionnalité d'envoi par email à implémenter");
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