"use client";

import { useState, useTransition } from "react";
import { updatePastClient } from "@/lib/actions";
import { cn } from "@/lib/utils";
import type { PastClient } from "@prisma/client";

const STATUSES = [
  { key: "not_contacted", label: "Not contacted", pill: "pill" },
  { key: "emailed", label: "Emailed", pill: "pill-info" },
  { key: "loom_sent", label: "Loom sent", pill: "pill-info" },
  { key: "replied", label: "Replied", pill: "pill-warn" },
  { key: "booked", label: "Booked", pill: "pill-success" },
  { key: "closed", label: "Closed", pill: "pill-success" },
  { key: "no_reply", label: "No reply", pill: "pill" },
];

export default function PastClientRow({ client }: { client: PastClient }) {
  const [status, setStatus] = useState(client.status);
  const [, startTransition] = useTransition();

  const onChange = (newStatus: string) => {
    setStatus(newStatus);
    startTransition(() => updatePastClient(client.id, newStatus));
  };

  const segColor =
    client.segment === "A" ? "pill-success" :
    client.segment === "B" ? "pill-info" : "pill";

  return (
    <div className="card p-3 flex items-start gap-3">
      <span className={cn("pill", segColor)} title={`Segment ${client.segment}`}>{client.segment}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight">{client.name}</div>
        <div className="text-xs text-fg-muted">
          {client.company && <span>{client.company} · </span>}
          {client.platform}
          {client.originalProjectYear && <span> · {client.originalProjectYear}</span>}
        </div>
        {client.originalProjectSummary && (
          <div className="text-[11px] text-fg-subtle mt-1 italic">{client.originalProjectSummary}</div>
        )}
      </div>
      <select
        className="input text-xs py-1 px-2 max-w-[140px]"
        value={status}
        onChange={(e) => onChange(e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
