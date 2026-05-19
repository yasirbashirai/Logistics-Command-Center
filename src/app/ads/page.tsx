import { db } from "@/lib/db";
import { getCurrentDayNumber } from "@/lib/scoring";
import AdCampaignCard from "@/components/ad-campaign-card";
import NewAdCampaignForm from "@/components/new-ad-campaign-form";
import { Megaphone, Wallet, TrendingUp, Target } from "lucide-react";
import { fmtMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdsPage() {
  const app = await db.appState.findUnique({ where: { id: 1 } });
  if (!app) return null;
  const dayN = getCurrentDayNumber(app.startDate, new Date());
  const months = await db.month.findMany({ orderBy: { monthNumber: "asc" } });
  const currentMonth = months.find((m) => m.startDayNumber <= dayN && m.endDayNumber >= dayN) ?? months[0];

  const campaigns = await db.adCampaign.findMany({
    orderBy: [{ monthNumber: "asc" }, { id: "asc" }],
    include: { creatives: true, metrics: { orderBy: { date: "asc" } } },
  });

  // Stats
  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const allMetrics = campaigns.flatMap((c) => c.metrics);
  const totalSpend = allMetrics.reduce((s, m) => s + m.spend, 0);
  const totalLeads = allMetrics.reduce((s, m) => s + m.leads, 0);
  const totalBooked = allMetrics.reduce((s, m) => s + m.bookedCalls, 0);
  const blendedCPL = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const blendedCPBooked = totalBooked > 0 ? totalSpend / totalBooked : 0;

  // Budget allocation
  const plannedMonthlyBudget = campaigns.filter((c) => c.status !== "killed" && c.monthNumber === currentMonth?.monthNumber).reduce((s, c) => s + c.monthlyBudget, 0);
  const budgetTarget = currentMonth?.adBudget ?? 0;
  const overBudget = plannedMonthlyBudget > budgetTarget * 1.05;
  const underBudget = plannedMonthlyBudget < budgetTarget * 0.95;

  // Group by status
  const planned = campaigns.filter((c) => c.status === "planned");
  const active = campaigns.filter((c) => c.status === "active");
  const paused = campaigns.filter((c) => c.status === "paused");
  const killed = campaigns.filter((c) => c.status === "killed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="w-6 h-6 text-brand" /> Paid Ads</h1>
        <p className="text-fg-muted text-sm mt-1">
          {currentMonth ? `Month ${currentMonth.monthNumber} · ${currentMonth.theme}` : "Setup needed"} ·
          Decision rules from PLAN §9.2 auto-surface inline (Day-3 pause, Day-5 refresh, Day-10 scale)
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat icon={<Wallet />} label="Active monthly $" value={`$${plannedMonthlyBudget.toFixed(0)}`} sub={`of $${budgetTarget} target`} tone={overBudget ? "danger" : underBudget ? "warn" : "success"} />
        <Stat icon={<Target />} label="Active campaigns" value={String(activeCampaigns.length)} sub={`/ ${campaigns.length} total`} tone="info" />
        <Stat icon={<TrendingUp />} label="Total spend (lifetime)" value={fmtMoney(totalSpend)} sub={`${allMetrics.length} day${allMetrics.length === 1 ? "" : "s"} logged`} tone="info" />
        <Stat icon={<TrendingUp />} label="Blended CPL" value={blendedCPL > 0 ? `$${blendedCPL.toFixed(0)}` : "—"} sub="target $8-25 lead-form" tone={blendedCPL > 0 && blendedCPL <= 25 ? "success" : blendedCPL > 0 && blendedCPL <= 75 ? "warn" : blendedCPL > 75 ? "danger" : "info"} />
        <Stat icon={<TrendingUp />} label="Cost per booked call" value={blendedCPBooked > 0 ? `$${blendedCPBooked.toFixed(0)}` : "—"} sub="target <$200" tone={blendedCPBooked > 0 && blendedCPBooked <= 200 ? "success" : "info"} />
      </div>

      {/* Budget breakdown by month */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">Monthly budget plan</h2>
          <span className="text-[11px] text-fg-subtle">PLAN §17 budget escalation</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {months.map((m) => {
            const monthSpend = campaigns.filter((c) => c.monthNumber === m.monthNumber && c.status !== "killed").reduce((s, c) => s + c.monthlyBudget, 0);
            const pct = m.adBudget > 0 ? (monthSpend / m.adBudget) * 100 : 0;
            const isCurrent = m.monthNumber === currentMonth?.monthNumber;
            return (
              <div key={m.id} className={`p-3 rounded-lg border ${isCurrent ? "border-brand bg-brand/5" : "border-border bg-bg-sub"}`}>
                <div className="text-[10px] uppercase tracking-wider text-fg-muted">Month {m.monthNumber}{isCurrent && " · current"}</div>
                <div className="text-base font-bold">${monthSpend.toFixed(0)} <span className="text-xs text-fg-muted font-normal">/ ${m.adBudget}</span></div>
                <div className="text-[10px] text-fg-subtle mt-0.5">{m.theme}</div>
                <div className="h-1 bg-bg-card rounded-full mt-2 overflow-hidden">
                  <div className={`h-full ${pct > 105 ? "bg-danger" : pct > 95 ? "bg-success" : "bg-brand"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NewAdCampaignForm currentMonth={currentMonth?.monthNumber ?? 1} />

      {/* Campaigns */}
      {active.length > 0 && (
        <Section title={`🟢 Active (${active.length})`}>
          {active.map((c) => <AdCampaignCard key={c.id} campaign={c} />)}
        </Section>
      )}
      {planned.length > 0 && (
        <Section title={`📋 Planned — ready to launch (${planned.length})`}>
          {planned.map((c) => <AdCampaignCard key={c.id} campaign={c} />)}
        </Section>
      )}
      {paused.length > 0 && (
        <Section title={`⏸ Paused (${paused.length})`}>
          {paused.map((c) => <AdCampaignCard key={c.id} campaign={c} />)}
        </Section>
      )}
      {killed.length > 0 && (
        <Section title={`💀 Killed — learnings only (${killed.length})`}>
          {killed.map((c) => <AdCampaignCard key={c.id} campaign={c} />)}
        </Section>
      )}

      {/* Rules cheatsheet */}
      <div className="card p-4 text-xs space-y-1.5">
        <div className="font-semibold text-fg uppercase tracking-wider text-[10px] mb-2">Ad management rules (from PLAN §9.2)</div>
        <div className="text-fg-muted">• <strong>Day 3:</strong> Pause creative if CTR &lt;0.5% OR CPL &gt;3× target.</div>
        <div className="text-fg-muted">• <strong>Day 5:</strong> If CPL still high, refresh creative, test new hook, consider audience swap.</div>
        <div className="text-fg-muted">• <strong>Day 10:</strong> Clear winner? Scale +20% per 48hr. Maintain audience. Don't exceed +20%/48h or you reset Learning Phase.</div>
        <div className="text-fg-muted">• <strong>M1 expectation:</strong> 0-1 closes from $300/mo. Ads buy retargeting pool + pixel training, not closes.</div>
        <div className="text-fg-muted">• <strong>NEVER say:</strong> "Guaranteed" · "Best" · "#1" · "Make money" · "FREE!" in caps. Meta will ban.</div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Stat({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub?: string; tone: "success" | "warn" | "danger" | "info" }) {
  const c = tone === "success" ? "border-l-success" : tone === "warn" ? "border-l-warn" : tone === "danger" ? "border-l-danger" : "border-l-info";
  return (
    <div className={`card p-3 border-l-4 ${c}`}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-fg-muted">
        <span>{label}</span>
        <span className="text-fg-subtle [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
      </div>
      <div className="text-xl font-bold mt-1">{value}</div>
      {sub && <div className="text-[10px] text-fg-subtle">{sub}</div>}
    </div>
  );
}
