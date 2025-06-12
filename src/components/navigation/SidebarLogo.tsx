import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  isCollapsed: boolean;
}

export function SidebarLogo({ isCollapsed }: SidebarLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center border-b border-white/10 dark:border-slate-700/50",
        "bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10",
        isCollapsed ? "px-2 py-4" : "px-6 py-4",
      )}
    >
      {/* Logo Icon with Advanced Design */}
      <div className="relative">
        <div
          className={cn(
            "relative flex items-center justify-center rounded-2xl",
            "bg-gradient-to-br from-blue-500 to-purple-600",
            "shadow-lg shadow-blue-500/25 dark:shadow-blue-500/40",
            isCollapsed ? "w-10 h-10" : "w-12 h-12",
          )}
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 rounded-2xl bg-white/20 backdrop-blur-sm"></div>

          {/* Logo SVG */}
          <div
            className={cn(
              "relative z-10 text-white",
              isCollapsed ? "w-6 h-6" : "w-8 h-8",
            )}
          >
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              <g fill="currentColor" opacity="0.9">
                <path d="M20 2L27.32 6.5V15.5L20 20L12.68 15.5V6.5L20 2Z" />
                <path d="M8.66 9L16 4.5V13.5L8.66 18L1.34 13.5V4.5L8.66 9Z" />
                <path d="M31.34 9L38.66 4.5V13.5L31.34 18L24 13.5V4.5L31.34 9Z" />
                <path d="M8.66 31L16 26.5V35.5L8.66 40L1.34 35.5V26.5L8.66 31Z" />
                <path d="M31.34 31L38.66 26.5V35.5L31.34 40L24 35.5V26.5L31.34 31Z" />
                <path d="M20 38L27.32 33.5V24.5L20 20L12.68 24.5V33.5L20 38Z" />
              </g>
              <path
                d="M15 20L18.5 23.5L25 17"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="17" y1="29" x2="23" y2="29" />
                <line x1="16" y1="31" x2="24" y2="31" />
                <line x1="15" y1="33" x2="25" y2="33" />
                <line x1="16" y1="35" x2="24" y2="35" />
                <line x1="18" y1="37" x2="22" y2="37" />
              </g>
            </svg>
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 opacity-75 blur-md -z-10"></div>
        </div>
      </div>

      {/* Brand Name */}
      {!isCollapsed && (
        <div className="ml-4 flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            benaya
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wider">
            ERP CONSTRUCTION
          </span>
        </div>
      )}
    </div>
  );
}
