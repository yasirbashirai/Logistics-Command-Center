import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentDayNumber } from "@/lib/scoring";
import { startOfDay, addDays } from "@/lib/dates";
import { fmtDate, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const now = new Date();
  const app = await db.appState.findUnique({ where: { id: 1 } });
  if (!app) return null;
  const currentDay = getCurrentDayNumber(app.startDate, now);
  const days = await db.day.findMany({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">30-Day Plan</h1>
        <p className="text-fg-muted text-sm mt-1">
          From {fmtDate(app.startDate, { month: "long", day: "numeric", year: "numeric" })} to {fmtDate(addDays(app.startDate, 29), { month: "long", day: "numeric", year: "numeric" })}.
          Click any day to drill in.
        </p>
      </div>

      {weeks.map((weekNumber) => {
        const weekDays = byWeek[weekNumber];
        const theme = weekDays[0]?.weeklyTheme;
        const weekStarted = currentDay >= weekDays[0].dayNumber;
        const weekDone = currentDay > weekDays[weekDays.length - 1].dayNumber;
        return (
          <section key={weekNumber}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <span className="text-fg-muted">Week {weekNumber}</span>
                <span className="text-fg">— {theme?.replace(/^Week \d+ — /, "")}</span>
              </h2>
              {weekDone ? (
                <span className="pill-success">complete</span>
              ) : weekStarted ? (
                <span className="pill-info">in progress</span>
              ) : (
                <span className="pill">upcoming</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {weekDays.map((d) => {
                const total = d.tasks.length;
                const done = d.tasks.filter((t) => t.status === "completed").length;
                const pct = total > 0 ? (done / total) * 100 : 0;
                const isToday = d.dayNumber === currentDay;
                const isPast = d.dayNumber < currentDay;
                const isFuture = d.dayNumber > currentDay;
                const date = addDays(app.startDate, d.dayNumber - 1);
                return (
                  <Link
                    key={d.id}
                    href={`/plan/${d.dayNumber}`}
                    className={cn(
                      "card p-3 group hover:shadow-lift transition-shadow flex flex-col",
                      isToday && "ring-2 ring-brand border-brand",
                      isPast && "opacity-70"
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <div className="text-xs text-fg-muted uppercase tracking-wider">
                        Day {d.dayNumber}
                      </div>
                      <div className="text-[10px] text-fg-subtle">{d.weekday}</div>
                    </div>
                    <div className="text-[10px] text-fg-subtle">
                      {fmtDate(date, { month: "short", day: "numeric" })}
                    </div>
                    <div className="mt-2 text-xs font-medium leading-snug line-clamp-3 min-h-[3rem] group-hover:text-brand">
                      {d.label}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-fg-subtle">
                      <span>{d.tasks.length} tasks · {d.hoursEstimated}h</span>
                      {done > 0 && <span className="text-success">{done}/{total} done</span>}
                    </div>
                    <div className="h-1 rounded-full bg-bg-sub mt-1.5 overflow-hidden">
                      <div
                        className={cn(
                          "h-full",
                          pct === 100 ? "bg-success" : pct > 0 ? "bg-brand" : "bg-bg-sub"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {isToday && (
                      <div className="mt-2 text-[10px] text-brand font-semibold">TODAY</div>
                    )}
                    {isFuture && (
                      <div className="mt-2 text-[10px] text-fg-subtle">in {d.dayNumber - currentDay}d</div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
