"use client";

import { useState, useTransition } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable, closestCenter } from "@dnd-kit/core";
import { updateLeadStage } from "@/lib/actions";
import { cn, fmtMoney } from "@/lib/utils";
import { AlertCircle, Building2, Tag } from "lucide-react";
import type { Lead } from "@prisma/client";

const STAGES: { key: string; label: string; tone: string }[] = [
  { key: "new", label: "New Lead", tone: "border-info/40" },
  { key: "audit_sent", label: "Audit Sent", tone: "border-info/40" },
  { key: "discovery_booked", label: "Discovery Booked", tone: "border-brand/40" },
  { key: "discovery_completed", label: "Discovery Completed", tone: "border-brand/60" },
  { key: "proposal_sent", label: "Proposal Sent", tone: "border-warn/40" },
  { key: "won", label: "Won 🏆", tone: "border-success/60" },
  { key: "lost", label: "Lost", tone: "border-danger/40" },
  { key: "nurture", label: "Nurture", tone: "border-fg-subtle/40" },
];

export default function PipelineBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [, startTransition] = useTransition();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const leadId = parseInt(String(active.id).replace("lead-", ""));
    const newStage = String(over.id).replace("stage-", "");
    if (!STAGES.find((s) => s.key === newStage)) return;
    setLeads((ls) =>
      ls.map((l) =>
        l.id === leadId ? { ...l, stage: newStage, stageEnteredAt: new Date() } : l
      )
    );
    startTransition(() => updateLeadStage(leadId, newStage));
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.key);
          const value = stageLeads.reduce((s, l) => s + l.estimatedValue + l.retainerValue, 0);
          return (
            <StageColumn key={stage.key} stage={stage} count={stageLeads.length} value={value}>
              {stageLeads.map((l) => (
                <LeadCard key={l.id} lead={l} />
              ))}
            </StageColumn>
          );
        })}
      </div>
    </DndContext>
  );
}

function StageColumn({
  stage, count, value, children,
}: {
  stage: { key: string; label: string; tone: string };
  count: number; value: number; children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `stage-${stage.key}` });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-72 shrink-0 bg-bg-sub rounded-lg border-t-4 p-2.5 flex flex-col gap-2 transition-colors",
        stage.tone,
        isOver && "ring-2 ring-brand"
      )}
    >
      <div className="px-1 py-1 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-fg-muted">{stage.label}</div>
          <div className="text-[10px] text-fg-subtle">{count} {count === 1 ? "lead" : "leads"} · {fmtMoney(value)}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2 min-h-[100px]">
        {children}
        {count === 0 && (
          <div className="text-[11px] text-fg-subtle text-center py-6 italic">drop leads here</div>
        )}
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({ id: `lead-${lead.id}` });
  const stale = (Date.now() - new Date(lead.stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24) >= 14;
  const totalValue = lead.estimatedValue + lead.retainerValue;
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={cn(
        "card p-3 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lift"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-tight truncate">{lead.name}</div>
          {lead.company && (
            <div className="text-[11px] text-fg-muted flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3" />{lead.company}
            </div>
          )}
        </div>
        {stale && (
          <span className="pill-danger text-[10px]"><AlertCircle className="w-3 h-3" /> stale</span>
        )}
      </div>
      {lead.painPoint && (
        <div className="text-[11px] text-fg-muted mt-2 line-clamp-2 italic">"{lead.painPoint}"</div>
      )}
      <div className="flex items-center justify-between gap-2 mt-2 text-[10px]">
        <span className="pill"><Tag className="w-2.5 h-2.5" />{lead.source}</span>
        {totalValue > 0 && <span className="font-medium text-brand">{fmtMoney(totalValue)}</span>}
      </div>
    </div>
  );
}
