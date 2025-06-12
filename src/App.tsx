import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import Index from "@/pages/Index";
import Devis from "@/pages/Devis";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";
import {
  Calendar,
  Building,
  Receipt,
  Users,
  BookOpen,
  ShoppingCart,
  CreditCard,
  Settings,
  Heart,
  HelpCircle,
} from "lucide-react";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <div className="flex h-screen bg-neo-gray-50 dark:bg-neo-gray-950">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/devis" element={<Devis />} />

                {/* Placeholder pages */}
                <Route
                  path="/agenda"
                  element={
                    <PlaceholderPage
                      title="Agenda"
                      description="Planifiez et gérez vos rendez-vous et interventions"
                      icon={Calendar}
                    />
                  }
                />
                <Route
                  path="/chantiers"
                  element={
                    <PlaceholderPage
                      title="Chantiers"
                      description="Suivez l'avancement de vos projets de construction"
                      icon={Building}
                    />
                  }
                />
                <Route
                  path="/factures"
                  element={
                    <PlaceholderPage
                      title="Factures"
                      description="Gérez vos factures clients et suivez les paiements"
                      icon={Receipt}
                    />
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <PlaceholderPage
                      title="Clients"
                      description="Gérez votre portefeuille clients"
                      icon={Users}
                    />
                  }
                />
                <Route
                  path="/bibliotheque"
                  element={
                    <PlaceholderPage
                      title="Bibliothèque"
                      description="Accédez à vos documents et modèles"
                      icon={BookOpen}
                    />
                  }
                />
                <Route
                  path="/bons-commande"
                  element={
                    <PlaceholderPage
                      title="Bons de commande"
                      description="Gérez vos commandes fournisseurs"
                      icon={ShoppingCart}
                    />
                  }
                />
                <Route
                  path="/factures-achats"
                  element={
                    <PlaceholderPage
                      title="Factures d'achats"
                      description="Suivez vos factures fournisseurs"
                      icon={Receipt}
                    />
                  }
                />
                <Route
                  path="/fournisseurs"
                  element={
                    <PlaceholderPage
                      title="Fournisseurs"
                      description="Gérez vos relations fournisseurs"
                      icon={Users}
                    />
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <PlaceholderPage
                      title="Transactions"
                      description="Suivez vos mouvements financiers"
                      icon={CreditCard}
                    />
                  }
                />
                <Route
                  path="/reglages"
                  element={
                    <PlaceholderPage
                      title="Réglages"
                      description="Configurez votre application"
                      icon={Settings}
                    />
                  }
                />
                <Route
                  path="/parrainage"
                  element={
                    <PlaceholderPage
                      title="Parrainage"
                      description="Parrainez vos contacts et gagnez des récompenses"
                      icon={Heart}
                    />
                  }
                />
                <Route
                  path="/aide"
                  element={
                    <PlaceholderPage
                      title="Besoin d'aide ?"
                      description="Trouvez des réponses à vos questions"
                      icon={HelpCircle}
                    />
                  }
                />

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
