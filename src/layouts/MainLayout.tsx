import { Outlet } from "react-router-dom";
import { SimpleSidebar } from "@/components/navigation/SimpleSidebar";
import { SimpleHeader } from "@/components/navigation/SimpleHeader";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  className?: string;
}

export function MainLayout({ className }: MainLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-benaya-50 via-white to-teal-50 dark:from-teal-950 dark:via-neutral-950 dark:to-teal-900", className)}>
      <div className="flex h-screen">
        <SimpleSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <SimpleHeader />

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-benaya-50/50 via-neutral-50 to-teal-50/50 dark:from-teal-900/30 dark:via-neutral-900 dark:to-teal-950/30">
            <div className="h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
