import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Send, 
  Printer, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  User,
  Building,
  FileText,
  Edit,
  Copy,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { quotesApi, QuoteDetail as QuoteDetailType, QuoteItem } from "@/lib/api/quotes";
import { ConvertToInvoiceModal } from "@/components/quotes/ConvertToInvoiceModal";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les modales
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [converting, setConverting] = useState(false);

  // Charger les données du devis
  useEffect(() => {
    const loadQuote = async () => {
      if (!id) {
        setError("ID du devis manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const quoteData = await quotesApi.getQuote(id);
        setQuote(quoteData);
      } catch (err) {
        console.error("Erreur lors du chargement du devis:", err);
        setError("Erreur lors du chargement du devis");
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [id]);

  // Actions sur le devis
  const handleEditQuote = () => {
    navigate(`/devis/edit/${id}`);
  };

  const handleDuplicateQuote = async () => {
    if (!id) return;
    
    try {
      const duplicatedQuote = await quotesApi.duplicateQuote(id, {});
      toast.success("Devis dupliqué avec succès");
      navigate(`/devis/edit/${duplicatedQuote.id}`);
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
      toast.error("Erreur lors de la duplication du devis");
    }
  };

  const handleSendQuote = async () => {
    if (!id) return;
    
    try {
      await quotesApi.markAsSent(id);
      toast.success("Devis envoyé avec succès");
      // Recharger les données
      const updatedQuote = await quotesApi.getQuote(id);
      setQuote(updatedQuote);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur lors de l'envoi du devis");
    }
  };

  const handleAcceptQuote = async () => {
    if (!id) return;
    
    try {
      await quotesApi.markAsAccepted(id);
      toast.success("Devis accepté avec succès");
      // Recharger les données
      const updatedQuote = await quotesApi.getQuote(id);
      setQuote(updatedQuote);
    } catch (error) {
      console.error("Erreur lors de l'acceptation:", error);
      toast.error("Erreur lors de l'acceptation du devis");
    }
  };

  const handleRejectQuote = async () => {
    if (!id) return;
    
    try {
      await quotesApi.markAsRejected(id);
      toast.success("Devis refusé");
      // Recharger les données
      const updatedQuote = await quotesApi.getQuote(id);
      setQuote(updatedQuote);
    } catch (error) {
      console.error("Erreur lors du refus:", error);
      toast.error("Erreur lors du refus du devis");
    }
  };

  const handleExportQuote = async () => {
    if (!id) return;
    
    try {
      const exportResult = await quotesApi.exportQuote(id, 'pdf');
      if (exportResult.download_url) {
        window.open(exportResult.download_url, '_blank');
        toast.success("Export PDF généré avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Erreur lors de l'export du devis");
    }
  };

  const handlePreviewQuote = () => {
    navigate(`/devis/preview/${id}`);
  };

  const handleConvertToInvoice = () => {
    setConvertModalOpen(true);
  };

  // Gérer la conversion en facture
  const handleConvertSubmit = async (invoiceData: {
    issueDate: string;
    dueDate: string;
    paymentTerms: string;
    notes?: string;
    copyItems: boolean;
  }) => {
    if (!quote) return;

    setConverting(true);
    try {
      // TODO: Implémenter l'API de création de facture depuis un devis
      // const newInvoice = await invoicesApi.createFromQuote(quote.id, invoiceData);
      
      // Pour l'instant, simuler la création
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Facture créée avec succès !");
      setConvertModalOpen(false);
      
      // TODO: Naviguer vers la facture créée
      // navigate(`/factures/${newInvoice.id}`);
      
      // Pour l'instant, naviguer vers la liste des factures
      navigate("/factures");
    } catch (error) {
      console.error("Erreur lors de la conversion:", error);
      toast.error("Erreur lors de la création de la facture");
    } finally {
      setConverting(false);
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="benaya-badge-neutral gap-1">
            <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
            Brouillon
          </Badge>
        );
      case "sent":
        return (
          <Badge className="benaya-badge-primary gap-1">
            <Send className="w-3 h-3" />
            Envoyé
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="benaya-badge-success gap-1">
            <CheckCircle className="w-3 h-3" />
            Accepté
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="benaya-badge-error gap-1">
            <XCircle className="w-3 h-3" />
            Refusé
          </Badge>
        );
      case "expired":
        return (
          <Badge className="benaya-badge-warning gap-1">
            <AlertCircle className="w-3 h-3" />
            Expiré
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="benaya-badge-neutral gap-1">
            <XCircle className="w-3 h-3" />
            Annulé
          </Badge>
        );
      default:
        return <Badge className="benaya-badge-neutral">—</Badge>;
    }
  };

  // Formater une date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Calculer la date d'expiration
  const getExpiryDate = (issueDate: string, validityPeriod: number) => {
    const issue = new Date(issueDate);
    const expiry = new Date(issue);
    expiry.setDate(issue.getDate() + validityPeriod);
    return expiry.toISOString().split('T')[0];
  };

  // Vérifier si le devis est expiré
  const isExpired = (issueDate: string, validityPeriod: number) => {
    const expiryDate = getExpiryDate(issueDate, validityPeriod);
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-benaya-600 mx-auto"></div>
          <p className="mt-4">Chargement du devis...</p>
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
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 hover:bg-white/20"
              onClick={() => navigate("/devis")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {quote.number}
                </h1>
                {getStatusBadge(quote.status)}
              </div>
              <p className="text-benaya-100 mt-1">
                Client: {quote.client_name} {quote.project_name && `- Projet: ${quote.project_name}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right mr-4">
              <div className="text-benaya-100 text-sm">Total TTC</div>
              <div className="text-xl font-bold">{formatCurrency(quote.total_ttc)} MAD</div>
            </div>
            
            <div className="flex">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20"
                onClick={handlePreviewQuote}
                title="Aperçu"
              >
                <Play className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20"
                onClick={handleExportQuote}
                title="Télécharger PDF"
              >
                <Download className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20"
                onClick={handleDuplicateQuote}
                title="Dupliquer"
              >
                <Copy className="w-4 h-4" />
              </Button>
              
              {quote.status === 'draft' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="bg-white/10 hover:bg-white/20"
                  onClick={handleEditQuote}
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client and Quote Info */}
          <div className="benaya-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </h3>
                <div className="space-y-1">
                  <div className="font-medium">{quote.client_name}</div>
                  {quote.client_address && (
                    <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                      {quote.client_address}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Projet
                </h3>
                <div className="space-y-1">
                  <div className="font-medium">
                    {quote.project_name || "—"}
                  </div>
                  {quote.project_address && (
                    <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                      {quote.project_address}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dates
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Date d'émission
                    </div>
                    <div className="font-medium">{formatDate(quote.issue_date)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Date d'expiration
                    </div>
                    <div className="font-medium">
                      {formatDate(getExpiryDate(quote.issue_date, quote.validity_period))}
                      {isExpired(quote.issue_date, quote.validity_period) && (
                        <span className="ml-2 text-red-500">
                          <AlertCircle className="w-4 h-4 inline" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Informations
                </h3>
                <div className="space-y-1">
                  <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Validité: {quote.validity_period} jours
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Créé le: {formatDate(quote.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Items */}
          <div className="benaya-card">
            <h3 className="font-medium text-lg mb-4">Détail du devis</h3>
            
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Désignation</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>TVA</TableHead>
                    <TableHead>Total HT</TableHead>
                    <TableHead>Total TTC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items?.map((item: QuoteItem) => {
                    // Si c'est un chapitre ou section, afficher en tant que titre
                    if (item.type === 'chapter' || item.type === 'section') {
                      return (
                        <TableRow key={item.id} className="bg-neutral-50 dark:bg-neutral-800/50">
                          <TableCell colSpan={6} className="font-semibold">
                            {item.designation}
                          </TableCell>
                        </TableRow>
                      );
                    }
                    
                    // Sinon, afficher comme élément normal
                    return (
                      <TableRow key={item.id}>
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
                          {item.quantity} {item.unit || 'unité'}
                        </TableCell>
                        <TableCell>{formatCurrency(item.unit_price)} MAD</TableCell>
                        <TableCell>{item.vat_rate}%</TableCell>
                        <TableCell>{formatCurrency(item.total_ht)} MAD</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(item.total_ttc)} MAD</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mt-6">
              <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total HT:</span>
                  <span className="font-medium">{formatCurrency(quote.total_ht)} MAD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total TVA:</span>
                  <span className="font-medium">{formatCurrency(quote.total_vat)} MAD</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-neutral-200 dark:border-neutral-700 pt-2">
                  <span>Total TTC:</span>
                  <span>{formatCurrency(quote.total_ttc)} MAD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="benaya-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quote.notes && (
                <div className="space-y-2">
                  <h3 className="font-medium">Notes</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {quote.notes}
                  </p>
                </div>
              )}
              
              {quote.terms_and_conditions && (
                <div className="space-y-2">
                  <h3 className="font-medium">Conditions générales</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {quote.terms_and_conditions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="benaya-card">
            <h3 className="font-medium text-lg mb-4">Statut et actions</h3>
            
            <div className="space-y-6">
              {/* Status */}
              <div className="flex flex-col items-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="text-lg font-semibold mb-2">Statut actuel</div>
                <div className="scale-125 mb-2">
                  {getStatusBadge(quote.status)}
                </div>
                
                {isExpired(quote.issue_date, quote.validity_period) && quote.status === 'sent' && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center mt-2">
                    Devis expiré le {formatDate(getExpiryDate(quote.issue_date, quote.validity_period))}
                  </p>
                )}
              </div>
              
              {/* Totals Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total HT:</span>
                  <span className="font-medium">{formatCurrency(quote.total_ht)} MAD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>TVA:</span>
                  <span className="font-medium">{formatCurrency(quote.total_vat)} MAD</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-neutral-200 dark:border-neutral-700 pt-2">
                  <span>Total TTC:</span>
                  <span className="text-benaya-600 dark:text-benaya-400">
                    {formatCurrency(quote.total_ttc)} MAD
                  </span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="space-y-3">
                {quote.status === 'draft' && (
                  <>
                    <Button 
                      className="w-full benaya-button-primary gap-2"
                      onClick={handleSendQuote}
                    >
                      <Send className="w-4 h-4" />
                      Envoyer au client
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={handleEditQuote}
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </Button>
                  </>
                )}
                
                {quote.status === 'sent' && (
                  <>
                    <Button 
                      className="w-full benaya-button-primary gap-2"
                      onClick={handleAcceptQuote}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marquer comme accepté
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={handleRejectQuote}
                    >
                      <XCircle className="w-4 h-4" />
                      Marquer comme refusé
                    </Button>
                  </>
                )}
                
                {quote.status === 'accepted' && (
                  <Button 
                    className="w-full benaya-button-primary gap-2"
                    onClick={handleConvertToInvoice}
                  >
                    <FileText className="w-4 h-4" />
                    Convertir en facture
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={handleDuplicateQuote}
                >
                  <Copy className="w-4 h-4" />
                  Dupliquer
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={handleExportQuote}
                >
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="benaya-card">
            <h3 className="font-medium text-lg mb-4">Résumé</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Éléments:</span>
                <span className="font-medium">{quote.items?.length || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Validité:</span>
                <span className="font-medium">{quote.validity_period} jours</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Créé par:</span>
                <span className="font-medium">{quote.created_by || '—'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Dernière MAJ:</span>
                <span className="font-medium">{formatDate(quote.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de conversion en facture */}
      {quote && (
        <ConvertToInvoiceModal
          open={convertModalOpen}
          onOpenChange={setConvertModalOpen}
          quote={{
            id: quote.id,
            number: quote.number,
            clientName: quote.client_name,
            projectName: quote.project_name,
            totalTTC: parseFloat(quote.total_ttc.toString()),
          }}
          onConvert={handleConvertSubmit}
          loading={converting}
        />
      )}
    </div>
  );
} 