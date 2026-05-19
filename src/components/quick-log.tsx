"use client";

import { useState, useTransition } from "react";
import { Plus, Minus, Check } from "lucide-react";
import { logRecurring } from "@/lib/actions";
import { cn } from "@/lib/utils";

export default function QuickLog({
  id,
  title,
  category,
  target,
  unit,
  actual,
  benchmark,
}: {
  id: number;
  title: string;
  category: string;
  target: number;
  unit: string;
  actual: number;
  benchmark?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(actual);
  const pct = Math.min(100, (optimistic / target) * 100);
  const status: "pass" | "warn" | "fail" =
    pct >= 100 ? "pass" : pct >= 50 ? "warn" : "fail";

  const tone =
    status === "pass" ? "bg-success" : status === "warn" ? "bg-warn" : "bg-danger";

  const quickButtons = pickQuickButtons(target, unit);

  const log = (delta: number) => {
    setOptimistic((o) => Math.max(0, o + delta));
    startTransition(() => {
      logRecurring(id, delta);
    });
  };

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-fg-muted uppercase tracking-wider mb-0.5">{category}</div>
          <div className="text-sm font-semibold leading-tight">{title}</div>
        </div>
        <span className={cn(
          "pill",
          status === "pass" && "pill-success",
          status === "warn" && "pill-warn",
          status === "fail" && "pill-danger"
        )}>
          {optimistic}/{target} {unit}
        </span>
      </div>

      <div className="h-2 rounded-full bg-bg-sub overflow-hidden">
        <div className={cn("h-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {quickButtons.map((n) => (
          <button
            key={n}
            disabled={pending}
            onClick={() => log(n)}
            className="btn text-xs px-2 py-1"
          >
            <Plus className="w-3 h-3" /> {n}
          </button>
        ))}
        <button
          disabled={pending || optimistic === 0}
          onClick={() => log(-1)}
          className="btn-ghost text-xs px-2 py-1"
        >
          <Minus className="w-3 h-3" />
        </button>
        {pct >= 100 && <span className="ml-auto pill-success"><Check className="w-3 h-3" /> Target hit</span>}
      </div>

      {benchmark && (
        <div className="text-[11px] text-fg-subtle leading-snug border-t border-border pt-2">{benchmark}</div>
      )}
    </div>
  );
}

function pickQuickButtons(target: number, unit: string): number[] {
  if (target >= 100) return [10, 50, 100];
  if (target >= 50) return [5, 10, 25];
  if (target >= 20) return [1, 5, 10];
  if (target >= 5) return [1, 2, 5];
  return [1];
}
