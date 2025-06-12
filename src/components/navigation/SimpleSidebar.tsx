import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mainNavItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Devis",
    href: "/devis",
    icon: FileText,
    badge: "12",
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Chantiers",
    href: "/chantiers",
    icon: Building,
    badge: "3",
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

  const isActive = (href: string) => location.pathname === href;

  return (
    <div
      className={cn(
        "relative h-full transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Sidebar Container */}
      <nav className="h-full benaya-glass border-r border-neutral-200 dark:border-neutral-700">
        {/* Header */}
        <div
          className={cn(
            "flex items-center border-b border-neutral-200 dark:border-neutral-700 p-4",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-8 h-8 rounded-lg bg-benaya-900 flex items-center justify-center">
                <div className="w-6 h-6 text-white">
                  <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    className="w-full h-full"
                  >
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
                <h1 className="text-lg font-bold text-benaya-900 dark:text-white">
                  benaya
                </h1>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  ERP Construction
                </p>
              </div>
            </div>
          )}

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-neutral-600 dark:text-neutral-400 hover:text-benaya-900 dark:hover:text-white"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-2">
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
                      ? "bg-white/20 text-white"
                      : "text-neutral-600 dark:text-neutral-400 group-hover:text-benaya-900 dark:group-hover:text-white",
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
                            ? "bg-white/20 text-white"
                            : "bg-benaya-100 dark:bg-benaya-900/30 text-benaya-800 dark:text-benaya-200",
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

        {/* Quick Action */}
        {!isCollapsed && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button className="w-full benaya-button-primary gap-2">
              <Plus className="w-4 h-4" />
              Nouveau devis
            </Button>
          </div>
        )}

        {/* User Section */}
        <div
          className={cn(
            "p-4 border-t border-neutral-200 dark:border-neutral-700 mt-auto",
            "bg-neutral-50 dark:bg-neutral-800/50",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 mb-3",
              isCollapsed && "justify-center",
            )}
          >
            <div className="w-8 h-8 rounded-full bg-benaya-900 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">J</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Jean
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Admin
                </p>
              </div>
            )}
          </div>

          {/* Auth Link */}
          {!isCollapsed && (
            <Link to="/auth">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
              >
                <LogOut className="w-4 h-4" />
                Voir page de connexion
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
