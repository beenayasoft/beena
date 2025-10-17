import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarNavigation } from "./SidebarNavigation";
import { SidebarFooter } from "./SidebarFooter";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={cn(
        "relative transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72",
      )}
    >
      <nav
        className={cn(
          "h-full backdrop-blur-xl bg-white/80 dark:bg-teal-950/80",
          "border-r border-benaya-400/20 dark:border-teal-700/30",
          "shadow-2xl shadow-benaya/10 dark:shadow-benaya/5",
          "relative z-10",
        )}
      >
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-8 z-20 h-6 w-6 rounded-full",
            "bg-benaya-400 hover:bg-benaya-500 dark:bg-teal-800/90 dark:hover:bg-teal-700",
            "border border-benaya-500/30 dark:border-teal-600/50",
            "shadow-yellow hover:shadow-yellow-lg transition-all duration-200",
            "backdrop-blur-sm text-teal-900 dark:text-benaya-300",
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <SidebarLogo isCollapsed={isCollapsed} />

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNavigation isCollapsed={isCollapsed} />
          </div>

          {/* Footer */}
          <SidebarFooter isCollapsed={isCollapsed} />
        </div>
      </nav>
    </div>
  );
}
