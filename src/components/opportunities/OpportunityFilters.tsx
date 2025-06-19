import { Search, Calendar, Filter, SortAsc } from "lucide-react";
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

interface OpportunityFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDateRangeChange?: (from: string, to: string) => void;
  onStageFilterChange?: (stages: string[]) => void;
  onSortChange?: (field: string, order: 'asc' | 'desc') => void;
}

export function OpportunityFilters({
  searchQuery,
  onSearchChange,
  onDateRangeChange,
  onStageFilterChange,
  onSortChange,
}: OpportunityFiltersProps) {
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
            placeholder="Rechercher une opportunité par nom, client..."
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
              Période
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Période</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDateRangeChange && onDateRangeChange(
              new Date().toISOString().split('T')[0],
              new Date().toISOString().split('T')[0]
            )}>
              Aujourd'hui
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const today = new Date();
              const weekStart = new Date(today);
              weekStart.setDate(today.getDate() - today.getDay());
              onDateRangeChange && onDateRangeChange(
                weekStart.toISOString().split('T')[0],
                today.toISOString().split('T')[0]
              );
            }}>
              Cette semaine
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const today = new Date();
              const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
              onDateRangeChange && onDateRangeChange(
                monthStart.toISOString().split('T')[0],
                today.toISOString().split('T')[0]
              );
            }}>
              Ce mois
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const today = new Date();
              const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
              onDateRangeChange && onDateRangeChange(
                quarterStart.toISOString().split('T')[0],
                today.toISOString().split('T')[0]
              );
            }}>
              Ce trimestre
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const today = new Date();
              const yearStart = new Date(today.getFullYear(), 0, 1);
              onDateRangeChange && onDateRangeChange(
                yearStart.toISOString().split('T')[0],
                today.toISOString().split('T')[0]
              );
            }}>
              Cette année
            </DropdownMenuItem>
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
            <DropdownMenuItem onClick={() => onStageFilterChange && onStageFilterChange(['new', 'qualifying', 'needs_analysis'])}>
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Qualification
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStageFilterChange && onStageFilterChange(['proposal', 'negotiation'])}>
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
              Proposition
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStageFilterChange && onStageFilterChange(['won'])}>
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Gagnées
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStageFilterChange && onStageFilterChange(['lost', 'cancelled'])}>
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Perdues/Annulées
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
            <DropdownMenuItem onClick={() => onSortChange && onSortChange('name', 'asc')}>
              Nom
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange && onSortChange('estimatedAmount', 'desc')}>
              Montant (décroissant)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange && onSortChange('probability', 'desc')}>
              Probabilité (décroissant)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange && onSortChange('expectedCloseDate', 'asc')}>
              Date de clôture (croissant)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange && onSortChange('createdAt', 'desc')}>
              Date de création (récent)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}