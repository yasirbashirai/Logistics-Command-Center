import { db } from "@/lib/db";
import { getCurrentDayNumber, getHealthChecks, getTodayScore, getWeeklyScore, getMonthlyScore, getNorthStarWeek } from "@/lib/scoring";
import { startOfWeek, addDays, startOfMonth } from "@/lib/dates";
import KpiLogForm from "@/components/kpi-log-form";
import { TrendingUp, CheckCircle, AlertTriangle, XCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function KpisPage() {
  const now = new Date();
  const app = await db.appState.findUnique({ where: { id: 1 } });
  if (!app) return null;
  const dayN = getCurrentDayNumber(app.startDate, now);

  const today = await getTodayScore(now);
  const week = await getWeeklyScore(now);
  const month = await getMonthlyScore(now);
  const northStar = await getNorthStarWeek(now);
  const healthChecks = await getHealthChecks(now);

  const monthStart = startOfMonth(now);
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);

  const kpis = await db.kpiDefinition.findMany({
    include: {
      logs: { where: { date: { gte: monthStart } }, orderBy: { date: "desc" } },
    },
    orderBy: { id: "asc" },
  });

  // North-star KPI
  const northStarKpi = kpis.find((k) => k.isNorthStar);

  // Categorize
  const healthCheckKpis = kpis.filter((k) => k.isHealthCheck);
  const volumeKpis = kpis.filter((k) => k.category === "volume");
  const revenueKpis = kpis.filter((k) => k.category === "revenue");
  const contentKpis = kpis.filter((k) => k.category === "content");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">KPI Scorecards</h1>
        <p className="text-fg-muted text-sm mt-1">Live scoring · weekly health checks · north-star tracker</p>
      </div>

      {/* Score row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ScoreCard label="Today" value={`${Math.round(today.score)}%`} sub={`${Math.round(today.points)}/${today.maxPoints} pts`} tone={today.score >= 80 ? "success" : today.score >= 50 ? "warn" : "danger"} />
        <ScoreCard label="This Week" value={`${Math.round(week.score)}%`} sub={`${Math.round(week.points)} pts`} tone={week.score >= 80 ? "success" : week.score >= 50 ? "warn" : "danger"} />
        <ScoreCard label="This Month" value={`${Math.round(month.score)}%`} sub={`Day ${dayN} of 30`} tone={month.score >= 80 ? "success" : month.score >= 50 ? "warn" : "danger"} />
        <ScoreCard label="North Star" value={`${northStar.value}/${northStar.target}`} sub="Booked calls (wk)" tone={northStar.value >= northStar.target ? "success" : northStar.value >= northStar.target / 2 ? "warn" : "danger"} icon={<Star className="w-4 h-4" />} />
      </div>

      {/* Health Check Ratios */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold">6 Health Check Ratios</h2>
          <span className="text-xs text-fg-muted">PLAN §15.3 — week to date</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {healthChecks.map((h) => (
            <div key={h.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-fg-muted uppercase tracking-wider">{h.category}</div>
                  <div className="text-sm font-semibold leading-tight mt-0.5">{h.name}</div>
                </div>
                <StatusIcon status={h.status} />
              </div>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-2xl font-bold">{h.value.toFixed(0)}<span className="text-base text-fg-muted">{h.unit === "%" ? "%" : ""}</span></span>
                <span className="text-xs text-fg-subtle">target {h.target}{h.unit === "%" ? "%" : ""} · min {h.thresholdMin}{h.unit === "%" ? "%" : ""}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <KpiLogForm kpiId={h.id} unit={h.unit} />
                <span className="text-[10px] text-fg-subtle">{h.logs?.length ?? 0} entries</span>
              </div>
              {h.status === "fail" && h.failureMode && (
                <div className="mt-3 text-[11px] text-danger bg-danger/5 border border-danger/20 rounded-md p-2 leading-snug">
                  ⚠ {h.failureMode}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Revenue KPIs */}
      <section>
        <h2 className="text-base font-semibold mb-3">Revenue & Outcome</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {revenueKpis.map((k) => {
            const latest = k.logs[0]?.value ?? 0;
            return (
              <div key={k.id} className="card p-4">
                <div className="text-xs text-fg-muted uppercase tracking-wider">{k.name}</div>
                <div className="text-2xl font-bold mt-1">{k.unit === "$" ? "$" : ""}{latest.toLocaleString()}{k.unit === "$" ? "" : ` ${k.unit}`}</div>
                <div className="text-[11px] text-fg-subtle mt-0.5">
                  M-target {k.unit === "$" ? "$" : ""}{k.monthlyTarget?.toLocaleString()}{k.unit === "$" ? "" : ""}
                </div>
                <div className="mt-2">
                  <KpiLogForm kpiId={k.id} unit={k.unit} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Volume + content rolled up */}
      <section>
        <h2 className="text-base font-semibold mb-3">Volume & Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...volumeKpis, ...contentKpis].map((k) => {
            const wkSum = k.logs.filter((l) => l.date >= weekStart && l.date < weekEnd).reduce((s, l) => s + l.value, 0);
            return (
              <div key={k.id} className="card p-4">
                <div className="text-xs text-fg-muted uppercase tracking-wider">{k.name}</div>
                <div className="text-xl font-bold mt-1">{wkSum.toLocaleString()} {k.unit}</div>
                <div className="text-[11px] text-fg-subtle mt-0.5">wk target {k.weeklyTarget} · M target {k.monthlyTarget}</div>
                <div className="mt-2">
                  <KpiLogForm kpiId={k.id} unit={k.unit} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {northStarKpi && (
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-warn" /> North Star — The Only Metric That Matters</h2>
          <div className="card p-6">
            <div className="text-sm text-fg-muted mb-2">{northStarKpi.description}</div>
            <div className="flex items-baseline gap-4">
              <div className="text-5xl font-bold">{northStar.value}</div>
              <div className="text-sm text-fg-muted">/ {northStar.target} this week</div>
            </div>
            {northStarKpi.failureMode && (
              <div className="mt-4 text-xs text-fg-muted bg-bg-sub border border-border rounded-md p-3">
                <span className="font-medium text-fg">If under target:</span> {northStarKpi.failureMode}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function ScoreCard({ label, value, sub, tone, icon }: { label: string; value: string; sub?: string; tone: "success" | "warn" | "danger" | "info"; icon?: React.ReactNode }) {
  const c = tone === "success" ? "border-l-success" : tone === "warn" ? "border-l-warn" : tone === "danger" ? "border-l-danger" : "border-l-info";
  return (
    <div className={`card p-4 border-l-4 ${c}`}>
      <div className="flex items-center justify-between text-xs text-fg-muted uppercase tracking-wider">
        <span>{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-fg-subtle mt-0.5">{sub}</div>}
    </div>
  );
}

function StatusIcon({ status }: { status: "pass" | "warn" | "fail" }) {
  if (status === "pass") return <CheckCircle className="w-5 h-5 text-success" />;
  if (status === "warn") return <AlertTriangle className="w-5 h-5 text-warn" />;
  return <XCircle className="w-5 h-5 text-danger" />;
}
