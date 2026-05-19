"use client";

import { useState, useTransition } from "react";
import { updateContentItem } from "@/lib/actions";
import { cn, fmtDate } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import type { ContentItem } from "@prisma/client";

const STATUSES = [
  { key: "idea", label: "Idea", pill: "pill" },
  { key: "draft", label: "Draft", pill: "pill-info" },
  { key: "scheduled", label: "Scheduled", pill: "pill-warn" },
  { key: "published", label: "Published", pill: "pill-success" },
];

export default function ContentItemRow({ item }: { item: ContentItem }) {
  const [status, setStatus] = useState(item.status);
  const [, startTransition] = useTransition();
  const onChange = (s: string) => {
    setStatus(s);
    startTransition(() => updateContentItem(item.id, s));
  };
  const stat = STATUSES.find((x) => x.key === status);

  return (
    <div className={cn("card p-3 flex items-start gap-3", status === "published" && "opacity-80")}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="pill text-[10px]">{item.type}</span>
          {item.dayOfWeek && <span className="pill text-[10px]">{item.dayOfWeek}</span>}
          {item.weekNumber && <span className="pill text-[10px]">Wk {item.weekNumber}</span>}
          <span className={cn("pill text-[10px]", stat?.pill)}>{stat?.label}</span>
        </div>
        <div className="text-sm font-medium leading-tight">{item.title}</div>
        {item.hookText && (
          <div className="text-[11px] text-fg-muted mt-1 italic">"{item.hookText}"</div>
        )}
        {item.publishedAt && (
          <div className="text-[10px] text-fg-subtle mt-1">Published {fmtDate(item.publishedAt)}</div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <select className="input text-xs py-1 px-2" value={status} onChange={(e) => onChange(e.target.value)}>
          {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        {item.postUrl && (
          <a href={item.postUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost text-[10px] py-1 px-2 justify-center">
            <ExternalLink className="w-3 h-3" /> Open
          </a>
        )}
      </div>
    </div>
  );
}
