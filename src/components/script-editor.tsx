"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, X, Trash2, Plus } from "lucide-react";
import { createScript, updateScript, deleteScript } from "@/lib/actions";

const CATEGORIES = [
  { key: "email", label: "Email" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "call", label: "Cold Call" },
  { key: "loom", label: "Loom" },
  { key: "discovery", label: "Discovery Call" },
  { key: "referral", label: "Referral" },
  { key: "ad", label: "Paid Ad" },
  { key: "lp", label: "Landing Page" },
];

const PERSONAS = ["general", "carrier", "broker", "owner-operator", "moving-company", "car-hauler", "last-mile-courier", "factor", "insurance"];

type Script = {
  id: number;
  key: string;
  title: string;
  category: string;
  persona: string;
  subject: string | null;
  body: string;
  variables: string | null;
  notes: string | null;
};

export function NewScriptButton() {
  const [open, setOpen] = useState(false);
  if (!open) return <button onClick={() => setOpen(true)} className="btn-brand"><Plus className="w-4 h-4" /> New script</button>;
  return <ScriptForm onClose={() => setOpen(false)} mode="create" />;
}

export function EditScriptButton({ script }: { script: Script }) {
  const [open, setOpen] = useState(false);
  if (!open) return <button onClick={() => setOpen(true)} className="btn-ghost text-xs">Edit</button>;
  return <ScriptForm onClose={() => setOpen(false)} mode="edit" script={script} />;
}

export function DeleteScriptButton({ id, title }: { id: number; title: string }) {
  const [pending, startTransition] = useTransition();
  const confirm = () => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteScript(id);
      toast.success("Script deleted");
    });
  };
  return (
    <button onClick={confirm} disabled={pending} className="btn-ghost text-xs text-danger hover:bg-danger/10">
      <Trash2 className="w-3 h-3" />
    </button>
  );
}

function ScriptForm({ onClose, mode, script }: { onClose: () => void; mode: "create" | "edit"; script?: Script }) {
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState({
    key: script?.key ?? "",
    title: script?.title ?? "",
    category: script?.category ?? "email",
    persona: script?.persona ?? "general",
    subject: script?.subject ?? "",
    body: script?.body ?? "",
    variables: script?.variables ?? "",
    notes: script?.notes ?? "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title || !f.body) {
      toast.error("Title and body are required");
      return;
    }
    startTransition(async () => {
      if (mode === "create") {
        const key = f.key || f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
        await createScript({
          key,
          title: f.title,
          category: f.category,
          persona: f.persona,
          subject: f.subject || undefined,
          body: f.body,
          variables: f.variables || undefined,
          notes: f.notes || undefined,
        });
        toast.success("Script created");
      } else if (script) {
        await updateScript(script.id, {
          title: f.title,
          category: f.category,
          persona: f.persona,
          subject: f.subject || null,
          body: f.body,
          variables: f.variables || null,
          notes: f.notes || null,
        });
        toast.success("Script updated");
      }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">{mode === "create" ? "Create script" : `Edit: ${script?.title}`}</h3>
          <button onClick={onClose} className="btn-ghost"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-xs uppercase tracking-wider text-fg-muted">
              Title *
              <input className="input mt-1" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
            </label>
            {mode === "create" && (
              <label className="text-xs uppercase tracking-wider text-fg-muted">
                Slug key (optional — auto from title)
                <input className="input mt-1 font-mono" value={f.key} onChange={(e) => setF({ ...f, key: e.target.value })} placeholder="auto-generated" />
              </label>
            )}
            <label className="text-xs uppercase tracking-wider text-fg-muted">
              Category
              <select className="input mt-1" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </label>
            <label className="text-xs uppercase tracking-wider text-fg-muted">
              Persona
              <select className="input mt-1" value={f.persona} onChange={(e) => setF({ ...f, persona: e.target.value })}>
                {PERSONAS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
          {(f.category === "email" || f.category === "ad") && (
            <label className="text-xs uppercase tracking-wider text-fg-muted block">
              Subject line / Hook (optional)
              <input className="input mt-1" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="e.g. Quick update from Yasir" />
            </label>
          )}
          <label className="text-xs uppercase tracking-wider text-fg-muted block">
            Body *
            <textarea
              className="input mt-1 font-mono text-sm"
              rows={12}
              value={f.body}
              onChange={(e) => setF({ ...f, body: e.target.value })}
              placeholder="Paste-ready content. Use {first_name} {company} etc. for variables."
              required
            />
          </label>
          <label className="text-xs uppercase tracking-wider text-fg-muted block">
            Variables (comma-separated, e.g. first_name, company, usdot)
            <input className="input mt-1" value={f.variables} onChange={(e) => setF({ ...f, variables: e.target.value })} />
          </label>
          <label className="text-xs uppercase tracking-wider text-fg-muted block">
            Notes / when to use
            <textarea className="input mt-1" rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </label>
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <button type="submit" disabled={pending} className="btn-brand"><Save className="w-4 h-4" /> {mode === "create" ? "Create script" : "Save changes"}</button>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
