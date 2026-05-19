"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createAdCampaign } from "@/lib/actions";

export default function NewAdCampaignForm({ currentMonth }: { currentMonth: number }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState({ name: "", platform: "meta", campaignType: "lead_form", dailyBudget: "20", audience: "", objective: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name) return;
    startTransition(async () => {
      await createAdCampaign({
        name: f.name,
        platform: f.platform,
        campaignType: f.campaignType,
        monthNumber: currentMonth,
        dailyBudget: parseFloat(f.dailyBudget) || 0,
        audience: f.audience || undefined,
        objective: f.objective || undefined,
      });
      setF({ name: "", platform: "meta", campaignType: "lead_form", dailyBudget: "20", audience: "", objective: "" });
      setOpen(false);
    });
  };

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-brand"><Plus className="w-4 h-4" /> New campaign</button>;
  }

  return (
    <div className="card p-4">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="input md:col-span-2" placeholder="Campaign name *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
        <input type="number" className="input" placeholder="Daily budget $" value={f.dailyBudget} onChange={(e) => setF({ ...f, dailyBudget: e.target.value })} />
        <select className="input" value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value })}>
          <option value="meta">Meta (Facebook/Instagram)</option>
          <option value="tiktok">TikTok</option>
          <option value="google">Google</option>
          <option value="linkedin">LinkedIn</option>
        </select>
        <select className="input" value={f.campaignType} onChange={(e) => setF({ ...f, campaignType: e.target.value })}>
          <option value="lead_form">Lead Form</option>
          <option value="ctwa">Click-to-WhatsApp</option>
          <option value="retargeting">Retargeting</option>
          <option value="spark">Spark Ad (TikTok)</option>
          <option value="conversion">Conversion</option>
          <option value="awareness">Awareness</option>
        </select>
        <input className="input" placeholder="Audience" value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })} />
        <input className="input md:col-span-3" placeholder="Objective / hypothesis (1 line)" value={f.objective} onChange={(e) => setF({ ...f, objective: e.target.value })} />
        <div className="md:col-span-3 flex items-center gap-2">
          <button type="submit" disabled={pending} className="btn-brand">Add campaign</button>
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
