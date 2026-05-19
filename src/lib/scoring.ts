import { db } from "@/lib/db";
import { addDays, startOfDay, startOfWeek, startOfMonth } from "@/lib/dates";

/**
 * Current Day N of the plan. Day 1 = startDate.
 * Returns 0 if before start. No upper cap — extensible to Month 2, 3, ...
 */
export function getCurrentDayNumber(startDate: Date, now: Date): number {
  const a = startOfDay(startDate);
  const b = startOfDay(now);
  const diff = Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

/**
 * Compute current month number from day number.
 * Default rolling 30-day months if no Month rows defined: Day 1-30 = M1, 31-60 = M2, etc.
 */
export function getMonthNumberFromDay(dayNumber: number): number {
  if (dayNumber < 1) return 0;
  return Math.ceil(dayNumber / 30);
}

/**
 * Daily score = (points earned today) / (points available today)
 * Points come from: completed DailyTasks + logged RecurringTask volume vs target.
 */
export async function getTodayScore(now: Date) {
  const app = await db.appState.findUnique({ where: { id: 1 } });
  if (!app) return { score: 0, points: 0, maxPoints: 0 };

  const dayN = getCurrentDayNumber(app.startDate, now);
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);

  // 1. Daily tasks for this day
  let taskPoints = 0;
  let taskMax = 0;
  if (dayN > 0 && dayN <= 30) {
    const day = await db.day.findUnique({
      where: { dayNumber: dayN },
      include: { tasks: true },
    });
    if (day) {
      for (const t of day.tasks) {
        taskMax += t.pointsValue;
        if (t.status === "completed") taskPoints += t.pointsValue;
      }
    }
  }

  // 2. Recurring tasks active today
  const recurring = await db.recurringTask.findMany({
    where: { activeFromDay: { lte: dayN }, activeToDay: { gte: dayN } },
    include: { logs: { where: { date: { gte: today, lt: tomorrow } } } },
  });
  let recPoints = 0;
  let recMax = 0;
  for (const r of recurring) {
    const actual = r.logs.reduce((s, l) => s + l.actualCount, 0);
    const earned = Math.min(actual, r.target) * r.pointsPerUnit;
    recPoints += earned;
    recMax += r.target * r.pointsPerUnit;
  }

  const points = taskPoints + recPoints;
  const maxPoints = taskMax + recMax;
  const score = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
  return { score, points, maxPoints: Math.round(maxPoints) };
}

/**
 * Streak = consecutive prior days (ending yesterday) where score ≥80%.
 * Uses ScoreSnapshot table. If today's score is ≥80, +1 to display.
 */
export async function getStreak(now: Date): Promise<number> {
  const today = startOfDay(now);
  const snapshots = await db.scoreSnapshot.findMany({
    where: { date: { lt: today } },
    orderBy: { date: "desc" },
    take: 60,
  });
  let streak = 0;
  let cursor = addDays(today, -1);
  for (const s of snapshots) {
    const snapDay = startOfDay(s.date);
    if (snapDay.getTime() !== cursor.getTime()) break;
    if (s.dailyScore >= 80) {
      streak++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }
  // Bonus: if today already ≥80, count it
  const t = await getTodayScore(now);
  if (t.score >= 80) streak++;
  return streak;
}

/**
 * North-star: booked discovery calls this week (Sun–Sat).
 * Target = 8/week per AppState.northStarTarget.
 */
export async function getNorthStarWeek(now: Date) {
  const app = await db.appState.findUnique({ where: { id: 1 } });
  const target = app?.northStarTarget ?? 8;
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);
  const rec = await db.recurringTask.findUnique({
    where: { key: "discovery-calls-booked" },
    include: { logs: { where: { date: { gte: weekStart, lt: weekEnd } } } },
  });
  const value = rec ? rec.logs.reduce((s, l) => s + l.actualCount, 0) : 0;
  return { value, target };
}

/**
 * Weekly KPI gates — the 6 health-check ratios from PLAN §15.3.
 * Returns array with current value (last 7d) vs threshold + traffic-light status.
 */
export async function getHealthChecks(now: Date) {
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);
  const kpis = await db.kpiDefinition.findMany({
    where: { isHealthCheck: true },
    include: { logs: { where: { date: { gte: weekStart, lt: weekEnd } } } },
    orderBy: { id: "asc" },
  });
  return kpis.map((k) => {
    const sum = k.logs.reduce((s, l) => s + l.value, 0);
    const avg = k.logs.length > 0 ? sum / k.logs.length : 0;
    const value = avg;
    const target = k.weeklyTarget ?? 0;
    const min = k.thresholdMin ?? 0;
    let status: "pass" | "warn" | "fail" = "fail";
    if (k.thresholdHigher) {
      if (value >= target) status = "pass";
      else if (value >= min) status = "warn";
    } else {
      if (value <= target) status = "pass";
      else if (value <= min) status = "warn";
    }
    return { ...k, value, target, status };
  });
}

/**
 * Weekly volume score: sum of recurring-task hit% for this week / 7 days expected
 */
export async function getWeeklyScore(now: Date) {
  const weekStart = startOfWeek(now);
  let totalEarned = 0;
  let totalPossible = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    if (d.getTime() > now.getTime()) break;
    const { points, maxPoints } = await getTodayScore(d);
    totalEarned += points;
    totalPossible += maxPoints;
  }
  return {
    score: totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0,
    points: totalEarned,
    maxPoints: totalPossible,
  };
}

export async function getMonthlyScore(now: Date) {
  const monthStart = startOfMonth(now);
  let totalEarned = 0;
  let totalPossible = 0;
  let cursor = monthStart;
  while (cursor.getTime() <= now.getTime()) {
    const { points, maxPoints } = await getTodayScore(cursor);
    totalEarned += points;
    totalPossible += maxPoints;
    cursor = addDays(cursor, 1);
  }
  return {
    score: totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0,
    points: totalEarned,
    maxPoints: totalPossible,
  };
}

/**
 * Persist a score snapshot for today. Called whenever the user logs something.
 * Upserts on date.
 */
export async function snapshotToday(now: Date) {
  const today = startOfDay(now);
  const daily = await getTodayScore(now);
  const weekly = await getWeeklyScore(now);
  const monthly = await getMonthlyScore(now);
  const streak = await getStreak(now);
  const northStar = await getNorthStarWeek(now);
  await db.scoreSnapshot.upsert({
    where: { date: today },
    create: {
      date: today,
      dailyScore: daily.score,
      weeklyScore: weekly.score,
      monthlyScore: monthly.score,
      streak,
      northStarValue: northStar.value,
    },
    update: {
      dailyScore: daily.score,
      weeklyScore: weekly.score,
      monthlyScore: monthly.score,
      streak,
      northStarValue: northStar.value,
    },
  });
}
