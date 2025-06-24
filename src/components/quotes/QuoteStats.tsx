import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Send,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";

interface QuoteStatsProps {
  stats: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    expired: number;
    cancelled: number;
    total_amount: number;
    acceptance_rate: number;
  };
}

export function QuoteStats({ stats }: QuoteStatsProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total devis"
        value={stats.total.toString()}
        change={`${stats.draft} brouillons`}
        changeType="neutral"
        icon={FileText}
        trend="stable"
      />
      <MetricCard
        title="Envoyés"
        value={stats.sent.toString()}
        change={`${Number(stats.acceptance_rate || 0).toFixed(1)}% acceptés`}
        changeType="neutral"
        icon={Send}
        trend="stable"
      />
      <MetricCard
        title="Acceptés"
        value={stats.accepted.toString()}
        change={`${stats.rejected} refusés`}
        changeType="positive"
        icon={CheckCircle}
        trend="up"
      />
      <MetricCard
        title="Montant total"
        value={formatAmount(stats.total_amount)}
        currency="MAD"
        change={`${stats.expired} expirés`}
        changeType="neutral"
        icon={DollarSign}
        trend="stable"
      />
    </div>
  );
} 