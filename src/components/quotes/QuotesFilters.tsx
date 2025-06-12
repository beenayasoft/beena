import { Search, Calendar, Filter, Download, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface QuotesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function QuotesFilters({
  searchQuery,
  onSearchChange,
}: QuotesFiltersProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-4 rounded-2xl",
        "bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl",
        "border border-white/20 dark:border-slate-700/50",
      )}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Rechercher un devis par numéro, client, chantier..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "pl-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm",
              "border-white/20 dark:border-slate-700/50",
              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50",
            )}
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2">
        {/* Date Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50"
            >
              <Calendar className="w-4 h-4" />
              Date d'émission
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Période</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Aujourd'hui</DropdownMenuItem>
            <DropdownMenuItem>Cette semaine</DropdownMenuItem>
            <DropdownMenuItem>Ce mois</DropdownMenuItem>
            <DropdownMenuItem>Ce trimestre</DropdownMenuItem>
            <DropdownMenuItem>Cette année</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Période personnalisée</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50"
            >
              <Filter className="w-4 h-4" />
              Statut
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="w-2 h-2 bg-slate-400 rounded-full mr-2"></div>
              Brouillon
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Envoyé
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Accepté
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Refusé
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50"
            >
              <SortAsc className="w-4 h-4" />
              Trier
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Trier par</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Date de création</DropdownMenuItem>
            <DropdownMenuItem>Date d'émission</DropdownMenuItem>
            <DropdownMenuItem>Date d'expiration</DropdownMenuItem>
            <DropdownMenuItem>Montant</DropdownMenuItem>
            <DropdownMenuItem>Client</DropdownMenuItem>
            <DropdownMenuItem>Statut</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50"
        >
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>
    </div>
  );
}
