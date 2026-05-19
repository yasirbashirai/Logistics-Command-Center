import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentDayNumber } from "@/lib/scoring";
import { addDays } from "@/lib/dates";
import { fmtDate } from "@/lib/utils";
import TaskRow from "@/components/task-row";

export const dynamic = "force-dynamic";

export default async function DayDetailPage({ params }: { params: Promise<{ day: string }> }) {
  const { day: dayParam } = await params;
  const dayNumber = parseInt(dayParam, 10);
  if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 30) return notFound();
  const day = await db.day.findUnique({ where: { dayNumber }, include: { tasks: { orderBy: { sortOrder: "asc" } } } });
  if (!day) return notFound();
  const app = await db.appState.findUnique({ where: { id: 1 } });
  if (!app) return null;
  const date = addDays(app.startDate, dayNumber - 1);
  const today = getCurrentDayNumber(app.startDate, new Date());

  const totalPoints = day.tasks.reduce((s, t) => s + t.pointsValue, 0);
  const earnedPoints = day.tasks.filter((t) => t.status === "completed").reduce((s, t) => s + t.pointsValue, 0);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/plan" className="btn-ghost"><ChevronLeft className="w-4 h-4" /> All days</Link>
        <div className="flex items-center gap-1">
          {dayNumber > 1 && <Link href={`/plan/${dayNumber - 1}`} className="btn"><ChevronLeft className="w-3 h-3" /> Day {dayNumber - 1}</Link>}
          {dayNumber < 30 && <Link href={`/plan/${dayNumber + 1}`} className="btn">Day {dayNumber + 1} <ChevronRight className="w-3 h-3" /></Link>}
        </div>
      </div>

      <div className="card p-6">
        <div className="text-xs text-fg-muted uppercase tracking-wider">
          {day.weeklyTheme} · Day {dayNumber} of 30 · {day.weekday} · {fmtDate(date, { month: "long", day: "numeric" })}
        </div>
        <h1 className="text-2xl font-bold mt-2 text-balance">{day.label}</h1>
        <div className="flex items-center gap-4 mt-3 text-sm">
          <span className="text-fg-muted">Focus: <span className="text-brand font-medium">{day.focusArea}</span></span>
          <span className="text-fg-muted inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{day.hoursEstimated}h</span>
          <span className="text-fg-muted">{day.tasks.length} tasks</span>
          <span className="text-fg-muted">{earnedPoints}/{totalPoints} pts</span>
          {dayNumber === today && <span className="pill-brand">TODAY</span>}
          {dayNumber < today && <span className="pill">past</span>}
          {dayNumber > today && <span className="pill-info">in {dayNumber - today}d</span>}
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3">Tasks</h2>
        <div className="space-y-2">
          {day.tasks.map((t) => <TaskRow key={t.id} {...t} />)}
        </div>
      </section>
    </div>
  );
}
