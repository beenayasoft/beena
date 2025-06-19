import React from "react";
import { Quote, QuoteItem } from "@/lib/types/quote";
import { formatCurrency } from "@/lib/utils";

interface QuotePreviewProps {
  quote: Quote;
  appearanceSettings?: {
    documentTemplate?: "modern" | "classic" | "minimal";
    primaryColor?: string;
    showLogo?: boolean;
    showClientAddress?: boolean;
    showProjectInfo?: boolean;
    showNotes?: boolean;
    showPaymentTerms?: boolean;
    showBankDetails?: boolean;
    showSignatureArea?: boolean;
  };
}

export function QuotePreview({ 
  quote,
  appearanceSettings = {
    documentTemplate: "modern",
    primaryColor: "#1B333F",
    showLogo: true,
    showClientAddress: true,
    showProjectInfo: true,
    showNotes: true,
    showPaymentTerms: true,
    showBankDetails: true,
    showSignatureArea: true,
  }
}: QuotePreviewProps) {
  // Format a date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Get section items for hierarchical display
  const getSectionItems = (parentId?: string) => {
    if (!quote.items) return [];
    return quote.items.filter(item => item.parentId === parentId);
  };

  // Get root level items (no parent)
  const getRootItems = () => {
    if (!quote.items) return [];
    return quote.items.filter(item => !item.parentId);
  };

  // Calculate section total
  const getSectionTotal = (sectionId: string) => {
    if (!quote.items) return { totalHT: 0, totalTTC: 0 };
    
    let totalHT = 0;
    let totalTTC = 0;
    
    // Get all items in this section
    const sectionItems = quote.items.filter(item => item.parentId === sectionId);
    
    // Sum up the totals
    sectionItems.forEach(item => {
      if (item.type !== 'chapter' && item.type !== 'section') {
        totalHT += item.totalHT;
        totalTTC += item.totalTTC;
      }
    });
    
    return { totalHT, totalTTC };
  };

  // Render hierarchical items
  const renderItems = (items: QuoteItem[], level = 0) => {
    return items.map((item) => {
      // For chapters and sections, render with their children
      if (item.type === 'chapter' || item.type === 'section') {
        const { totalHT } = getSectionTotal(item.id);
        const childItems = getSectionItems(item.id);
        
        return (
          <React.Fragment key={item.id}>
            <tr className="bg-neutral-50">
              <td 
                colSpan={5} 
                className="py-3 px-4 font-semibold border-b border-neutral-200"
                style={{ 
                  paddingLeft: `${level * 20 + 16}px`,
                  color: appearanceSettings.primaryColor
                }}
              >
                {item.designation}
              </td>
            </tr>
            
            {/* Render child items */}
            {renderItems(childItems, level + 1)}
          </React.Fragment>
        );
      }
      
      // For regular items
      return (
        <tr key={item.id}>
          <td 
            className="py-3 px-4 border-b border-neutral-200"
            style={{ paddingLeft: `${level * 20 + 16}px` }}
          >
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
            {formatCurrency(Math.abs(item.unitPrice))} MAD
            {item.discount && item.discount > 0 && (
              <div className="text-xs text-red-600">
                -{item.discount}%
              </div>
            )}
          </td>
          <td className="py-3 px-4 text-right border-b border-neutral-200">
            {item.vatRate}%
          </td>
          <td className="py-3 px-4 text-right font-medium border-b border-neutral-200">
            <span className={item.type === 'discount' ? "text-red-600" : ""}>
              {formatCurrency(Math.abs(item.totalHT))} {item.type === 'discount' && "-"} MAD
            </span>
          </td>
        </tr>
      );
    });
  };

  // Get template-specific styles
  const getTemplateStyles = () => {
    switch (appearanceSettings.documentTemplate) {
      case "classic":
        return {
          headerBg: "bg-neutral-100",
          headerBorder: "border-b-2 border-neutral-300",
          titleColor: appearanceSettings.primaryColor,
          sectionTitleColor: appearanceSettings.primaryColor,
          tableBorder: "border border-neutral-300",
          tableHeaderBg: "bg-neutral-100",
        };
      case "minimal":
        return {
          headerBg: "bg-white",
          headerBorder: "border-b border-neutral-200",
          titleColor: appearanceSettings.primaryColor,
          sectionTitleColor: appearanceSettings.primaryColor,
          tableBorder: "border-t border-b border-neutral-200",
          tableHeaderBg: "bg-white",
        };
      case "modern":
      default:
        return {
          headerBg: "bg-white",
          headerBorder: "border-b border-neutral-200",
          titleColor: appearanceSettings.primaryColor,
          sectionTitleColor: appearanceSettings.primaryColor,
          tableBorder: "border-none",
          tableHeaderBg: "bg-neutral-100",
        };
    }
  };

  const templateStyles = getTemplateStyles();

  return (
    <div className="w-full h-full bg-white text-black overflow-auto">
      {/* A4 container with proper aspect ratio */}
      <div className="w-full mx-auto" style={{ maxWidth: "210mm", minHeight: "297mm" }}>
        {/* Header */}
        <div className={`p-8 ${templateStyles.headerBorder} ${templateStyles.headerBg}`}>
          <div className="flex justify-between">
            {/* Company Info */}
            <div className="space-y-2">
              {appearanceSettings.showLogo && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: appearanceSettings.primaryColor }}>
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
                    <h1 className="text-2xl font-bold" style={{ color: appearanceSettings.primaryColor }}>Benaya Construction</h1>
                    <p className="text-sm text-neutral-600">Votre spécialiste en construction</p>
                  </div>
                </div>
              )}
              <div className="text-sm text-neutral-600 mt-2">
                <p>123 Rue de la Construction</p>
                <p>75001 Paris, France</p>
                <p>Tél: +33 1 23 45 67 89</p>
                <p>Email: contact@benaya.fr</p>
                <p>SIRET: 123 456 789 00012</p>
              </div>
            </div>

            {/* Quote Info */}
            <div className="text-right">
              <div className="text-3xl font-bold mb-2" style={{ color: appearanceSettings.primaryColor }}>DEVIS</div>
              <div className="text-xl font-semibold mb-4">
                {quote.number || "Brouillon"}
              </div>
              <div className="text-sm text-neutral-600 space-y-1">
                <div className="flex justify-end gap-2">
                  <span className="font-medium">Date d'émission:</span>
                  <span>{formatDate(quote.issueDate)}</span>
                </div>
                <div className="flex justify-end gap-2">
                  <span className="font-medium">Date d'expiration:</span>
                  <span>{formatDate(quote.expiryDate)}</span>
                </div>
                <div className="flex justify-end gap-2">
                  <span className="font-medium">Validité:</span>
                  <span>{quote.validityPeriod} jours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client and Project Info */}
        {(appearanceSettings.showClientAddress || (appearanceSettings.showProjectInfo && quote.projectName)) && (
          <div className="p-8 border-b border-neutral-200">
            <div className="flex justify-between">
              {/* Client Info */}
              {appearanceSettings.showClientAddress && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold" style={{ color: appearanceSettings.primaryColor }}>Client</h2>
                  <div className="text-sm">
                    <p className="font-medium">{quote.clientName || "Client non spécifié"}</p>
                    {quote.clientAddress && (
                      <div className="text-neutral-600 whitespace-pre-line">
                        {quote.clientAddress}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Project Info */}
              {appearanceSettings.showProjectInfo && quote.projectName && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold" style={{ color: appearanceSettings.primaryColor }}>Projet</h2>
                  <div className="text-sm">
                    <p className="font-medium">{quote.projectName}</p>
                    {quote.projectAddress && (
                      <div className="text-neutral-600 whitespace-pre-line">
                        {quote.projectAddress}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quote Items */}
        <div className="p-8">
          <table className={`w-full border-collapse ${templateStyles.tableBorder}`}>
            <thead>
              <tr className={templateStyles.tableHeaderBg}>
                <th className="py-3 px-4 text-left font-semibold border-b border-neutral-300" style={{ color: appearanceSettings.primaryColor }}>Désignation</th>
                <th className="py-3 px-4 text-right font-semibold border-b border-neutral-300" style={{ color: appearanceSettings.primaryColor }}>Quantité</th>
                <th className="py-3 px-4 text-right font-semibold border-b border-neutral-300" style={{ color: appearanceSettings.primaryColor }}>Prix unitaire</th>
                <th className="py-3 px-4 text-right font-semibold border-b border-neutral-300" style={{ color: appearanceSettings.primaryColor }}>TVA</th>
                <th className="py-3 px-4 text-right font-semibold border-b border-neutral-300" style={{ color: appearanceSettings.primaryColor }}>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {renderItems(getRootItems())}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between py-2 border-b border-neutral-200">
                <span className="font-medium">Total HT:</span>
                <span>{formatCurrency(quote.totalHT || 0)} MAD</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-200">
                <span className="font-medium">Total TVA:</span>
                <span>{formatCurrency(quote.totalVAT || 0)} MAD</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold" style={{ color: appearanceSettings.primaryColor }}>
                <span>Total TTC:</span>
                <span>{formatCurrency(quote.totalTTC || 0)} MAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 mt-auto">
          {/* Terms and Conditions */}
          {appearanceSettings.showPaymentTerms && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2" style={{ color: appearanceSettings.primaryColor }}>Conditions</h3>
              <p className="text-sm text-neutral-600">
                {quote.termsAndConditions || "Acompte de 30% à la signature. Solde à la fin des travaux."}
              </p>
            </div>
          )}

          {/* Bank Details */}
          {appearanceSettings.showBankDetails && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2" style={{ color: appearanceSettings.primaryColor }}>Coordonnées bancaires</h3>
              <div className="text-sm text-neutral-600">
                <p>IBAN: FR76 1234 5678 9012 3456 7890 123</p>
                <p>BIC: ABCDEFGHIJK</p>
                <p>Banque: Banque Exemple</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {appearanceSettings.showNotes && quote.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2" style={{ color: appearanceSettings.primaryColor }}>Notes</h3>
              <p className="text-sm text-neutral-600">{quote.notes}</p>
            </div>
          )}

          {/* Acceptance */}
          {appearanceSettings.showSignatureArea && (
            <div className="mb-6 border-t border-neutral-200 pt-6">
              <h3 className="text-lg font-semibold mb-2" style={{ color: appearanceSettings.primaryColor }}>Acceptation du devis</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-neutral-600 mb-4">
                    Bon pour accord (signature et date)
                  </p>
                  <div className="h-24 border border-neutral-300 rounded"></div>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-4">
                    Cachet de l'entreprise
                  </p>
                  <div className="h-24 border border-neutral-300 rounded"></div>
                </div>
              </div>
            </div>
          )}

          {/* Legal Mentions */}
          <div className="text-xs text-neutral-500 mt-8 pt-4 border-t border-neutral-200">
            <p>Benaya Construction - SIRET: 123 456 789 00012 - TVA: FR12345678901</p>
            <p>123 Rue de la Construction, 75001 Paris, France</p>
            <p>Ce devis est valable {quote.validityPeriod} jours à compter de sa date d'émission.</p>
          </div>
        </div>
      </div>
    </div>
  );
}