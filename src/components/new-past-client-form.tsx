"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createPastClient } from "@/lib/actions";

export default function NewPastClientForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState({ name: "", company: "", email: "", platform: "fiverr", segment: "B", year: "", summary: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name) return;
    startTransition(async () => {
      await createPastClient({
        name: f.name,
        company: f.company || undefined,
        email: f.email || undefined,
        platform: f.platform,
        segment: f.segment,
        originalProjectYear: f.year ? parseInt(f.year) : undefined,
        originalProjectSummary: f.summary || undefined,
      });
      setF({ name: "", company: "", email: "", platform: "fiverr", segment: "B", year: "", summary: "" });
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-brand">
        <Plus className="w-4 h-4" /> Add past client
      </button>
    );
  }

  return (
    <div className="card p-4">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="input" placeholder="Contact name *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
        <input className="input" placeholder="Company" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} />
        <input className="input" type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <select className="input" value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value })}>
          <option value="fiverr">Fiverr</option>
          <option value="upwork">Upwork</option>
          <option value="direct">Direct</option>
          <option value="referral">Referral</option>
        </select>
        <select className="input" value={f.segment} onChange={(e) => setF({ ...f, segment: e.target.value })}>
          <option value="A">A — repeat 5★ (priority)</option>
          <option value="B">B — single 5★</option>
          <option value="C">C — single ≤4★ (skip)</option>
        </select>
        <input type="number" className="input" placeholder="Project year" value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} />
        <input className="input md:col-span-3" placeholder="Project summary (1 line — e.g. 'Trucking website for 12-truck carrier')" value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} />
        <div className="md:col-span-3 flex items-center gap-2">
          <button type="submit" disabled={pending} className="btn-brand">Add</button>
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
