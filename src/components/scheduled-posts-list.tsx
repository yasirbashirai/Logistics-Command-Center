"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { X, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cancelScheduledPost } from "@/lib/actions";
import { cn, fmtDate } from "@/lib/utils";
import type { ScheduledPost } from "@prisma/client";

export default function ScheduledPostsList({ posts }: { posts: ScheduledPost[] }) {
  const [, startTransition] = useTransition();
  const cancel = (id: number) => {
    if (!window.confirm("Cancel this scheduled post?")) return;
    startTransition(async () => {
      await cancelScheduledPost(id);
      toast.success("Post cancelled");
    });
  };

  return (
    <div className="space-y-2">
      {posts.map((p) => {
        const Icon = p.status === "published" ? CheckCircle : p.status === "failed" ? AlertCircle : Clock;
        const tone = p.status === "published" ? "text-success" : p.status === "failed" ? "text-danger" : p.status === "queued" ? "text-warn" : "text-fg-subtle";
        return (
          <div key={p.id} className={cn("card p-3 flex items-start gap-3", p.status === "cancelled" && "opacity-50")}>
            <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", tone)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="pill text-[10px]">{p.platform}</span>
                <span className={cn("pill text-[10px]",
                  p.status === "queued" && "pill-warn",
                  p.status === "published" && "pill-success",
                  p.status === "failed" && "pill-danger",
                )}>{p.status}</span>
                <span className="text-[11px] text-fg-muted">{fmtDate(p.scheduledFor, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="text-xs text-fg leading-snug line-clamp-2">{p.body}</div>
              {p.errorMessage && (
                <div className="text-[11px] text-danger mt-1">⚠ {p.errorMessage}</div>
              )}
            </div>
            {p.status === "queued" && (
              <button onClick={() => cancel(p.id)} className="btn-ghost text-xs">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
