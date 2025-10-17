import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Receipt,
  Calendar,
  Wrench,
  Package,
  Building2,
  Hammer,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const mainNavItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Agenda",
    href: "/agenda",
    icon: Calendar,
    badge: "5",
  },
  {
    name: "Opportunités",
    href: "/opportunities",
    icon: BarChart3,
    badge: "6",
  },
  {
    name: "Chantiers",
    href: "/chantiers",
    icon: Building,
    badge: "8",
  },
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
    badge: "7",
  },
  {
    name: "Interventions",
    href: "/interventions",
    icon: Wrench,
    badge: "3",
  },
  {
    name: "Stock",
    href: "/stock",
    icon: Package,
  },
  {
    name: "Bibliothèque d'ouvrages",
    href: "/bibliotheque-ouvrages",
    icon: Hammer,
  },
  {
    name: "Tiers",
    href: "/tiers",
    icon: Building2,
  },
  {
    name: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
];

export function SimpleSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (href: string) => location.pathname === href;

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div
      className={cn(
        "relative h-full transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <nav className="h-full benaya-glass border-r border-benaya-300/20 dark:border-teal-700/30">
        {/* Header */}
        <div
          className={cn(
            "flex items-center border-b border-benaya-300/20 dark:border-teal-700/30 p-4 bg-gradient-to-r from-benaya-50/30 to-transparent dark:from-teal-900/20",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-benaya-400/30 shadow-yellow">
                <img
                  src="/WhatsApp Image 2025-09-16 à 12.41.17_7f6cdf01.jpg"
                  alt="Benaya Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-teal-900 to-benaya-600 dark:from-benaya-400 dark:to-white bg-clip-text text-transparent">
                  {user?.company || "Benaya"}
                </h1>
                <p className="text-xs text-teal-700 dark:text-benaya-400 font-medium">
                  {user ? `${user.first_name} ${user.last_name}` : "Construction"}
                </p>
              </div>
            </div>
          )}

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-teal-700 dark:text-benaya-400 hover:text-benaya-500 dark:hover:text-benaya-300 hover:bg-benaya-100 dark:hover:bg-teal-800/50"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-1 flex-1 overflow-y-auto benaya-scrollbar">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "nav-item group",
                  active ? "nav-item-active" : "nav-item-inactive",
                  isCollapsed && "justify-center px-2",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-lg transition-all duration-200",
                    active
                      ? "bg-teal-900/20 text-teal-900 dark:text-benaya-300"
                      : "text-teal-700 dark:text-neutral-400 group-hover:text-teal-900 dark:group-hover:text-benaya-400",
                    isCollapsed ? "w-8 h-8" : "w-6 h-6",
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full",
                          active
                            ? "bg-teal-900/30 text-teal-900 dark:text-benaya-300"
                            : "bg-benaya-200 dark:bg-benaya-400/20 text-teal-900 dark:text-benaya-300",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {!isCollapsed && (
          <div className="p-4 border-t border-benaya-300/20 dark:border-teal-700/30">
            <Button className="w-full benaya-button-primary gap-2">
              <Plus className="w-4 h-4" />
              Nouveau devis
            </Button>
          </div>
        )}

        {/* User Section */}
        <div
          className={cn(
            "p-4 border-t border-benaya-300/20 dark:border-teal-700/30",
            "bg-gradient-to-r from-benaya-50/50 to-transparent dark:from-teal-900/20 dark:to-transparent",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 mb-3",
              isCollapsed && "justify-center",
            )}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-benaya-400/30">
              <img src="/WhatsApp Image 2025-09-16 à 12.41.17_7f6cdf01.jpg" alt="Benaya logo" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-bold bg-gradient-to-r from-teal-900 to-benaya-600 dark:from-benaya-400 dark:to-white bg-clip-text text-transparent">
                  Benaya
                </p>
                <p className="text-xs text-teal-700 dark:text-benaya-400 font-medium">
                  v1.0.0
                </p>
              </div>
            )}
          </div>

          {/* Déconnexion */}
          {!isCollapsed && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
}