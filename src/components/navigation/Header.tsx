import {
  Search,
  Bell,
  Globe,
  HelpCircle,
  Gift,
  Settings,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { HeaderBreadcrumb } from "./HeaderBreadcrumb";
import { HeaderActions } from "./HeaderActions";

export function Header() {
  return (
    <header
      className={cn(
        "relative z-10 h-16 flex items-center justify-between px-6",
        "backdrop-blur-xl bg-white/70 dark:bg-teal-950/70",
        "border-b border-benaya-400/20 dark:border-teal-700/30",
        "shadow-lg shadow-benaya/5 dark:shadow-benaya/10",
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-benaya-400/5 via-transparent to-teal-900/5 dark:from-benaya-400/10 dark:to-teal-900/10"></div>

      {/* Left Section - Breadcrumb */}
      <div className="relative z-10 flex-1">
        <HeaderBreadcrumb />
      </div>

      {/* Center Section - Search */}
      <div className="relative z-10 flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-600 dark:text-benaya-400" />
          <Input
            placeholder="Rechercher partout..."
            className={cn(
              "pl-10 pr-4 py-2 w-full",
              "bg-white/70 dark:bg-teal-900/50 backdrop-blur-sm",
              "border-benaya-300/30 dark:border-teal-700/50",
              "focus:ring-2 focus:ring-benaya-400/30 focus:border-benaya-400/50",
              "placeholder:text-teal-600/60 dark:placeholder:text-benaya-400/60",
            )}
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="relative z-10 flex-1 flex items-center justify-end">
        <HeaderActions />
      </div>
    </header>
  );
}
