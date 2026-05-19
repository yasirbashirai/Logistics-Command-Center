"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function ScriptCard({
  scriptKey, title, category, persona, subject, body, variables, notes,
}: {
  scriptKey: string; title: string; category: string; persona: string;
  subject?: string | null; body: string; variables?: string | null; notes?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = subject ? `Subject: ${subject}\n\n${body}` : body;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id={scriptKey} className="card p-5 scroll-mt-20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-fg-muted mb-1">
            <span className="pill">{category}</span>
            {persona !== "general" && <span className="pill-info">{persona}</span>}
          </div>
          <h3 className="text-base font-semibold leading-tight">{title}</h3>
          {subject && <div className="text-sm text-fg-muted italic mt-1">Subject: {subject}</div>}
        </div>
        <button onClick={copy} className={copied ? "btn-brand" : "btn"}>
          {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>

      <pre className="mt-3 text-xs font-mono whitespace-pre-wrap bg-bg-sub border border-border rounded-md p-3 leading-relaxed overflow-x-auto scrollbar-thin">{body}</pre>

      {variables && (
        <div className="mt-2 text-[11px] text-fg-subtle">
          <span className="font-semibold">Variables:</span> {variables.split(",").map(v => (
            <code key={v.trim()} className="ml-1 px-1 py-0.5 rounded bg-bg-sub text-brand">{`{${v.trim()}}`}</code>
          ))}
        </div>
      )}
      {notes && (
        <div className="mt-2 text-[11px] text-fg-muted border-t border-border pt-2">{notes}</div>
      )}
    </div>
  );
}
