"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createLead } from "@/lib/actions";

export default function NewLeadForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", company: "", source: "linkedin", persona: "small-carrier", estimatedValue: "0", painPoint: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    startTransition(async () => {
      await createLead({
        name: form.name,
        company: form.company || undefined,
        source: form.source,
        persona: form.persona,
        estimatedValue: parseFloat(form.estimatedValue) || 0,
        painPoint: form.painPoint || undefined,
      });
      setForm({ name: "", company: "", source: "linkedin", persona: "small-carrier", estimatedValue: "0", painPoint: "" });
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-brand">
        <Plus className="w-4 h-4" /> New lead
      </button>
    );
  }

  return (
    <div className="card p-4 mb-4">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="input" placeholder="Contact name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
          <option value="cold_email">Cold Email</option>
          <option value="linkedin">LinkedIn</option>
          <option value="cold_call">Cold Call</option>
          <option value="past_client">Past Client</option>
          <option value="referral">Referral</option>
          <option value="ads">Paid Ads</option>
          <option value="ctwa">CTWA</option>
          <option value="inbound">Inbound</option>
        </select>
        <select className="input" value={form.persona} onChange={(e) => setForm({ ...form, persona: e.target.value })}>
          <option value="small-carrier">Small Carrier</option>
          <option value="freight-broker">Freight Broker</option>
          <option value="owner-operator">Owner-Operator</option>
          <option value="moving-company">Moving Company</option>
          <option value="car-hauler">Car Hauler</option>
          <option value="last-mile-courier">Last-Mile Courier</option>
        </select>
        <input type="number" className="input" placeholder="Estimated project value $" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
        <input className="input" placeholder="Pain point (1 line)" value={form.painPoint} onChange={(e) => setForm({ ...form, painPoint: e.target.value })} />
        <div className="md:col-span-2 flex items-center gap-2">
          <button type="submit" disabled={pending} className="btn-brand">Add lead</button>
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
