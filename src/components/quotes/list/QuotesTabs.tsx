import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { QuoteStatus } from "@/lib/types/quote";

interface QuotesTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    all: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    expired: number;
    cancelled: number;
  };
}

export function QuotesTabs({ activeTab, onTabChange, counts }: QuotesTabsProps) {
  const tabs = [
    { id: "all", label: "Tous", count: counts.all },
    { id: "draft", label: "Brouillons", count: counts.draft },
    { id: "sent", label: "Envoyés", count: counts.sent },
    { id: "accepted", label: "Acceptés", count: counts.accepted },
    { id: "rejected", label: "Refusés", count: counts.rejected },
    { id: "expired", label: "Expirés", count: counts.expired },
    { id: "cancelled", label: "Annulés", count: counts.cancelled },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
      <TabsList className="grid grid-cols-7 w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
            {tab.label}
            {tab.count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {tab.count}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
} 