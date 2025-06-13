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
  
  // States for modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [creditNoteModalOpen, setCreditNoteModalOpen] = useState(false);

  // Load invoices and stats
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

    // Filter invoices based on active tab
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

  // View invoice details
  const handleViewInvoice = (invoice: Invoice) => {
    navigate(`/factures/${invoice.id}`);
  };

  // Edit invoice
  const handleEditInvoice = (invoice: Invoice) => {
    navigate(`/factures/edit/${invoice.id}`);
  };

  // Create new invoice
  const handleCreateInvoice = () => {
    navigate(`/factures/edit/new`);
  };

  // Delete invoice
  const handleDeleteInvoice = (invoice: Invoice) => {
    // In a real app, we would ask for confirmation
    if (confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoice.number} ?`)) {
      // Delete the invoice (to be implemented in lib/mock/invoices.ts)
      // Then reload invoices
      const updatedInvoices = invoices.filter(inv => inv.id !== invoice.id);
      setInvoices(updatedInvoices);
    }
  };

  // Validate and send invoice
  const handleSendInvoice = (invoice: Invoice) => {
    try {
      const updatedInvoice = validateInvoice(invoice.id);
      if (updatedInvoice) {
        // Update invoice list
        const updatedInvoices = invoices.map(inv => 
          inv.id === updatedInvoice.id ? updatedInvoice : inv
        );
        setInvoices(updatedInvoices);
        
        // Update stats
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

  // Record payment
  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  // Submit payment
  const handleSubmitPayment = (invoiceId: string, payment: Omit<Payment, "id">) => {
    try {
      const updatedInvoice = recordPayment(invoiceId, payment);
      if (updatedInvoice) {
        // Update invoice list
        const updatedInvoices = invoices.map(inv => 
          inv.id === updatedInvoice.id ? updatedInvoice : inv
        );
        setInvoices(updatedInvoices);
        
        // Update stats
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

  // Create credit note
  const handleCreateCreditNote = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setCreditNoteModalOpen(true);
  };

  // Submit credit note
  const handleSubmitCreditNote = (invoiceId: string, isFullCreditNote: boolean, selectedItems?: string[]) => {
    try {
      const creditNote = createCreditNote(invoiceId, isFullCreditNote, selectedItems);
      if (creditNote) {
        // Update invoice list
        const updatedInvoices = getInvoices({
          status: activeTab !== "all" ? activeTab as InvoiceStatus : undefined,
          search: searchQuery,
        });
        setInvoices(updatedInvoices);
        
        // Update stats
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

  // Download invoice (placeholder)
  const handleDownloadInvoice = (invoice: Invoice) => {
    alert(`Téléchargement de la facture ${invoice.number} à implémenter`);
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
            onClick={handleCreateInvoice}
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