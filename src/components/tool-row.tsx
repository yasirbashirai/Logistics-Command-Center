"use client";

import { useState, useTransition } from "react";
import { toggleToolStatus } from "@/lib/actions";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";
import type { Tool } from "@prisma/client";

const STATUSES = [
  { key: "active", label: "Active", tone: "pill-success" },
  { key: "holding", label: "Holding", tone: "pill-info" },
  { key: "cancelled", label: "Cancelled", tone: "pill-danger" },
];

export default function ToolRow({ tool }: { tool: Tool }) {
  const [status, setStatus] = useState(tool.status);
  const [, startTransition] = useTransition();
  const onChange = (s: string) => {
    setStatus(s);
    startTransition(() => toggleToolStatus(tool.id, s));
  };

  return (
    <div className={cn(
      "card p-3 flex items-center gap-3",
      status === "cancelled" && "opacity-50",
      status === "holding" && "opacity-80"
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{tool.name}</span>
          <span className="pill text-[10px]">{tool.category}</span>
          {tool.plan && <span className="pill text-[10px]">{tool.plan}</span>}
          {tool.warning && (
            <span className="pill-warn text-[10px]" title={tool.warning}>
              <AlertTriangle className="w-2.5 h-2.5" /> warning
            </span>
          )}
        </div>
        <div className="text-[11px] text-fg-muted mt-1 leading-snug">{tool.role}</div>
        {tool.warning && (
          <div className="text-[11px] text-warn mt-1 italic leading-snug">⚠ {tool.warning}</div>
        )}
        {tool.alternativesRuledOut && (
          <div className="text-[10px] text-fg-subtle mt-1 leading-snug">Ruled out: {tool.alternativesRuledOut}</div>
        )}
      </div>
      <div className="text-right">
        <div className="text-base font-semibold">${tool.costPerMonth}</div>
        <div className="text-[10px] text-fg-subtle">/ month</div>
      </div>
      <div className="flex flex-col gap-1">
        <select
          className="input text-xs py-1 px-2"
          value={status}
          onChange={(e) => onChange(e.target.value)}
        >
          {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        {tool.loginUrl && (
          <a href={tool.loginUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost text-[10px] py-1 px-2 justify-center">
            <ExternalLink className="w-3 h-3" /> Login
          </a>
        )}
      </div>
    </div>
  );
}
