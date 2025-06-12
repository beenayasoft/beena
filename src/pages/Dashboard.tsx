import { useState } from "react";
import {
  Calendar,
  TrendingUp,
  Plus,
  BarChart3,
  DollarSign,
  Users,
  Building,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950/50 dark:via-blue-950/30 dark:to-indigo-950/50">
      <div className="relative p-6 space-y-8">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-red-500/10 rounded-full filter blur-3xl"></div>
        </div>

        {/* Welcome Header */}
        <div className="relative z-10">
          <WelcomeHeader />
        </div>

        {/* Metrics Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Chiffre d'affaires"
            value="0,00"
            currency="MAD"
            change="+0% ce mois"
            changeType="neutral"
            icon={DollarSign}
            trend="stable"
          />
          <MetricCard
            title="Projets actifs"
            value="0"
            change="Aucun projet"
            changeType="neutral"
            icon={Building}
            trend="stable"
          />
          <MetricCard
            title="Clients"
            value="0"
            change="Aucun client"
            changeType="neutral"
            icon={Users}
            trend="stable"
          />
          <MetricCard
            title="Devis en attente"
            value="12"
            change="+3 cette semaine"
            changeType="positive"
            icon={BarChart3}
            trend="up"
          />
        </div>

        {/* Charts and Analytics */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Évolution du chiffre d'affaires"
              period={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          {/* Tasks */}
          <div>
            <TasksWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
