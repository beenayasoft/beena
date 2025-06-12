import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { MainLayout } from "@/layouts/MainLayout";
import Auth from "@/pages/Auth";
import Index from "@/pages/Dashboard";
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
        <Routes>
          {/* Auth routes */}
          <Route path="/auth" element={<Auth />} />

          {/* Main app routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="devis" element={<Devis />} />

            {/* Placeholder pages */}
            <Route
              path="agenda"
              element={
                <PlaceholderPage
                  title="Agenda"
                  description="Planifiez et gérez vos rendez-vous et interventions"
                  icon={Calendar}
                />
              }
            />
            <Route
              path="chantiers"
              element={
                <PlaceholderPage
                  title="Chantiers"
                  description="Suivez l'avancement de vos projets de construction"
                  icon={Building}
                />
              }
            />
            <Route
              path="clients"
              element={
                <PlaceholderPage
                  title="Clients"
                  description="Gérez votre portefeuille clients"
                  icon={Users}
                />
              }
            />
            <Route
              path="settings"
              element={
                <PlaceholderPage
                  title="Paramètres"
                  description="Configurez votre application"
                  icon={Settings}
                />
              }
            />
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
