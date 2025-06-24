import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { QuoteTableProvider } from "@/components/quotes/editor/QuoteTableContext";
import { EnhancedQuoteEditor } from "@/components/quotes/editor/EnhancedQuoteEditor";
import { LiveQuotePreview } from "@/components/quotes/editor/LiveQuotePreview";
import { FlexibleQuoteTable } from "@/components/quotes/editor/FlexibleQuoteTable";
import { BulkQuoteData, EditorQuoteItem } from "@/lib/api/quotes";
import { Wrench, Eye, Save, FileText } from "lucide-react";

// Mock data pour les tests
const mockQuote = {
  id: 'test-quote-1',
  number: 'DEV-2024-001',
  status: 'draft' as const,
  status_display: 'Brouillon',
  tier: 'client-1',
  client_name: 'Société Test SARL',
  client_type: 'entreprise',
  client_address: '123 Rue de la Paix\n20000 Casablanca\nMaroc',
  project_name: 'Rénovation bureau',
  project_address: '456 Avenue Hassan II\n20000 Casablanca\nMaroc',
  issue_date: new Date().toISOString().split('T')[0],
  expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  issue_date_formatted: new Date().toLocaleDateString('fr-FR'),
  expiry_date_formatted: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
  validity_period: 30,
  notes: 'Devis test pour validation des composants',
  conditions: 'Acompte de 30% à la signature. Solde à la fin des travaux.',
  total_ht: 12500,
  total_tva: 2500,
  total_ttc: 15000,
  items_count: 5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tier_details: {
    id: 'client-1',
    nom: 'Société Test SARL',
    type: 'entreprise',
    adresse: '123 Rue de la Paix\n20000 Casablanca\nMaroc',
  },
  items: [
    {
      id: 'item-1',
      quote: 'test-quote-1',
      type: 'chapter' as const,
      type_display: 'Chapitre',
      position: 1,
      designation: 'Gros œuvre',
      description: 'Travaux de structure et fondations',
      unit: '',
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      tva_rate: '20',
      tva_rate_display: '20%',
      margin: 0,
      total_ht: 0,
      total_ttc: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-2',
      quote: 'test-quote-1',
      type: 'product' as const,
      type_display: 'Produit',
      parent: 'item-1',
      position: 2,
      reference: 'CIM-001',
      designation: 'Ciment Portland',
      description: 'Sac de 50kg - Qualité supérieure',
      unit: 'sac',
      quantity: 20,
      unit_price: 45,
      discount_percentage: 5,
      tva_rate: '20',
      tva_rate_display: '20%',
      margin: 15,
      total_ht: 855,
      total_ttc: 1026,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-3',
      quote: 'test-quote-1',
      type: 'service' as const,
      type_display: 'Service',
      parent: 'item-1',
      position: 3,
      designation: 'Main d\'œuvre terrassement',
      description: 'Excavation et préparation terrain',
      unit: 'jour',
      quantity: 3,
      unit_price: 450,
      discount_percentage: 0,
      tva_rate: '20',
      tva_rate_display: '20%',
      margin: 25,
      total_ht: 1350,
      total_ttc: 1620,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-4',
      quote: 'test-quote-1',
      type: 'section' as const,
      type_display: 'Section',
      position: 4,
      designation: 'Second œuvre',
      description: 'Finitions et aménagements',
      unit: '',
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      tva_rate: '20',
      tva_rate_display: '20%',
      margin: 0,
      total_ht: 0,
      total_ttc: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-5',
      quote: 'test-quote-1',
      type: 'product' as const,
      type_display: 'Produit',
      parent: 'item-4',
      position: 5,
      reference: 'PEI-002',
      designation: 'Peinture intérieure',
      description: 'Peinture acrylique blanc mat 15L',
      unit: 'pot',
      quantity: 8,
      unit_price: 125,
      discount_percentage: 10,
      tva_rate: '20',
      tva_rate_display: '20%',
      margin: 20,
      total_ht: 900,
      total_ttc: 1080,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  items_stats: {
    total_items: 5,
    chapters: 1,
    sections: 1,
    products: 2,
    services: 1,
    works: 0,
    discounts: 0,
  },
  vat_breakdown: [
    {
      rate: 20,
      base_ht: 12500,
      vat_amount: 2500,
    },
  ],
};

export default function QuoteEditorTest() {
  const [activeTab, setActiveTab] = React.useState("editor");
  const [saving, setSaving] = React.useState(false);

  const handleSave = async (quoteData: BulkQuoteData) => {
    setSaving(true);
    console.log("💾 Sauvegarde des données:", quoteData);
    
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success("Devis test sauvegardé avec succès !");
    setSaving(false);
  };

  const handleTestCalculations = () => {
    const testItems: EditorQuoteItem[] = [
      {
        designation: "Test produit 1",
        quantity: 10,
        unit: "m²",
        unitPrice: 25.50,
        discountPercentage: 5,
        tvaRate: "20",
        type: "product",
      },
      {
        designation: "Test service 1",
        quantity: 2,
        unit: "jour",
        unitPrice: 450,
        discountPercentage: 0,
        tvaRate: "20",
        type: "service",
      },
    ];

    const { calculateTotals } = require("@/lib/api/quotes").quotesApi;
    const totals = calculateTotals(testItems);
    
    toast.success(`Calculs test : HT: ${totals.totalHT}€, TVA: ${totals.totalTVA}€, TTC: ${totals.totalTTC}€`);
    console.log("🧮 Résultats des calculs test:", totals);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Wrench className="w-8 h-8 mr-3 text-blue-600" />
            Test des Composants d'Édition de Devis
          </h1>
          <p className="text-gray-600 mt-2">
            Page de test pour valider l'intégration des nouveaux composants
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleTestCalculations}>
            🧮 Test Calculs
          </Button>
          <Button variant="outline" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Sauvegarde..." : "Tester Sauvegarde"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Devis Test - DEV-2024-001
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="editor">Éditeur Complet</TabsTrigger>
              <TabsTrigger value="table">Table Flexible</TabsTrigger>
              <TabsTrigger value="preview">Aperçu Live</TabsTrigger>
              <TabsTrigger value="both">Vue Côte à Côte</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>EnhancedQuoteEditor</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuoteTableProvider
                    initialQuote={mockQuote}
                    onSave={handleSave}
                    saving={saving}
                  >
                    <EnhancedQuoteEditor />
                  </QuoteTableProvider>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="table" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>FlexibleQuoteTable</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuoteTableProvider
                    initialQuote={mockQuote}
                    onSave={handleSave}
                    saving={saving}
                  >
                    <FlexibleQuoteTable />
                  </QuoteTableProvider>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    LiveQuotePreview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuoteTableProvider
                    initialQuote={mockQuote}
                    onSave={handleSave}
                    saving={saving}
                  >
                    <LiveQuotePreview />
                  </QuoteTableProvider>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="both" className="mt-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Éditeur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuoteTableProvider
                      initialQuote={mockQuote}
                      onSave={handleSave}
                      saving={saving}
                    >
                      <EnhancedQuoteEditor />
                    </QuoteTableProvider>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Aperçu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuoteTableProvider
                      initialQuote={mockQuote}
                      onSave={handleSave}
                      saving={saving}
                    >
                      <LiveQuotePreview />
                    </QuoteTableProvider>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Informations de debug */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Données du devis test:</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <p><strong>Client:</strong> {mockQuote.client_name}</p>
                <p><strong>Projet:</strong> {mockQuote.project_name}</p>
                <p><strong>Nombre d'éléments:</strong> {mockQuote.items.length}</p>
                <p><strong>Total HT:</strong> {mockQuote.total_ht}€</p>
                <p><strong>Total TTC:</strong> {mockQuote.total_ttc}€</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Fonctionnalités testées:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>✅ Affichage des colonnes conditionnelles (TVA/Remise)</li>
                <li>✅ Calculs en temps réel</li>
                <li>✅ Structure hiérarchique (chapitres/sections)</li>
                <li>✅ Aperçu live synchronisé</li>
                <li>✅ Contexte partagé entre composants</li>
                <li>✅ Gestion des états de sauvegarde</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 