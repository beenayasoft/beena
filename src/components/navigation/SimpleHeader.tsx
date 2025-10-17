import { Search, Bell, Moon, Sun, Monitor, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function SimpleHeader() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="h-16 benaya-glass border-b border-benaya-300/20 dark:border-teal-700/30 px-6 flex items-center justify-between bg-gradient-to-r from-benaya-50/30 via-transparent to-teal-50/30 dark:from-teal-900/20 dark:to-transparent">
      <div>
        <h2 className="text-lg font-bold bg-gradient-to-r from-teal-900 to-benaya-600 dark:from-benaya-400 dark:to-white bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-sm text-teal-700 dark:text-benaya-400">
          Bienvenue dans votre espace de travail
        </p>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-600 dark:text-benaya-400" />
          <Input
            placeholder="Rechercher..."
            className="pl-10 benaya-input focus:ring-2 focus:ring-benaya-400 focus:border-benaya-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-teal-700 dark:text-benaya-400 hover:text-benaya-500 dark:hover:text-benaya-300 hover:bg-benaya-100 dark:hover:bg-teal-800/50"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-teal-700 dark:text-benaya-400 hover:text-benaya-500 dark:hover:text-benaya-300 hover:bg-benaya-100 dark:hover:bg-teal-800/50"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="benaya-glass">
            <DropdownMenuLabel>Thème</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Clair</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Sombre</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              <span>Système</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-teal-700 dark:text-benaya-400 hover:text-benaya-500 dark:hover:text-benaya-300 hover:bg-benaya-100 dark:hover:bg-teal-800/50"
            >
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 benaya-glass">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold bg-gradient-to-r from-teal-900 to-benaya-600 dark:from-benaya-400 dark:to-white bg-clip-text text-transparent">
                  {user ? `${user.first_name} ${user.last_name}` : "Utilisateur"}
                </p>
                <p className="text-xs text-teal-700 dark:text-benaya-400">
                  {user?.email || "utilisateur@benaya.fr"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>Mon profil</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>Paramètres</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Se déconnecter</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
