"use client";

import { useState, useTransition } from "react";
import { Copy, Plus, X } from "lucide-react";
import { cloneDayTo, createCustomDay } from "@/lib/actions";

export default function CloneDayButton({
  targetMonth,
  startDayNumber,
  existingDays = [],
}: {
  targetMonth: number;
  startDayNumber: number;
  existingDays?: number[];
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"clone" | "blank">("clone");
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState({
    sourceDayNumber: "1",
    targetDayNumber: String(startDayNumber + existingDays.length),
    weekday: "Mon",
    label: "",
    focusArea: "outreach",
    hoursEstimated: "4",
  });

  const targetWeek = Math.ceil((parseInt(f.targetDayNumber) - (targetMonth - 1) * 30) / 7) + (targetMonth - 1) * 4;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDay = parseInt(f.targetDayNumber);
    if (isNaN(targetDay) || existingDays.includes(targetDay)) return;
    startTransition(async () => {
      if (mode === "clone") {
        const source = parseInt(f.sourceDayNumber);
        if (isNaN(source)) return;
        await cloneDayTo(source, targetDay, targetMonth, targetWeek, f.weekday);
      } else {
        await createCustomDay({
          dayNumber: targetDay,
          monthNumber: targetMonth,
          weekNumber: targetWeek,
          weekday: f.weekday,
          label: f.label || `Day ${targetDay} — custom`,
          focusArea: f.focusArea,
          hoursEstimated: parseFloat(f.hoursEstimated) || 4,
          weeklyTheme: `Month ${targetMonth} — custom`,
        });
      }
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-brand">
        <Plus className="w-4 h-4" /> Add day to Month {targetMonth}
      </button>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Add day to Month {targetMonth}</h3>
        <button onClick={() => setOpen(false)} className="btn-ghost"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setMode("clone")}
          className={mode === "clone" ? "btn-brand text-xs" : "btn text-xs"}
        >
          <Copy className="w-3 h-3" /> Clone from M1
        </button>
        <button
          onClick={() => setMode("blank")}
          className={mode === "blank" ? "btn-brand text-xs" : "btn text-xs"}
        >
          <Plus className="w-3 h-3" /> Blank custom day
        </button>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {mode === "clone" ? (
          <label className="text-xs">
            Clone Day (1-30)
            <input type="number" min="1" max="30" className="input mt-1" value={f.sourceDayNumber} onChange={(e) => setF({ ...f, sourceDayNumber: e.target.value })} />
          </label>
        ) : (
          <label className="text-xs md:col-span-2">
            Day label (e.g. "Beehiiv launch + first newsletter")
            <input className="input mt-1" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} required />
          </label>
        )}
        <label className="text-xs">
          Day number (in plan)
          <input type="number" min={startDayNumber} className="input mt-1" value={f.targetDayNumber} onChange={(e) => setF({ ...f, targetDayNumber: e.target.value })} required />
        </label>
        <label className="text-xs">
          Weekday
          <select className="input mt-1" value={f.weekday} onChange={(e) => setF({ ...f, weekday: e.target.value })}>
            <option>Sun</option><option>Mon</option><option>Tue</option><option>Wed</option><option>Thu</option><option>Fri</option><option>Sat</option>
          </select>
        </label>
        {mode === "blank" && (
          <>
            <label className="text-xs">
              Focus area
              <select className="input mt-1" value={f.focusArea} onChange={(e) => setF({ ...f, focusArea: e.target.value })}>
                <option value="setup">setup</option>
                <option value="outreach">outreach</option>
                <option value="build">build</option>
                <option value="content">content</option>
                <option value="admin">admin</option>
                <option value="review">review</option>
              </select>
            </label>
            <label className="text-xs">
              Hours estimated
              <input type="number" step="0.5" className="input mt-1" value={f.hoursEstimated} onChange={(e) => setF({ ...f, hoursEstimated: e.target.value })} />
            </label>
          </>
        )}
        <div className="md:col-span-3 flex items-center gap-2">
          <button type="submit" disabled={pending} className="btn-brand">
            {mode === "clone" ? "Clone day" : "Create custom day"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
