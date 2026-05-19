"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { logAdMetric } from "@/lib/actions";

export default function AdMetricForm({ campaignId }: { campaignId: number }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState({ spend: "", impressions: "", clicks: "", leads: "", bookedCalls: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await logAdMetric({
        campaignId,
        spend: parseFloat(f.spend) || 0,
        impressions: parseInt(f.impressions) || 0,
        clicks: parseInt(f.clicks) || 0,
        leads: parseInt(f.leads) || 0,
        bookedCalls: parseInt(f.bookedCalls) || 0,
      });
      toast.success(`Ad metrics logged`, { description: `$${f.spend || 0} spent · ${f.leads || 0} leads · ${f.bookedCalls || 0} booked` });
      setF({ spend: "", impressions: "", clicks: "", leads: "", bookedCalls: "" });
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn text-xs px-2 py-1">
        <Plus className="w-3 h-3" /> Log day
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card-elev p-3 mt-2 grid grid-cols-5 gap-2 items-end">
      <Field label="Spend $" value={f.spend} onChange={(v) => setF({ ...f, spend: v })} />
      <Field label="Impressions" value={f.impressions} onChange={(v) => setF({ ...f, impressions: v })} />
      <Field label="Clicks" value={f.clicks} onChange={(v) => setF({ ...f, clicks: v })} />
      <Field label="Leads" value={f.leads} onChange={(v) => setF({ ...f, leads: v })} />
      <Field label="Booked" value={f.bookedCalls} onChange={(v) => setF({ ...f, bookedCalls: v })} />
      <div className="col-span-5 flex items-center gap-2">
        <button type="submit" disabled={pending} className="btn-brand text-xs">Save</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost text-xs">Cancel</button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-[10px] uppercase tracking-wider text-fg-muted">
      {label}
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input text-xs py-1 mt-0.5"
      />
    </label>
  );
}
