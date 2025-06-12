import { LucideIcon, Construction, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export default function PlaceholderPage({
  title,
  description,
  icon: Icon = Construction,
}: PlaceholderPageProps) {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950/50 dark:via-blue-950/30 dark:to-indigo-950/50">
      <div className="relative flex flex-col items-center justify-center min-h-[600px] p-6">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        {/* Content Card */}
        <div
          className={cn(
            "relative z-10 max-w-md w-full text-center space-y-8 p-8 rounded-3xl",
            "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl",
            "border border-white/20 dark:border-slate-700/50",
            "shadow-2xl shadow-slate-500/10 dark:shadow-slate-900/30",
          )}
        >
          {/* Icon */}
          <div className="relative mx-auto">
            <div
              className={cn(
                "flex items-center justify-center w-24 h-24 rounded-3xl",
                "bg-gradient-to-br from-blue-500 to-purple-600",
                "shadow-2xl shadow-blue-500/25 dark:shadow-blue-500/40",
                "animate-float",
              )}
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 rounded-3xl bg-white/20 backdrop-blur-sm"></div>

              <Icon className="relative z-10 w-12 h-12 text-white" />

              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400 to-purple-500 opacity-75 blur-md -z-10"></div>
            </div>

            {/* Floating particles */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-60 animate-ping"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-60 animate-ping animation-delay-2000"></div>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full",
              "bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50",
              "border border-orange-200 dark:border-orange-700/50",
              "text-orange-700 dark:text-orange-300",
            )}
          >
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">En développement</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 gap-2 bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50"
            >
              Être notifié
            </Button>
            <Button className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Retour au dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Progression</span>
              <span>25%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: "25%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="relative z-10 text-sm text-slate-500 dark:text-slate-400 mt-8 max-w-md text-center">
          Cette fonctionnalité sera bientôt disponible. En attendant, vous
          pouvez explorer les autres sections de l'application.
        </p>
      </div>
    </div>
  );
}
