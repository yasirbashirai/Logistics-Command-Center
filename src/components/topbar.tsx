import { db } from "@/lib/db";
import { fmtDate } from "@/lib/utils";
import { getCurrentDayNumber, getTodayScore, getStreak, getNorthStarWeek, getMonthNumberFromDay } from "@/lib/scoring";
import { Flame, Target as TargetIcon, TrendingUp } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import CommandPalette from "./command-palette";

export default async function TopBar() {
  const app = await db.appState.findUnique({ where: { id: 1 } });
  if (!app) return null;
  const now = new Date();
  const dayNumber = getCurrentDayNumber(app.startDate, now);
  const monthNumber = getMonthNumberFromDay(dayNumber);
  const dayInMonth = ((dayNumber - 1) % 30) + 1;
  const { score, points, maxPoints } = await getTodayScore(now);
  const streak = await getStreak(now);
  const northStar = await getNorthStarWeek(now);

  return (
    <header className="h-16 border-b border-border bg-bg-card flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-xs text-fg-muted uppercase tracking-wider">
            {dayNumber < 1
              ? "Pre-launch"
              : `Month ${monthNumber} · Day ${dayInMonth} of 30 (overall Day ${dayNumber})`}
          </div>
          <div className="text-base font-semibold">
            {fmtDate(now, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <CommandPalette />
        <ScoreChip label="Today" value={`${Math.round(score)}%`} sub={`${Math.round(points)}/${maxPoints} pts`} tone={score >= 80 ? "success" : score >= 50 ? "warn" : "danger"} icon={<TargetIcon className="w-4 h-4" />} />
        <ScoreChip label="Booked (wk)" value={`${northStar.value}/${northStar.target}`} sub="north star" tone={northStar.value >= northStar.target ? "success" : northStar.value >= northStar.target / 2 ? "warn" : "danger"} icon={<TrendingUp className="w-4 h-4" />} />
        <ScoreChip label="Streak" value={`${streak}🔥`} sub={streak >= 7 ? "Hot" : "Build"} tone={streak >= 7 ? "success" : "info"} icon={<Flame className="w-4 h-4" />} />
        <ThemeToggle />
      </div>
    </header>
  );
}

function ScoreChip({
  label, value, sub, tone, icon,
}: {
  label: string; value: string; sub: string; tone: "success" | "warn" | "danger" | "info"; icon?: React.ReactNode;
}) {
  const ring =
    tone === "success" ? "border-success/30 bg-success/5 text-success" :
    tone === "warn" ? "border-warn/30 bg-warn/5 text-warn" :
    tone === "danger" ? "border-danger/30 bg-danger/5 text-danger" :
    "border-info/30 bg-info/5 text-info";
  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border ${ring}`}>
      <div className="opacity-70">{icon}</div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold">{value}</span>
          <span className="text-[10px] opacity-70">{sub}</span>
        </div>
      </div>
    </div>
  );
}
