"use client";

import { useTransition, useState } from "react";
import { Check, Clock, AlertCircle, FileText, Wrench as WrenchIcon } from "lucide-react";
import { toast } from "sonner";
import { toggleTaskStatus } from "@/lib/actions";
import { cn } from "@/lib/utils";

export default function TaskRow({
  id,
  title,
  description,
  category,
  hoursEstimated,
  deliverable,
  status,
  priority,
  pointsValue,
  scriptRef,
  toolsNeeded,
}: {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  hoursEstimated: number;
  deliverable?: string | null;
  status: string;
  priority: string;
  pointsValue: number;
  scriptRef?: string | null;
  toolsNeeded?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(status === "completed");

  const onToggle = () => {
    const next = !completed;
    setCompleted(next);
    startTransition(async () => {
      await toggleTaskStatus(id);
      if (next) {
        toast.success(`✓ +${pointsValue} pts`, { description: title.length > 60 ? title.slice(0, 60) + "…" : title });
      } else {
        toast(`↩ Task re-opened`, { description: title.length > 60 ? title.slice(0, 60) + "…" : title });
      }
    });
  };

  return (
    <div className={cn(
      "card p-4 flex items-start gap-3 transition-opacity",
      completed && "opacity-60"
    )}>
      <button
        disabled={pending}
        onClick={onToggle}
        className={cn(
          "shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center mt-0.5 transition-colors",
          completed
            ? "bg-success border-success text-white"
            : "border-border-strong hover:border-brand"
        )}
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
      >
        {completed && <Check className="w-4 h-4" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "text-sm font-medium leading-snug",
            completed && "line-through text-fg-muted"
          )}>
            {title}
          </span>
          {priority === "high" && (
            <span className="pill-danger"><AlertCircle className="w-3 h-3" /> high</span>
          )}
          <span className="pill text-[10px] uppercase">{category}</span>
        </div>
        {description && (
          <p className="text-xs text-fg-muted mt-1 leading-snug">{description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-fg-subtle">
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{hoursEstimated}h</span>
          <span>+{pointsValue} pts</span>
          {deliverable && <span className="text-fg-muted">→ {deliverable}</span>}
        </div>
        {(scriptRef || toolsNeeded) && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {scriptRef && (
              <a href={`/scripts#${scriptRef}`} className="pill-info">
                <FileText className="w-3 h-3" />{scriptRef}
              </a>
            )}
            {toolsNeeded && (
              <span className="pill"><WrenchIcon className="w-3 h-3" />{toolsNeeded}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
