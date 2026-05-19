import { db } from "@/lib/db";
import { getCurrentDayNumber, getTodayScore, getNorthStarWeek, getHealthChecks, getMonthNumberFromDay } from "@/lib/scoring";
import { startOfDay, addDays } from "@/lib/dates";
import TaskRow from "@/components/task-row";
import QuickLog from "@/components/quick-log";
import { Sparkles, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const now = new Date();
  const app = await db.appState.findUnique({ where: { id: 1 } });
  if (!app) return <SetupNeeded />;

  const dayN = getCurrentDayNumber(app.startDate, now);
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);

  const day = dayN > 0
    ? await db.day.findUnique({ where: { dayNumber: dayN }, include: { tasks: { orderBy: { sortOrder: "asc" } } } })
    : null;
  const monthNumber = getMonthNumberFromDay(dayN);

  const recurring = await db.recurringTask.findMany({
    where: { activeFromDay: { lte: dayN }, activeToDay: { gte: dayN } },
    include: { logs: { where: { date: { gte: today, lt: tomorrow } } } },
    orderBy: { id: "asc" },
  });

  const { score, points, maxPoints } = await getTodayScore(now);
  const northStar = await getNorthStarWeek(now);
  const healthChecks = await getHealthChecks(now);

  // Today's script suggestions (based on scriptRef on today's tasks)
  const refs = (day?.tasks ?? []).map((t) => t.scriptRef).filter(Boolean) as string[];
  const scripts = refs.length > 0
    ? await db.script.findMany({ where: { key: { in: refs } } })
    : [];

  // Pre-plan or post-plan state
  if (dayN < 1) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-3">Plan starts {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(app.startDate)}</h1>
        <p className="text-fg-muted">Day 1 hasn't begun yet. Come back then — your daily commander will activate automatically.</p>
      </div>
    );
  }
  if (!day) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-3">Day {dayN} not in plan yet</h1>
        <p className="text-fg-muted text-sm">You're past Day 30 — Month {monthNumber} hasn't been planned out yet. Open the Plan and clone days from Month 1, or create custom days for Month {monthNumber}.</p>
        <div className="mt-6 flex items-center gap-3 justify-center">
          <Link href={`/plan/month/${monthNumber}`} className="btn-brand">Plan Month {monthNumber} →</Link>
          <Link href="/kpis" className="btn">Review KPIs</Link>
        </div>
        <p className="text-fg-subtle text-xs mt-6">Your daily cadence loggers below stay active forever — keep dialing, emailing, posting.</p>

        {recurring.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3 text-left">Daily cadence (quick log)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
              {recurring.map((r) => {
                const actual = r.logs.reduce((s, l) => s + l.actualCount, 0);
                return (
                  <QuickLog key={r.id} id={r.id} title={r.title} category={r.category} target={r.target} unit={r.unit} actual={actual} benchmark={r.benchmark} />
                );
              })}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Day banner */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs text-fg-muted uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5" />
            {day?.weeklyTheme} · Day {dayN} · {day?.weekday}
          </div>
          <h1 className="text-2xl font-bold mt-1 text-balance">{day?.label}</h1>
          <div className="text-sm text-fg-muted mt-1">
            Focus: <span className="text-brand font-medium">{day?.focusArea}</span> · Est {day?.hoursEstimated}h
          </div>
        </div>
        <Link href={`/plan/${dayN}`} className="btn">
          See full day plan <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Score row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Stat label="Today's Score" value={`${Math.round(score)}%`} sub={`${Math.round(points)} / ${maxPoints} pts`} tone={score >= 80 ? "success" : score >= 50 ? "warn" : "danger"} />
        <Stat label="North Star (this wk)" value={`${northStar.value}`} sub={`Booked calls — target ${northStar.target}`} tone={northStar.value >= northStar.target ? "success" : northStar.value >= northStar.target / 2 ? "warn" : "danger"} />
        <Stat label="Tasks today" value={`${day?.tasks.filter(t => t.status === "completed").length ?? 0}/${day?.tasks.length ?? 0}`} sub="completed" tone="info" />
        <Stat label="Day of plan" value={`${dayN} / 30`} sub={day?.weeklyTheme ?? undefined} tone="info" />
      </div>

      {/* Today's Tasks */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3">Today's tasks</h2>
        <div className="space-y-2">
          {day?.tasks.map((t) => (
            <TaskRow key={t.id} {...t} />
          ))}
        </div>
      </section>

      {/* Daily cadence — quick loggers */}
      {recurring.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3">Daily cadence (quick log)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recurring.map((r) => {
              const actual = r.logs.reduce((s, l) => s + l.actualCount, 0);
              return (
                <QuickLog
                  key={r.id}
                  id={r.id}
                  title={r.title}
                  category={r.category}
                  target={r.target}
                  unit={r.unit}
                  actual={actual}
                  benchmark={r.benchmark}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Contextual scripts */}
      {scripts.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Scripts you'll use today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scripts.map((s) => (
              <Link key={s.id} href={`/scripts#${s.key}`} className="card p-4 hover:shadow-lift transition-shadow group">
                <div className="text-xs text-fg-muted uppercase tracking-wider mb-1">{s.category} · {s.persona}</div>
                <div className="font-semibold text-sm group-hover:text-brand transition-colors">{s.title}</div>
                {s.subject && <div className="text-xs text-fg-muted mt-1 italic">Subj: {s.subject}</div>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Weekly health checks (compact) */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3">Weekly health checks</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {healthChecks.map((h) => (
            <div key={h.id} className={`card p-3 border-l-4 ${h.status === "pass" ? "border-l-success" : h.status === "warn" ? "border-l-warn" : "border-l-danger"}`}>
              <div className="text-[10px] uppercase tracking-wider text-fg-subtle truncate">{h.name}</div>
              <div className="text-base font-semibold mt-0.5">
                {h.value.toFixed(0)}{h.unit === "%" ? "%" : ""}
              </div>
              <div className="text-[10px] text-fg-muted">
                target {h.target}{h.unit === "%" ? "%" : ""}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: "success" | "warn" | "danger" | "info" }) {
  const border =
    tone === "success" ? "border-l-success" :
    tone === "warn" ? "border-l-warn" :
    tone === "danger" ? "border-l-danger" : "border-l-info";
  return (
    <div className={`card p-4 border-l-4 ${border}`}>
      <div className="text-xs text-fg-muted uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-fg-subtle mt-0.5">{sub}</div>}
    </div>
  );
}

function SetupNeeded() {
  return (
    <div className="max-w-md mx-auto py-12 text-center">
      <h1 className="text-xl font-bold">First-time setup needed</h1>
      <p className="text-fg-muted text-sm mt-2">Run <code className="text-brand">npx tsx prisma/seed.ts</code> to initialise.</p>
    </div>
  );
}
