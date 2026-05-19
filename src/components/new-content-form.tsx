"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createContentItem } from "@/lib/actions";

export default function NewContentForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState({ type: "linkedin_post", title: "", dayOfWeek: "Mon", weekNumber: "", hookText: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title) return;
    startTransition(async () => {
      await createContentItem({
        type: f.type,
        title: f.title,
        dayOfWeek: f.dayOfWeek || undefined,
        weekNumber: f.weekNumber ? parseInt(f.weekNumber) : undefined,
        hookText: f.hookText || undefined,
      });
      setF({ type: "linkedin_post", title: "", dayOfWeek: "Mon", weekNumber: "", hookText: "" });
      setOpen(false);
    });
  };

  if (!open) return <button onClick={() => setOpen(true)} className="btn-brand"><Plus className="w-4 h-4" /> Add content</button>;

  return (
    <div className="card p-4">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          <option value="linkedin_post">LinkedIn Post</option>
          <option value="loom_teardown">Loom Teardown</option>
          <option value="case_study">Case Study</option>
          <option value="ad_creative">Ad Creative</option>
          <option value="tiktok">TikTok</option>
          <option value="newsletter">Newsletter</option>
        </select>
        <select className="input" value={f.dayOfWeek} onChange={(e) => setF({ ...f, dayOfWeek: e.target.value })}>
          <option value="Mon">Mon (carousel)</option>
          <option value="Wed">Wed (short video)</option>
          <option value="Fri">Fri (contrarian text)</option>
          <option value="Sun">Sun (case study)</option>
          <option value="">no slot</option>
        </select>
        <input type="number" min="1" max="12" placeholder="Week #" className="input" value={f.weekNumber} onChange={(e) => setF({ ...f, weekNumber: e.target.value })} />
        <input className="input md:col-span-3" placeholder="Title *" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
        <input className="input md:col-span-3" placeholder="Hook (first line of post)" value={f.hookText} onChange={(e) => setF({ ...f, hookText: e.target.value })} />
        <div className="md:col-span-3 flex items-center gap-2">
          <button type="submit" disabled={pending} className="btn-brand">Add</button>
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
