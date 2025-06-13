import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { MainLayout } from "@/layouts/MainLayout";
import Auth from "@/pages/Auth";
import Index from "@/pages/Dashboard";
import Agenda from "@/pages/Agenda";
import Chantiers from "@/pages/Chantiers";
import Devis from "@/pages/Devis";
import Factures from "@/pages/Factures";
import InvoiceDetail from "@/pages/InvoiceDetail";
import InvoiceEditor from "@/pages/InvoiceEditor";
import InvoicePreview from "@/pages/InvoicePreview";
import Interventions from "@/pages/Interventions";
import Stock from "@/pages/Stock";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Tiers from "@/pages/Tiers";
import TierDetail from "@/pages/TierDetail";
import WorkLibrary from "@/pages/WorkLibrary";
import { Users } from "lucide-react";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth" element={<Auth />} />

          {/* Main app routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="chantiers" element={<Chantiers />} />
            <Route path="devis" element={<Devis />} />
            <Route path="factures" element={<Factures />} />
            <Route path="factures/:id" element={<InvoiceDetail />} />
            <Route path="factures/edit/:id" element={<InvoiceEditor />} />
            <Route path="factures/preview/:id" element={<InvoicePreview />} />
            <Route path="interventions" element={<Interventions />} />
            <Route path="stock" element={<Stock />} />
            <Route path="settings" element={<Settings />} />
            <Route path="tiers" element={<Tiers />} />
            <Route path="tiers/:id" element={<TierDetail />} />
            <Route path="bibliotheque-ouvrages" element={<WorkLibrary />} />

            {/* Placeholder pages */}
            
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}