"use client";

import { useState, useEffect, useRef, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, LayoutDashboard, CalendarDays, Target, Kanban, FileText, Users, Radio, Wrench, Sparkles, ShieldAlert, Megaphone, Link as LinkIcon, CornerDownLeft } from "lucide-react";
import { dashboardSearch, type SearchHit } from "@/lib/search";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, CalendarDays, Target, Kanban, FileText, Users, Radio, Wrench, Sparkles, ShieldAlert, Megaphone, Link: LinkIcon,
};

const GROUP_LABELS: Record<string, string> = {
  module: "Modules",
  lead: "Pipeline leads",
  "past-client": "Past clients",
  script: "Scripts",
  channel: "Channels",
  tool: "Tools",
  day: "Plan days",
  content: "Content",
  "ad-campaign": "Ad campaigns",
  persona: "Personas",
  rule: "Compliance rules",
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      // Load initial modules
      startTransition(async () => {
        const res = await dashboardSearch("");
        setHits(res);
      });
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      startTransition(async () => {
        const res = await dashboardSearch(query);
        setHits(res);
        setActiveIdx(0);
      });
    }, 120);
    return () => clearTimeout(t);
  }, [query, open]);

  const grouped = useMemo(() => {
    const g: Record<string, SearchHit[]> = {};
    for (const h of hits) {
      if (!g[h.group]) g[h.group] = [];
      g[h.group].push(h);
    }
    return g;
  }, [hits]);

  const flatHits = useMemo(() => {
    return Object.keys(GROUP_LABELS).flatMap((k) => grouped[k] ?? []);
  }, [grouped]);

  const go = (hit: SearchHit) => {
    router.push(hit.href);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(flatHits.length - 1, i + 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(0, i - 1)); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (flatHits[activeIdx]) go(flatHits[activeIdx]);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-bg-sub hover:border-brand/40 hover:bg-bg-card transition-colors text-sm text-fg-muted"
        title="Search (⌘K)"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search…</span>
        <kbd className="ml-2 text-[10px] px-1.5 py-0.5 bg-bg-card rounded border border-border font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="card w-full max-w-2xl overflow-hidden animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-fg-subtle shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search modules, leads, scripts, posts, days, ads…"
            className="flex-1 bg-transparent outline-none text-base"
          />
          <kbd className="text-[10px] text-fg-subtle">esc</kbd>
          <button onClick={() => setOpen(false)} className="text-fg-subtle hover:text-fg"><X className="w-4 h-4" /></button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
          {flatHits.length === 0 ? (
            <div className="px-4 py-10 text-center text-fg-muted text-sm">
              {query ? `No matches for "${query}"` : "Type to search across everything…"}
            </div>
          ) : (
            <>
              {Object.keys(GROUP_LABELS).map((groupKey) => {
                const items = grouped[groupKey];
                if (!items || items.length === 0) return null;
                return (
                  <div key={groupKey} className="py-1">
                    <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-fg-subtle bg-bg-sub/50 font-semibold">
                      {GROUP_LABELS[groupKey]}
                    </div>
                    {items.map((hit) => {
                      const idx = flatHits.indexOf(hit);
                      const Icon = ICONS[hit.icon ?? ""] ?? Search;
                      const active = idx === activeIdx;
                      return (
                        <button
                          key={hit.id}
                          onClick={() => go(hit)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={cn(
                            "w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors",
                            active ? "bg-brand/10 border-l-2 border-brand" : "border-l-2 border-transparent hover:bg-bg-sub"
                          )}
                        >
                          <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", active ? "text-brand" : "text-fg-subtle")} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{hit.title}</div>
                            {hit.subtitle && <div className="text-xs text-fg-muted truncate">{hit.subtitle}</div>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {hit.meta && <span className="text-[10px] text-fg-subtle">{hit.meta}</span>}
                            {active && <CornerDownLeft className="w-3 h-3 text-brand" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border text-[10px] text-fg-subtle flex items-center justify-between">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>Try: "facebook ad", "broker", "loom", "MRR", a client name…</span>
        </div>
      </div>
    </div>
  );
}
