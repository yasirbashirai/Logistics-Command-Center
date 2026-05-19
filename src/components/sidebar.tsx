"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Target,
  Kanban,
  FileText,
  Users,
  Radio,
  Wrench,
  Sparkles,
  ShieldAlert,
  TruckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/today", label: "Today", icon: LayoutDashboard, hint: "Daily command center" },
  { href: "/plan", label: "30-Day Plan", icon: CalendarDays, hint: "W1–W4 calendar" },
  { href: "/kpis", label: "KPIs", icon: Target, hint: "Scorecards + health checks" },
  { href: "/pipeline", label: "Pipeline", icon: Kanban, hint: "8-stage kanban" },
  { href: "/scripts", label: "Scripts", icon: FileText, hint: "Paste-ready library" },
  { href: "/past-clients", label: "Past Clients", icon: Users, hint: "Re-engagement (#1 ROI)" },
  { href: "/channels", label: "Channels", icon: Radio, hint: "15 outreach channels" },
  { href: "/tools", label: "Tools", icon: Wrench, hint: "$264/mo stack" },
  { href: "/content", label: "Content", icon: Sparkles, hint: "Posts + Looms + ads" },
  { href: "/brain", label: "Compliance & Brain", icon: ShieldAlert, hint: "Rules + personas + warnings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-bg-sub h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand text-brand-fg flex items-center justify-center">
            <TruckIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">Logistics</span>
            <span className="text-xs text-fg-muted -mt-0.5">Command Center</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-0.5">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-brand/10 text-brand font-medium"
                  : "text-fg-muted hover:bg-bg-card hover:text-fg"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active && "text-brand")} />
              <div className="flex flex-col leading-tight overflow-hidden">
                <span className="truncate">{item.label}</span>
                <span className="text-[10px] text-fg-subtle truncate -mt-0.5">{item.hint}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-border text-[11px] text-fg-subtle">
        <div className="font-medium text-fg-muted">Yasir Bashir</div>
        <div>$10K MRR / 6mo target</div>
      </div>
    </aside>
  );
}
