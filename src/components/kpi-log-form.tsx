"use client";

import { useState, useTransition } from "react";
import { logKpi } from "@/lib/actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function KpiLogForm({ kpiId, unit }: { kpiId: number; unit: string }) {
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(value);
    if (isNaN(n)) return;
    startTransition(async () => {
      await logKpi(kpiId, n);
      toast.success(`Logged ${n}${unit === "%" ? "%" : ` ${unit}`}`, { description: "KPI entry saved" });
    });
    setValue("");
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-1.5 items-center">
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`log ${unit}`}
        className="input text-xs px-2 py-1 w-24"
      />
      <button type="submit" disabled={pending || !value} className="btn-brand text-xs px-2 py-1">
        <Plus className="w-3 h-3" />
      </button>
    </form>
  );
}
