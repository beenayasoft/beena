import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Calendar,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Send,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InvoiceStats } from "@/components/invoices/InvoiceStats";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceTabs } from "@/components/invoices/InvoiceTabs";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { CreateInvoiceModal } from "@/components/invoices/CreateInvoiceModal";
import { RecordPaymentModal } from "@/components/invoices/RecordPaymentModal";
import { CreateCreditNoteModal } from "@/components/invoices/CreateCreditNoteModal";
import { 
  getInvoices, 
  getInvoiceStats, 
  validateInvoice, 
  recordPayment, 
  createCreditNote 
} from "@/lib/mock/invoices";
import { Invoice, InvoiceStatus } from "@/lib/types/invoice";
import { initialTiers } from "@/components/tiers";

export default function Factures() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    all: 0,
    draft: 0,
    sent: 0,
    overdue: 0,
    partially_paid: 0,
    paid: 0,
    cancelled: 0,
  });
  
  // États pour les modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [creditNoteModalOpen, setCreditNoteModalOpen] = useState(false);

  // Charger les factures et statistiques
  useEffect(() => {
    const invoiceStats = getInvoiceStats();
    setStats({
      all: invoiceStats.total,
      draft: invoiceStats.draft,
      sent: invoiceStats.sent,
      overdue: invoiceStats.overdue,
      partially_paid: invoiceStats.partially_paid,
      paid: invoiceStats.paid,
      cancelled: invoiceStats.cancelled + invoiceStats.cancelled_by_credit_note,
    });

    // Filtrer les factures selon l'onglet actif
    let statusFilter: InvoiceStatus | undefined;
    if (activeTab !== "all") {
      statusFilter = activeTab as InvoiceStatus;
    }

    const filteredInvoices = getInvoices({
      status: statusFilter,
      search: searchQuery,
    });
    setInvoices(filteredInvoices);
  }, [activeTab, searchQuery]);

  // Voir le détail d'une facture
  const handleViewInvoice = (invoice: Invoice) => {
    navigate(`/factures/${invoice.id}`);
  };

  // Modifier une facture
  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setCreateModalOpen(true);
  };

  // Supprimer une facture
  const handleDeleteInvoice = (invoice: Invoice) => {
    // Dans une vraie application, on demanderait une confirmation
    if (confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoice.number} ?`)) {
      // Supprimer la facture (à implémenter dans lib/mock/invoices.ts)
      // Puis recharger les factures
      const updatedInvoices = invoices.filter(inv => inv.id !== invoice.id);
      setInvoices(updatedInvoices);
    }
  };

  // Valider et envoyer une facture
  const handleSendInvoice = (invoice: Invoice) => {
    try {
      const updatedInvoice = validateInvoice(invoice.id);
      if (updatedInvoice) {
        // Mettre à jour la liste des factures
        const updatedInvoices = invoices.map(inv => 
          inv.id === updatedInvoice.id ? updatedInvoice : inv
        );
        setInvoices(updatedInvoices);
        
        // Mettre à jour les statistiques
        const invoiceStats = getInvoiceStats();
        setStats({
          all: invoiceStats.total,
          draft: invoiceStats.draft,
          sent: invoiceStats.sent,
          overdue: invoiceStats.overdue,
          partially_paid: invoiceStats.partially_paid,
          paid: invoiceStats.paid,
          cancelled: invoiceStats.cancelled + invoiceStats.cancelled_by_credit_note,
        });
      }
    } catch (err) {
      console.error("Erreur lors de la validation de la facture:", err);
    }
  };

  // Enregistrer un paiement
  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  // Soumettre un paiement
  const handleSubmitPayment = (invoiceId: string, payment: Omit<Payment, "id">) => {
    try {
      const updatedInvoice = recordPayment(invoiceId, payment);
      if (updatedInvoice) {
        // Mettre à jour la liste des factures
        const updatedInvoices = invoices.map(inv => 
          inv.id === updatedInvoice.id ? updatedInvoice : inv
        );
        setInvoices(updatedInvoices);
        
        // Mettre à jour les statistiques
        const invoiceStats = getInvoiceStats();
        setStats({
          all: invoiceStats.total,
          draft: invoiceStats.draft,
          sent: invoiceStats.sent,
          overdue: invoiceStats.overdue,
          partially_paid: invoiceStats.partially_paid,
          paid: invoiceStats.paid,
          cancelled: invoiceStats.cancelled + invoiceStats.cancelled_by_credit_note,
        });
      }
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du paiement:", err);
    }
  };

  // Créer un avoir
  const handleCreateCreditNote = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setCreditNoteModalOpen(true);
  };

  // Soumettre un avoir
  const handleSubmitCreditNote = (invoiceId: string, isFullCreditNote: boolean, selectedItems?: string[]) => {
    try {
      const creditNote = createCreditNote(invoiceId, isFullCreditNote, selectedItems);
      if (creditNote) {
        // Mettre à jour la liste des factures
        const updatedInvoices = getInvoices({
          status: activeTab !== "all" ? activeTab as InvoiceStatus : undefined,
          search: searchQuery,
        });
        setInvoices(updatedInvoices);
        
        // Mettre à jour les statistiques
        const invoiceStats = getInvoiceStats();
        setStats({
          all: invoiceStats.total,
          draft: invoiceStats.draft,
          sent: invoiceStats.sent,
          overdue: invoiceStats.overdue,
          partially_paid: invoiceStats.partially_paid,
          paid: invoiceStats.paid,
          cancelled: invoiceStats.cancelled + invoiceStats.cancelled_by_credit_note,
        });
      }
    } catch (err) {
      console.error("Erreur lors de la création de l'avoir:", err);
    }
  };

  // Télécharger une facture (placeholder)
  const handleDownloadInvoice = (invoice: Invoice) => {
    alert(`Téléchargement de la facture ${invoice.number} à implémenter`);
  };

  // Créer une nouvelle facture
  const handleCreateInvoice = (invoiceData: Partial<Invoice>) => {
    // Dans une vraie application, on enverrait ces données à l'API
    console.log("Nouvelle facture:", invoiceData);
    
    // Recharger les factures
    const updatedInvoices = getInvoices({
      status: activeTab !== "all" ? activeTab as InvoiceStatus : undefined,
      search: searchQuery,
    });
    setInvoices(updatedInvoices);
    
    // Mettre à jour les statistiques
    const invoiceStats = getInvoiceStats();
    setStats({
      all: invoiceStats.total,
      draft: invoiceStats.draft,
      sent: invoiceStats.sent,
      overdue: invoiceStats.overdue,
      partially_paid: invoiceStats.partially_paid,
      paid: invoiceStats.paid,
      cancelled: invoiceStats.cancelled + invoiceStats.cancelled_by_credit_note,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Factures</h1>
            <p className="text-benaya-100 mt-1">
              Gérez vos factures et suivez les paiements
            </p>
          </div>
          <Button 
            className="gap-2 bg-white text-benaya-900 hover:bg-white/90"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      {/* Stats */}
      <InvoiceStats 
        stats={{
          total: stats.all,
          draft: stats.draft,
          sent: stats.sent,
          overdue: stats.overdue,
          partially_paid: stats.partially_paid,
          paid: stats.paid,
          cancelled: stats.cancelled,
          totalAmount: getInvoiceStats().totalAmount,
          overdueAmount: getInvoiceStats().overdueAmount,
          paidAmount: getInvoiceStats().paidAmount,
          remainingAmount: getInvoiceStats().remainingAmount,
        }}
      />

      {/* Filters */}
      <InvoiceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <div className="benaya-card">
        {/* Tabs */}
        <InvoiceTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          counts={{
            all: stats.all,
            draft: stats.draft,
            sent: stats.sent,
            overdue: stats.overdue,
            partially_paid: stats.partially_paid,
            paid: stats.paid,
            cancelled: stats.cancelled,
          }}
        />

        {/* Table */}
        <InvoiceList
          invoices={invoices}
          onView={handleViewInvoice}
          onEdit={handleEditInvoice}
          onDelete={handleDeleteInvoice}
          onSend={handleSendInvoice}
          onRecordPayment={handleRecordPayment}
          onCreateCreditNote={handleCreateCreditNote}
          onDownload={handleDownloadInvoice}
        />
      </div>

      {/* Modals */}
      <CreateInvoiceModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateInvoice}
        initialInvoice={selectedInvoice || undefined}
        clients={initialTiers}
        projects={[
          { id: '1', name: 'Villa Moderne' },
          { id: '2', name: 'Rénovation appartement' },
          { id: '3', name: 'Extension maison' },
          { id: '4', name: 'Rénovation cuisine' },
        ]}
      />

      {selectedInvoice && (
        <>
          <RecordPaymentModal
            open={paymentModalOpen}
            onOpenChange={setPaymentModalOpen}
            invoice={selectedInvoice}
            onSubmit={handleSubmitPayment}
          />
          
          <CreateCreditNoteModal
            open={creditNoteModalOpen}
            onOpenChange={setCreditNoteModalOpen}
            invoice={selectedInvoice}
            onSubmit={handleSubmitCreditNote}
          />
        </>
      )}
    </div>
  );
}