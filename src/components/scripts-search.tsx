"use client";

import { useState, useMemo } from "react";
import { Search, Copy, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditScriptButton, DeleteScriptButton } from "./script-editor";

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

const CATEGORIES: { key: string; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "call", label: "Cold Call" },
  { key: "loom", label: "Loom" },
  { key: "discovery", label: "Discovery Call" },
  { key: "referral", label: "Referral" },
  { key: "ad", label: "Paid Ad" },
  { key: "lp", label: "Landing Page" },
];

export default function ScriptsSearch({ scripts }: { scripts: Script[] }) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return scripts.filter((s) => {
      if (activeCat && s.category !== activeCat) return false;
      if (activePersona && s.persona !== activePersona) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.body.toLowerCase().includes(q) ||
        (s.subject?.toLowerCase().includes(q) ?? false) ||
        (s.notes?.toLowerCase().includes(q) ?? false) ||
        s.persona.toLowerCase().includes(q)
      );
    });
  }, [scripts, query, activeCat, activePersona]);

  const personas = Array.from(new Set(scripts.map((s) => s.persona))).filter(Boolean);
  const grouped: Record<string, Script[]> = {};
  for (const s of filtered) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }

  const copy = async (s: Script) => {
    const text = s.subject ? `Subject: ${s.subject}\n\n${s.body}` : s.body;
    await navigator.clipboard.writeText(text);
    setCopiedKey(s.key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, body, persona, or notes…"
            className="input pl-9 pr-9"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-fg-subtle uppercase tracking-wider mr-1">Category:</span>
          <button onClick={() => setActiveCat(null)} className={cn("pill text-[10px]", activeCat === null && "pill-brand")}>All</button>
          {CATEGORIES.map((c) => {
            const count = scripts.filter((s) => s.category === c.key).length;
            if (count === 0) return null;
            return (
              <button key={c.key} onClick={() => setActiveCat(c.key)} className={cn("pill text-[10px]", activeCat === c.key && "pill-brand")}>
                {c.label} ({count})
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-fg-subtle uppercase tracking-wider mr-1">Persona:</span>
          <button onClick={() => setActivePersona(null)} className={cn("pill text-[10px]", activePersona === null && "pill-brand")}>All</button>
          {personas.map((p) => (
            <button key={p} onClick={() => setActivePersona(p)} className={cn("pill text-[10px]", activePersona === p && "pill-brand")}>
              {p}
            </button>
          ))}
        </div>
        {filtered.length !== scripts.length && (
          <div className="text-xs text-fg-muted">{filtered.length} / {scripts.length} scripts matching</div>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-fg-muted">No scripts match. Adjust filters or clear search.</div>
      ) : (
        Object.entries(grouped).map(([cat, list]) => {
          const catLabel = CATEGORIES.find((c) => c.key === cat)?.label ?? cat;
          return (
            <section key={cat} id={`cat-${cat}`}>
              <h2 className="text-base font-semibold uppercase tracking-wider text-fg-muted mb-3">{catLabel}</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {list.map((s) => (
                  <div key={s.id} id={s.key} className="card p-5 scroll-mt-20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-fg-muted mb-1">
                          <span className="pill">{s.category}</span>
                          {s.persona !== "general" && <span className="pill-info">{s.persona}</span>}
                        </div>
                        <h3 className="text-base font-semibold leading-tight">{s.title}</h3>
                        {s.subject && <div className="text-sm text-fg-muted italic mt-1">Subject: {s.subject}</div>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => copy(s)} className={copiedKey === s.key ? "btn-brand" : "btn"}>
                          {copiedKey === s.key ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                        </button>
                        <EditScriptButton script={s} />
                        <DeleteScriptButton id={s.id} title={s.title} />
                      </div>
                    </div>
                    <pre className="mt-3 text-xs font-mono whitespace-pre-wrap bg-bg-sub border border-border rounded-md p-3 leading-relaxed overflow-x-auto scrollbar-thin max-h-96">{s.body}</pre>
                    {s.variables && (
                      <div className="mt-2 text-[11px] text-fg-subtle">
                        <span className="font-semibold">Variables:</span> {s.variables.split(",").map((v) => (
                          <code key={v.trim()} className="ml-1 px-1 py-0.5 rounded bg-bg-sub text-brand">{`{${v.trim()}}`}</code>
                        ))}
                      </div>
                    )}
                    {s.notes && (
                      <div className="mt-2 text-[11px] text-fg-muted border-t border-border pt-2 leading-snug">{s.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
