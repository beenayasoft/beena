import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";

const stats = [
  {
    title: "Total devis",
    value: "5",
    change: "+2 ce mois",
    changeType: "positive" as const,
    icon: FileText,
    trend: "up" as const,
  },
  {
    title: "En attente",
    value: "1",
    change: "1 devis envoyé",
    changeType: "neutral" as const,
    icon: Clock,
    trend: "stable" as const,
  },
  {
    title: "Acceptés",
    value: "1",
    change: "Taux: 20%",
    changeType: "positive" as const,
    icon: CheckCircle,
    trend: "up" as const,
  },
  {
    title: "Montant total",
    value: "59,550",
    currency: "MAD",
    change: "+15,500 MAD",
    changeType: "positive" as const,
    icon: DollarSign,
    trend: "up" as const,
  },
];

export function QuotesStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <MetricCard
          key={index}
          title={stat.title}
          value={stat.value}
          currency={stat.currency}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}
