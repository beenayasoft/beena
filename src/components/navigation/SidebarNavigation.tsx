import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  Building,
  FileText,
  Receipt,
  Users,
  BookOpen,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarSection } from "./SidebarSection";
import { SidebarItem } from "./SidebarItem";

interface SidebarNavigationProps {
  isCollapsed: boolean;
}

const mainNavigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    badge: null,
  },
  {
    name: "Agenda",
    href: "/agenda",
    icon: Calendar,
    badge: "3",
  },
  {
    name: "Chantiers",
    href: "/chantiers",
    icon: Building,
    badge: null,
  },
];

const salesNavigation = [
  {
    name: "Devis",
    href: "/devis",
    icon: FileText,
    badge: "12",
  },
  {
    name: "Factures",
    href: "/factures",
    icon: Receipt,
    badge: null,
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
    badge: null,
  },
  {
    name: "Bibliothèque",
    href: "/bibliotheque",
    icon: BookOpen,
    badge: null,
  },
];

const purchaseNavigation = [
  {
    name: "Bons de commande",
    href: "/bons-commande",
    icon: ShoppingCart,
    badge: "5",
  },
  {
    name: "Factures d'achats",
    href: "/factures-achats",
    icon: Receipt,
    badge: null,
  },
  {
    name: "Fournisseurs",
    href: "/fournisseurs",
    icon: Users,
    badge: null,
  },
];

const accountingNavigation = [
  {
    name: "Transactions",
    href: "/transactions",
    icon: CreditCard,
    badge: null,
  },
];

export function SidebarNavigation({ isCollapsed }: SidebarNavigationProps) {
  const location = useLocation();

  return (
    <div className="space-y-6">
      {/* Main Navigation */}
      <div className="space-y-1 px-3">
        {mainNavigation.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isActive={location.pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      {/* Sales Section */}
      <SidebarSection
        title="Ventes"
        isCollapsed={isCollapsed}
        items={salesNavigation}
        currentPath={location.pathname}
      />

      {/* Purchase Section */}
      <SidebarSection
        title="Achats"
        isCollapsed={isCollapsed}
        items={purchaseNavigation}
        currentPath={location.pathname}
      />

      {/* Accounting Section */}
      <SidebarSection
        title="Comptabilité"
        isCollapsed={isCollapsed}
        items={accountingNavigation}
        currentPath={location.pathname}
      />
    </div>
  );
}
