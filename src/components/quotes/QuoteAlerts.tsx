import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface QuoteAlertsProps {
  stats: {
    expired: number;
    sent: number;
    accepted: number;
    rejected: number;
  };
}

export function QuoteAlerts({ stats }: QuoteAlertsProps) {
  const hasAlerts = stats.expired > 0 || stats.sent > 0;

  if (!hasAlerts) return null;

  return (
    <div className="space-y-3">
      {stats.expired > 0 && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800 dark:text-orange-200">
              Devis expirés
            </h3>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
            {stats.expired} devis ont expiré et nécessitent une action.
          </p>
        </div>
      )}
      
      {stats.sent > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">
              Devis en attente
            </h3>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            {stats.sent} devis sont en attente de réponse client.
          </p>
        </div>
      )}
    </div>
  );
} 