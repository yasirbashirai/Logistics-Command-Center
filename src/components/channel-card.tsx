"use client";

import { useState, useTransition } from "react";
import { toggleChannelStatus } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Play, Pause, EyeOff } from "lucide-react";
import type { Channel } from "@prisma/client";

const STATUS_OPTIONS = [
  { key: "active", label: "Active", icon: Play, tone: "pill-success" },
  { key: "paused", label: "Paused", icon: Pause, tone: "pill-warn" },
  { key: "hold", label: "Hold", icon: EyeOff, tone: "pill" },
];

export default function ChannelCard({ channel }: { channel: Channel }) {
  const [status, setStatus] = useState(channel.status);
  const [, startTransition] = useTransition();

  const onChange = (newStatus: string) => {
    setStatus(newStatus);
    startTransition(() => toggleChannelStatus(channel.id, newStatus));
  };

  const priorityPill =
    channel.priority === "primary" ? "pill-brand" :
    channel.priority === "secondary" ? "pill-info" :
    channel.priority === "avoid" ? "pill-danger" : "pill";

  return (
    <div className={cn(
      "card p-5 flex flex-col gap-3",
      status === "paused" && "opacity-70",
      status === "hold" && "opacity-50"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn("pill text-[10px]", priorityPill)}>{channel.priority}</span>
            <span className="pill text-[10px]">${channel.costPerMonth}/mo</span>
          </div>
          <h3 className="text-base font-semibold leading-tight">{channel.name}</h3>
        </div>
        <div className="flex flex-col gap-1">
          {STATUS_OPTIONS.map((s) => {
            const Icon = s.icon;
            const active = status === s.key;
            return (
              <button
                key={s.key}
                onClick={() => onChange(s.key)}
                className={cn(
                  "pill text-[10px] py-1 px-2 transition",
                  active ? s.tone : "opacity-30 hover:opacity-100"
                )}
              >
                <Icon className="w-2.5 h-2.5" /> {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-fg-muted leading-snug">{channel.role}</p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-[10px] uppercase text-fg-subtle">Weekly target</div>
          <div className="font-semibold">{channel.weeklyTarget} {channel.unit}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-fg-subtle">Expected M1</div>
          <div className="font-medium text-[11px] leading-snug">{channel.expectedClients}</div>
        </div>
      </div>

      {channel.benchmarks && (
        <div className="text-[11px] text-fg-muted bg-bg-sub border border-border rounded-md p-2 leading-snug">
          <span className="font-semibold text-fg">Benchmark:</span> {channel.benchmarks}
        </div>
      )}

      {channel.bestPractice && (
        <div className="text-[11px] text-fg-muted leading-snug">
          <span className="font-semibold text-fg">Best practice:</span> {channel.bestPractice}
        </div>
      )}

      {channel.rules && (
        <div className="text-[11px] text-warn bg-warn/5 border border-warn/20 rounded-md p-2 leading-snug">
          <span className="font-semibold">Rules:</span> {channel.rules}
        </div>
      )}
    </div>
  );
}
