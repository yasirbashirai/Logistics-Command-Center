import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ChevronLeft, Target, Wallet, Users, Calendar, Sparkles } from "lucide-react";
import { getCurrentDayNumber } from "@/lib/scoring";
import { addDays } from "@/lib/dates";
import { fmtDate, fmtMoney, cn } from "@/lib/utils";
import CloneDayButton from "@/components/clone-day-button";

export const dynamic = "force-dynamic";

export default async function MonthDetailPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const monthNumber = parseInt(n, 10);
  if (isNaN(monthNumber)) return notFound();
  const month = await db.month.findUnique({ where: { monthNumber } });
  if (!month) return notFound();
  const app = await db.appState.findUnique({ where: { id: 1 } });
  if (!app) return null;
  const today = getCurrentDayNumber(app.startDate, new Date());

  const days = await db.day.findMany({
    where: { monthNumber },
    orderBy: { dayNumber: "asc" },
    include: { tasks: true },
  });

  // Group by week
  const byWeek: Record<number, typeof days> = {};
  for (const d of days) {
    if (!byWeek[d.weekNumber]) byWeek[d.weekNumber] = [];
    byWeek[d.weekNumber].push(d);
  }
  const weeks = Object.keys(byWeek).map(Number).sort();

  const tasksAll = days.flatMap((d) => d.tasks);
  const tasksDone = tasksAll.filter((t) => t.status === "completed").length;
  const progressPct = tasksAll.length > 0 ? (tasksDone / tasksAll.length) * 100 : 0;

  const monthStarted = today >= month.startDayNumber;
  const monthDone = today > month.endDayNumber;
  const monthCurrent = monthStarted && !monthDone;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/plan" className="btn-ghost"><ChevronLeft className="w-4 h-4" /> All months</Link>
        {monthCurrent && <span className="pill-success">current month</span>}
        {monthDone && <span className="pill">complete</span>}
        {!monthStarted && <span className="pill-info">upcoming</span>}
      </div>

      {/* Month banner */}
      <div className="card p-6">
        <div className="text-xs text-fg-muted uppercase tracking-wider">Month {month.monthNumber}</div>
        <h1 className="text-2xl font-bold mt-1">{month.theme}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Stat icon={<Wallet />} label="Revenue target" value={fmtMoney(month.revenueTarget)} />
          <Stat icon={<Target />} label="MRR target" value={fmtMoney(month.mrrTarget)} />
          <Stat icon={<Users />} label="New clients" value={String(month.clientsTarget)} />
          <Stat icon={<Sparkles />} label="Ad budget" value={fmtMoney(month.adBudget)} sub="/mo" />
        </div>
      </div>

      {/* Objectives */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-2">Objectives</h2>
        <div className="card p-4 text-sm leading-relaxed">
          {month.objectives.split("·").map((s, i) => (
            <div key={i} className="flex gap-2 py-0.5">
              <span className="text-brand">✓</span>
              <span>{s.trim()}</span>
            </div>
          ))}
        </div>
        {month.retainerMix && (
          <div className="card p-4 mt-2 text-sm text-fg-muted">
            <span className="font-semibold text-fg">Retainer mix:</span> {month.retainerMix}
          </div>
        )}
        {month.notes && (
          <div className="card p-4 mt-2 text-sm text-fg-muted">
            <span className="font-semibold text-fg">Notes:</span> {month.notes}
          </div>
        )}
      </section>

      {/* Days in this month */}
      {days.length > 0 ? (
        <>
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">Days · {days.length} total</h2>
              <div className="text-xs text-fg-muted">{tasksDone}/{tasksAll.length} tasks ({progressPct.toFixed(0)}%)</div>
            </div>
            {weeks.map((weekNumber) => {
              const weekDays = byWeek[weekNumber];
              return (
                <div key={weekNumber} className="mb-4">
                  <div className="text-xs font-medium text-fg-muted mb-2">Week {weekNumber}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2">
                    {weekDays.map((d) => {
                      const total = d.tasks.length;
                      const done = d.tasks.filter((t) => t.status === "completed").length;
                      const pct = total > 0 ? (done / total) * 100 : 0;
                      const isToday = d.dayNumber === today;
                      const date = addDays(app.startDate, d.dayNumber - 1);
                      return (
                        <Link
                          key={d.id}
                          href={`/plan/${d.dayNumber}`}
                          className={cn("card p-2.5 hover:shadow-lift transition-shadow", isToday && "ring-2 ring-brand")}
                        >
                          <div className="text-[10px] text-fg-subtle">Day {d.dayNumber} · {d.weekday}</div>
                          <div className="text-[9px] text-fg-subtle">{fmtDate(date)}</div>
                          <div className="text-[11px] font-medium leading-snug line-clamp-2 mt-1 min-h-[2.5rem]">{d.label}</div>
                          <div className="h-1 bg-bg-sub rounded-full mt-2 overflow-hidden">
                            <div className={cn("h-full", pct === 100 ? "bg-success" : pct > 0 ? "bg-brand" : "bg-bg-sub")} style={{ width: `${pct}%` }} />
                          </div>
                          {isToday && <div className="text-[10px] text-brand font-semibold mt-1">TODAY</div>}
                          {d.isCustom && <div className="text-[9px] text-fg-subtle mt-0.5">custom</div>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      ) : (
        <div className="card p-8 text-center">
          <div className="text-fg-muted mb-3">No days created yet for Month {monthNumber}.</div>
          <p className="text-xs text-fg-subtle max-w-md mx-auto mb-4">
            Clone individual days from Month 1's plan into Month {monthNumber} — or add custom days for what's unique to this month (Beehiiv launch, podcast pitches, AI Dispatcher Agent launch, etc.).
          </p>
          <CloneDayButton targetMonth={monthNumber} startDayNumber={month.startDayNumber} />
        </div>
      )}

      {/* Clone button always available */}
      {days.length > 0 && (
        <div className="card p-4">
          <div className="text-xs text-fg-muted mb-2">Extend this month with more days:</div>
          <CloneDayButton targetMonth={monthNumber} startDayNumber={month.startDayNumber} existingDays={days.map((d) => d.dayNumber)} />
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="card p-3 bg-bg-sub border-border">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-fg-muted">
        <span className="text-fg-subtle [&>svg]:w-3 [&>svg]:h-3">{icon}</span>
        {label}
      </div>
      <div className="text-xl font-bold mt-1">{value}{sub && <span className="text-sm text-fg-muted font-normal">{sub}</span>}</div>
    </div>
  );
}
