import { db } from "@/lib/db";
import PipelineBoard from "@/components/pipeline-board";
import NewLeadForm from "@/components/new-lead-form";
import { fmtMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const leads = await db.lead.findMany({ orderBy: { stageEnteredAt: "desc" } });
  const totalValue = leads.reduce((s, l) => s + l.estimatedValue + l.retainerValue, 0);
  const wonValue = leads.filter((l) => l.stage === "won").reduce((s, l) => s + l.estimatedValue + l.retainerValue, 0);
  const openCount = leads.filter((l) => l.stage !== "won" && l.stage !== "lost" && l.stage !== "nurture").length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-fg-muted text-sm mt-1">Drag leads between stages · 8-stage funnel from PLAN §11</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <div className="text-fg-muted">Open</div>
            <div className="font-semibold text-base">{openCount}</div>
          </div>
          <div className="text-right">
            <div className="text-fg-muted">Pipeline value</div>
            <div className="font-semibold text-base">{fmtMoney(totalValue)}</div>
          </div>
          <div className="text-right">
            <div className="text-fg-muted">Won</div>
            <div className="font-semibold text-base text-success">{fmtMoney(wonValue)}</div>
          </div>
        </div>
      </div>

      <NewLeadForm />
      <PipelineBoard initialLeads={leads} />

      <div className="card p-4 text-xs text-fg-muted">
        <div className="font-semibold text-fg mb-1">Stale-lead rule (from PLAN §11.3):</div>
        Leads in the same stage 14+ days auto-flag as <span className="pill-danger">stale</span>. GHL automation #7 will trigger a revival sequence — log here when you action it.
      </div>
    </div>
  );
}
