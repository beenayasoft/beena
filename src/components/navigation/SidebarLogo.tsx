import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  isCollapsed: boolean;
}

export function SidebarLogo({ isCollapsed }: SidebarLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center border-b border-benaya-400/20 dark:border-teal-700/50",
        "bg-gradient-to-r from-benaya-400/10 to-teal-900/10 dark:from-benaya-400/5 dark:to-teal-900/20",
        isCollapsed ? "px-2 py-4" : "px-6 py-4",
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "relative flex items-center justify-center rounded-2xl overflow-hidden",
            "bg-white dark:bg-teal-800/50",
            "shadow-yellow dark:shadow-yellow-lg",
            "ring-2 ring-benaya-400/30 dark:ring-benaya-400/20",
            isCollapsed ? "w-10 h-10" : "w-12 h-12",
          )}
        >
          <img
            src="/WhatsApp Image 2025-09-16 à 12.41.17_7f6cdf01.jpg"
            alt="Benaya Logo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-benaya-400/10 to-teal-900/10"></div>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-benaya-400/20 blur-lg -z-10 animate-pulse-glow"></div>
      </div>

      {!isCollapsed && (
        <div className="ml-4 flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-teal-900 via-teal-700 to-benaya-600 dark:from-benaya-400 dark:via-benaya-300 dark:to-white bg-clip-text text-transparent">
            benaya
          </span>
          <span className="text-xs text-teal-700 dark:text-benaya-400 font-semibold tracking-wider uppercase">
            ERP CONSTRUCTION
          </span>
        </div>
      )}
    </div>
  );
}
