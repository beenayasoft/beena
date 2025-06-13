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
import { Invoice } from "@/lib/types/invoice";
import { getInvoiceById } from "@/lib/mock/invoices";
import { formatCurrency } from "@/lib/utils";

export default function InvoicePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isPreviewMode = id === 'preview';

  // Load invoice data
  useEffect(() => {
    if (isPreviewMode) {
      // Get invoice data from sessionStorage
      const storedInvoice = sessionStorage.getItem('previewInvoice');
      if (storedInvoice) {
        try {
          setInvoice(JSON.parse(storedInvoice) as Invoice);
        } catch (err) {
          setError("Erreur lors du chargement de l'aperçu");
          console.error(err);
        }
      } else {
        setError("Aucune donnée d'aperçu disponible");
      }
      setLoading(false);
    } else if (id) {
      try {
        const invoiceData = getInvoiceById(id);
        if (invoiceData) {
          setInvoice(invoiceData);
        } else {
          setError("Facture non trouvée");
        }
      } catch (err) {
        setError("Erreur lors du chargement de la facture");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  }, [id, isPreviewMode]);

  // Format a date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Print the invoice
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

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">{error || "Facture non trouvée"}</h2>
          <Button onClick={() => navigate("/factures")}>
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
              onClick={() => window.close()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold">
                Aperçu de la facture
              </h1>
              <p className="text-benaya-100 mt-1">
                {invoice.number || "Brouillon"} - {invoice.clientName}
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
        {/* A4 container with proper aspect ratio */}
        <div className="w-full mx-auto" style={{ maxWidth: "210mm", minHeight: "297mm" }}>
          {/* Header */}
          <div className="p-8 border-b border-neutral-200">
            <div className="flex justify-between">
              {/* Company Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-benaya-900 flex items-center justify-center">
                    <div className="w-8 h-8 text-white">
                      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                        <g fill="currentColor" opacity="0.9">
                          <path d="M20 2L27.32 6.5V15.5L20 20L12.68 15.5V6.5L20 2Z" />
                          <path d="M8.66 9L16 4.5V13.5L8.66 18L1.34 13.5V4.5L8.66 9Z" />
                          <path d="M31.34 9L38.66 4.5V13.5L31.34 18L24 13.5V4.5L31.34 9Z" />
                          <path d="M8.66 31L16 26.5V35.5L8.66 40L1.34 35.5V26.5L8.66 31Z" />
                          <path d="M31.34 31L38.66 26.5V35.5L31.34 40L24 35.5V26.5L31.34 31Z" />
                          <path d="M20 38L27.32 33.5V24.5L20 20L12.68 24.5V33.5L20 38Z" />
                        </g>
                        <path
                          d="M15 20L18.5 23.5L25 17"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-benaya-900">Benaya Construction</h1>
                    <p className="text-sm text-neutral-600">Votre partenaire en construction</p>
                  </div>
                </div>
                <div className="text-sm text-neutral-600 mt-2">
                  <p>123 Rue de la Construction</p>
                  <p>75001 Paris, France</p>
                  <p>Tél: +33 1 23 45 67 89</p>
                  <p>Email: contact@benaya.fr</p>
                  <p>SIRET: 123 456 789 00012</p>
                </div>
              </div>

              {/* Invoice Info */}
              <div className="text-right">
                <div className="text-3xl font-bold text-benaya-900 mb-2">FACTURE</div>
                <div className="text-xl font-semibold mb-4">
                  {invoice.number || "Brouillon"}
                </div>
                <div className="text-sm text-neutral-600 space-y-1">
                  <div className="flex justify-end gap-2">
                    <span className="font-medium">Date d'émission:</span>
                    <span>{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <span className="font-medium">Date d'échéance:</span>
                    <span>{formatDate(invoice.dueDate)}</span>
                  </div>
                  {invoice.quoteNumber && (
                    <div className="flex justify-end gap-2">
                      <span className="font-medium">Devis d'origine:</span>
                      <span>{invoice.quoteNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Client and Project Info */}
          <div className="p-8 border-b border-neutral-200">
            <div className="flex justify-between">
              {/* Client Info */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-benaya-900">Facturer à</h2>
                <div className="text-sm">
                  <p className="font-medium">{invoice.clientName || "Client non spécifié"}</p>
                  {invoice.clientAddress && (
                    <div className="text-neutral-600 whitespace-pre-line">
                      {invoice.clientAddress}
                    </div>
                  )}
                </div>
              </div>

              {/* Project Info */}
              {invoice.projectName && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-benaya-900">Projet</h2>
                  <div className="text-sm">
                    <p className="font-medium">{invoice.projectName}</p>
                    {invoice.projectAddress && (
                      <div className="text-neutral-600 whitespace-pre-line">
                        {invoice.projectAddress}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="p-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-100 text-benaya-900">
                  <th className="py-3 px-4 text-left font-semibold border-b border-neutral-300">Désignation</th>
                  <th className="py-3 px-4 text-right font-semibold border-b border-neutral-300">Quantité</th>
                  <th className="py-3 px-4 text-right font-semibold border-b border-neutral-300">Prix unitaire</th>
                  <th className="py-3 px-4 text-right font-semibold border-b border-neutral-300">TVA</th>
                  <th className="py-3 px-4 text-right font-semibold border-b border-neutral-300">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.map((item) => {
                  if (item.type === 'chapter' || item.type === 'section') {
                    return (
                      <tr key={item.id} className="bg-neutral-50">
                        <td colSpan={5} className="py-3 px-4 font-semibold text-benaya-900 border-b border-neutral-200">
                          {item.designation}
                        </td>
                      </tr>
                    );
                  }
                  
                  return (
                    <tr key={item.id}>
                      <td className="py-3 px-4 border-b border-neutral-200">
                        <div className="font-medium">{item.designation}</div>
                        {item.description && (
                          <div className="text-xs text-neutral-600">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right border-b border-neutral-200">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right border-b border-neutral-200">
                        {formatCurrency(item.unitPrice)} MAD
                      </td>
                      <td className="py-3 px-4 text-right border-b border-neutral-200">
                        {item.vatRate}%
                      </td>
                      <td className="py-3 px-4 text-right font-medium border-b border-neutral-200">
                        {formatCurrency(item.totalHT)} MAD
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-8 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between py-2 border-b border-neutral-200">
                  <span className="font-medium">Total HT:</span>
                  <span>{formatCurrency(invoice.totalHT || 0)} MAD</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-200">
                  <span className="font-medium">Total TVA:</span>
                  <span>{formatCurrency(invoice.totalVAT || 0)} MAD</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold text-benaya-900">
                  <span>Total TTC:</span>
                  <span>{formatCurrency(invoice.totalTTC || 0)} MAD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 mt-auto">
            {/* Payment Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-benaya-900 mb-2">Conditions de paiement</h3>
              <p className="text-sm text-neutral-600">
                {invoice.termsAndConditions || "Paiement à 30 jours."}
              </p>
            </div>

            {/* Bank Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-benaya-900 mb-2">Coordonnées bancaires</h3>
              <div className="text-sm text-neutral-600">
                <p>IBAN: FR76 1234 5678 9012 3456 7890 123</p>
                <p>BIC: ABCDEFGHIJK</p>
                <p>Banque: Banque Exemple</p>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-benaya-900 mb-2">Notes</h3>
                <p className="text-sm text-neutral-600">{invoice.notes}</p>
              </div>
            )}

            {/* Legal Mentions */}
            <div className="text-xs text-neutral-500 mt-8 pt-4 border-t border-neutral-200">
              <p>Benaya Construction - SIRET: 123 456 789 00012 - TVA: FR12345678901</p>
              <p>123 Rue de la Construction, 75001 Paris, France</p>
              <p>En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}